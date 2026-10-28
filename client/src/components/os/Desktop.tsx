"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import type { WindowState } from "@/lib/types";
import Window from "./Window";
import Taskbar from "./Taskbar";
import AboutApp from "./apps/AboutApp";
import ProjectsApp from "./apps/ProjectsApp";
import SkillsApp from "./apps/SkillsApp";
import ExperienceApp from "./apps/ExperienceApp";
import ContactApp from "./apps/ContactApp";
import Terminal from "./apps/Terminal";
import DesignsApp from "./apps/DesignsApp";

interface DesktopProps {
  onSwitchToDesk: () => void;
}

const APP_DEFS: Record<string, { title: string; icon: string; width: number; height: number }> = {
  about:      { title: "About Me",   icon: "👤", width: 640, height: 520 },
  projects:   { title: "Projects",   icon: "📁", width: 800, height: 540 },
  skills:     { title: "Skills",     icon: "⚡", width: 600, height: 500 },
  experience: { title: "Experience", icon: "💼", width: 620, height: 520 },
  designs:    { title: "Designs",    icon: "🎨", width: 720, height: 520 },
  contact:    { title: "Contact",    icon: "✉️", width: 680, height: 440 },
  terminal:   { title: "Terminal",   icon: "⬛", width: 720, height: 460 },
};

const APP_COMPONENTS: Record<string, React.FC> = {
  about: AboutApp,
  projects: ProjectsApp,
  skills: SkillsApp,
  experience: ExperienceApp,
  designs: DesignsApp,
  contact: ContactApp,
  terminal: Terminal,
};

let nextZ = 10;

function makeWindow(id: string, offset = 0): WindowState {
  const def = APP_DEFS[id];
  return {
    id,
    title: def.title,
    icon: def.icon,
    component: id,
    x: 80 + offset * 30,
    y: 40 + offset * 30,
    width: def.width,
    height: def.height,
    minimized: false,
    maximized: false,
    zIndex: nextZ++,
    isOpen: true,
  };
}

export default function Desktop({ onSwitchToDesk }: DesktopProps) {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const openApp = useCallback((id: string) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        // Re-open / focus
        return prev.map((w) =>
          w.id === id ? { ...w, isOpen: true, minimized: false, zIndex: nextZ++ } : w
        );
      }
      return [...prev, makeWindow(id, prev.filter((w) => w.isOpen).length)];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ++, minimized: false } : w))
    );
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width, height } : w)));
  }, []);

  const toggleFromTaskbar = useCallback((id: string) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (!win) return prev;
      if (win.minimized) {
        return prev.map((w) => (w.id === id ? { ...w, minimized: false, zIndex: nextZ++ } : w));
      }
      // Check if it's the top window
      const maxZ = Math.max(...prev.filter((w) => w.isOpen && !w.minimized).map((w) => w.zIndex));
      if (win.zIndex === maxZ) {
        return prev.map((w) => (w.id === id ? { ...w, minimized: true } : w));
      }
      return prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ++ } : w));
    });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-os-bg overflow-hidden">
      {/* CRT overlay */}
      <div className="crt-overlay pointer-events-none" />

      {/* Desktop area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(14 165 233) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }} />

        {/* Desktop icons */}
        <div className="absolute top-4 left-4 flex flex-col gap-3 z-[1]">
          {Object.entries(APP_DEFS).map(([id, def]) => (
            <button
              key={id}
              onDoubleClick={() => openApp(id)}
              className="flex flex-col items-center gap-1 w-16 p-2 rounded-lg hover:bg-os-border/20 transition-colors group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{def.icon}</span>
              <span className="text-[10px] text-os-text/60 group-hover:text-os-text/90 text-center leading-tight">
                {def.title}
              </span>
            </button>
          ))}
        </div>

        {/* Windows */}
        <AnimatePresence>
          {windows
            .filter((w) => w.isOpen)
            .map((w) => {
              const AppComponent = APP_COMPONENTS[w.component];
              return (
                <Window
                  key={w.id}
                  state={w}
                  onClose={() => closeWindow(w.id)}
                  onMinimize={() => minimizeWindow(w.id)}
                  onMaximize={() => maximizeWindow(w.id)}
                  onFocus={() => focusWindow(w.id)}
                  onMove={(x, y) => moveWindow(w.id, x, y)}
                  onResize={(width, height) => resizeWindow(w.id, width, height)}
                >
                  {AppComponent && <AppComponent />}
                </Window>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        onToggleWindow={toggleFromTaskbar}
        onOpenApp={openApp}
        onSwitchToDesk={onSwitchToDesk}
      />
    </div>
  );
}
