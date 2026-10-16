"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/context/DataContext";
import { api } from "@/lib/api";

export default function ContactApp() {
  const { data } = useData();
  const { profile } = data;
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.body) return;
    setStatus("sending");
    try {
      await api.sendMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", body: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="p-5 font-mono text-sm overflow-y-auto bg-os-bg/50 min-h-full">
      <div className="text-os-accent text-xs uppercase tracking-wider mb-4">
        // Contact
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Info */}
        <div className="space-y-4">
          <p className="text-os-text/80 text-xs leading-relaxed">
            Feel free to reach out for collaborations, PFE opportunities, or just to say hello.
          </p>

          <div className="space-y-2">
            {[
              { icon: "📧", label: "Email", value: profile.email, href: `mailto:${profile.email}` },
              { icon: "📱", label: "Phone", value: profile.phone },
              { icon: "📍", label: "Location", value: profile.location },
              { icon: "🔗", label: "GitHub", value: "github.com/aminechaieb", href: profile.github },
              { icon: "🔗", label: "LinkedIn", value: "LinkedIn", href: profile.linkedin },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-xs">
                <span>{item.icon}</span>
                {item.href ? (
                  <a href={item.href} target="_blank" className="text-os-text/70 hover:text-os-accent transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <span className="text-os-text/70">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <span className="text-4xl mb-3">✅</span>
              <p className="text-os-green font-semibold text-sm">Message sent!</p>
              <p className="text-os-muted text-xs mt-1">I&apos;ll get back to you soon.</p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 px-3 py-1 rounded bg-os-border/30 text-os-text text-xs hover:bg-os-border/50 transition-colors"
              >
                Send another
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name *"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="bg-os-border/20 border border-os-border/30 rounded px-3 py-2 text-xs text-os-text placeholder:text-os-muted/50 focus:outline-none focus:border-os-accent/50 transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="bg-os-border/20 border border-os-border/30 rounded px-3 py-2 text-xs text-os-text placeholder:text-os-muted/50 focus:outline-none focus:border-os-accent/50 transition-colors"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="w-full bg-os-border/20 border border-os-border/30 rounded px-3 py-2 text-xs text-os-text placeholder:text-os-muted/50 focus:outline-none focus:border-os-accent/50 transition-colors"
              />
              <textarea
                placeholder="Message *"
                rows={5}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="w-full bg-os-border/20 border border-os-border/30 rounded px-3 py-2 text-xs text-os-text placeholder:text-os-muted/50 focus:outline-none focus:border-os-accent/50 transition-colors resize-none"
                required
              />
              {status === "error" && (
                <p className="text-os-red text-xs">Failed to send. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-2 rounded bg-os-accent text-white text-xs font-semibold hover:bg-os-accent/80 disabled:opacity-50 transition-colors"
              >
                {status === "sending" ? "Sending..." : "Send Message →"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
