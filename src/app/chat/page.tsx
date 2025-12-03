"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
  model?: string;
  category?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  folder: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

const DEFAULT_FOLDERS = ["New Chat", "My Projects", "Snippets", "Game Design", "UI/UX Drafts"];

export default function ChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [userId, setUserId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem("devil_user");
    if (!user) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(user);
    setUserId(userData.id);

    // Load chats from localStorage
    const storageKey = `devil_chats_${userData.id}`;
    const savedChats = localStorage.getItem(storageKey);
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, [router]);

  useEffect(() => {
    // Save chats to localStorage
    if (userId) {
      const storageKey = `devil_chats_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(chats));
    }
  }, [chats, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChatId, chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const currentChat = chats.find((c) => c.id === currentChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      title: "New Conversation",
      messages: [],
      folder: "New Chat",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(chats.filter((c) => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const renameChat = () => {
    if (!currentChatId || !renameTitle.trim()) return;
    setChats(
      chats.map((c) =>
        c.id === currentChatId ? { ...c, title: renameTitle, updatedAt: Date.now() } : c
      )
    );
    setShowRenameDialog(false);
    setRenameTitle("");
  };

  const togglePin = (chatId: string) => {
    setChats(
      chats.map((c) =>
        c.id === chatId ? { ...c, pinned: !c.pinned, updatedAt: Date.now() } : c
      )
    );
  };

  const changeChatFolder = (chatId: string, folder: string) => {
    setChats(
      chats.map((c) =>
        c.id === chatId ? { ...c, folder, updatedAt: Date.now() } : c
      )
    );
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentChatId || loading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: message.trim(),
      timestamp: Date.now(),
    };

    // Add user message
    setChats(
      chats.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              title: c.messages.length === 0 ? message.slice(0, 50) : c.title,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          chatId: currentChatId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("No response stream");
      }

      let aiMessageContent = "";
      let aiModel = "";
      let aiCategory = "";

      // Create placeholder AI message
      const aiMessageId = `msg_${Date.now()}`;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.content) {
                aiMessageContent += parsed.content;
                aiModel = parsed.model || aiModel;
                aiCategory = parsed.category || aiCategory;

                // Update message in real-time
                setChats((prevChats) =>
                  prevChats.map((c) =>
                    c.id === currentChatId
                      ? {
                          ...c,
                          messages: [
                            ...c.messages.filter(m => m.id !== aiMessageId),
                            {
                              id: aiMessageId,
                              role: "ai" as const,
                              content: aiMessageContent,
                              timestamp: Date.now(),
                              model: aiModel,
                              category: aiCategory,
                            },
                          ],
                          updatedAt: Date.now(),
                        }
                      : c
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "ai",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response. Please check if OpenRouter API key is configured in Admin panel."}`,
        timestamp: Date.now(),
      };

      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === currentChatId
            ? { ...c, messages: [...c.messages, errorMessage], updatedAt: Date.now() }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadChat = (format: "json" | "txt") => {
    if (!currentChat) return;

    let content = "";
    let filename = `${currentChat.title}_${Date.now()}`;
    let mimeType = "text/plain";

    if (format === "json") {
      content = JSON.stringify(currentChat, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === "txt") {
      content = `${currentChat.title}\n${"=".repeat(50)}\n\n`;
      currentChat.messages.forEach((msg) => {
        content += `[${msg.role.toUpperCase()}] ${new Date(msg.timestamp).toLocaleString()}\n${msg.content}\n\n`;
      });
      filename += ".txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const filteredChats = chats
    .filter((chat) => {
      const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFolder = selectedFolder === "All" || chat.folder === selectedFolder;
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const handleLogout = () => {
    localStorage.removeItem("devil_user");
    router.push("/");
  };

  const getCategoryDisplay = (category?: string) => {
    const categoryMap: Record<string, { icon: string; name: string }> = {
      main_brain: { icon: "🧠", name: "Main Brain" },
      coding: { icon: "💻", name: "Coding" },
      debugging: { icon: "🐛", name: "Debugging" },
      uiux: { icon: "🎨", name: "UI/UX" },
      gamedev: { icon: "🎮", name: "Game Dev" },
      fast: { icon: "⚡", name: "Fast" },
      canvas: { icon: "📝", name: "Canvas" },
      image: { icon: "🖼️", name: "Image" },
    };

    return category && categoryMap[category] 
      ? `${categoryMap[category].icon} ${categoryMap[category].name}`
      : "🤖 Auto";
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="grid-background" />

      {/* Sidebar */}
      <div className="relative z-10 w-80 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="neon-underline">DEVIL DEV</span>
          </h1>
          <Button
            onClick={createNewChat}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm vscode-hover"
          >
            + New Chat
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 space-y-2 border-b border-border">
          <Input
            placeholder="🔍 Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input border-border text-foreground font-mono text-sm vscode-hover"
          />
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="bg-input border-border text-foreground font-mono text-sm vscode-hover">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="All" className="text-foreground font-mono">All Folders</SelectItem>
              {DEFAULT_FOLDERS.map((folder) => (
                <SelectItem key={folder} value={folder} className="text-foreground font-mono">
                  📁 {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 p-2">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`explorer-item mb-1 group ${
                currentChatId === chat.id ? "active" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {chat.pinned && <span className="text-primary">📌</span>}
                    <p className="text-sm font-mono text-foreground truncate">
                      {chat.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {chat.messages.length} msgs • {chat.folder}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 hover:bg-accent/10">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border-border">
                    <DropdownMenuItem
                      onClick={() => togglePin(chat.id)}
                      className="text-foreground hover:bg-accent/10 font-mono"
                    >
                      {chat.pinned ? "📌 Unpin" : "📌 Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setRenameTitle(chat.title);
                        setCurrentChatId(chat.id);
                        setShowRenameDialog(true);
                      }}
                      className="text-foreground hover:bg-accent/10 font-mono"
                    >
                      ✏️ Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteChat(chat.id)}
                      className="text-destructive hover:bg-destructive/10 font-mono"
                    >
                      🗑️ Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="text-center text-muted-foreground mt-8 font-mono">
              <p className="text-4xl mb-2">📂</p>
              <p>No chats found</p>
            </div>
          )}
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-border text-foreground hover:bg-accent/10 font-mono text-sm vscode-hover"
          >
            ← Logout
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-primary/10 border-l-2 border-primary rounded">
                  <h2 className="text-sm font-mono font-bold text-primary">{currentChat.title}</h2>
                </div>
                <p className="text-xs text-muted-foreground font-mono">📁 {currentChat.folder}</p>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-border text-foreground font-mono text-xs vscode-hover">
                      📁 Move
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border-border">
                    {DEFAULT_FOLDERS.map((folder) => (
                      <DropdownMenuItem
                        key={folder}
                        onClick={() => changeChatFolder(currentChat.id, folder)}
                        className="text-foreground hover:bg-accent/10 font-mono"
                      >
                        {folder}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-border text-foreground font-mono text-xs vscode-hover">
                      💾 Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border-border">
                    <DropdownMenuItem
                      onClick={() => downloadChat("json")}
                      className="text-foreground hover:bg-accent/10 font-mono"
                    >
                      JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => downloadChat("txt")}
                      className="text-foreground hover:bg-accent/10 font-mono"
                    >
                      TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              {currentChat.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">⚡</div>
                    <p className="text-xl font-mono text-primary">Intelligent AI Routing</p>
                    <p className="text-sm text-muted-foreground font-mono">AI automatically selects the best model for your task</p>
                    <div className="grid grid-cols-2 gap-2 mt-6 text-xs text-muted-foreground font-mono">
                      <div>🧠 Complex reasoning</div>
                      <div>💻 Coding tasks</div>
                      <div>🐛 Debugging issues</div>
                      <div>🎨 UI/UX design</div>
                      <div>🎮 Game development</div>
                      <div>⚡ Quick answers</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {currentChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          msg.role === "user" ? "user-bubble" : "ai-bubble"
                        }`}
                      >
                        {msg.role === "ai" && (msg.model || msg.category) && (
                          <div className="mb-2 pb-2 border-b border-border/30">
                            <p className="text-xs font-mono text-primary">
                              {getCategoryDisplay(msg.category)}
                            </p>
                            {msg.model && (
                              <p className="text-[10px] text-muted-foreground font-mono mt-1">
                                Model: {msg.model}
                              </p>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap font-mono text-sm">{msg.content}</p>
                        <div className={`text-xs mt-2 font-mono ${msg.role === "user" ? "text-primary/60" : "text-muted-foreground"}`}>
                          <p>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="ai-bubble">
                        <p className="animate-pulse font-mono text-sm">
                          🤖 AI is thinking<span className="terminal-cursor">_</span>
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-3 text-primary font-mono text-sm">{'>'}</span>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Ask anything... AI will route to the best model"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[60px] resize-none font-mono text-sm pl-8 vscode-hover"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono px-8 vscode-hover"
                  >
                    ▶
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center font-mono mt-2">
                  🤖 Intelligent routing enabled • Press Enter to send
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="text-8xl mb-4">⚡</div>
              <h2 className="text-3xl font-bold font-mono text-primary">
                Developer Workspace
              </h2>
              <p className="text-lg text-muted-foreground font-mono">Select a chat or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="command-palette border-primary">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className="bg-input border-border text-foreground font-mono vscode-hover"
              placeholder="Enter new name"
            />
            <Button
              onClick={renameChat}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover"
            >
              ✓ Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}