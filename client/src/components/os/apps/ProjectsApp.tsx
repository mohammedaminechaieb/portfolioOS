"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/context/DataContext";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI/ML" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "iot", label: "IoT" },
];

export default function ProjectsApp() {
  const { data } = useData();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? data.projects
      : data.projects.filter((p) => p.category === filter);

  const detail = data.projects.find((p) => p.id === selected);

  return (
    <div className="flex h-full bg-os-bg/50 font-mono text-sm">
      {/* Sidebar */}
      <div className="w-56 border-r border-os-border p-3 shrink-0 overflow-y-auto">
        <div className="text-os-accent text-xs uppercase tracking-wider mb-3">
          // Projects ({filtered.length})
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1 mb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setFilter(cat.id); setSelected(null); }}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                filter === cat.id
                  ? "bg-os-accent text-white"
                  : "bg-os-border/30 text-os-muted hover:text-os-text"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Project list */}
        <div className="space-y-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`w-full text-left px-2 py-2 rounded transition-colors ${
                selected === p.id
                  ? "bg-os-accent/15 text-os-accent"
                  : "hover:bg-os-border/30 text-os-text/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{p.featured ? "⭐" : "📄"}</span>
                <span className="truncate text-xs">{p.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          {detail ? (
            <motion.div
              key={detail.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-os-text">{detail.title}</h2>
                {detail.featured && (
                  <span className="px-2 py-0.5 rounded bg-os-accent/15 text-os-accent text-xs">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-os-text/80 leading-relaxed">{detail.description}</p>

              {detail.longDesc && (
                <div>
                  <div className="text-os-accent text-xs uppercase tracking-wider mb-1">
                    // Details
                  </div>
                  <p className="text-os-text/70 text-xs leading-relaxed">{detail.longDesc}</p>
                </div>
              )}

              <div>
                <div className="text-os-accent text-xs uppercase tracking-wider mb-2">
                  // Tech Stack
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detail.techStack.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-os-border/40 text-os-text/70 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {(detail.liveUrl || detail.githubUrl) && (
                <div className="flex gap-3 pt-2">
                  {detail.liveUrl && (
                    <a
                      href={detail.liveUrl}
                      target="_blank"
                      className="px-3 py-1.5 rounded bg-os-accent text-white text-xs hover:bg-os-accentDim transition-colors"
                    >
                      🔗 Live Demo
                    </a>
                  )}
                  {detail.githubUrl && (
                    <a
                      href={detail.githubUrl}
                      target="_blank"
                      className="px-3 py-1.5 rounded bg-os-border/50 text-os-text text-xs hover:bg-os-border transition-colors"
                    >
                      📂 Source Code
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-os-muted"
            >
              <span className="text-4xl mb-3">📁</span>
              <span className="text-sm">Select a project to view details</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
