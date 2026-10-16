"use client";

import { useState, useEffect } from "react";
import type { WindowState } from "@/lib/types";

interface TaskbarProps {
  windows: WindowState[];
  onToggleWindow: (id: string) => void;
  onOpenApp: (id: string) => void;
  onSwitchToDesk: () => void;
}

const APPS = [
  { id: "about", icon: "👤", label: "About" },
  { id: "projects", icon: "📁", label: "Projects" },
  { id: "skills", icon: "⚡", label: "Skills" },
  { id: "experience", icon: "💼", label: "Experience" },
  { id: "contact", icon: "✉️", label: "Contact" },
  { id: "terminal", icon: "⬛", label: "Terminal" },
];

export default function Taskbar({ windows, onToggleWindow, onOpenApp, onSwitchToDesk }: TaskbarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-12 bg-os-bg/95 backdrop-blur-md border-t border-os-border flex items-center px-2 shrink-0 z-40">
      {/* Start / desk toggle */}
      <button
        onClick={onSwitchToDesk}
        className="h-8 px-3 rounded-md bg-os-accent/10 hover:bg-os-accent/20 text-os-accent text-sm font-mono font-semibold transition-colors mr-2 flex items-center gap-1.5"
        title="Switch to Desk mode"
      >
        <span className="text-base">🖥️</span>
        <span className="hidden sm:inline">Desk</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-os-border mx-1" />

      {/* App launcher icons */}
      <div className="flex items-center gap-1 mx-1">
        {APPS.map((app) => {
          const win = windows.find((w) => w.id === app.id);
          const isOpen = win?.isOpen;
          return (
            <button
              key={app.id}
              onClick={() => (isOpen ? onToggleWindow(app.id) : onOpenApp(app.id))}
              className={`h-8 w-8 rounded-md flex items-center justify-center text-base transition-all ${
                isOpen
                  ? "bg-os-accent/20 ring-1 ring-os-accent/30"
                  : "hover:bg-os-border/50"
              }`}
              title={app.label}
            >
              {app.icon}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Open windows in taskbar */}
      <div className="flex items-center gap-1 mr-2">
        {windows
          .filter((w) => w.isOpen)
          .map((w) => (
            <button
              key={w.id}
              onClick={() => onToggleWindow(w.id)}
              className={`h-7 px-2.5 rounded text-xs font-mono truncate max-w-[120px] transition-colors ${
                w.minimized
                  ? "bg-os-border/30 text-os-muted"
                  : "bg-os-accent/15 text-os-text"
              }`}
            >
              {w.icon} {w.title}
            </button>
          ))}
      </div>

      {/* System tray */}
      <div className="flex items-center gap-3 text-xs text-os-muted font-mono pl-2 border-l border-os-border">
        <span className="text-os-green">●</span>
        <span>{time}</span>
      </div>
    </div>
  );
}
