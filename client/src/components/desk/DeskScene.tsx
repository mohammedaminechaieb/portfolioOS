"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/context/DataContext";

interface DeskSceneProps {
  onOpenOS: () => void;
}

type ShelfItem = { type: "folder" | "book" | "paper"; label: string; content: string; color: string };

export default function DeskScene({ onOpenOS }: DeskSceneProps) {
  const { data } = useData();
  const { profile, projects, skills, experience, education, certifications, competitions } = data;
  const [view, setView] = useState<"desk" | "shelf">("desk");
  const [openItem, setOpenItem] = useState<ShelfItem | null>(null);

  // Build shelf items from portfolio data
  const shelfItems: ShelfItem[] = [
    {
      type: "folder",
      label: "About Me",
      color: "#d4a574",
      content: `${profile.name}\n${profile.title}\n${profile.subtitle}\n\n${profile.bio}\n\nEmail: ${profile.email}\nPhone: ${profile.phone}\nLocation: ${profile.location}`,
    },
    {
      type: "book",
      label: "Projects",
      color: "#8B4513",
      content: projects
        .map((p) => `${p.featured ? "⭐ " : ""}${p.title}\n${p.description}\nTech: ${p.techStack.join(", ")}${p.liveUrl ? `\nURL: ${p.liveUrl}` : ""}`)
        .join("\n\n───────────────\n\n"),
    },
    {
      type: "book",
      label: "Skills",
      color: "#2c5f2d",
      content: (() => {
        const grouped: Record<string, string[]> = {};
        skills.forEach((s) => (grouped[s.category] ||= []).push(`${s.name} — ${s.level}%`));
        return Object.entries(grouped)
          .map(([cat, items]) => `[${cat.toUpperCase()}]\n${items.join("\n")}`)
          .join("\n\n");
      })(),
    },
    {
      type: "folder",
      label: "Experience",
      color: "#b8860b",
      content: experience
        .map((e) => `${e.role} @ ${e.company}\n${e.type} | ${e.startDate} – ${e.current ? "Present" : e.endDate}\n${e.highlights.join("\n")}`)
        .join("\n\n───────────────\n\n"),
    },
    {
      type: "paper",
      label: "Education",
      color: "#f5f0e6",
      content: education
        .map((e) => `${e.degree}\n${e.school} — ${e.location}\n${e.startDate} – ${e.current ? "Present" : e.endDate}${e.gpa ? `\nGPA: ${e.gpa}` : ""}`)
        .join("\n\n"),
    },
    {
      type: "paper",
      label: "Certifications",
      color: "#f5f0e6",
      content: certifications.map((c) => `${c.title}\nIssued by ${c.issuer} — ${c.date}`).join("\n\n"),
    },
    {
      type: "paper",
      label: "Competitions",
      color: "#f5f0e6",
      content: competitions.map((c) => `${c.title}\n${c.organizer} — ${c.date}\nResult: ${c.result}`).join("\n\n"),
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-desk-wood relative select-none">
      {/* Wood grain texture */}
      <div className="wood-grain absolute inset-0" />

      <AnimatePresence mode="wait">
        {view === "desk" ? (
          <motion.div
            key="desk"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Arrow up — to shelf */}
            <motion.button
              onClick={() => setView("shelf")}
              className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-desk-paper/40 hover:text-desk-paper/80 transition-colors z-10"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span className="text-xs font-mono">Overhead Shelf</span>
            </motion.button>

            {/* Desk surface — items on the desk */}
            <div className="relative w-full max-w-4xl px-8">
              {/* Desk mat / pad */}
              <div className="bg-desk-leather/80 rounded-xl p-8 shadow-2xl border border-desk-leather/40 relative">
                <div className="absolute inset-0 rounded-xl opacity-10"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)" }}
                />

                {/* Nameplate */}
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-desk-brass/90 px-6 py-2 rounded shadow-lg">
                    <span className="text-desk-woodDark font-bold text-sm tracking-widest font-mono uppercase">
                      {profile.name}
                    </span>
                  </div>
                </div>

                {/* Desk items */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Notebook */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    className="cursor-pointer"
                    onClick={() => setOpenItem(shelfItems[0])}
                  >
                    <div className="bg-desk-paper rounded shadow-lg p-4 aspect-[3/4] relative overflow-hidden">
                      <div className="paper-texture absolute inset-0" />
                      <div className="relative">
                        <div className="text-desk-woodDark/80 text-xs font-mono leading-relaxed">
                          <div className="font-bold text-sm mb-2">About Me</div>
                          <div className="text-[10px] text-desk-woodDark/50 line-clamp-6">{profile.bio}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Monitor / Computer */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="cursor-pointer"
                    onClick={onOpenOS}
                  >
                    <div className="bg-gray-800 rounded-lg shadow-2xl aspect-[4/3] flex flex-col items-center justify-center border-4 border-gray-700 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-os-accent/5 to-transparent" />
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="text-os-accent text-3xl mb-2"
                      >
                        ⬛
                      </motion.div>
                      <span className="text-os-accent/80 text-xs font-mono">AmineOS</span>
                      <span className="text-os-muted/50 text-[10px] font-mono mt-1">Click to boot</span>
                    </div>
                    {/* Monitor stand */}
                    <div className="flex justify-center">
                      <div className="w-12 h-3 bg-gray-700 rounded-b-sm" />
                    </div>
                    <div className="flex justify-center">
                      <div className="w-20 h-1 bg-gray-600 rounded-full" />
                    </div>
                  </motion.div>

                  {/* Coffee mug & pen holder */}
                  <div className="flex flex-col items-center justify-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="text-4xl cursor-default"
                      title="Still warm ☕"
                    >
                      ☕
                    </motion.div>
                    <div className="text-desk-paper/30 text-[10px] font-mono text-center">
                      {profile.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard */}
            <div className="mt-4 bg-gray-800/60 rounded-lg px-12 py-2 shadow-lg">
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-5 h-4 bg-gray-700/50 rounded-sm border border-gray-600/30" />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="shelf"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Arrow down — back to desk */}
            <motion.button
              onClick={() => setView("desk")}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-desk-paper/40 hover:text-desk-paper/80 transition-colors z-10"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-xs font-mono">Back to Desk</span>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </motion.button>

            {/* Shelf */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <div className="text-desk-brass text-xs font-mono uppercase tracking-widest mb-6">
                ─── Overhead Shelf ───
              </div>

              {/* Wooden shelf plank */}
              <div className="relative w-full max-w-4xl">
                <div className="bg-desk-woodLight rounded-lg shadow-2xl p-6 border-b-4 border-desk-woodDark/50">
                  <div className="wood-grain absolute inset-0 rounded-lg opacity-50" />

                  <div className="relative flex flex-wrap items-end justify-center gap-4">
                    {shelfItems.map((item, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setOpenItem(item)}
                        whileHover={{ y: -8, scale: 1.05 }}
                        className="desk-item-glow"
                      >
                        {item.type === "book" ? (
                          <div
                            className="w-10 rounded-sm shadow-lg relative overflow-hidden"
                            style={{ height: 100 + i * 10, backgroundColor: item.color }}
                          >
                            <div className="book-spine absolute inset-0 flex items-center justify-center">
                              <span className="text-desk-paper/80 text-[8px] font-bold tracking-widest uppercase">
                                {item.label}
                              </span>
                            </div>
                          </div>
                        ) : item.type === "folder" ? (
                          <div className="w-24 relative">
                            {/* Folder tab */}
                            <div className="h-3 w-10 rounded-t-md ml-2" style={{ backgroundColor: item.color }} />
                            {/* Folder body */}
                            <div
                              className="h-16 rounded-b-md rounded-tr-md shadow-lg flex items-center justify-center"
                              style={{ backgroundColor: item.color }}
                            >
                              <span className="text-desk-woodDark/70 text-[9px] font-mono font-bold text-center px-1">
                                {item.label}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 bg-desk-paper rounded shadow-lg p-2 relative">
                            <div className="paper-texture absolute inset-0 rounded" />
                            <div className="relative">
                              <div className="text-desk-woodDark/60 text-[8px] font-mono leading-tight">
                                <div className="font-bold text-[9px] mb-1">{item.label}</div>
                                <div className="line-clamp-3">{item.content.slice(0, 60)}...</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Shelf brackets */}
                <div className="absolute -bottom-4 left-8 w-4 h-4 border-l-2 border-b-2 border-desk-woodDark/50 rounded-bl" />
                <div className="absolute -bottom-4 right-8 w-4 h-4 border-r-2 border-b-2 border-desk-woodDark/50 rounded-br" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item viewer overlay */}
      <AnimatePresence>
        {openItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            onClick={() => setOpenItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-desk-paper rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden relative"
            >
              <div className="paper-texture absolute inset-0" />
              <div className="relative p-8">
                {/* Close button */}
                <button
                  onClick={() => setOpenItem(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-desk-woodDark/10 hover:bg-desk-woodDark/20 flex items-center justify-center text-desk-woodDark/60 transition-colors"
                >
                  ✕
                </button>

                <h2 className="text-desk-woodDark font-bold text-xl mb-4 font-mono">
                  {openItem.type === "folder" ? "📁" : openItem.type === "book" ? "📖" : "📄"}{" "}
                  {openItem.label}
                </h2>

                <div className="overflow-y-auto max-h-[60vh] pr-2">
                  <pre className="text-desk-woodDark/80 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                    {openItem.content}
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
