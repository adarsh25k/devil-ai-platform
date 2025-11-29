"use client";

import { useEffect, useState } from "react";

const BOOT_LOGS = [
  "Initializing Developer Workspace...",
  "Loading Models...",
  "Checking Dependencies...",
  "Starting Kernel...",
  "System Ready."
];

interface BootAnimationProps {
  onComplete: () => void;
}

export const BootAnimation = ({ onComplete }: BootAnimationProps) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (currentLine >= BOOT_LOGS.length) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }

    const currentText = BOOT_LOGS[currentLine];
    
    if (charIndex < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
        setDisplayedText("");
        setCharIndex(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentLine, charIndex, onComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl p-8">
        <div className="space-y-2 font-mono text-sm">
          {BOOT_LOGS.slice(0, currentLine).map((log, index) => (
            <div key={index} className="text-primary opacity-60">
              <span className="text-muted-foreground mr-2">&gt;</span>
              {log}
            </div>
          ))}
          {currentLine < BOOT_LOGS.length && (
            <div className="text-primary">
              <span className="text-muted-foreground mr-2">&gt;</span>
              {displayedText}
              <span className="terminal-cursor ml-1">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
