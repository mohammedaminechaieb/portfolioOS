"use client";

import { useState, ReactNode } from "react";
import type {
  Profile,
  Experience,
  Education,
  Certification,
  Competition,
  Club,
  Design,
} from "@/lib/types";
import { formatDate, formatYM, capitalize } from "@/lib/format";

/* Structured content for the folders and papers on the desk.
   Every entry is its own card so items are clearly separated. */

const ACCENTS = ["#b4533c", "#c8912e", "#5f8a4b", "#3f7f87", "#4a6fa5", "#7a5fa8", "#a8567f"];
const accent = (i: number) => ACCENTS[i % ACCENTS.length];

function Heading({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-desk-woodDark font-bold text-base font-mono">{children}</div>
      {count !== undefined && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-desk-woodDark/10 text-desk-woodDark/60">
          {count}
        </span>
      )}
    </div>
  );
}

function Card({ i, children }: { i: number; children: ReactNode }) {
  return (
    <div
      className="rounded-md border border-desk-woodDark/15 bg-white/45 shadow-[0_1px_2px_rgba(60,40,20,0.12)] pl-3 pr-3 py-2.5"
      style={{ borderLeft: `4px solid ${accent(i)}` }}
    >
      {children}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-desk-woodDark/10 text-desk-woodDark/75 whitespace-nowrap shrink-0 self-start">
      {children}
    </span>
  );
}

function Meta({ children }: { children: ReactNode }) {
  return <div className="text-[10.5px] font-mono text-desk-woodDark/55">{children}</div>;
}

function Title({ children }: { children: ReactNode }) {
  return <div className="text-[13px] font-mono font-bold text-desk-woodDark leading-snug">{children}</div>;
}

function Body({ children }: { children: ReactNode }) {
  return <p className="text-[12px] font-mono text-desk-woodDark/75 leading-relaxed mt-1.5">{children}</p>;
}

