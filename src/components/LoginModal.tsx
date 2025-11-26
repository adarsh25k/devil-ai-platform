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
      setError("Invalid credentials. The devil rejects you! 👹");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="devil-card max-w-md border-2 border-red-600">
        <DialogHeader>
          <DialogTitle className="text-3xl glitch-text neon-text text-center">
            Enter the Abyss
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Toggle Admin/User */}
          <div className="flex gap-2 p-1 bg-black/50 rounded-lg border border-red-600">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2 rounded transition-all ${
                !isAdmin
                  ? "bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold"
                  : "text-red-500 hover:text-red-400"
              }`}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2 rounded transition-all ${
                isAdmin
                  ? "bg-gradient-to-r from-red-600 to-orange-500 text-black font-bold"
                  : "text-red-500 hover:text-red-400"
              }`}
            >
              Admin Login
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-red-400">
              {isAdmin ? "Admin ID" : "Username"}
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/80 border-red-600 text-orange-500 placeholder:text-red-800"
              placeholder={isAdmin ? "devilbaby" : "Enter your username"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-red-400">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/80 border-red-600 text-orange-500 placeholder:text-red-800"
              placeholder="Enter the secret spell"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-950/50 rounded border border-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-black font-bold text-lg py-6"
          >
            {loading ? "Summoning..." : "🔥 Enter Hell 🔥"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-red-600 text-sm">Don't have access?</p>
            <button
              type="button"
              onClick={onRequestAccess}
              className="text-orange-500 hover:text-orange-400 underline text-sm"
            >
              Request ID/PASS from the Devil →
            </button>
          </div>
        </form>

        {/* Decorative demon eyes */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-8">
          <div className="w-4 h-4 rounded-full bg-red-600 demon-eyes shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
          <div className="w-4 h-4 rounded-full bg-red-600 demon-eyes shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
