"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccessRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AccessRequestData) => void;
}

export interface AccessRequestData {
  name: string;
  email: string;
  reason: string;
  category: "Student" | "Working";
}

export default function AccessRequestModal({ open, onClose, onSubmit }: AccessRequestModalProps) {
  const [formData, setFormData] = useState<AccessRequestData>({
    name: "",
    email: "",
    reason: "",
    category: "Student",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({ name: "", email: "", reason: "", category: "Student" });
      }, 3000);
    } catch (error) {
      console.error("Failed to submit request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="devil-card max-w-md border-2 border-red-600">
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">😈</div>
            <h3 className="text-2xl glitch-text neon-text">Request Received!</h3>
            <p className="text-orange-500">
              The Devil will review your soul and decide your fate.
            </p>
            <p className="text-red-600 text-sm">
              You'll be notified if you're worthy to enter Hell...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="devil-card max-w-md border-2 border-red-600 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl glitch-text neon-text text-center">
            Petition the Devil
          </DialogTitle>
          <p className="text-orange-500 text-center text-sm mt-2">
            Prove you're worthy of access to Hell
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-red-400">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/80 border-red-600 text-orange-500 placeholder:text-red-800"
              placeholder="What do they call you?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-red-400">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-black/80 border-red-600 text-orange-500 placeholder:text-red-800"
              placeholder="your.soul@hell.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-red-400">
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: "Student" | "Working") =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="bg-black/80 border-red-600 text-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-red-600">
                <SelectItem value="Student" className="text-orange-500 hover:bg-red-950">
                  Student
                </SelectItem>
                <SelectItem value="Working" className="text-orange-500 hover:bg-red-950">
                  Working Professional
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-red-400">
              Why do you seek the Devil? *
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="bg-black/80 border-red-600 text-orange-500 placeholder:text-red-800 min-h-32"
              placeholder="Tell us your darkest desires and how you plan to use this power..."
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full fire-burst bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-black font-bold text-lg py-6"
          >
            {loading ? "Sending to Hell..." : "🔥 Submit Request 🔥"}
          </Button>

          <p className="text-xs text-red-700 text-center">
            * The Devil reviews all requests personally. Only worthy souls gain access.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
