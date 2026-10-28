"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import type { Design } from "@/lib/types";

function Tile({ d, onOpen }: { d: Design; onOpen: (d: Design) => void }) {
  const [broken, setBroken] = useState(false);
  return (
    <button
      onClick={() => onOpen(d)}
      className="text-left rounded-lg border border-os-border/40 bg-os-border/10 overflow-hidden hover:border-os-accent/50 transition-colors"
    >
      <div className="aspect-[4/3] bg-os-border/20 flex items-center justify-center overflow-hidden">
        {d.image && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.image} alt={d.title} loading="lazy" className="w-full h-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <span className="text-3xl opacity-40">🎨</span>
        )}
      </div>
      <div className="p-2">
        <div className="text-os-text/90 text-xs font-semibold truncate">{d.title}</div>
        <div className="text-os-muted text-[10px] truncate">{d.category}</div>
      </div>
    </button>
  );
}

export default function DesignsApp() {
  const { data } = useData();
  const { designs } = data;
  const [open, setOpen] = useState<Design | null>(null);
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...Array.from(new Set(designs.map((d) => d.category).filter(Boolean) as string[]))];
  const shown = filter === "All" ? designs : designs.filter((d) => d.category === filter);

  return (
    <div className="p-5 font-mono text-sm overflow-y-auto bg-os-bg/50 min-h-full">
      <div className="text-os-accent text-xs uppercase tracking-wider mb-3">// Graphic design</div>
      {designs.length === 0 ? (
        <div className="text-os-muted text-xs">No designs yet.</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                  filter === c
                    ? "bg-os-accent/20 border-os-accent/60 text-os-accent"
                    : "border-os-border/40 text-os-text/60 hover:text-os-text"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shown.map((d) => (
              <Tile key={d.id} d={d} onOpen={setOpen} />
            ))}
          </div>
        </>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-6"
          onClick={() => setOpen(null)}
        >
          <div className="max-w-xl w-full rounded-xl bg-os-bg border border-os-border/50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {open.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.image} alt={open.title} className="w-full max-h-[60vh] object-contain bg-black/30" />
            )}
            <div className="p-4">
              <div className="text-os-text font-semibold">{open.title}</div>
              <div className="text-os-muted text-xs mt-0.5">{[open.category, open.tools.join(", ")].filter(Boolean).join(" · ")}</div>
              {open.description && <div className="text-os-text/70 text-xs mt-2">{open.description}</div>}
              <button onClick={() => setOpen(null)} className="mt-3 text-xs text-os-accent hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
