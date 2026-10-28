"use client";

import { useData } from "@/context/DataContext";
import { formatDate } from "@/lib/format";

export default function AboutApp() {
  const { data } = useData();
  const { profile, education, certifications, competitions, clubs } = data;

  return (
    <div className="p-6 font-mono text-sm space-y-6 bg-os-bg/50 min-h-full">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-os-accent to-os-accent/40 flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-os-text">{profile.name}</h1>
          <p className="text-os-accent mt-1">{profile.title}</p>
          <p className="text-os-muted text-xs mt-1">{profile.subtitle}</p>
          {profile.available && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-os-green/10 text-os-green text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-os-green animate-pulse" />
              Available for PFE
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      <div>
        <div className="text-os-accent text-xs uppercase tracking-wider mb-2">// About</div>
        <p className="text-os-text/80 leading-relaxed">{profile.bio}</p>
      </div>

      {/* Contact */}
      <div>
        <div className="text-os-accent text-xs uppercase tracking-wider mb-2">// Contact</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href={`mailto:${profile.email}`} className="text-os-text/70 hover:text-os-accent transition-colors">
            📧 {profile.email}
          </a>
          <span className="text-os-text/70">📱 {profile.phone}</span>
          <span className="text-os-text/70">📍 {profile.location}</span>
          <a href={profile.github} target="_blank" className="text-os-text/70 hover:text-os-accent transition-colors">
            🔗 GitHub
          </a>
          <a href={profile.linkedin} target="_blank" className="text-os-text/70 hover:text-os-accent transition-colors">
            🔗 LinkedIn
          </a>
        </div>
      </div>

      {/* Education */}
      <div>
        <div className="text-os-accent text-xs uppercase tracking-wider mb-2">// Education</div>
        <div className="space-y-3">
          {education.map((edu) => (
            <div key={edu.id} className="border-l-2 border-os-accent/30 pl-3">
              <div className="font-semibold text-os-text/90">{edu.degree}</div>
              <div className="text-os-muted text-xs">{edu.school} — {edu.location}</div>
              <div className="text-os-muted text-xs">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</div>
              {edu.description && <div className="text-os-text/60 text-xs mt-1">{edu.description}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <div className="text-os-accent text-xs uppercase tracking-wider mb-2">// Certifications</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {certifications.map((c) => (
              <div key={c.id} className="rounded-lg border border-os-border/40 bg-os-border/10 p-2.5">
                <div className="text-os-text/90 text-xs font-semibold leading-snug">{c.title}</div>
                <div className="text-os-muted text-[11px] mt-0.5">
                  {c.issuer}{formatDate(c.date) ? ` · ${formatDate(c.date)}` : ""}
                </div>
                {c.category && (
                  <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded bg-os-accent/10 text-os-accent text-[10px]">
                    {c.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitions */}
      {competitions.length > 0 && (
        <div>
          <div className="text-os-accent text-xs uppercase tracking-wider mb-2">// Competitions</div>
          <div className="space-y-2">
            {competitions.map((c) => (
              <div key={c.id} className="rounded-lg border border-os-border/40 bg-os-border/10 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-os-text/90 text-xs font-semibold leading-snug">{c.title}</div>
                  {c.organizer && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-os-accent/10 text-os-accent text-[10px]">
                      {c.organizer}
                    </span>
                  )}
                </div>
                <div className="text-os-muted text-[11px] mt-0.5">
                  {c.result}{c.result && formatDate(c.date) ? " · " : ""}{formatDate(c.date)}
                </div>
                {c.description && <div className="text-os-text/60 text-[11px] mt-1 leading-relaxed">{c.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clubs */}
      {clubs.length > 0 && (
        <div>
          <div className="text-os-accent text-xs uppercase tracking-wider mb-2">// Clubs &amp; associations</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {clubs.map((c) => (
              <div key={c.id} className="rounded-lg border border-os-border/40 bg-os-border/10 p-2.5">
                <div className="text-os-text/90 text-xs font-semibold leading-snug">{c.name}</div>
                <div className="text-os-muted text-[11px] mt-0.5">
                  {[c.role, c.period].filter(Boolean).join(" · ")}
                </div>
                {c.description && <div className="text-os-text/60 text-[11px] mt-1 leading-relaxed">{c.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
