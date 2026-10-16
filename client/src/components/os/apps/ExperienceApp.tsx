"use client";

import { useData } from "@/context/DataContext";
import { motion } from "framer-motion";

export default function ExperienceApp() {
  const { data } = useData();
  const { experience } = data;

  return (
    <div className="p-5 font-mono text-sm overflow-y-auto bg-os-bg/50 min-h-full">
      <div className="text-os-accent text-xs uppercase tracking-wider mb-4">
        // Experience
      </div>

      <div className="relative pl-6">
        {/* Timeline line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-os-border/50" />

        <div className="space-y-6">
          {experience.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full bg-os-accent border-2 border-os-bg" />

              <div className="bg-os-border/10 border border-os-border/30 rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-os-text font-semibold text-sm">{exp.role}</h3>
                    <div className="text-os-accent text-xs">{exp.company}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded bg-os-accent/10 text-os-accent text-[10px] uppercase">
                      {exp.type}
                    </span>
                    <div className="text-os-muted text-[10px] mt-1">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </div>
                  </div>
                </div>

                {exp.description && (
                  <p className="text-os-text/70 text-xs mb-2 leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {exp.highlights.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-os-text/60 text-xs flex items-start gap-2">
                        <span className="text-os-accent mt-0.5">▸</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {exp.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {exp.techStack.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-os-border/30 text-os-muted text-[10px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
