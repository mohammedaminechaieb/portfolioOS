"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { useData } from "@/context/DataContext";
import BookViewer, { BookEntry } from "./BookViewer";

/* Seed-based pseudo-random to avoid hydration mismatch */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface DeskSceneProps {
  onOpenOS: () => void;
}

type ItemKind = "folder" | "book" | "paper";

interface ShelfItem {
  id: string;
  type: ItemKind;
  label: string;
  icon: string;
  content: string;
  color: string;
  secondaryColor?: string;
  entries?: BookEntry[];
}

/* ═══════════════════════════════
   AMBIENT DUST PARTICLES
   ═══════════════════════════════ */
function DustParticles() {
  const particles = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2.5,
      duration: 12 + rand() * 20,
      delay: rand() * 8,
      drift: (rand() - 0.5) * 60,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-100/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -80, -160],
            x: [0, p.drift, p.drift * 0.5],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════
   STEAM PARTICLE
   ═══════════════════════════════ */
function SteamParticle({ delay, seed }: { delay: number; seed: number }) {
  const vals = useMemo(() => {
    const rand = seededRandom(seed);
    return {
      xMid: rand() > 0.5 ? 6 : -6,
      xEnd: rand() > 0.5 ? 3 : -3,
      dur: 2.8 + rand() * 1.2,
    };
  }, [seed]);

  return (
    <motion.div
      className="absolute w-2 h-4 rounded-full bg-white/10 blur-[3px]"
      initial={{ y: 0, x: 0, opacity: 0, scale: 0.6 }}
      animate={{
        y: [-2, -30, -50],
        x: [0, vals.xMid, vals.xEnd],
        opacity: [0, 0.4, 0],
        scale: [0.6, 1.2, 1.6],
      }}
      transition={{
        duration: vals.dur,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

/* ═══════════════════════════════
   DESK DRAWER COMPONENT
   ═══════════════════════════════ */
function DeskDrawer({
  side,
  items,
  onPickItem,
}: {
  side: "left" | "right";
  items: ShelfItem[];
  onPickItem: (item: ShelfItem) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`absolute bottom-0 ${side === "left" ? "left-0 md:left-4" : "right-0 md:right-4"} z-20`}
    >
      {/* Drawer knob */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="relative mx-auto block"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-28 md:w-36 h-8 bg-gradient-to-b from-desk-woodLight to-desk-wood rounded-t-md shadow-lg relative overflow-hidden border-t border-x border-desk-woodLight/30">
          <div className="wood-grain absolute inset-0 opacity-50" />
          <div className="relative flex items-center justify-center h-full gap-2">
            <div className="w-8 h-2 bg-desk-brass/60 rounded-full shadow-inner" />
          </div>
        </div>
      </motion.button>

      {/* Drawer body */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="w-28 md:w-36 bg-gradient-to-b from-desk-wood to-desk-woodDark rounded-b-md shadow-2xl overflow-hidden border-b border-x border-desk-woodDark/50"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="wood-grain absolute inset-0 opacity-30" />
            <div className="relative p-2 space-y-1.5">
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onPickItem(item);
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded bg-desk-paper/10 hover:bg-desk-paper/20 text-desk-paper/60 hover:text-desk-paper/90 text-[9px] md:text-[10px] font-mono transition-colors flex items-center gap-1.5"
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════
   DOCUMENT VIEWER ON DESK
   (Paper pull-up animation)
   ═══════════════════════════════ */
function DeskDocument({
  item,
  onClose,
}: {
  item: ShelfItem;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Dim overlay */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* ── Paper lands on the desk from a shelf-like pull ── */}
      <motion.div
        className="relative z-10"
        initial={{
          y: -400,
          scale: 0.2,
          rotateX: 45,
          rotateZ: -8,
          opacity: 0,
        }}
        animate={{
          y: 0,
          scale: 1,
          rotateX: 0,
          rotateZ: 0,
          opacity: 1,
        }}
        exit={{
          y: -300,
          scale: 0.15,
          rotateX: 35,
          rotateZ: 6,
          opacity: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 16,
          mass: 0.6,
        }}
        style={{ perspective: "1200px" }}
      >
        {item.type === "book" && item.entries && item.entries.length > 0 ? (
          <BookViewer
            title={item.label}
            icon={item.icon}
            coverColor={item.color}
            entries={item.entries}
          />
        ) : item.type === "book" ? (
          /* ══ OPEN BOOK (plain fallback) ═══ */
          <div className="flex" style={{ perspective: "1200px" }}>
            {/* Left — cover page */}
            <motion.div
              className="w-[260px] md:w-[320px] rounded-l-md shadow-2xl overflow-hidden relative"
              style={{ backgroundColor: item.color }}
              initial={{ rotateY: -30 }}
              animate={{ rotateY: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 14 }}
              whileHover={{ rotateY: -2 }}
            >
              {/* book spine shadow */}
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-black/20" />
              <div className="p-5 h-[400px] md:h-[460px] flex flex-col justify-between">
                <div>
                  <motion.div
                    className="text-desk-paper/90 text-xl md:text-2xl font-bold font-mono mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {item.icon} {item.label}
                  </motion.div>
                  <div className="w-16 h-0.5 bg-desk-brass/40 rounded mb-4" />
                  <div className="text-desk-paper/40 text-xs font-mono">
                    Mohamed Amine Chaieb
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-px bg-desk-brass/20" />
                  <div className="text-desk-paper/20 text-[9px] font-mono flex justify-between">
                    <span>PORTFOLIO</span>
                    <span>2026</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — content page with page-flip animation */}
            <motion.div
              className="w-[260px] md:w-[320px] bg-desk-paper rounded-r-md shadow-2xl overflow-hidden relative"
              initial={{ rotateY: -110, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 70,
                damping: 14,
              }}
              style={{ transformOrigin: "left center" }}
            >
              <div className="paper-texture absolute inset-0" />
              {/* Page corner fold */}
              <div className="absolute top-0 right-0 w-8 h-8 page-corner" />
              <div className="relative p-5 h-[400px] md:h-[460px] overflow-y-auto custom-scroll-paper">
                <pre className="text-desk-woodDark/80 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">
                  {item.content || "No entries yet."}
                </pre>
              </div>
            </motion.div>
          </div>
        ) : item.type === "folder" ? (
          /* ══ OPEN FOLDER ═══ */
          <div style={{ perspective: "1000px" }}>
            {/* Folder body */}
            <motion.div
              className="w-[300px] md:w-[400px] rounded-lg shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: item.color }}
              initial={{ rotateX: -20 }}
              animate={{ rotateX: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              {/* Tab */}
              <div
                className="h-5 w-24 rounded-t-md absolute -top-5 left-3"
                style={{
                  backgroundColor: item.secondaryColor || item.color,
                  filter: "brightness(0.85)",
                }}
              >
                <div className="text-center text-desk-paper/50 text-[7px] font-mono pt-0.5 tracking-wider uppercase">
                  {item.label}
                </div>
              </div>

              {/* Stacked paper edges */}
              <div className="absolute top-1 left-2 right-2 h-full">
                <div className="absolute top-0 left-1 right-1 h-1 bg-desk-paper/30 rounded-t" />
                <div className="absolute top-1 left-0.5 right-0.5 h-1 bg-desk-paper/20 rounded-t" />
              </div>

              {/* Main paper */}
              <motion.div
                className="m-3 mt-4 bg-desk-paper rounded shadow-xl overflow-hidden relative"
                initial={{ y: 30, rotateX: -20, opacity: 0 }}
                animate={{ y: 0, rotateX: 0, opacity: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 90,
                  damping: 14,
                }}
              >
                <div className="paper-texture absolute inset-0" />
                {/* Clip / paperclip */}
                <div className="absolute -top-1 right-6 w-3 h-8 border-2 border-gray-400/40 rounded-b-full z-10" />
                <div className="relative p-5 max-h-[380px] md:max-h-[440px] overflow-y-auto custom-scroll-paper">
                  <div className="text-desk-woodDark font-bold text-base font-mono mb-2 flex items-center gap-2">
                    {item.icon} {item.label}
                  </div>
                  <div className="w-full h-px bg-desk-woodDark/10 mb-3" />
                  <pre className="text-desk-woodDark/80 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">
                    {item.content || "No entries yet."}
                  </pre>
                </div>
              </motion.div>

              {/* Bottom shadow stack */}
              <div className="h-2 relative">
                <div className="absolute bottom-0.5 left-4 right-4 h-1 bg-desk-paper/40 rounded-b" />
                <div className="absolute bottom-0 left-5 right-5 h-1 bg-desk-paper/25 rounded-b" />
              </div>
            </motion.div>
          </div>
        ) : (
          /* ══ SINGLE PAPER / CERTIFICATE ═══ */
          <motion.div
            className="w-[300px] md:w-[400px] bg-desk-paper rounded-sm shadow-2xl overflow-hidden relative"
            initial={{ rotateZ: -4, scale: 0.9 }}
            animate={{ rotateZ: 0.5, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            style={{ perspective: "800px" }}
          >
            <div className="paper-aged absolute inset-0" />
            <div className="paper-texture absolute inset-0" />
            {/* Red margin line */}
            <div className="absolute top-0 bottom-0 left-12 w-px bg-red-300/25" />
            {/* Top blue lines */}
            <div className="absolute top-10 left-0 right-0 h-px bg-blue-300/15" />
            {/* Page corner fold */}
            <div className="absolute top-0 right-0 w-8 h-8 page-corner" />
            <div className="relative p-5 pl-16 max-h-[420px] md:max-h-[480px] overflow-y-auto custom-scroll-paper">
              <div className="text-desk-woodDark font-bold text-base font-mono mb-2">
                {item.icon} {item.label}
              </div>
              <div className="w-full h-px bg-desk-woodDark/10 mb-3" />
              <pre className="text-desk-woodDark/80 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">
                {item.content || "No entries yet."}
              </pre>
            </div>
          </motion.div>
        )}

        {/* ── Close button ── */}
        <motion.button
          onClick={onClose}
          className={`absolute left-1/2 -translate-x-1/2 ${item.type === "book" && item.entries?.length ? "-bottom-16" : "-bottom-12"} bg-desk-woodDark/90 hover:bg-desk-woodDark text-desk-paper/70 hover:text-desk-paper px-5 py-2 rounded-full text-[11px] font-mono tracking-wider flex items-center gap-2 shadow-xl backdrop-blur-sm transition-colors border border-desk-paper/5`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Put back
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════
   MAIN DESK SCENE
   ═══════════════════════════════ */
export default function DeskScene({ onOpenOS }: DeskSceneProps) {
  const { data } = useData();
  const {
    profile,
    projects,
    skills,
    experience,
    education,
    certifications,
    competitions,
  } = data;
  const [openItem, setOpenItem] = useState<ShelfItem | null>(null);
  const [hoveredShelf, setHoveredShelf] = useState<string | null>(null);
  const [monitorHover, setMonitorHover] = useState(false);
  const [time, setTime] = useState("--:--");
  const [mounted, setMounted] = useState(false);
  const shelfRef = useRef<HTMLDivElement>(null);

  // Hydration-safe mount
  useEffect(() => { setMounted(true); }, []);

  // Clock
  useEffect(() => {
    if (!mounted) return;
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [mounted]);

  // Parallax mouse tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 50, damping: 30 };
  const bgX = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), springConfig);
  const bgY = useSpring(useTransform(mouseY, [0, 1], [-3, 3]), springConfig);
  const shelfX = useSpring(
    useTransform(mouseX, [0, 1], [-2, 2]),
    springConfig
  );
  const deskRotateX = useSpring(
    useTransform(mouseY, [0, 1], [1, -1]),
    springConfig
  );
  const deskRotateY = useSpring(
    useTransform(mouseX, [0, 1], [-1, 1]),
    springConfig
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  // ── Projects book: hide unfinished ones, fold the Android apps into one suite ──
  const UNFINISHED = /^(smartnest|aria\b|ashen)/i;
  const ANDROID = /^(haptikit|nightdeck|statusbar|soundskin|lockforge|auralauncher)/i;
  const mkProject = (p: (typeof projects)[number], withTab: boolean): BookEntry => ({
        id: p.id,
        tab: withTab ? p.title : undefined,
        label: p.title,
        left: (
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/40 mb-1">
              {p.category || "Project"}
              {p.featured ? " · ⭐ featured" : ""}
            </div>
            <div className="text-desk-woodDark font-bold text-lg font-mono leading-tight mb-2">
              {p.title}
            </div>
            <div className="w-12 h-0.5 bg-desk-brass/60 rounded mb-3" />
            <p className="text-desk-woodDark/80 text-[12.5px] font-mono leading-relaxed whitespace-pre-wrap">
              {p.longDesc || p.description}
            </p>
          </div>
        ),
        right: (
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/40 mb-2">
              Tech stack
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {p.techStack.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-desk-woodDark/10 text-desk-woodDark/80"
                >
                  {t}
                </span>
              ))}
            </div>
            {p.longDesc && p.description && (
              <p className="text-desk-woodDark/70 text-[12px] font-mono leading-relaxed mb-4">
                {p.description}
              </p>
            )}
            <div className="space-y-1.5">
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[11px] font-mono text-blue-800 underline underline-offset-2 break-all"
                >
                  🔗 Live demo
                </a>
              )}
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[11px] font-mono text-blue-800 underline underline-offset-2 break-all"
                >
                  💻 Source code
                </a>
              )}
            </div>
          </div>
        ),
  });
  const bookProjects: BookEntry[] = (() => {
    const done = projects.filter((p) => !UNFINISHED.test(p.title.trim()));
    const apps = done.filter((p) => ANDROID.test(p.title.trim()));
    const out: BookEntry[] = [];
    let suiteAdded = false;
    done.forEach((p) => {
      if (!ANDROID.test(p.title.trim())) {
        out.push(mkProject(p, true));
      } else if (!suiteAdded) {
        suiteAdded = true;
        out.push({
          id: "android-suite",
          tab: "Android Suite",
          label: "Android Suite",
          left: (
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/40 mb-1">
                Mobile · system-level Android
              </div>
              <div className="text-desk-woodDark font-bold text-lg font-mono leading-tight mb-2">
                Android Suite
              </div>
              <div className="w-12 h-0.5 bg-desk-brass/60 rounded mb-3" />
              <p className="text-desk-woodDark/80 text-[12.5px] font-mono leading-relaxed">
                A family of system-level Android apps bundled around a custom
                launcher (AuraLauncher). Core logic is done; polishing and
                testing are in progress.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Kotlin", "Flutter", "Jetpack Compose"].map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-desk-woodDark/10 text-desk-woodDark/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ),
          right: ({ goToId }) => (
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/40 mb-2">
                Inside the suite (tap to open)
              </div>
              <ul className="space-y-1.5">
                {apps.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => goToId(a.id)}
                      className="w-full text-left text-[12px] font-mono text-desk-woodDark/85 hover:text-desk-woodDark px-2 py-1.5 rounded bg-desk-woodDark/5 hover:bg-desk-woodDark/10 transition-colors"
                    >
                      <span className="font-bold">{a.title}</span>
                      <span className="block text-[10px] text-desk-woodDark/55 truncate">
                        {a.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ),
        });
        apps.forEach((a) => out.push(mkProject(a, false)));
      }
    });
    return out;
  })();

  // Build shelf items from portfolio data
  const shelfItems: ShelfItem[] = [
    {
      id: "about",
      type: "folder",
      label: "About Me",
      icon: "📁",
      color: "#c4935a",
      secondaryColor: "#a67b48",
      content: `${profile.name}\n${profile.title}\n${profile.subtitle}\n\n${profile.bio}\n\n✉  ${profile.email}\n☎  ${profile.phone}\n📍 ${profile.location}\n\nGitHub: ${profile.github}\nLinkedIn: ${profile.linkedin}`,
    },
    {
      id: "projects",
      type: "book",
      label: "Projects",
      icon: "📖",
      color: "#6b3a2a",
      entries: bookProjects,
      content:
        projects.length > 0
          ? projects
              .map(
                (p) =>
                  `${p.featured ? "⭐ " : ""}${p.title}\n${p.description}\n\nTech: ${p.techStack.join(", ")}${p.liveUrl ? `\nURL: ${p.liveUrl}` : ""}${p.githubUrl ? `\nRepo: ${p.githubUrl}` : ""}`
              )
              .join("\n\n───────────────\n\n")
          : "No projects added yet.",
    },
    {
      id: "skills",
      type: "book",
      label: "Skills",
      icon: "🛠️",
      color: "#2c5f2d",
      entries: (() => {
        const cats: Record<string, typeof skills> = {};
        skills.forEach((s) => (cats[s.category] ||= []).push(s));
        return Object.entries(cats).map(([cat, list]) => {
          const avg = Math.round(
            list.reduce((a, b) => a + b.level, 0) / list.length
          );
          const top = [...list].sort((a, b) => b.level - a.level).slice(0, 3);
          return {
            id: cat,
            tab: cat,
            left: (
              <div>
                <div className="text-desk-woodDark font-bold text-lg font-mono capitalize mb-1">
                  {cat}
                </div>
                <div className="w-12 h-0.5 bg-desk-brass/60 rounded mb-3" />
                <div className="space-y-2.5">
                  {list.map((s) => (
                    <div key={s.id}>
                      <div className="flex justify-between text-[11px] font-mono text-desk-woodDark/80">
                        <span>{s.name}</span>
                        <span className="text-desk-woodDark/50">{s.level}%</span>
                      </div>
                      <div className="h-1.5 rounded bg-desk-woodDark/10 overflow-hidden">
                        <div
                          className="h-full rounded bg-desk-woodDark/60"
                          style={{ width: `${s.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
            right: (
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/40 mb-2">
                  At a glance
                </div>
                <div className="text-4xl font-bold font-mono text-desk-woodDark mb-0.5">
                  {list.length}
                </div>
                <div className="text-[11px] font-mono text-desk-woodDark/60 mb-4">
                  skills · average {avg}%
                </div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/40 mb-2">
                  Strongest
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {top.map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-desk-woodDark/10 text-desk-woodDark/80"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ),
          };
        });
      })(),
      content: (() => {
        if (skills.length === 0) return "No skills added yet.";
        const grouped: Record<string, string[]> = {};
        skills.forEach(
          (s) =>
            (grouped[s.category] ||= []).push(
              `  • ${s.name} ${"█".repeat(Math.round(s.level / 10))}${"░".repeat(10 - Math.round(s.level / 10))} ${s.level}%`
            )
        );
        return Object.entries(grouped)
          .map(([cat, items]) => `[${cat.toUpperCase()}]\n${items.join("\n")}`)
          .join("\n\n");
      })(),
    },
    {
      id: "experience",
      type: "folder",
      label: "Experience",
      icon: "💼",
      color: "#8b7355",
      secondaryColor: "#73603f",
      content:
        experience.length > 0
          ? experience
              .map(
                (e) =>
                  `${e.role}\n@ ${e.company}\n${e.type} | ${e.location}\n${e.startDate} – ${e.current ? "Present" : e.endDate}\n\n${e.description}\n\n${e.highlights.length > 0 ? "Highlights:\n" + e.highlights.map((h) => `  • ${h}`).join("\n") : ""}${e.techStack.length > 0 ? `\n\nStack: ${e.techStack.join(", ")}` : ""}`
              )
              .join("\n\n───────────────\n\n")
          : "No experience entries yet.",
    },
    {
      id: "education",
      type: "paper",
      label: "Education",
      icon: "🎓",
      color: "#f5f0e6",
      content:
        education.length > 0
          ? education
              .map(
                (e) =>
                  `${e.degree}\n${e.school} — ${e.location}\n${e.startDate} – ${e.current ? "Present" : e.endDate}${e.gpa ? `\nGPA: ${e.gpa}` : ""}${e.description ? `\n\n${e.description}` : ""}`
              )
              .join("\n\n")
          : "No education entries yet.",
    },
    {
      id: "certs",
      type: "paper",
      label: "Certifications",
      icon: "🏅",
      color: "#f5f0e6",
      content:
        certifications.length > 0
          ? certifications
              .map(
                (c) =>
                  `${c.title}\nIssued by ${c.issuer} — ${c.date}${c.url ? `\n${c.url}` : ""}`
              )
              .join("\n\n")
          : "No certifications yet.",
    },
    {
      id: "comps",
      type: "paper",
      label: "Competitions",
      icon: "🏆",
      color: "#f5f0e6",
      content:
        competitions.length > 0
          ? competitions
              .map(
                (c) =>
                  `${c.title}\n${c.organizer || ""} — ${c.date}${c.result ? `\nResult: ${c.result}` : ""}${c.description ? `\n${c.description}` : ""}`
              )
              .join("\n\n")
          : "No competitions yet.",
    },
  ];

  const drawerLeft = shelfItems.filter((_, i) => i < 3);
  const drawerRight = shelfItems.filter((_, i) => i >= 3);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1a120a] relative select-none">
      {/* ── Deep ambient background ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0906] via-[#1a120a] to-[#2a1a10]" />

      {/* ── Ambient light ray from lamp ── */}
      <div className="absolute top-0 left-[8%] w-[300px] h-[70%] opacity-[0.04] pointer-events-none lamp-cone" />

      {/* Dust particles */}
      <DustParticles />

      {/* Wood grain parallax */}
      <motion.div
        className="wood-grain absolute inset-0 opacity-80"
        style={{ x: bgX, y: bgY }}
      />

      {/* ══════════════════════════════
         WALL — top section
         ══════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 h-[26%] wall-texture">
        {/* Subtle textured wallpaper */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#14100c] via-[#1c1610] to-[#2a1e14]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* ── Framed Photo ── (left wall) */}
        <motion.div
          className="absolute top-4 left-[6%] md:left-[10%]"
          style={{ x: shelfX }}
          whileHover={{ scale: 1.04, rotate: 0.5 }}
        >
          <div className="w-16 h-20 md:w-20 md:h-24 rounded-sm overflow-hidden shadow-xl border-[3px] border-desk-woodLight/40 relative frame-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-desk-leather/80 to-desk-woodDark/90 flex items-center justify-center">
              <span className="text-2xl md:text-3xl">👨‍💻</span>
            </div>
            {/* Glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          </div>
        </motion.div>

        {/* ── Wall clock ── (right wall) */}
        <motion.div
          className="absolute top-3 right-[6%] md:right-[10%]"
          style={{ x: useTransform(shelfX, (v) => -v) }}
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-desk-paper/90 shadow-xl border-2 border-desk-brass/40 flex items-center justify-center relative clock-shadow">
            <div className="text-desk-woodDark font-mono text-xs md:text-sm font-bold tracking-tight">
              {time}
            </div>
            {/* Clock ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
              (deg) => (
                <div
                  key={deg}
                  className="absolute w-0.5 h-1 bg-desk-woodDark/30 rounded"
                  style={{
                    top: "4px",
                    left: "50%",
                    transform: `translateX(-50%) rotate(${deg}deg)`,
                    transformOrigin: `50% ${28}px`,
                  }}
                />
              )
            )}
          </div>
        </motion.div>

        {/* ══ OVERHEAD SHELF ══ */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center">
        <motion.div
          className="w-full max-w-4xl px-2 md:px-4"
          style={{ x: shelfX }}
        >
          {/* Shelf plank */}
          <div className="relative bg-gradient-to-b from-desk-woodLight to-desk-wood rounded-t-sm shelf-3d">
            <div className="wood-grain absolute inset-0 rounded-t-sm opacity-50" />
            {/* Edge highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-desk-brass/10" />

            <div
              ref={shelfRef}
              className="relative overflow-x-auto overflow-y-visible shelf-scroll"
              onWheel={(e) => {
                if (shelfRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  shelfRef.current.scrollLeft += e.deltaY;
                }
              }}
            >
            <div className="flex items-end w-max min-w-full justify-center gap-3 md:gap-4 px-4 pt-7 pb-2.5 min-h-[75px]">
              {shelfItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => setOpenItem(item)}
                  onMouseEnter={() => setHoveredShelf(item.id)}
                  onMouseLeave={() => setHoveredShelf(null)}
                  className="shelf-item relative group"
                  whileTap={{ scale: 0.92, y: 2 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                >
                  {item.type === "book" ? (
                    <div
                      className="w-7 md:w-9 rounded-[2px] shadow-lg relative overflow-hidden book-on-shelf"
                      style={{
                        height:
                          item.id === "projects"
                            ? 85
                            : item.id === "skills"
                              ? 75
                              : 65,
                        backgroundColor: item.color,
                      }}
                    >
                      {/* Spine shadow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/15" />
                      {/* Gold bands */}
                      <div className="absolute bottom-2 left-1 right-1 h-px bg-desk-brass/50" />
                      <div className="absolute top-2 left-1 right-1 h-px bg-desk-brass/50" />
                      {/* Spine text */}
                      <div className="book-spine absolute inset-0 flex items-center justify-center">
                        <span className="text-desk-paper/70 text-[6px] md:text-[7px] font-bold tracking-[0.15em] uppercase">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  ) : item.type === "folder" ? (
                    <div className="w-14 md:w-18 relative">
                      <div
                        className="h-2 w-7 rounded-t-md ml-1"
                        style={{
                          backgroundColor: item.color,
                          filter: "brightness(0.82)",
                        }}
                      />
                      <div
                        className="h-10 md:h-12 rounded-b-md rounded-tr-md shadow-lg flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: item.color }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                        <span className="text-desk-woodDark/60 text-[7px] md:text-[8px] font-mono font-bold text-center px-1 relative">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 md:w-14 bg-desk-paper rounded shadow-md p-1 relative -rotate-1">
                      <div className="paper-texture absolute inset-0 rounded" />
                      <div className="relative text-desk-woodDark/50 text-[6px] md:text-[7px] font-mono leading-tight">
                        <div className="font-bold mb-0.5 text-desk-woodDark/70">
                          {item.label}
                        </div>
                        <div className="text-[5px] text-desk-woodDark/30 line-clamp-2">
                          {item.content.slice(0, 30)}…
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredShelf === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: -4, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.9 }}
                        className="absolute -top-9 left-1/2 -translate-x-1/2 bg-desk-woodDark/95 text-desk-paper text-[9px] font-mono px-2.5 py-1 rounded shadow-xl whitespace-nowrap z-30 backdrop-blur-sm border border-desk-paper/5"
                      >
                        {item.icon} {item.label}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-desk-woodDark/95 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
            </div>
          </div>

          {/* Shelf brackets */}
          <div className="flex justify-between px-10 md:px-16">
            <div className="shelf-bracket" />
            <div className="shelf-bracket" />
          </div>
        </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════
         DESK SURFACE — bottom section
         ══════════════════════════════ */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[74%] flex items-start justify-center pt-4 md:pt-8"
        style={{
          rotateX: deskRotateX,
          rotateY: deskRotateY,
          perspective: "1200px",
        }}
      >
        {/* Desk edge bevel */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-desk-woodLight/50 via-desk-wood/30 to-transparent" />

        <div className="relative w-full max-w-4xl px-4">
          {/* ── Leather desk mat ── */}
          <div className="relative bg-desk-leather rounded-xl p-4 md:p-5 shadow-desk-mat border border-desk-leather/20 mx-auto max-w-2xl leather-mat">
            {/* Leather grain */}
            <div className="leather-grain absolute inset-0 rounded-xl" />
            {/* Stitching */}
            <div className="stitch-border absolute inset-[6px] rounded-lg pointer-events-none" />

            {/* ── Brass Nameplate ── */}
            <div className="flex items-center justify-center mb-3 md:mb-4">
              <motion.div
                className="nameplate px-6 py-1.5 rounded-sm shadow-lg relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 nameplate-shine" />
                <span className="text-desk-woodDark font-bold text-xs md:text-sm tracking-[0.2em] font-mono uppercase relative">
                  {profile.name}
                </span>
              </motion.div>
            </div>

            {/* ── Desk Objects ── */}
            <div className="grid grid-cols-5 gap-2 md:gap-3 items-end">
              {/* Left: Sticky notes */}
              <div className="col-span-1 flex flex-col items-center gap-1.5">
                <motion.div
                  className="w-11 h-11 md:w-13 md:h-13 bg-yellow-200/90 rounded-sm p-1.5 rotate-2 sticky-note-3d"
                  whileHover={{ rotate: -2, scale: 1.1, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="text-yellow-900/60 text-[6px] md:text-[7px] font-mono leading-tight">
                    TODO:
                    <br />
                    Build
                    <br />
                    something
                    <br />
                    amazing ✨
                  </div>
                </motion.div>
                <motion.div
                  className="w-10 h-10 md:w-12 md:h-12 bg-sky-200/80 rounded-sm p-1.5 -rotate-3 sticky-note-3d"
                  whileHover={{ rotate: 1, scale: 1.1, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="text-sky-900/50 text-[6px] md:text-[7px] font-mono leading-tight">
                    {profile.available ? "🟢 Open\nto work" : "Heads\ndown 🎯"}
                  </div>
                </motion.div>
              </div>

              {/* Pen cup */}
              <div className="col-span-1 flex flex-col items-center">
                <motion.div
                  className="pen-cup-3d w-7 h-12 md:w-8 md:h-14 rounded-b-md rounded-t-sm relative"
                  whileHover={{ rotate: 2 }}
                >
                  <div className="absolute -top-5 left-0.5 w-1 h-7 bg-gray-700 rounded-t-full rotate-[-5deg]" />
                  <div className="absolute -top-6 left-2.5 w-1 h-8 bg-blue-900 rounded-t-full rotate-[3deg]" />
                  <div className="absolute -top-4 left-[14px] md:left-4 w-1 h-6 bg-red-900 rounded-t-full rotate-[7deg]" />
                  {/* Pen tip highlights */}
                  <div className="absolute -top-6 left-0.5 w-1 h-1 bg-gray-400 rounded-t-full rotate-[-5deg]" />
                  <div className="absolute -top-7 left-2.5 w-1 h-1 bg-gray-400 rounded-t-full rotate-[3deg]" />
                </motion.div>
              </div>

              {/* CENTER: MONITOR — main interaction */}
              <motion.div
                className="col-span-1 flex flex-col items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenOS}
                onHoverStart={() => setMonitorHover(true)}
                onHoverEnd={() => setMonitorHover(false)}
              >
                <div className="monitor-body bg-[#1a1a1a] rounded-lg shadow-2xl w-24 md:w-32 aspect-[4/3] flex flex-col items-center justify-center border-[3px] border-[#2a2a2a] relative overflow-hidden">
                  {/* Screen content */}
                  <div className="absolute inset-[3px] rounded bg-gradient-to-br from-os-bg to-[#0d1520] overflow-hidden">
                    {/* Fake terminal lines */}
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      animate={
                        monitorHover
                          ? { scale: 1.05, filter: "brightness(1.3)" }
                          : { scale: 1, filter: "brightness(1)" }
                      }
                    >
                      <motion.div
                        className="text-os-accent text-lg md:text-xl font-bold font-mono tracking-wider"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        &gt;_
                      </motion.div>
                      <span className="text-os-accent/60 text-[8px] md:text-[9px] font-mono mt-0.5">
                        AmineOS
                      </span>
                      <motion.span
                        className="text-os-muted/30 text-[6px] md:text-[7px] font-mono mt-0.5"
                        animate={
                          monitorHover
                            ? { opacity: 1, color: "#0ea5e9" }
                            : { opacity: 0.4 }
                        }
                      >
                        {monitorHover ? "→ click to boot" : "click to boot"}
                      </motion.span>
                    </motion.div>
                    {/* CRT scanlines on monitor */}
                    <div className="absolute inset-0 pointer-events-none crt-monitor" />
                    {/* Screen reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                  </div>
                  {/* Monitor glow */}
                  <motion.div
                    className="absolute -inset-2 rounded-xl pointer-events-none"
                    animate={
                      monitorHover
                        ? {
                            boxShadow:
                              "0 0 30px rgba(14,165,233,0.25), 0 0 60px rgba(14,165,233,0.1)",
                          }
                        : {
                            boxShadow:
                              "0 0 15px rgba(14,165,233,0.1), 0 0 30px rgba(14,165,233,0.05)",
                          }
                    }
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {/* Stand */}
                <div className="w-4 h-2 bg-[#222] mx-auto" />
                <div className="w-12 md:w-14 h-1 bg-[#1a1a1a] rounded-full mx-auto shadow" />
              </motion.div>

              {/* Plant */}
              <div className="col-span-1 flex flex-col items-center">
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 0.5, 0, -0.5, 0] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-7 h-5 md:w-8 md:h-6 bg-[#c4714a] rounded-b-lg rounded-t-sm relative overflow-hidden mx-auto shadow-md">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4815a]" />
                    {/* Soil */}
                    <div className="absolute bottom-0 left-0.5 right-0.5 h-2 bg-[#3d2b1f] rounded-b" />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="w-2.5 h-4 bg-green-700/80 rounded-full -rotate-12 absolute -left-1.5" />
                    <div className="w-2.5 h-5 bg-green-600/80 rounded-full rotate-6 absolute -right-0.5 -top-1" />
                    <div className="w-2 h-3.5 bg-green-700/60 rounded-full -rotate-25 absolute -left-2.5 top-0.5" />
                    <div className="w-2 h-4 bg-green-500/70 rounded-full rotate-15 absolute right-0 -top-0.5" />
                  </div>
                </motion.div>
              </div>

              {/* Coffee mug */}
              <div className="col-span-1 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-10">
                    <SteamParticle delay={0} seed={100} />
                    <SteamParticle delay={0.8} seed={200} />
                    <SteamParticle delay={1.6} seed={300} />
                    <SteamParticle delay={2.4} seed={400} />
                  </div>
                  <div className="w-7 h-8 md:w-8 md:h-9 bg-gray-200 rounded-b-lg rounded-t-sm relative overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-300" />
                    {/* Label on mug */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[5px] font-mono text-gray-500/60 font-bold">
                      {"</>"}
                    </div>
                    <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0 bg-[#3a2010] rounded-b-lg" />
                    <div className="absolute top-0.5 left-0.5 right-0.5 h-2 bg-[#5a3820] rounded-t-sm" />
                  </div>
                  <div className="absolute top-0.5 -right-1.5 w-2.5 h-4 border-2 border-gray-300 rounded-r-full" />
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div className="mt-3 md:mt-4 text-center">
              <motion.div
                className="text-desk-paper/15 text-[9px] md:text-[10px] font-mono tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {profile.subtitle || profile.title}
              </motion.div>
            </div>
          </div>

          {/* ── Keyboard ── */}
          <div className="mt-2 md:mt-3 bg-[#1a1a1a]/60 rounded-lg px-6 md:px-10 py-1.5 shadow-lg max-w-sm mx-auto keyboard-3d">
            <div className="flex gap-[2px] md:gap-0.5 justify-center mb-0.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 md:w-4 md:h-3 bg-[#2a2a2a]/60 rounded-[2px] border border-[#333]/20 key-cap"
                />
              ))}
            </div>
            <div className="flex gap-[2px] md:gap-0.5 justify-center mb-0.5">
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 md:w-4 md:h-3 bg-[#252525]/50 rounded-[2px] border border-[#333]/15 key-cap"
                />
              ))}
            </div>
            {/* Spacebar */}
            <div className="flex justify-center">
              <div className="w-16 md:w-24 h-2 md:h-2.5 bg-[#2a2a2a]/50 rounded-[2px] border border-[#333]/15 key-cap" />
            </div>
          </div>

          {/* ── Desk lamp (left) ── */}
          <div className="absolute -top-6 -left-2 md:left-0">
            <motion.div
              animate={{
                filter: [
                  "brightness(1)",
                  "brightness(1.05)",
                  "brightness(1)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-12 h-7 md:w-14 md:h-8 bg-[#111] rounded-b-full relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-b from-[#222] to-[#0a0a0a]" />
                <div className="absolute bottom-0 left-2 right-2 h-3 bg-amber-200/20 rounded-full blur-sm" />
              </div>
              {/* Warm light cone */}
              <div className="lamp-light-cone" />
              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-[#181818] -rotate-2" />
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-7 h-1 bg-[#111] rounded-full" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Desk Drawers ── */}
      <DeskDrawer side="left" items={drawerLeft} onPickItem={setOpenItem} />
      <DeskDrawer side="right" items={drawerRight} onPickItem={setOpenItem} />

      {/* ── Bottom hint ── */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-desk-paper/10 text-[9px] font-mono tracking-widest z-10 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span>Click shelf items to explore</span>
        <span className="text-desk-brass/20">•</span>
        <span>Click monitor to boot</span>
        <span className="text-desk-brass/20">•</span>
        <span>Open drawers for quick access</span>
      </motion.div>

      {/* ═══ Document viewer overlay ═══ */}
      <AnimatePresence>
        {openItem && (
          <DeskDocument item={openItem} onClose={() => setOpenItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}