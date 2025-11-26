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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl neon-text glitch-text">⚡</div>
          <p className="text-orange-500 animate-pulse">Loading Hell's Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-red-500 p-8">
      <div className="fog-overlay" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold glitch-text neon-text mb-2">
              👹 Devil's Control Panel v2.0
            </h1>
            <p className="text-orange-500">Master of the Abyss</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-600 text-red-500 hover:bg-red-950"
          >
            🔥 Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-black/50 border border-red-600 flex-wrap h-auto">
            <TabsTrigger value="requests">Requests ({requests.filter(r => r.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="keys">🔑 API Keys</TabsTrigger>
            <TabsTrigger value="ui-texts">📝 UI Texts</TabsTrigger>
            <TabsTrigger value="splash">🎬 Splash</TabsTrigger>
            <TabsTrigger value="themes">🎨 Themes</TabsTrigger>
            <TabsTrigger value="models">🤖 Model Routing</TabsTrigger>
            <TabsTrigger value="plugins">🔌 Plugins</TabsTrigger>
            <TabsTrigger value="notes">📢 System Notes</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          </TabsList>

          {/* Access Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-red-400">Pending Soul Requests</h2>
              <Button onClick={handleExportCSV} className="bg-gradient-to-r from-red-600 to-orange-500 text-black">
                📥 Export CSV
              </Button>
            </div>

            <Card className="devil-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-red-600">
                    <TableHead className="text-orange-500">Name</TableHead>
                    <TableHead className="text-orange-500">Email</TableHead>
                    <TableHead className="text-orange-500">Category</TableHead>
                    <TableHead className="text-orange-500">Reason</TableHead>
                    <TableHead className="text-orange-500">Status</TableHead>
                    <TableHead className="text-orange-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="border-red-600/30">
                      <TableCell className="text-red-400">{request.name}</TableCell>
                      <TableCell className="text-red-400">{request.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          {request.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-red-400 max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "outline"}
                          className={
                            request.status === "pending"
                              ? "border-yellow-500 text-yellow-500"
                              : request.status === "approved"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveRequest(request.id)} className="bg-green-600 hover:bg-green-700 text-white">
                              ✓ Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
                              ✗ Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-orange-500 py-8">
                        No souls seeking entry... yet 👹
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
              <h2 className="text-2xl text-red-400">Damned Souls</h2>
              <Button onClick={() => setShowCreateUser(true)} className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
                ➕ Create User
              </Button>
            </div>

            <Card className="devil-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-red-600">
                    <TableHead className="text-orange-500">User ID</TableHead>
                    <TableHead className="text-orange-500">Username</TableHead>
                    <TableHead className="text-orange-500">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-red-600/30">
                      <TableCell className="text-red-400 font-mono">{user.id}</TableCell>
                      <TableCell className="text-red-400">{user.username}</TableCell>
                      <TableCell className="text-red-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-orange-500 py-8">
                        No users yet. Create the first soul! 🔥
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
              <h2 className="text-2xl text-red-400">🔑 API Key Vault (AES-256-GCM Encrypted)</h2>
              <Button onClick={() => setShowAddKey(true)} className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
                ➕ Add Key
              </Button>
            </div>

            <Card className="devil-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-red-600">
                    <TableHead className="text-orange-500">Key Name</TableHead>
                    <TableHead className="text-orange-500">Created By</TableHead>
                    <TableHead className="text-orange-500">Created At</TableHead>
                    <TableHead className="text-orange-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id} className="border-red-600/30">
                      <TableCell className="text-red-400 font-mono">{key.key_name}</TableCell>
                      <TableCell className="text-red-400">{key.created_by}</TableCell>
                      <TableCell className="text-red-400">{new Date(key.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteApiKey(key.key_name)}>
                          🗑️ Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apiKeys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-orange-500 py-8">
                        No API keys configured. Add your first key! 🔐
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
              <h2 className="text-2xl text-red-400">📝 UI Text Manager</h2>
              <Button onClick={() => setShowAddText(true)} className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
                ➕ Add Text
              </Button>
            </div>

            <Card className="devil-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-red-600">
                    <TableHead className="text-orange-500">Key</TableHead>
                    <TableHead className="text-orange-500">Value</TableHead>
                    <TableHead className="text-orange-500">Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uiTexts.map((text) => (
                    <TableRow key={text.id} className="border-red-600/30">
                      <TableCell className="text-red-400 font-mono">{text.key}</TableCell>
                      <TableCell className="text-red-400 max-w-md truncate">{text.value}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          {text.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {uiTexts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-orange-500 py-8">
                        No UI texts configured. Add your first text! 📝
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
              <h2 className="text-2xl text-red-400">🎬 Splash Screen Manager</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowSplashConfig(true)} className="bg-gradient-to-r from-red-600 to-orange-500 text-black">
                  ⚙️ Configure
                </Button>
                <Button onClick={() => setShowUploadVideo(true)} className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black">
                  📤 Upload Video
                </Button>
              </div>
            </div>

            <Card className="devil-card p-6">
              <div className="space-y-4 text-red-400">
                <p><strong>Title:</strong> {splashConfig.title}</p>
                <p><strong>Subtitle:</strong> {splashConfig.subtitle}</p>
                <p><strong>Duration:</strong> {splashConfig.duration}s</p>
                <p><strong>Screen Shake:</strong> {splashConfig.screenShake ? "✓ Enabled" : "✗ Disabled"}</p>
                <p><strong>Fire Particles:</strong> {splashConfig.fireParticles ? "✓ Enabled" : "✗ Disabled"}</p>
                <p><strong>Fog Layer:</strong> {splashConfig.fogLayer ? "✓ Enabled" : "✗ Disabled"}</p>
              </div>
            </Card>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-red-400">🎨 Theme Engine</h2>
              <Button onClick={() => setShowAddTheme(true)} className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
                ➕ Create Theme
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <Card key={theme.id} className="devil-card p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl text-red-400 font-bold">{theme.name}</h3>
                    {theme.isDefault && (
                      <Badge className="bg-orange-500 text-black">Default</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.accentColor }} />
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.backgroundColor }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={theme.isEnabled ? "default" : "outline"} className={theme.isEnabled ? "bg-green-600" : "border-gray-500 text-gray-500"}>
                      {theme.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </Card>
              ))}
              {themes.length === 0 && (
                <div className="col-span-full text-center text-orange-500 py-8">
                  No themes yet. Create your first theme! 🎨
                </div>
              )}
            </div>
          </TabsContent>

          {/* Model Routing Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-red-400">🤖 Model Routing Rules</h2>
              <Button onClick={() => setShowAddRule(true)} className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
                ➕ Add Rule
              </Button>
            </div>

            <Card className="devil-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-red-600">
                    <TableHead className="text-orange-500">Rule Name</TableHead>
                    <TableHead className="text-orange-500">Trigger</TableHead>
                    <TableHead className="text-orange-500">Target Model</TableHead>
                    <TableHead className="text-orange-500">Priority</TableHead>
                    <TableHead className="text-orange-500">Status</TableHead>
                    <TableHead className="text-orange-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelRules.map((rule) => (
                    <TableRow key={rule.id} className="border-red-600/30">
                      <TableCell className="text-red-400">{rule.ruleName}</TableCell>
                      <TableCell className="text-red-400">
                        <Badge variant="outline" className="border-orange-500 text-orange-500 mr-2">
                          {rule.triggerType}
                        </Badge>
                        <span className="text-sm">{rule.triggerValue}</span>
                      </TableCell>
                      <TableCell className="text-red-400 font-mono text-sm">{rule.targetModel}</TableCell>
                      <TableCell className="text-red-400">{rule.priority}</TableCell>
                      <TableCell>
                        <Badge variant={rule.isEnabled ? "default" : "outline"} className={rule.isEnabled ? "bg-green-600" : "border-gray-500 text-gray-500"}>
                          {rule.isEnabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteModelRule(rule.id)}>
                          🗑️
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {modelRules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-orange-500 py-8">
                        No routing rules configured. Add your first rule! 🤖
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
              <h2 className="text-2xl text-red-400">🔌 Plugin Manager</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plugins.map((plugin) => (
                <Card key={plugin.id} className="devil-card p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg text-red-400 font-bold">{plugin.pluginName}</h3>
                      <p className="text-sm text-orange-500">{plugin.pluginType}</p>
                    </div>
                    <Switch
                      checked={plugin.isEnabled}
                      onCheckedChange={() => handleTogglePlugin(plugin.pluginName, plugin.isEnabled)}
                    />
                  </div>
                </Card>
              ))}
              {plugins.length === 0 && (
                <div className="col-span-full text-center text-orange-500 py-8">
                  No plugins available. 🔌
                </div>
              )}
            </div>
          </TabsContent>

          {/* System Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-red-400">📢 System Announcements</h2>
              <Button onClick={() => setShowAddNote(true)} className="fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
                ➕ Create Note
              </Button>
            </div>

            <div className="space-y-4">
              {systemNotes.map((note) => (
                <Card key={note.id} className="devil-card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg text-red-400 font-bold">{note.title}</h3>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          {note.noteType}
                        </Badge>
                        {note.isActive && (
                          <Badge className="bg-green-600 text-white">Active</Badge>
                        )}
                      </div>
                      <p className="text-red-400 text-sm">{note.message}</p>
                      <p className="text-orange-500 text-xs mt-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSystemNote(note.id)}>
                      🗑️
                    </Button>
                  </div>
                </Card>
              ))}
              {systemNotes.length === 0 && (
                <Card className="devil-card p-8 text-center text-orange-500">
                  No system notes. Create your first announcement! 📢
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab - Placeholder */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-2xl text-red-400">📊 Analytics Dashboard</h2>
            <Card className="devil-card p-6 text-center text-orange-500">
              <p>Analytics dashboard coming soon! 📊</p>
              <p className="text-sm mt-2">Track model usage, token consumption, and user activity.</p>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl text-red-400">Hell's Configuration</h2>
            
            <Card className="devil-card p-6 space-y-6">
              <div className="border-t border-red-600 pt-6">
                <h3 className="text-xl text-orange-500 mb-2">👹 System Info</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-red-400">Platform: <span className="text-orange-500">I AM DEVIL v2.0</span></p>
                  <p className="text-red-400">Admin ID: <span className="text-orange-500 font-mono">devilbaby</span></p>
                  <p className="text-red-400">Total Users: <span className="text-orange-500">{users.length}</span></p>
                  <p className="text-red-400">API Keys: <span className="text-orange-500">{apiKeys.length}</span></p>
                  <p className="text-red-400">Themes: <span className="text-orange-500">{themes.length}</span></p>
                  <p className="text-red-400">Active Rules: <span className="text-orange-500">{modelRules.filter(r => r.isEnabled).length}</span></p>
                  <p className="text-red-400">Active Plugins: <span className="text-orange-500">{plugins.filter(p => p.isEnabled).length}</span></p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="devil-card border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Create New Soul</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-400">Username</Label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              🔥 Create User
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Video Modal */}
      <Dialog open={showUploadVideo} onOpenChange={setShowUploadVideo}>
        <DialogContent className="devil-card border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Upload Intro Video</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadVideo} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-400">Video File (MP4)</Label>
              <Input
                type="file"
                accept="video/mp4"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="bg-black/80 border-red-600 text-orange-500"
                required
              />
              <p className="text-xs text-red-600">Max size: 50MB. Will auto-play for 5 seconds on splash screen.</p>
            </div>
            <Button type="submit" disabled={!videoFile} className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              🔥 Upload
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add API Key Modal */}
      <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
        <DialogContent className="devil-card border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Add API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddApiKey} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-400">Key Name</Label>
              <Select value={newKey.key_name} onValueChange={(value) => setNewKey({ ...newKey, key_name: value })}>
                <SelectTrigger className="bg-black/80 border-red-600 text-orange-500">
                  <SelectValue placeholder="Select key type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-red-600">
                  <SelectItem value="openrouter_api_key">OpenRouter API Key</SelectItem>
                  <SelectItem value="openrouter_embedding_key">OpenRouter Embedding Key</SelectItem>
                  <SelectItem value="image_generation_key">Image Generation Key</SelectItem>
                  <SelectItem value="tts_api_key">TTS API Key</SelectItem>
                  <SelectItem value="ocr_api_key">OCR API Key</SelectItem>
                  <SelectItem value="youtube_transcript_key">YouTube Transcript Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">API Key Value</Label>
              <Input
                type="password"
                value={newKey.value}
                onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="Enter API key"
                required
              />
              <p className="text-xs text-orange-500">🔒 Will be encrypted with AES-256-GCM</p>
            </div>
            <Button type="submit" className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              🔐 Save Key
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add UI Text Modal */}
      <Dialog open={showAddText} onOpenChange={setShowAddText}>
        <DialogContent className="devil-card border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Add/Edit UI Text</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUiText} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-400">Text Key</Label>
              <Input
                value={newText.key}
                onChange={(e) => setNewText({ ...newText, key: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="e.g., splash_title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Text Value</Label>
              <Textarea
                value={newText.value}
                onChange={(e) => setNewText({ ...newText, value: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="Enter text content"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Category</Label>
              <Select value={newText.category} onValueChange={(value) => setNewText({ ...newText, category: value })}>
                <SelectTrigger className="bg-black/80 border-red-600 text-orange-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black border-red-600">
                  <SelectItem value="splash">Splash Screen</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="buttons">Buttons</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="errors">Errors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              💾 Save Text
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Theme Modal */}
      <Dialog open={showAddTheme} onOpenChange={setShowAddTheme}>
        <DialogContent className="devil-card border-2 border-red-600 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Create New Theme</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTheme} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-400">Theme Name</Label>
                <Input
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  className="bg-black/80 border-red-600 text-orange-500"
                  placeholder="Devil Red"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Primary Color</Label>
                <Input
                  type="color"
                  value={newTheme.primaryColor}
                  onChange={(e) => setNewTheme({ ...newTheme, primaryColor: e.target.value })}
                  className="bg-black/80 border-red-600 h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Accent Color</Label>
                <Input
                  type="color"
                  value={newTheme.accentColor}
                  onChange={(e) => setNewTheme({ ...newTheme, accentColor: e.target.value })}
                  className="bg-black/80 border-red-600 h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Background Color</Label>
                <Input
                  type="color"
                  value={newTheme.backgroundColor}
                  onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                  className="bg-black/80 border-red-600 h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Glow Intensity (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTheme.glowIntensity}
                  onChange={(e) => setNewTheme({ ...newTheme, glowIntensity: parseInt(e.target.value) })}
                  className="bg-black/80 border-red-600 text-orange-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Smoke Density (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTheme.smokeDensity}
                  onChange={(e) => setNewTheme({ ...newTheme, smokeDensity: parseInt(e.target.value) })}
                  className="bg-black/80 border-red-600 text-orange-500"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              🎨 Create Theme
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Model Rule Modal */}
      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent className="devil-card border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Add Routing Rule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddModelRule} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-400">Rule Name</Label>
              <Input
                value={newRule.rule_name}
                onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="Coding Assistant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Trigger Type</Label>
              <Select value={newRule.trigger_type} onValueChange={(value) => setNewRule({ ...newRule, trigger_type: value })}>
                <SelectTrigger className="bg-black/80 border-red-600 text-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-red-600">
                  <SelectItem value="keyword">Keyword</SelectItem>
                  <SelectItem value="file_type">File Type</SelectItem>
                  <SelectItem value="length">Request Length</SelectItem>
                  <SelectItem value="intent">Intent Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Trigger Value</Label>
              <Input
                value={newRule.trigger_value}
                onChange={(e) => setNewRule({ ...newRule, trigger_value: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="code, python, debug"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Target Model</Label>
              <Input
                value={newRule.target_model}
                onChange={(e) => setNewRule({ ...newRule, target_model: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="gpt-4-turbo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Priority (higher = first)</Label>
              <Input
                type="number"
                value={newRule.priority}
                onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                className="bg-black/80 border-red-600 text-orange-500"
                required
              />
            </div>
            <Button type="submit" className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              🤖 Add Rule
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add System Note Modal */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="devil-card border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Create System Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSystemNote} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-400">Title</Label>
              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="System Update"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Message</Label>
              <Textarea
                value={newNote.message}
                onChange={(e) => setNewNote({ ...newNote, message: e.target.value })}
                className="bg-black/80 border-red-600 text-orange-500"
                placeholder="Enter announcement message..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-400">Type</Label>
              <Select value={newNote.note_type} onValueChange={(value) => setNewNote({ ...newNote, note_type: value })}>
                <SelectTrigger className="bg-black/80 border-red-600 text-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-red-600">
                  <SelectItem value="announcement">📢 Announcement</SelectItem>
                  <SelectItem value="update">🆕 Update</SelectItem>
                  <SelectItem value="maintenance">⚠️ Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              📢 Create Note
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Splash Config Modal */}
      <Dialog open={showSplashConfig} onOpenChange={setShowSplashConfig}>
        <DialogContent className="devil-card border-2 border-red-600 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl glitch-text neon-text">Splash Configuration</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSplashConfig} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-400">Title</Label>
                <Input
                  value={splashConfig.title}
                  onChange={(e) => setSplashConfig({ ...splashConfig, title: e.target.value })}
                  className="bg-black/80 border-red-600 text-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Subtitle</Label>
                <Input
                  value={splashConfig.subtitle}
                  onChange={(e) => setSplashConfig({ ...splashConfig, subtitle: e.target.value })}
                  className="bg-black/80 border-red-600 text-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Duration (seconds)</Label>
                <Input
                  type="number"
                  value={splashConfig.duration}
                  onChange={(e) => setSplashConfig({ ...splashConfig, duration: parseInt(e.target.value) })}
                  className="bg-black/80 border-red-600 text-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-400">Glow Color</Label>
                <Input
                  type="color"
                  value={splashConfig.glowColor}
                  onChange={(e) => setSplashConfig({ ...splashConfig, glowColor: e.target.value })}
                  className="bg-black/80 border-red-600 h-10"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-red-400">Screen Shake Effect</Label>
                <Switch
                  checked={splashConfig.screenShake}
                  onCheckedChange={(checked) => setSplashConfig({ ...splashConfig, screenShake: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-red-400">Fire Particles</Label>
                <Switch
                  checked={splashConfig.fireParticles}
                  onCheckedChange={(checked) => setSplashConfig({ ...splashConfig, fireParticles: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-red-400">Fog Layer</Label>
                <Switch
                  checked={splashConfig.fogLayer}
                  onCheckedChange={(checked) => setSplashConfig({ ...splashConfig, fogLayer: checked })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold">
              💾 Save Configuration
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}