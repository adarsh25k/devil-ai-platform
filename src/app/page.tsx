"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BootAnimation } from "@/components/BootAnimation";
import LoginModal from "@/components/LoginModal";
import AccessRequestModal, { AccessRequestData } from "@/components/AccessRequestModal";

export default function Home() {
  const router = useRouter();
  const [showBoot, setShowBoot] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showAccessRequest, setShowAccessRequest] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("devil_user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/chat");
      }
    }
  }, [router]);

  const handleBootComplete = () => {
    setShowBoot(false);
    setShowLogin(true);
  };

  const handleLogin = async (username: string, password: string, isAdmin: boolean) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, isAdmin }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      
      // Store user data
      localStorage.setItem("devil_user", JSON.stringify({
        id: data.userId,
        username: data.username,
        isAdmin: data.isAdmin,
        token: data.token,
      }));

      // Redirect based on role
      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/chat");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleAccessRequest = async (data: AccessRequestData) => {
    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Access request error:", error);
      throw error;
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="grid-background" />
      
      {/* Boot Animation */}
      {showBoot && <BootAnimation onComplete={handleBootComplete} />}

      {/* Login Modal */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onRequestAccess={() => {
          setShowLogin(false);
          setShowAccessRequest(true);
        }}
        onLogin={handleLogin}
      />

      {/* Access Request Modal */}
      <AccessRequestModal
        open={showAccessRequest}
        onClose={() => {
          setShowAccessRequest(false);
          setShowLogin(true);
        }}
        onSubmit={handleAccessRequest}
      />

      {/* Background when modals are shown */}
      {!showBoot && (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-8 relative z-10">
            <div className="text-8xl mb-8 text-primary">⚡</div>
            <h1 className="text-7xl font-bold font-mono text-primary neon-underline">
              DEVIL DEV
            </h1>
            <p className="text-2xl text-muted-foreground font-mono animate-pulse">
              Developer Workspace
            </p>
          </div>
        </div>
      )}
    </div>
  );
}