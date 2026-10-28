"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

/* ═══════════════════════════════════════════════
   BOOK VIEWER
   Open book with:
   - a table of contents on the left page (click = flip)
   - coloured sticky bookmarks on the right edge (click = flip)
   - real 3D leaves that turn around the spine
   ═══════════════════════════════════════════════ */

export interface BookEntry {
  id: string;
  /** Label printed on the bookmark and in the contents */
  tab: string;
  /** Left page of the spread */
  left: ReactNode;
  /** Right page of the spread */
  right: ReactNode;
}

interface BookViewerProps {
  title: string;
  icon: string;
  coverColor: string;
  entries: BookEntry[];
}

const TAB_COLORS = [
  "#d9534f",
  "#e8a33d",
  "#e6d44f",
  "#5fae5b",
  "#3fa7a0",
  "#4a8fd4",
  "#7a6bd1",
  "#c565b3",
  "#e07a5f",
  "#8d99ae",
];

const PAGE_W = 300;
const PAGE_H = 430;
const TAB_AREA = 96; // space for bookmarks to stick out of the right edge
const FLIP_MS = 650;

function PageShell({
  children,
  side,
  number,
}: {
  children: ReactNode;
  side: "left" | "right";
  number?: number;
}) {
  return (
    <div
      className="relative w-full h-full bg-desk-paper overflow-hidden"
      style={{
        borderRadius: side === "left" ? "6px 0 0 6px" : "0 6px 6px 0",
      }}
    >
      <div className="paper-texture absolute inset-0" />
      {/* gutter shadow next to the spine */}
      <div
        className="absolute top-0 bottom-0 w-10 pointer-events-none"
        style={{
          [side === "left" ? "right" : "left"]: 0,
          background: `linear-gradient(${
            side === "left" ? "to left" : "to right"
          }, rgba(60,40,20,0.28), transparent)`,
        }}
      />
      <div className="relative h-full p-5 overflow-y-auto custom-scroll-paper">
        {children}
      </div>
      {number !== undefined && (
        <div
          className={`absolute bottom-2 text-[9px] font-mono text-desk-woodDark/40 ${
            side === "left" ? "left-4" : "right-4"
          }`}
        >
          {number}
        </div>
      )}
    </div>
  );
}

/* One physical leaf: front = right page, back = left page of next spread */
function Leaf({
  index,
  total,
  flipped,
  delayMs,
  front,
  back,
  frontNumber,
  backNumber,
}: {
  index: number;
  total: number;
  flipped: boolean;
  delayMs: number;
  front: ReactNode;
  back: ReactNode;
  frontNumber?: number;
  backNumber?: number;
}) {
  const rotateY = useMotionValue(flipped ? -180 : 0);
  const [inTransit, setInTransit] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setInTransit(true);
    const controls = animate(rotateY, flipped ? -180 : 0, {
      duration: FLIP_MS / 1000,
      delay: delayMs / 1000,
      ease: [0.45, 0.05, 0.25, 1],
      onComplete: () => setInTransit(false),
    });
    return () => controls.stop();
  }, [flipped, delayMs, rotateY]);

  // shadows that follow the curl
  const frontShade = useTransform(rotateY, [0, -90], [0, 0.45]);
  const backShade = useTransform(rotateY, [-90, -180], [0.45, 0]);
  const castShadow = useTransform(rotateY, [0, -90, -180], [0, 0.35, 0]);

  const z = inTransit ? 1000 : flipped ? index + 1 : total - index + 1;

  return (
    <motion.div
      className="absolute top-0 left-1/2 pointer-events-auto"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        zIndex: z,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        rotateY,
      }}
    >
      {/* front (right-hand page) */}
      <div
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden" }}
      >
        <PageShell side="right" number={frontNumber}>
          {front}
        </PageShell>
        <motion.div
          className="absolute inset-0 bg-black pointer-events-none rounded-r-md"
          style={{ opacity: frontShade }}
        />
      </div>
      {/* back (left-hand page once turned) */}
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <PageShell side="left" number={backNumber}>
          {back}
        </PageShell>
        <motion.div
          className="absolute inset-0 bg-black pointer-events-none rounded-l-md"
          style={{ opacity: backShade }}
        />
      </div>
      {/* soft shadow cast onto the page underneath */}
      <motion.div
        className="absolute inset-y-0 -right-6 w-6 pointer-events-none"
        style={{
          opacity: castShadow,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.35), transparent)",
          transform: "translateZ(-1px)",
        }}
      />
    </motion.div>
  );
}

