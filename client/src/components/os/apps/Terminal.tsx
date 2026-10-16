"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useData } from "@/context/DataContext";

interface TerminalLine {
  type: "input" | "output" | "error" | "ascii";
  text: string;
}

export default function Terminal() {
  const { data } = useData();
  const { profile, projects, skills, experience } = data;
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", text: `AmineOS v3.0 — Interactive Terminal` },
    { type: "output", text: `Type "help" for available commands.\n` },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const runCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();
      const args = trimmed.split(/\s+/);
      const command = args[0];

      addLines([{ type: "input", text: `amine@portfolio:~$ ${cmd}` }]);

      switch (command) {
        case "help":
          addLines([
            { type: "output", text: "Available commands:" },
            { type: "output", text: "  about       — Who I am" },
            { type: "output", text: "  skills      — My technical skills" },
            { type: "output", text: "  projects    — My projects" },
            { type: "output", text: "  experience  — Work experience" },
            { type: "output", text: "  education   — Education background" },
            { type: "output", text: "  contact     — Contact information" },
            { type: "output", text: "  whoami      — Current user" },
            { type: "output", text: "  neofetch    — System information" },
            { type: "output", text: "  ls          — List sections" },
            { type: "output", text: "  cat <file>  — Read a file" },
            { type: "output", text: "  echo <msg>  — Echo a message" },
            { type: "output", text: "  date        — Current date" },
            { type: "output", text: "  clear       — Clear terminal" },
            { type: "output", text: "  history     — Command history" },
            { type: "output", text: "  sudo        — Try it ;)" },
          ]);
          break;

        case "about":
          addLines([
            { type: "output", text: `\n${profile.name}` },
            { type: "output", text: `${profile.title}` },
            { type: "output", text: `${profile.subtitle}\n` },
            { type: "output", text: profile.bio },
          ]);
          break;

        case "skills":
          const grouped: Record<string, string[]> = {};
          skills.forEach((s) => {
            (grouped[s.category] ||= []).push(`${s.name} (${s.level}%)`);
          });
          Object.entries(grouped).forEach(([cat, items]) => {
            addLines([
              { type: "output", text: `\n[${cat.toUpperCase()}]` },
              { type: "output", text: `  ${items.join(", ")}` },
            ]);
          });
          break;

        case "projects":
          projects.forEach((p) => {
            addLines([
              { type: "output", text: `\n${p.featured ? "⭐ " : ""}${p.title}` },
              { type: "output", text: `  ${p.description}` },
              { type: "output", text: `  Tech: ${p.techStack.join(", ")}` },
            ]);
          });
          break;

        case "experience":
          experience.forEach((exp) => {
            addLines([
              { type: "output", text: `\n${exp.role} @ ${exp.company}` },
              { type: "output", text: `  ${exp.type} | ${exp.startDate} – ${exp.current ? "Present" : exp.endDate}` },
              ...exp.highlights.map((h) => ({ type: "output" as const, text: `  ▸ ${h}` })),
            ]);
          });
          break;

        case "education":
          data.education.forEach((edu) => {
            addLines([
              { type: "output", text: `\n${edu.degree}` },
              { type: "output", text: `  ${edu.school} — ${edu.location}` },
              { type: "output", text: `  ${edu.startDate} – ${edu.current ? "Present" : edu.endDate}` },
            ]);
          });
          break;

        case "contact":
          addLines([
            { type: "output", text: `\nEmail:    ${profile.email}` },
            { type: "output", text: `Phone:    ${profile.phone}` },
            { type: "output", text: `Location: ${profile.location}` },
            { type: "output", text: `GitHub:   ${profile.github}` },
            { type: "output", text: `LinkedIn: ${profile.linkedin}` },
          ]);
          break;

        case "whoami":
          addLines([{ type: "output", text: "amine — Engineering Student & Full-Stack Developer" }]);
          break;

        case "neofetch":
          addLines([
            { type: "ascii", text: "        ╔══════════╗" },
            { type: "ascii", text: "        ║  AMINE   ║       amine@portfolio" },
            { type: "ascii", text: "        ║    OS     ║       ──────────────────" },
            { type: "ascii", text: "        ╚══════════╝       OS: AmineOS v3.0" },
            { type: "output", text: `                          Host: ${profile.location}` },
            { type: "output", text: `                          Kernel: Next.js 15` },
            { type: "output", text: `                          Shell: amine-bash 1.0` },
            { type: "output", text: `                          Resolution: ${typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "1920x1080"}` },
            { type: "output", text: `                          Theme: Dark Teal [os-accent]` },
            { type: "output", text: `                          Terminal: AmineTerminal` },
            { type: "output", text: `                          CPU: ${skills.length} skills loaded` },
            { type: "output", text: `                          Memory: ${projects.length} projects cached` },
          ]);
          break;

        case "ls":
          addLines([
            { type: "output", text: "about.md    projects/    skills.json    experience.log" },
            { type: "output", text: "education/  contact.cfg  README.md      .secrets" },
          ]);
          break;

        case "cat":
          if (args[1] === ".secrets") {
            addLines([{ type: "error", text: "Permission denied: Nice try though! 😄" }]);
          } else if (args[1] === "readme.md" || args[1] === "README.md") {
            addLines([
              { type: "output", text: `# ${profile.name}'s Portfolio` },
              { type: "output", text: `A retro OS-themed portfolio showcasing my work.` },
              { type: "output", text: `Built with Next.js, Express, and PostgreSQL.` },
            ]);
          } else if (args[1]) {
            addLines([{ type: "error", text: `cat: ${args[1]}: Try 'about', 'projects', 'skills' instead` }]);
          } else {
            addLines([{ type: "error", text: "cat: missing file operand" }]);
          }
          break;

        case "echo":
          addLines([{ type: "output", text: args.slice(1).join(" ") || "" }]);
          break;

        case "date":
          addLines([{ type: "output", text: new Date().toString() }]);
          break;

        case "clear":
          setLines([]);
          return;

        case "history":
          history.forEach((h, i) => {
            addLines([{ type: "output", text: `  ${i + 1}  ${h}` }]);
          });
          break;

        case "sudo":
          addLines([
            { type: "error", text: "amine is not in the sudoers file. This incident will be reported." },
            { type: "output", text: "Just kidding — but you don't have root here 😉" },
          ]);
          break;

        case "pwd":
          addLines([{ type: "output", text: "/home/amine/portfolio" }]);
          break;

        case "":
          break;

        default:
          addLines([
            { type: "error", text: `command not found: ${command}` },
            { type: "output", text: `Type "help" for available commands.` },
          ]);
      }
    },
    [addLines, data, profile, projects, skills, experience, history]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const cmd = input.trim();
      if (cmd) setHistory((h) => [...h, cmd]);
      setHistIdx(-1);
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      if (histIdx >= history.length - 1) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(histIdx + 1);
        setInput(history[histIdx + 1]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="h-full bg-[#0a0e14] p-3 font-mono text-xs overflow-y-auto cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className={`whitespace-pre-wrap leading-5 ${
            line.type === "input"
              ? "text-os-green"
              : line.type === "error"
              ? "text-os-red"
              : line.type === "ascii"
              ? "text-os-accent"
              : "text-os-text/70"
          }`}
        >
          {line.text}
        </div>
      ))}

      {/* Input line */}
      <div className="flex items-center leading-5">
        <span className="text-os-green">amine@portfolio:~$&nbsp;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-os-text outline-none caret-os-accent"
          autoFocus
          spellCheck={false}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
