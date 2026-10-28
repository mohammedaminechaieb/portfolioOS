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
