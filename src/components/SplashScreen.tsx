"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Auto-complete after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Fog overlay */}
      <div className="fog-overlay" />
      
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-radial from-red-900/20 via-black to-black" />
      
      {/* Video or Fallback */}
      {!videoError ? (
        <video
          autoPlay
          muted
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src="/api/assets/intro.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-orange-950" />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 screen-shake">
        {/* Demon Eyes */}
        <div className="flex gap-16 mb-8">
          <div className="w-8 h-8 rounded-full bg-red-600 demon-eyes shadow-[0_0_30px_rgba(255,0,0,0.8)]" />
          <div className="w-8 h-8 rounded-full bg-red-600 demon-eyes shadow-[0_0_30px_rgba(255,0,0,0.8)]" />
        </div>
        
        {/* Title */}
        <h1 className="text-8xl font-bold glitch-text neon-text text-center">
          I AM DEVIL
        </h1>
        
        {/* Subtitle */}
        <p className="text-2xl text-orange-500 animate-pulse">
          Summoning the Darkness...
        </p>
        
        {/* Progress bar */}
        <div className="w-96 h-2 bg-red-950 rounded-full overflow-hidden border border-red-600">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Loading text */}
        <p className="text-red-500 text-sm">
          {progress < 100 ? `Loading... ${progress}%` : "Welcome to Hell 🔥"}
        </p>
      </div>
      
      {/* Fire particles */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-900/30 to-transparent pointer-events-none" />
    </div>
  );
}
