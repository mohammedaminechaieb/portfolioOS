"use client";

import { useData } from "@/context/DataContext";
import { motion } from "framer-motion";
import SkillIcon from "@/components/SkillIcon";

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  language: { label: "Languages", icon: "💻" },
  frontend: { label: "Frontend", icon: "🎨" },
  backend: { label: "Backend", icon: "⚙️" },
  database: { label: "Databases", icon: "🗄️" },
  devops: { label: "DevOps", icon: "🚀" },
  ai: { label: "AI / ML", icon: "🧠" },
  embedded: { label: "Embedded / IoT", icon: "🔌" },
  tools: { label: "Tools", icon: "🔧" },
  design: { label: "Design", icon: "🎨" },
};

export default function SkillsApp() {
  const { data } = useData();
  const { skills } = data;

  // Group by category
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-5 font-mono text-sm overflow-y-auto bg-os-bg/50 min-h-full">
      <div className="text-os-accent text-xs uppercase tracking-wider mb-4">
        // Skills & Technologies
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, items]) => {
          const meta = CATEGORY_LABELS[cat] || { label: cat, icon: "📦" };
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span>{meta.icon}</span>
                <span className="text-os-text font-semibold text-xs uppercase tracking-wider">
                  {meta.label}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group"
                  >
                    <div className="flex items-center gap-2.5">
                      <SkillIcon icon={skill.icon} name={skill.name} size={26} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-os-text/80 text-xs truncate">{skill.name}</span>
                          <span className="text-os-muted text-[10px]">{skill.level}%</span>
                        </div>
                        <div className="h-1.5 bg-os-border/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-os-accent/60 to-os-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 0.8, delay: i * 0.03 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
