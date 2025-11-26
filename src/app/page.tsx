"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/SplashScreen";
import LoginModal from "@/components/LoginModal";
import AccessRequestModal, { AccessRequestData } from "@/components/AccessRequestModal";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
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

  const handleSplashComplete = () => {
    setShowSplash(false);
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
      {/* Fog overlay effect */}
      {!showSplash && <div className="fog-overlay" />}
      
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

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
      {!showSplash && (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center space-y-8">
            <div className="flex justify-center gap-16 mb-8">
              <div className="w-12 h-12 rounded-full bg-red-600 demon-eyes shadow-[0_0_40px_rgba(255,0,0,0.9)]" />
              <div className="w-12 h-12 rounded-full bg-red-600 demon-eyes shadow-[0_0_40px_rgba(255,0,0,0.9)]" />
            </div>
            <h1 className="text-9xl font-bold glitch-text neon-text">
              I AM DEVIL
            </h1>
            <p className="text-3xl text-orange-500 animate-pulse">
              Welcome to the Abyss
            </p>
          </div>
        </div>
      )}
    </div>
  );
}