function List({ children }: { children: ReactNode }) {
  return <div className="space-y-2.5">{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="text-[12px] font-mono text-desk-woodDark/50">{text}</div>;
}

function A({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2 decoration-desk-woodDark/30 hover:decoration-desk-woodDark text-blue-900"
    >
      {children}
    </a>
  );
}

/* ═════════ About ═════════ */
export function AboutBody({ profile }: { profile: Profile }) {
  const rows: [string, ReactNode][] = [
    ["Email", <A key="e" href={`mailto:${profile.email}`}>{profile.email}</A>],
    ["Phone", profile.phone],
    ["Location", profile.location],
    ["GitHub", <A key="g" href={profile.github}>{profile.github.replace("https://", "")}</A>],
    ["LinkedIn", <A key="l" href={profile.linkedin}>{profile.linkedin.replace(/https:\/\/(www\.)?/, "")}</A>],
  ];
  if (profile.portfolio)
    rows.push(["Portfolio", <A key="p" href={profile.portfolio}>{profile.portfolio.replace("https://", "")}</A>]);
  if (profile.resumeUrl) rows.push(["CV", <A key="r" href={profile.resumeUrl}>Download (PDF)</A>]);
  return (
    <List>
      <Card i={0}>
        <Title>{profile.name}</Title>
        <Meta>{profile.title}</Meta>
        <Meta>{profile.subtitle}</Meta>
        {profile.available && (
          <div className="mt-2">
            <Chip>● Available for a PFE internship</Chip>
          </div>
        )}
      </Card>
      {profile.bio && (
        <Card i={1}>
          <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/45 mb-0.5">About</div>
          <Body>{profile.bio}</Body>
        </Card>
      )}
      <Card i={2}>
        <div className="text-[9px] font-mono uppercase tracking-widest text-desk-woodDark/45 mb-1.5">Contact</div>
        <div className="space-y-1">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-3 text-[12px] font-mono text-desk-woodDark/80">
              <span className="w-[68px] shrink-0 text-desk-woodDark/45">{k}</span>
              <span className="break-all">{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </List>
  );
}

/* ═════════ Experience ═════════ */
const TYPE_LABEL: Record<string, string> = {
  internship: "Internship",
  capstone: "Capstone project",
  research: "Research",
  job: "Job",
};
export function ExperienceBody({ items }: { items: Experience[] }) {
  if (!items.length) return <Empty text="No experience entries yet." />;
  return (
    <List>
      {items.map((e, i) => (
        <Card key={e.id} i={i}>
          <div className="flex items-start justify-between gap-2">
            <Title>{e.role}</Title>
            <Chip>{TYPE_LABEL[e.type] || capitalize(e.type)}</Chip>
          </div>
          <Meta>
            {e.company} · {e.location}
          </Meta>
          <Meta>
            {formatYM(e.startDate)} – {e.current ? "Present" : formatYM(e.endDate)}
          </Meta>
          <Body>{e.description}</Body>
          {e.highlights.length > 0 && (
            <ul className="mt-2 space-y-1 list-disc pl-4 text-[11.5px] font-mono text-desk-woodDark/75 leading-snug">
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          {e.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {e.techStack.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          )}
        </Card>
      ))}
    </List>
  );
}

/* ═════════ Education ═════════ */
export function EducationBody({ items }: { items: Education[] }) {
  if (!items.length) return <Empty text="No education entries yet." />;
  return (
    <List>
      {items.map((e, i) => (
        <Card key={e.id} i={i}>
          <Title>{e.degree}</Title>
          <Meta>{e.school}</Meta>
          <Meta>{e.location}</Meta>
          <div className="mt-1.5">
            <Chip>
              {e.startDate} – {e.current ? "Present" : e.endDate}
            </Chip>
          </div>
          {e.description && <Body>{e.description}</Body>}
        </Card>
      ))}
    </List>
  );
}

/* ═════════ Certifications ═════════ */
export function CertsBody({ items }: { items: Certification[] }) {
  if (!items.length) return <Empty text="No certifications yet." />;
  return (
    <List>
      {items.map((c, i) => (
        <Card key={c.id} i={i}>
          <div className="flex items-start justify-between gap-2">
            <Title>{c.title}</Title>
            {c.category && <Chip>{c.category}</Chip>}
          </div>
          <Meta>
            {c.issuer}
            {formatDate(c.date) ? ` · ${formatDate(c.date)}` : ""}
          </Meta>
          {c.url && (
            <div className="text-[11px] font-mono mt-1">
              <A href={c.url}>View credential</A>
            </div>
          )}
        </Card>
      ))}
    </List>
  );
}

/* ═════════ Competitions & events ═════════ */
export function CompetitionsBody({ items }: { items: Competition[] }) {
  if (!items.length) return <Empty text="No competitions yet." />;
  return (
    <List>
      {items.map((c, i) => (
        <Card key={c.id} i={i}>
          <div className="flex items-start justify-between gap-2">
            <Title>{c.title}</Title>
            {c.organizer && <Chip>{c.organizer}</Chip>}
          </div>
          {(c.result || formatDate(c.date)) && (
            <Meta>
              {c.result}
              {c.result && formatDate(c.date) ? " · " : ""}
              {formatDate(c.date)}
            </Meta>
          )}
          {c.description && <Body>{c.description}</Body>}
        </Card>
      ))}
    </List>
  );
}

/* ═════════ Clubs ═════════ */
export function ClubsBody({ items }: { items: Club[] }) {
  if (!items.length) return <Empty text="No clubs yet." />;
  return (
    <List>
      {items.map((c, i) => (
        <Card key={c.id} i={i}>
          <div className="flex items-start justify-between gap-2">
            <Title>{c.name}</Title>
            {c.role && <Chip>{c.role}</Chip>}
          </div>
          {c.period && <Meta>{c.period}</Meta>}
          {c.description && <Body>{c.description}</Body>}
          {c.achievements.length > 0 && (
            <ul className="mt-1.5 list-disc pl-4 text-[11.5px] font-mono text-desk-woodDark/75">
              {c.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </List>
  );
}

/* ═════════ Designs (gallery) ═════════ */
function Thumb({ d }: { d: Design }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="rounded-md border border-desk-woodDark/15 bg-white/50 overflow-hidden shadow-[0_1px_2px_rgba(60,40,20,0.12)]">
      <div className="aspect-[4/3] bg-desk-woodDark/10 flex items-center justify-center overflow-hidden">
        {d.image && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.image}
            alt={d.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="text-2xl opacity-40">🎨</span>
        )}
      </div>
      <div className="p-2">
        <div className="text-[11px] font-mono font-bold text-desk-woodDark leading-tight truncate">{d.title}</div>
        <div className="text-[9.5px] font-mono text-desk-woodDark/55 truncate">
          {[d.category, d.tools.join(", ")].filter(Boolean).join(" · ")}
        </div>
      </div>
    </div>
  );
}
export function DesignsBody({ items }: { items: Design[] }) {
  if (!items.length) return <Empty text="No designs yet." />;
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((d) => (
        <Thumb key={d.id} d={d} />
      ))}
    </div>
  );
}

export { Heading };
