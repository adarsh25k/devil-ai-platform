"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onRequestAccess: () => void;
  onLogin: (username: string, password: string, isAdmin: boolean) => void;
}

export default function LoginModal({ open, onClose, onRequestAccess, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(username, password, isAdmin);
    } catch (err) {
      setError("Access denied. Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="command-palette max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono text-primary text-center">
            Developer Access Required
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-mono text-center mt-2">
            Authenticate to enter the workspace
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Toggle Admin/User */}
          <div className="flex gap-2 p-1 bg-input rounded border border-border">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2 rounded transition-all font-mono text-sm ${
                !isAdmin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2 rounded transition-all font-mono text-sm ${
                isAdmin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground font-mono text-sm">
              <span className="text-primary">{'>'}</span> {isAdmin ? "admin_id" : "username"}
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-input border-border text-foreground font-mono vscode-hover"
              placeholder={isAdmin ? "devilbaby" : "enter username"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-mono text-sm">
              <span className="text-primary">{'>'}</span> password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border text-foreground font-mono vscode-hover"
              placeholder="enter password"
              required
            />
          </div>

          {error && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded border border-destructive font-mono">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-base py-6 vscode-hover"
          >
            {loading ? "Authenticating..." : "Access Workspace"}
          </Button>

          <div className="text-center space-y-2 pt-2 border-t border-border">
            <p className="text-muted-foreground text-sm font-mono">Need access?</p>
            <button
              type="button"
              onClick={onRequestAccess}
              className="text-primary hover:text-primary/80 underline text-sm font-mono"
            >
              Request Access →
            </button>
          </div>
        </form>

        {/* Decorative indicator */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-8">
          <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
          <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] terminal-cursor" />
        </div>
      </DialogContent>
    </Dialog>
  );
}