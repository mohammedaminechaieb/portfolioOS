"use client";

import { useState } from "react";

/**
 * Skill icon. `icon` is either
 *  - a slug of a bundled SVG in /public/skill-icons (e.g. "python"), or
 *  - an emoji (e.g. "🔗"), or
 *  - empty -> first letter of the skill.
 * It sits on a light chip so dark logos (Next.js, Vercel, Git...) stay visible on the
 * dark OS theme as well as on the paper of the desk.
 */
/** Default icon per skill name, used when the database has no `icon` for the skill. */
const DEFAULT_ICONS: Record<string, string> = {
  python: "python", javascript: "javascript", "c/c++": "cplusplus", c: "cplusplus", dart: "dart",
  sql: "mysql", typescript: "typescript", kotlin: "kotlin", react: "react", "html/css": "html5",
  flutter: "flutter", "tailwind css": "tailwindcss", "next.js": "nextjs", angular: "angular",
  "node.js/express": "nodejs", fastapi: "fastapi", "rest apis": "🔗", "jwt auth": "🔐",
  mongodb: "mongodb", postgresql: "postgresql", sqlite: "sqlite", git: "git", docker: "docker",
  render: "☁️", vercel: "vercel", opencv: "opencv", "scikit-learn": "scikitlearn", pytorch: "pytorch",
  "cnn/lstm": "🧠", "faster-whisper": "🎙️", "llm apis": "🤖", n8n: "🔁", esp32: "📟", mqtt: "📡",
  platformio: "🔩", figma: "figma", postman: "postman", canva: "canva", photoshop: "photoshop",
  illustrator: "illustrator",
};

export default function SkillIcon({
  icon,
  name,
  size = 22,
  className = "",
}: {
  icon?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  icon = icon || DEFAULT_ICONS[name.trim().toLowerCase()] || "";
  const isSlug = !!icon && /^[a-z0-9]+$/.test(icon);
  const box = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: size * 0.6,
  } as const;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md bg-white/90 shadow-sm shrink-0 leading-none ${className}`}
      style={box}
      aria-hidden="true"
    >
      {isSlug && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/skill-icons/${icon}.svg`}
          alt=""
          width={size - 6}
          height={size - 6}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : icon && !isSlug ? (
        <span>{icon}</span>
      ) : (
        <span className="font-bold text-[#444]" style={{ fontSize: size * 0.5 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}