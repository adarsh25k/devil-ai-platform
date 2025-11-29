"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
  routingReason?: string;
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

const DEFAULT_FOLDERS = ["Study", "Coding", "Projects", "Notes", "Custom"];

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
      folder: "Custom",
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
      // Get conversation history
      const currentChatData = chats.find((c) => c.id === currentChatId);
      const conversationHistory = currentChatData?.messages.slice(-10) || [];

      // Call API - auto routing, no model selection
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          chatId: currentChatId,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "ai",
        content: data.message,
        timestamp: Date.now(),
        model: data.model,
        routingReason: data.routingReason,
      };

      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === currentChatId
            ? { ...c, messages: [...c.messages, aiMessage], updatedAt: Date.now() }
            : c
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "ai",
        content: `🔥 Error: ${error instanceof Error ? error.message : "Failed to get response. Please check if OpenRouter API keys are configured in Admin panel."}`,
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

  const downloadChat = (format: "json" | "txt" | "pdf") => {
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
    } else if (format === "pdf") {
      // For PDF, we'll create a simple text version (real PDF would need a library)
      alert("PDF export coming soon! Use TXT or JSON for now. 🔥");
      return;
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

  return (
    <div className="flex h-screen bg-black text-red-500">
      <div className="fog-overlay" />

      {/* Sidebar */}
      <div className="relative z-10 w-80 border-r border-red-600 bg-black/50 backdrop-blur-sm flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-red-600">
          <h1 className="text-2xl font-bold glitch-text neon-text mb-4">
            👹 DEVIL DEV
          </h1>
          <Button
            onClick={createNewChat}
            className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-black font-bold"
          >
            ➕ New Chat
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 space-y-2 border-b border-red-600">
          <Input
            placeholder="🔍 Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/80 border-red-600 text-orange-500"
          />
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="bg-black/80 border-red-600 text-orange-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-red-600">
              <SelectItem value="All" className="text-orange-500">All Folders</SelectItem>
              {DEFAULT_FOLDERS.map((folder) => (
                <SelectItem key={folder} value={folder} className="text-orange-500">
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
              className={`p-3 mb-2 rounded cursor-pointer transition-all group ${
                currentChatId === chat.id
                  ? "devil-card"
                  : "bg-black/30 hover:bg-red-950/30 border border-red-600/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {chat.pinned && <span className="text-orange-500">📌</span>}
                    <p className="text-sm font-medium text-orange-500 truncate">
                      {chat.title}
                    </p>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {chat.messages.length} messages • {chat.folder}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black border-red-600">
                    <DropdownMenuItem
                      onClick={() => togglePin(chat.id)}
                      className="text-orange-500 hover:bg-red-950"
                    >
                      {chat.pinned ? "📌 Unpin" : "📌 Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setRenameTitle(chat.title);
                        setCurrentChatId(chat.id);
                        setShowRenameDialog(true);
                      }}
                      className="text-orange-500 hover:bg-red-950"
                    >
                      ✏️ Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteChat(chat.id)}
                      className="text-red-500 hover:bg-red-950"
                    >
                      🗑️ Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="text-center text-orange-500 mt-8">
              <p className="text-4xl mb-2">👻</p>
              <p>No chats found</p>
            </div>
          )}
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-red-600">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-600 text-red-500 hover:bg-red-950"
          >
            🔥 Logout
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-red-600 bg-black/50 backdrop-blur-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-orange-500">{currentChat.title}</h2>
                <p className="text-xs text-red-600">📁 {currentChat.folder}</p>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-red-600 text-red-500">
                      📁 Move
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black border-red-600">
                    {DEFAULT_FOLDERS.map((folder) => (
                      <DropdownMenuItem
                        key={folder}
                        onClick={() => changeChatFolder(currentChat.id, folder)}
                        className="text-orange-500 hover:bg-red-950"
                      >
                        {folder}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-red-600 text-red-500">
                      💾 Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black border-red-600">
                    <DropdownMenuItem
                      onClick={() => downloadChat("json")}
                      className="text-orange-500 hover:bg-red-950"
                    >
                      JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => downloadChat("txt")}
                      className="text-orange-500 hover:bg-red-950"
                    >
                      TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => downloadChat("pdf")}
                      className="text-orange-500 hover:bg-red-950"
                    >
                      PDF (Soon)
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
                    <div className="flex justify-center gap-8 mb-4">
                      <div className="w-8 h-8 rounded-full bg-red-600 demon-eyes" />
                      <div className="w-8 h-8 rounded-full bg-red-600 demon-eyes" />
                    </div>
                    <p className="text-2xl glitch-text neon-text">Start building with DEVIL DEV...</p>
                    <p className="text-orange-500">Ask about coding, UI/UX, or game development 🔥</p>
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
                        {msg.role === "ai" && msg.model && (
                          <div className="mb-2 pb-2 border-b border-red-600/30">
                            <p className="text-xs font-mono text-orange-500">
                              🤖 Using: <span className="font-bold">{msg.model}</span>
                            </p>
                            {msg.routingReason && (
                              <p className="text-[10px] text-red-600 mt-1">
                                📍 {msg.routingReason}
                              </p>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-xs mt-2 ${msg.role === "user" ? "text-black/60" : "text-red-600"}`}>
                          <p>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="ai-bubble">
                        <p className="animate-pulse neon-text">
                          Devil's thinking... 👹🔥
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input - NO MODEL SELECTOR */}
            <div className="p-4 border-t border-red-600 bg-black/50 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask about coding, UI/UX, game dev, or anything... 🔥"
                    className="bg-black/80 border-red-600 text-orange-500 placeholder:text-red-800 min-h-[60px] resize-none"
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || loading}
                    className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-black font-bold px-8"
                  >
                    🔥
                  </Button>
                </div>
                <p className="text-xs text-orange-500/60 mt-2 text-center">
                  💡 Auto-routing enabled - I'll pick the best model for your task
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="flex justify-center gap-12">
                <div className="w-12 h-12 rounded-full bg-red-600 demon-eyes" />
                <div className="w-12 h-12 rounded-full bg-red-600 demon-eyes" />
              </div>
              <h2 className="text-4xl font-bold glitch-text neon-text">
                Select a chat or create a new one
              </h2>
              <p className="text-xl text-orange-500">DEVIL DEV awaits... 👹</p>
            </div>
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="devil-card border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className="bg-black/80 border-red-600 text-orange-500"
              placeholder="Enter new name"
            />
            <Button
              onClick={renameChat}
              className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-black font-bold"
            >
              🔥 Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}