export default function BookViewer({
  title,
  icon,
  coverColor,
  entries,
}: BookViewerProps) {
  const n = entries.length;
  // p = number of leaves turned. 0 = contents + title page, k = entry k-1
  const [p, setP] = useState(0);
  const lastP = useRef(0);
  const [scale, setScale] = useState(1);

  // fit the whole book on small screens
  useEffect(() => {
    const fit = () => {
      const w = (window.innerWidth - 16) / (PAGE_W * 2 + TAB_AREA * 2);
      const h = (window.innerHeight - 130) / (PAGE_H + 30);
      setScale(Math.max(0.4, Math.min(1, w, h)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const goTo = useCallback(
    (target: number) => {
      const t = Math.max(0, Math.min(n, target));
      lastP.current = p;
      setP(t);
    },
    [n, p]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(p + 1);
      if (e.key === "ArrowLeft") goTo(p - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, p]);

  // Stagger multi-page jumps so leaves turn one after another
  const delayFor = (i: number) => {
    const from = lastP.current;
    if (p > from && i >= from && i < p) return (i - from) * 110;
    if (p < from && i >= p && i < from) return (from - 1 - i) * 110;
    return 0;
  };

  const tabs = entries.map((e, i) => ({
    ...e,
    color: TAB_COLORS[i % TAB_COLORS.length],
  }));

  const tabH = Math.max(22, Math.min(40, (PAGE_H - 30) / Math.max(n, 1)));

  /* Contents page (static, under all leaves on the left) */
  const contents = (
    <div>
      <div className="text-desk-woodDark font-bold text-lg font-mono">
        {icon} {title}
      </div>
      <div className="text-desk-woodDark/50 text-[10px] font-mono tracking-widest uppercase mb-1">
        Table of contents
      </div>
      <div className="w-full h-px bg-desk-woodDark/15 mb-3" />
      <ul className="space-y-0.5">
        {tabs.map((t, i) => (
          <li key={t.id}>
            <button
              onClick={() => goTo(i + 1)}
              className="group w-full flex items-baseline gap-2 text-left text-[12px] font-mono text-desk-woodDark/80 hover:text-desk-woodDark py-1 px-1 rounded hover:bg-desk-woodDark/5 transition-colors"
            >
              <span
                className="inline-block w-2 h-2 rounded-sm shrink-0 translate-y-[1px]"
                style={{ background: t.color }}
              />
              <span className="truncate">{t.tab}</span>
              <span className="flex-1 border-b border-dotted border-desk-woodDark/25 translate-y-[-3px] min-w-[8px]" />
              <span className="text-desk-woodDark/50 group-hover:text-desk-woodDark">
                {i * 2 + 2}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const titlePage = (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-desk-woodDark font-bold text-xl font-mono">
        {title}
      </div>
      <div className="w-14 h-0.5 bg-desk-brass/60 rounded my-3" />
      <div className="text-desk-woodDark/60 text-[11px] font-mono leading-relaxed">
        Mohamed Amine Chaieb
        <br />
        Portfolio 2026
      </div>
      <div className="mt-6 text-desk-woodDark/40 text-[10px] font-mono leading-relaxed">
        Pick a chapter in the contents,
        <br />
        or use the coloured bookmarks →
      </div>
    </div>
  );

  const endPage = (
    <div className="h-full flex flex-col items-center justify-center text-center text-desk-woodDark/50 text-[11px] font-mono">
      <div className="text-3xl mb-2">✦</div>
      The end
      <button
        onClick={() => goTo(0)}
        className="mt-3 underline underline-offset-2 hover:text-desk-woodDark"
      >
        Back to contents
      </button>
    </div>
  );

  // leaf j: front = entry j-1 right page (title page for j=0)
  //         back  = entry j left page (end page for j=n)
  const leaves = Array.from({ length: n + 1 }, (_, j) => ({
    front: j === 0 ? titlePage : tabs[j - 1].right,
    back: j === n ? endPage : tabs[j].left,
  }));

  const heightPx = PAGE_H;

  return (
    <div
      style={{
        width: PAGE_W * 2 + TAB_AREA * 2,
        height: heightPx + 30,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
      className="relative"
    >
      {/* Book block */}
      <div
        className="absolute top-3"
        style={{ left: TAB_AREA, width: PAGE_W * 2, height: heightPx, perspective: 2400 }}
      >
        {/* leather cover (slightly bigger than pages) */}
        <div
          className="absolute -inset-2 rounded-lg shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${coverColor}, ${coverColor}cc)`,
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />
        {/* page block edges (stacked paper look) */}
        <div className="absolute inset-0 rounded bg-[#d8ccb0] translate-y-[3px]" />

        {/* static left page: contents */}
        <div
          className="absolute left-0 top-0"
          style={{ width: PAGE_W, height: heightPx }}
        >
          <PageShell side="left">
            {contents}
          </PageShell>
        </div>
        {/* static right page under the last leaf (blank paper) */}
        <div
          className="absolute right-0 top-0"
          style={{ width: PAGE_W, height: heightPx }}
        >
          <PageShell side="right">
            <div />
          </PageShell>
        </div>

        {/* spine crease */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px bg-black/40 z-[900] pointer-events-none"
          style={{ boxShadow: "0 0 10px 3px rgba(0,0,0,0.25)" }}
        />

        {/* turning leaves */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transformStyle: "preserve-3d" }}
        >
          {leaves.map((l, j) => (
            <Leaf
              key={j}
              index={j}
              total={n + 1}
              flipped={j < p}
              delayMs={delayFor(j)}
              front={l.front}
              back={l.back}
              frontNumber={j * 2 + 1}
              backNumber={j === n ? undefined : j * 2 + 2}
            />
          ))}
        </div>

        {/* corner arrows */}
        <button
          aria-label="Previous page"
          onClick={() => goTo(p - 1)}
          disabled={p === 0}
          className="absolute -bottom-9 left-1/2 -translate-x-[calc(100%+12px)] text-desk-paper/60 hover:text-desk-paper disabled:opacity-20 text-[11px] font-mono px-3 py-1 rounded-full bg-desk-woodDark/80"
        >
          ← prev
        </button>
        <button
          aria-label="Next page"
          onClick={() => goTo(p + 1)}
          disabled={p === n}
          className="absolute -bottom-9 left-1/2 translate-x-3 text-desk-paper/60 hover:text-desk-paper disabled:opacity-20 text-[11px] font-mono px-3 py-1 rounded-full bg-desk-woodDark/80"
        >
          next →
        </button>
      </div>

      {/* Sticky bookmarks on the right edge */}
      <div
        className="absolute top-3 z-[2000]"
        style={{ left: TAB_AREA + PAGE_W * 2 + 6, height: heightPx }}
      >
        {tabs.map((t, i) => {
          const active = p === i + 1;
          return (
            <motion.button
              key={t.id}
              onClick={() => goTo(i + 1)}
              title={t.tab}
              className="absolute left-0 text-left shadow-lg overflow-hidden whitespace-nowrap"
              style={{
                top: 6 + i * tabH,
                height: tabH - 3,
                width: TAB_AREA - 4,
                background: t.color,
                borderRadius: "0 6px 6px 0",
                borderLeft: "3px solid rgba(0,0,0,0.25)",
              }}
              animate={{ x: active ? 6 : -10 }}
              whileHover={{ x: active ? 6 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <span
                className="block px-2 text-[9px] font-mono font-bold text-black/70 truncate"
                style={{ lineHeight: `${tabH - 3}px` }}
              >
                {t.tab}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* "Contents" ribbon on the left edge */}
      <motion.button
        onClick={() => goTo(0)}
        className="absolute z-[2000] text-[9px] font-mono font-bold text-black/70 shadow-lg"
        style={{
          left: TAB_AREA - 82,
          top: 18,
          width: 78,
          height: 24,
          lineHeight: "24px",
          background: "#e8dcc0",
          borderRadius: "6px 0 0 6px",
          paddingLeft: 8,
          textAlign: "left",
          transformOrigin: "left center",
        }}
        initial={{ x: 10 }}
        animate={{ x: p === 0 ? 10 : 0 }}
        whileHover={{ x: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        ☰ Contents
      </motion.button>
    </div>
  );
}
