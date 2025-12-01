"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  reason: string;
  category: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  createdAt: string;
}

interface ApiKey {
  id: number;
  key_name: string;
  created_at: string;
  created_by: string;
}

interface UiText {
  id: number;
  key: string;
  value: string;
  category: string;
}

interface Theme {
  id: number;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  isEnabled: boolean;
  isDefault: boolean;
}

interface ModelRule {
  id: number;
  ruleName: string;
  triggerType: string;
  triggerValue: string;
  targetModel: string;
  priority: number;
  isEnabled: boolean;
}

interface Plugin {
  id: number;
  pluginName: string;
  pluginType: string;
  isEnabled: boolean;
}

interface SystemNote {
  id: number;
  title: string;
  message: string;
  noteType: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [uiTexts, setUiTexts] = useState<UiText[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [modelRules, setModelRules] = useState<ModelRule[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [systemNotes, setSystemNotes] = useState<SystemNote[]>([]);
  
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUploadVideo, setShowUploadVideo] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [showAddText, setShowAddText] = useState(false);
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showSplashConfig, setShowSplashConfig] = useState(false);
  
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [newKey, setNewKey] = useState({ key_name: "", value: "" });
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ keyName: string; result: any } | null>(null);
  const [newText, setNewText] = useState({ key: "", value: "", category: "" });
  const [newTheme, setNewTheme] = useState({
    name: "",
    primaryColor: "#ff0000",
    accentColor: "#ff4500",
    backgroundColor: "#000000",
    chatBubbleStyle: "rounded",
    fontFamily: "system-ui",
    gradientMode: "linear",
    iconSet: "default",
    glowIntensity: 5,
    animationSpeed: "normal",
    devilAccents: true,
    smokeDensity: 5
  });
  const [newRule, setNewRule] = useState({
    rule_name: "",
    trigger_type: "keyword",
    trigger_value: "",
    target_model: "",
    priority: 0
  });
  const [newNote, setNewNote] = useState({
    title: "",
    message: "",
    note_type: "announcement"
  });
  const [splashConfig, setSplashConfig] = useState({
    title: "I AM DEVIL",
    subtitle: "v2.0",
    duration: 3,
    glowColor: "#ff0000",
    screenShake: true,
    fireParticles: true,
    fogLayer: true,
    loadingMessages: ["Summoning demons...", "Loading chaos..."]
  });

  useEffect(() => {
    const user = localStorage.getItem("devil_user");
    if (!user) {
      router.push("/");
      return;
    }
    
    const userData = JSON.parse(user);
    if (!userData.isAdmin) {
      router.push("/chat");
      return;
    }

    loadData();
  }, [router]);

  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem("devil_user") || "{}");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user.token}`,
    };
  };

  const loadData = async () => {
    try {
      const headers = getAuthHeaders();

      const [requestsRes, usersRes, keysRes, textsRes, themesRes, rulesRes, pluginsRes, notesRes] = await Promise.all([
        fetch("/api/admin/requests", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/keys/list", { headers }),
        fetch("/api/ui-texts/load"),
        fetch("/api/themes/list"),
        fetch("/api/admin/models/rules/list", { headers }),
        fetch("/api/plugins/list"),
        fetch("/api/system-notes/active"),
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.requests || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.keys || []);
      }

      if (textsRes.ok) {
        const data = await textsRes.json();
        setUiTexts(data.texts || []);
      }

      if (themesRes.ok) {
        const data = await themesRes.json();
        setThemes(data.themes || []);
      }

      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setModelRules(data.rules || []);
      }

      if (pluginsRes.ok) {
        const data = await pluginsRes.json();
        setPlugins(data.plugins || []);
      }

      if (notesRes.ok) {
        const data = await notesRes.json();
        setSystemNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setShowCreateUser(false);
        setNewUser({ username: "", password: "" });
        loadData();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/keys/set", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newKey),
      });

      if (response.ok) {
        setShowAddKey(false);
        setNewKey({ key_name: "", value: "" });
        loadData();
      }
    } catch (error) {
      console.error("Failed to add key:", error);
    }
  };

  const handleDeleteApiKey = async (keyName: string) => {
    try {
      const response = await fetch(`/api/admin/keys/delete?key_name=${keyName}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error("Failed to delete key:", error);
    }
  };

  const handleTestApiKey = async (keyName: string) => {
    setTestingKey(keyName);
    setTestResult(null);
    
    try {
      const response = await fetch("/api/admin/keys/test", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ key_type: keyName }),
      });

      const data = await response.json();
      setTestResult({ keyName, result: data });
    } catch (error) {
      console.error("Failed to test key:", error);
      setTestResult({ 
        keyName, 
        result: { 
          success: false, 
          status: 'ERROR', 
          message: 'Failed to test key: ' + (error instanceof Error ? error.message : 'Unknown error') 
        } 
      });
    } finally {
      setTestingKey(null);
    }
  };

  const handleAddUiText = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/ui-texts/update", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newText),
      });

      if (response.ok) {
        setShowAddText(false);
        setNewText({ key: "", value: "", category: "" });
        loadData();
      }
    } catch (error) {
      console.error("Failed to add UI text:", error);
    }
  };

  const handleAddTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/themes/create", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newTheme),
      });

      if (response.ok) {
        setShowAddTheme(false);
        loadData();
      }
    } catch (error) {
      console.error("Failed to add theme:", error);
    }
  };

  const handleAddModelRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/models/rules/add", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newRule),
      });

      if (response.ok) {
        setShowAddRule(false);
        setNewRule({
          rule_name: "",
          trigger_type: "keyword",
          trigger_value: "",
          target_model: "",
          priority: 0
        });
        loadData();
      }
    } catch (error) {
      console.error("Failed to add rule:", error);
    }
  };

  const handleDeleteModelRule = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/models/rules/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  };

  const handleTogglePlugin = async (pluginName: string, isEnabled: boolean) => {
    try {
      const response = await fetch("/api/admin/plugins/toggle", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ plugin_name: pluginName, is_enabled: !isEnabled }),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error("Failed to toggle plugin:", error);
    }
  };

  const handleAddSystemNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/system-notes/create", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        setShowAddNote(false);
        setNewNote({ title: "", message: "", note_type: "announcement" });
        loadData();
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleDeleteSystemNote = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/system-notes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleUpdateSplashConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/splash/update", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(splashConfig),
      });

      if (response.ok) {
        setShowSplashConfig(false);
        alert("Splash configuration updated! 🔥");
      }
    } catch (error) {
      console.error("Failed to update splash config:", error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/requests/${requestId}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/requests/${requestId}/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Name", "Email", "Category", "Reason", "Status", "Date"],
      ...requests.map(r => [r.name, r.email, r.category, r.reason, r.status, new Date(r.createdAt).toLocaleDateString()])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-requests-${Date.now()}.csv`;
    a.click();
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const user = JSON.parse(localStorage.getItem("devil_user") || "{}");
      const response = await fetch("/api/admin/upload-intro", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setShowUploadVideo(false);
        setVideoFile(null);
        alert("Intro video uploaded successfully! 🔥");
      }
    } catch (error) {
      console.error("Failed to upload video:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("devil_user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl text-primary">⚡</div>
          <p className="text-foreground animate-pulse font-mono">Loading System Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="grid-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2 font-mono flex items-center gap-3">
              <span className="text-5xl">⚡</span>
              <span className="neon-underline">DEVIL DEV</span>
              <span className="text-2xl text-muted-foreground">/ Command Center</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm">Developer + Game Dev + UI/UX AI Platform</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-accent/10 font-mono vscode-hover"
          >
            ← Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-card/50 border border-border flex-wrap h-auto font-mono">
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Requests ({requests.filter(r => r.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="keys" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">🔑 API Keys</TabsTrigger>
            <TabsTrigger value="ui-texts" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">📝 UI Texts</TabsTrigger>
            <TabsTrigger value="splash" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">🎬 Splash</TabsTrigger>
            <TabsTrigger value="themes" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">🎨 Themes</TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">🤖 Routing</TabsTrigger>
            <TabsTrigger value="plugins" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">🔌 Plugins</TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">📢 Notes</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">📊 Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">⚙️ Settings</TabsTrigger>
          </TabsList>

          {/* Access Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">Access Requests</h2>
              <Button onClick={handleExportCSV} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                📥 Export CSV
              </Button>
            </div>

            <Card className="terminal-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-primary font-mono">Name</TableHead>
                    <TableHead className="text-primary font-mono">Email</TableHead>
                    <TableHead className="text-primary font-mono">Category</TableHead>
                    <TableHead className="text-primary font-mono">Reason</TableHead>
                    <TableHead className="text-primary font-mono">Status</TableHead>
                    <TableHead className="text-primary font-mono">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="border-border/30">
                      <TableCell className="text-foreground font-mono">{request.name}</TableCell>
                      <TableCell className="text-foreground font-mono text-sm">{request.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-accent text-accent font-mono">
                          {request.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "outline"}
                          className={
                            request.status === "pending"
                              ? "border-yellow-500 text-yellow-500 font-mono"
                              : request.status === "approved"
                              ? "bg-green-600 font-mono"
                              : "bg-destructive font-mono"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveRequest(request.id)} className="bg-green-600 hover:bg-green-700 text-white font-mono vscode-hover">
                              ✓
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)} className="font-mono vscode-hover">
                              ✗
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8 font-mono">
                        No pending requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">System Users</h2>
              <Button onClick={() => setShowCreateUser(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                + Create User
              </Button>
            </div>

            <Card className="terminal-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-primary font-mono">User ID</TableHead>
                    <TableHead className="text-primary font-mono">Username</TableHead>
                    <TableHead className="text-primary font-mono">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-border/30">
                      <TableCell className="text-foreground font-mono text-sm">{user.id}</TableCell>
                      <TableCell className="text-foreground font-mono">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8 font-mono">
                        No users yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">🔑 API Key Vault</h2>
              <Button onClick={() => setShowAddKey(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                + Add Key
              </Button>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <Card className={`terminal-card p-4 border-2 ${
                testResult.result.success 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-red-500 bg-red-500/10'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {testResult.result.status === 'WORKING' && '✅'}
                    {testResult.result.status === 'INVALID' && '❌'}
                    {testResult.result.status === 'NOT_FOUND' && '⚠️'}
                    {testResult.result.status === 'ERROR' && '🔥'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-mono text-primary mb-1">
                      Test Result: {testResult.keyName}
                    </h3>
                    <p className={`text-sm font-mono ${
                      testResult.result.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {testResult.result.message}
                    </p>
                    {testResult.result.modelsCount && (
                      <p className="text-xs text-muted-foreground font-mono mt-2">
                        ✓ OpenRouter returned {testResult.result.modelsCount} available models
                      </p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setTestResult(null)}
                    className="font-mono"
                  >
                    ✕
                  </Button>
                </div>
              </Card>
            )}

            <Card className="terminal-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-primary font-mono">Key Name</TableHead>
                    <TableHead className="text-primary font-mono">Created By</TableHead>
                    <TableHead className="text-primary font-mono">Created At</TableHead>
                    <TableHead className="text-primary font-mono">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id} className="border-border/30">
                      <TableCell className="text-foreground font-mono text-sm">{key.key_name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">{key.created_by}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">{new Date(key.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleTestApiKey(key.key_name)} 
                            disabled={testingKey === key.key_name}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground font-mono vscode-hover"
                          >
                            {testingKey === key.key_name ? '⏳ Testing...' : '🔍 Test'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteApiKey(key.key_name)} 
                            className="font-mono vscode-hover"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apiKeys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8 font-mono">
                        No API keys configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* UI Texts Tab */}
          <TabsContent value="ui-texts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">📝 UI Text Manager</h2>
              <Button onClick={() => setShowAddText(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                + Add Text
              </Button>
            </div>

            <Card className="terminal-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-primary font-mono">Key</TableHead>
                    <TableHead className="text-primary font-mono">Value</TableHead>
                    <TableHead className="text-primary font-mono">Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uiTexts.map((text) => (
                    <TableRow key={text.id} className="border-border/30">
                      <TableCell className="text-foreground font-mono text-sm">{text.key}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm max-w-md truncate">{text.value}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-accent text-accent font-mono">
                          {text.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {uiTexts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8 font-mono">
                        No UI texts configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Splash Manager Tab */}
          <TabsContent value="splash" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">🎬 Splash Screen</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowSplashConfig(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                  Configure
                </Button>
                <Button onClick={() => setShowUploadVideo(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                  Upload Video
                </Button>
              </div>
            </div>

            <Card className="terminal-card p-6">
              <div className="space-y-3 text-foreground font-mono text-sm">
                <p><span className="text-primary">Title:</span> {splashConfig.title}</p>
                <p><span className="text-primary">Subtitle:</span> {splashConfig.subtitle}</p>
                <p><span className="text-primary">Duration:</span> {splashConfig.duration}s</p>
                <p><span className="text-primary">Screen Shake:</span> {splashConfig.screenShake ? "✓ Enabled" : "✗ Disabled"}</p>
                <p><span className="text-primary">Fire Particles:</span> {splashConfig.fireParticles ? "✓ Enabled" : "✗ Disabled"}</p>
                <p><span className="text-primary">Fog Layer:</span> {splashConfig.fogLayer ? "✓ Enabled" : "✗ Disabled"}</p>
              </div>
            </Card>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">🎨 Theme Engine</h2>
              <Button onClick={() => setShowAddTheme(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                + Create Theme
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <Card key={theme.id} className="terminal-card p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg text-primary font-mono">{theme.name}</h3>
                    {theme.isDefault && (
                      <Badge className="bg-accent text-accent-foreground font-mono">Default</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: theme.accentColor }} />
                    <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: theme.backgroundColor }} />
                  </div>
                  <Badge variant={theme.isEnabled ? "default" : "outline"} className={theme.isEnabled ? "bg-green-600 font-mono" : "border-muted text-muted-foreground font-mono"}>
                    {theme.isEnabled ? "Active" : "Inactive"}
                  </Badge>
                </Card>
              ))}
              {themes.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8 font-mono">
                  No themes configured
                </div>
              )}
            </div>
          </TabsContent>

          {/* Model Routing Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">🤖 Model Routing</h2>
              <Button onClick={() => setShowAddRule(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                + Add Rule
              </Button>
            </div>

            <Card className="terminal-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-primary font-mono">Rule Name</TableHead>
                    <TableHead className="text-primary font-mono">Trigger</TableHead>
                    <TableHead className="text-primary font-mono">Target Model</TableHead>
                    <TableHead className="text-primary font-mono">Priority</TableHead>
                    <TableHead className="text-primary font-mono">Status</TableHead>
                    <TableHead className="text-primary font-mono">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelRules.map((rule) => (
                    <TableRow key={rule.id} className="border-border/30">
                      <TableCell className="text-foreground font-mono">{rule.ruleName}</TableCell>
                      <TableCell className="text-foreground font-mono text-sm">
                        <Badge variant="outline" className="border-accent text-accent font-mono mr-2">
                          {rule.triggerType}
                        </Badge>
                        <span className="text-muted-foreground">{rule.triggerValue}</span>
                      </TableCell>
                      <TableCell className="text-foreground font-mono text-xs">{rule.targetModel}</TableCell>
                      <TableCell className="text-foreground font-mono">{rule.priority}</TableCell>
                      <TableCell>
                        <Badge variant={rule.isEnabled ? "default" : "outline"} className={rule.isEnabled ? "bg-green-600 font-mono" : "border-muted text-muted-foreground font-mono"}>
                          {rule.isEnabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteModelRule(rule.id)} className="font-mono vscode-hover">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {modelRules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8 font-mono">
                        No routing rules configured
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Plugins Tab */}
          <TabsContent value="plugins" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">🔌 Plugin Manager</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plugins.map((plugin) => (
                <Card key={plugin.id} className="terminal-card p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg text-primary font-mono">{plugin.pluginName}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{plugin.pluginType}</p>
                    </div>
                    <Switch
                      checked={plugin.isEnabled}
                      onCheckedChange={() => handleTogglePlugin(plugin.pluginName, plugin.isEnabled)}
                    />
                  </div>
                </Card>
              ))}
              {plugins.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8 font-mono">
                  No plugins available
                </div>
              )}
            </div>
          </TabsContent>

          {/* System Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-primary font-mono">📢 System Notes</h2>
              <Button onClick={() => setShowAddNote(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
                + Create Note
              </Button>
            </div>

            <div className="space-y-4">
              {systemNotes.map((note) => (
                <Card key={note.id} className="terminal-card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg text-primary font-mono">{note.title}</h3>
                        <Badge variant="outline" className="border-accent text-accent font-mono">
                          {note.noteType}
                        </Badge>
                        {note.isActive && (
                          <Badge className="bg-green-600 text-white font-mono">Active</Badge>
                        )}
                      </div>
                      <p className="text-foreground text-sm font-mono">{note.message}</p>
                      <p className="text-muted-foreground text-xs mt-2 font-mono">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSystemNote(note.id)} className="font-mono vscode-hover">
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
              {systemNotes.length === 0 && (
                <Card className="terminal-card p-8 text-center text-muted-foreground font-mono">
                  No system notes
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl text-primary font-mono">📊 Analytics Dashboard</h2>
            <Card className="terminal-card p-6 text-center text-muted-foreground font-mono">
              <p className="text-lg mb-2">Analytics dashboard coming soon</p>
              <p className="text-sm">Track model usage, token consumption, and user activity</p>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl text-primary font-mono">⚙️ System Configuration</h2>
            
            <Card className="terminal-card p-6 space-y-6">
              <div className="border-t border-border pt-6">
                <h3 className="text-xl text-primary mb-4 font-mono">System Info</h3>
                <div className="space-y-2 text-sm font-mono">
                  <p className="text-foreground">Platform: <span className="text-primary">DEVIL DEV v2.0</span></p>
                  <p className="text-foreground">Admin ID: <span className="text-primary">devilbaby</span></p>
                  <p className="text-foreground">Total Users: <span className="text-primary">{users.length}</span></p>
                  <p className="text-foreground">API Keys: <span className="text-primary">{apiKeys.length}</span></p>
                  <p className="text-foreground">Themes: <span className="text-primary">{themes.length}</span></p>
                  <p className="text-foreground">Active Rules: <span className="text-primary">{modelRules.filter(r => r.isEnabled).length}</span></p>
                  <p className="text-foreground">Active Plugins: <span className="text-primary">{plugins.filter(p => p.isEnabled).length}</span></p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Username</Label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="bg-input border-border text-foreground font-mono vscode-hover"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-input border-border text-foreground font-mono vscode-hover"
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              Create User
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Video Modal */}
      <Dialog open={showUploadVideo} onOpenChange={setShowUploadVideo}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Upload Intro Video</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadVideo} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Video File (MP4)</Label>
              <Input
                type="file"
                accept="video/mp4"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="bg-input border-border text-foreground font-mono"
                required
              />
              <p className="text-xs text-muted-foreground font-mono">Max size: 50MB</p>
            </div>
            <Button type="submit" disabled={!videoFile} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              Upload
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add API Key Modal */}
      <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Add API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddApiKey} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Key Type</Label>
              <Select value={newKey.key_name} onValueChange={(value) => setNewKey({ ...newKey, key_name: value })}>
                <SelectTrigger className="bg-input border-border text-foreground font-mono vscode-hover">
                  <SelectValue placeholder="Select key type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="main_brain_key" className="text-foreground font-mono">🧠 Main Brain API Key</SelectItem>
                  <SelectItem value="coding_key" className="text-foreground font-mono">💻 Coding API Key</SelectItem>
                  <SelectItem value="debugging_api_key" className="text-foreground font-mono">🐛 Debugging / Fix Bugs API Key</SelectItem>
                  <SelectItem value="fast_api_key" className="text-foreground font-mono">⚡ Fast Daily Use API Key</SelectItem>
                  <SelectItem value="uiux_mockup_api_key" className="text-foreground font-mono">🎨 UI/UX & Mockup API Key</SelectItem>
                  <SelectItem value="image_generation_api_key" className="text-foreground font-mono">🖼️ Image Generation API Key</SelectItem>
                  <SelectItem value="game_dev_key" className="text-foreground font-mono">🎮 Game Dev API Key</SelectItem>
                  <SelectItem value="canvas_notes_api_key" className="text-foreground font-mono">📝 Canvas / PPT / Notes API Key</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground font-mono">Auto-router will select the best model</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">OpenRouter API Key</Label>
              <Input
                type="password"
                value={newKey.value}
                onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                className="bg-input border-border text-foreground font-mono vscode-hover"
                placeholder={
                  newKey.key_name === "debugging_api_key" 
                    ? "Enter your Debugging API Key" 
                    : newKey.key_name === "fast_api_key"
                    ? "Enter your Fast API Key"
                    : newKey.key_name === "canvas_notes_api_key"
                    ? "Enter your Canvas/Notes API Key"
                    : newKey.key_name === "uiux_mockup_api_key"
                    ? "Enter your UI/UX & Mockup API Key"
                    : newKey.key_name === "image_generation_api_key"
                    ? "Enter your Image Generation API Key"
                    : "sk-or-v1-..."
                }
                required
              />
              <p className="text-xs text-muted-foreground font-mono">🔒 AES-256-GCM encrypted</p>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              Save Key
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add UI Text Modal */}
      <Dialog open={showAddText} onOpenChange={setShowAddText}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Add UI Text</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUiText} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Text Key</Label>
              <Input
                value={newText.key}
                onChange={(e) => setNewText({ ...newText, key: e.target.value })}
                className="bg-input border-border text-foreground font-mono vscode-hover"
                placeholder="e.g., splash_title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Text Value</Label>
              <Textarea
                value={newText.value}
                onChange={(e) => setNewText({ ...newText, value: e.target.value })}
                className="bg-input border-border text-foreground font-mono vscode-hover"
                placeholder="Enter text content"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Category</Label>
              <Select value={newText.category} onValueChange={(value) => setNewText({ ...newText, category: value })}>
                <SelectTrigger className="bg-input border-border text-foreground font-mono vscode-hover">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="splash" className="font-mono">Splash</SelectItem>
                  <SelectItem value="login" className="font-mono">Login</SelectItem>
                  <SelectItem value="chat" className="font-mono">Chat</SelectItem>
                  <SelectItem value="buttons" className="font-mono">Buttons</SelectItem>
                  <SelectItem value="messages" className="font-mono">Messages</SelectItem>
                  <SelectItem value="errors" className="font-mono">Errors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              Save Text
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Theme Modal */}
      <Dialog open={showAddTheme} onOpenChange={setShowAddTheme}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Create New Theme</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTheme} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Theme Name</Label>
                <Input
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  className="bg-input border-border text-foreground font-mono"
                  placeholder="Devil Red"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Primary Color</Label>
                <Input
                  type="color"
                  value={newTheme.primaryColor}
                  onChange={(e) => setNewTheme({ ...newTheme, primaryColor: e.target.value })}
                  className="bg-input border-border h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Accent Color</Label>
                <Input
                  type="color"
                  value={newTheme.accentColor}
                  onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })}
                  className="bg-input border-border h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Background Color</Label>
                <Input
                  type="color"
                  value={newTheme.backgroundColor}
                  onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                  className="bg-input border-border h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Glow Intensity (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTheme.glowIntensity}
                  onChange={(e) => setNewTheme({ ...newTheme, glowIntensity: parseInt(e.target.value) })}
                  className="bg-input border-border text-foreground font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Smoke Density (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTheme.smokeDensity}
                  onChange={(e) => setNewTheme({ ...newTheme, smokeDensity: parseInt(e.target.value) })}
                  className="bg-input border-border text-foreground font-mono"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              🎨 Create Theme
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Model Rule Modal */}
      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Add Routing Rule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddModelRule} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Rule Name</Label>
              <Input
                value={newRule.rule_name}
                onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                className="bg-input border-border text-foreground font-mono"
                placeholder="Coding Assistant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Trigger Type</Label>
              <Select value={newRule.trigger_type} onValueChange={(value) => setNewRule({ ...newRule, trigger_type: value })}>
                <SelectTrigger className="bg-input border-border text-foreground font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="file_type">File Type</SelectItem>
                  <SelectItem value="length">Request Length</SelectItem>
                  <SelectItem value="intent">Intent Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Trigger Value</Label>
              <Input
                value={newRule.trigger_value}
                onChange={(e) => setNewRule({ ...newRule, trigger_value: e.target.value })}
                className="bg-input border-border text-foreground font-mono"
                placeholder="code, python, debug"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Target Model</Label>
              <Input
                value={newRule.target_model}
                onChange={(e) => setNewRule({ ...newRule, target_model: e.target.value })}
                className="bg-input border-border text-foreground font-mono"
                placeholder="gpt-4-turbo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Priority (higher = first)</Label>
              <Input
                type="number"
                value={newRule.priority}
                onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                className="bg-input border-border text-foreground font-mono"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              🤖 Add Rule
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add System Note Modal */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Create System Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSystemNote} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Title</Label>
              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="bg-input border-border text-foreground font-mono"
                placeholder="System Update"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Message</Label>
              <Textarea
                value={newNote.message}
                onChange={(e) => setNewNote({ ...newNote, message: e.target.value })}
                className="bg-input border-border text-foreground font-mono"
                placeholder="Enter announcement message..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-mono">Type</Label>
              <Select value={newNote.note_type} onValueChange={(value) => setNewNote({ ...newNote, note_type: value })}>
                <SelectTrigger className="bg-input border-border text-foreground font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="announcement">📢 Announcement</SelectItem>
                  <SelectItem value="update">🆕 Update</SelectItem>
                  <SelectItem value="maintenance">⚠️ Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              📢 Create Note
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Splash Config Modal */}
      <Dialog open={showSplashConfig} onOpenChange={setShowSplashConfig}>
        <DialogContent className="command-palette">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono text-primary">Splash Configuration</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSplashConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Title</Label>
                <Input
                  value={splashConfig.title}
                  onChange={(e) => setSplashConfig({ ...splashConfig, title: e.target.value })}
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Subtitle</Label>
                <Input
                  value={splashConfig.subtitle}
                  onChange={(e) => setSplashConfig({ ...splashConfig, subtitle: e.target.value })}
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Duration (seconds)</Label>
                <Input
                  type="number"
                  value={splashConfig.duration}
                  onChange={(e) => setSplashConfig({ ...splashConfig, duration: parseInt(e.target.value) })}
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-mono">Glow Color</Label>
                <Input
                  type="color"
                  value={splashConfig.glowColor}
                  onChange={(e) => setSplashConfig({ ...splashConfig, glowColor: e.target.value })}
                  className="bg-input border-border h-10"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-mono">Screen Shake Effect</Label>
                <Switch
                  checked={splashConfig.screenShake}
                  onCheckedChange={(checked) => setSplashConfig({ ...splashConfig, screenShake: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-mono">Fire Particles</Label>
                <Switch
                  checked={splashConfig.fireParticles}
                  onCheckedChange={(checked) => setSplashConfig({ ...splashConfig, fireParticles: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-mono">Fog Layer</Label>
                <Switch
                  checked={splashConfig.fogLayer}
                  onCheckedChange={(checked) => setSplashConfig({ ...splashConfig, fogLayer: checked })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono vscode-hover">
              💾 Save Configuration
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}