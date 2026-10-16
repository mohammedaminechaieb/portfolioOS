"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  osName: string;
  osVersion: string;
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: "BIOS POST ... ", delay: 200, status: "OK" },
  { text: "Detecting hardware", delay: 400, status: "4 cores, 16 GB" },
  { text: "Loading kernel image", delay: 600, status: "vmlinuz-6.1" },
  { text: "Mounting root filesystem", delay: 300, status: "ext4" },
  { text: "Starting network manager", delay: 350, status: "eth0 UP" },
  { text: "Loading GPU drivers", delay: 250, status: "mesa 24.0" },
  { text: "Initializing display server", delay: 400, status: "wayland" },
  { text: "Starting portfolio services", delay: 500, status: "3/3 active" },
  { text: "Loading user profile", delay: 300, status: "amine" },
  { text: "Starting window manager", delay: 350, status: "compositor" },
];

export default function BootSequence({ osName, osVersion, onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<typeof BOOT_LINES>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "logo" | "done">("boot");

  const skipBoot = useCallback(() => {
    setPhase("done");
    setTimeout(onComplete, 300);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "boot") return;

    let idx = 0;
    const timer = setInterval(() => {
      if (idx < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[idx]]);
        setProgress(Math.round(((idx + 1) / BOOT_LINES.length) * 100));
        idx++;
      } else {
        clearInterval(timer);
        setTimeout(() => setPhase("logo"), 400);
      }
    }, 300);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "logo") {
      setTimeout(() => {
        setPhase("done");
        setTimeout(onComplete, 500);
      }, 1500);
    }
  }, [phase, onComplete]);

  // Listen for any key or click to skip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skipBoot();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [skipBoot]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 bg-os-bg z-50 flex flex-col font-mono text-sm"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-os-border/30 flex justify-between items-center">
            <div className="text-os-muted text-xs tracking-widest uppercase">
              Personal Systems // TUN Node 01
            </div>
            <button
              onClick={skipBoot}
              className="text-xs text-os-muted hover:text-os-accent transition-colors px-3 py-1 border border-os-border/50 rounded"
            >
              Skip boot →
            </button>
          </div>

          {phase === "boot" && (
            <div className="flex-1 p-6 overflow-hidden">
              {/* OS name header */}
              <div className="mb-6">
                <div className="text-os-accent text-2xl font-bold tracking-wider">
                  {osName}
                </div>
                <div className="text-os-muted text-xs mt-1">
                  v{osVersion} — Portfolio Operating Environment
                </div>
              </div>

              {/* Boot lines */}
              <div className="space-y-1">
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-os-muted w-4 text-right text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-os-text/80">{line.text}</span>
                    <span className="flex-1 border-b border-dotted border-os-border/30 mx-2" />
                    <span className="text-os-green text-xs font-semibold">[{line.status}]</span>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-8">
                <div className="flex justify-between text-xs text-os-muted mb-2">
                  <span>Loading kernel</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 bg-os-border/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-os-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          )}

          {phase === "logo" && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl font-bold text-os-accent tracking-wider mb-4">
                {osName}
              </div>
              <div className="text-os-muted text-sm tracking-[0.3em] uppercase">
                Mohamed Amine Chaieb // Portfolio System
              </div>
              <div className="mt-8 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-os-accent"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* CRT scanlines */}
          <div className="crt-overlay opacity-30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
