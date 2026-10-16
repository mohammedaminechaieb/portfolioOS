"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi, api } from "@/lib/api";
import type { Profile, Project, Experience, Skill, Message, SiteConfig } from "@/lib/types";

type Tab = "profile" | "projects" | "experience" | "skills" | "messages" | "settings";

interface Props {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadAll = useCallback(async () => {
    try {
      const [p, pr, ex, sk, msg, cfg] = await Promise.all([
        api.getProfile(),
        api.getProjects(),
        api.getExperience(),
        api.getSkills(),
        adminApi.getMessages(),
        api.getConfig(),
      ]);
      setProfile(p);
      setProjects(pr);
      setExperience(ex);
      setSkills(sk);
      setMessages(msg);
      setConfig(cfg);
    } catch (err) {
      console.error("Load failed:", err);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await adminApi.updateProfile(profile);
      showToast("Profile saved!");
    } catch { showToast("Save failed"); }
    setSaving(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await adminApi.deleteProject(id);
      setProjects((p) => p.filter((x) => x.id !== id));
      showToast("Project deleted");
    } catch { showToast("Delete failed"); }
  };

  const deleteExp = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    try {
      await adminApi.deleteExperience(id);
      setExperience((e) => e.filter((x) => x.id !== id));
      showToast("Experience deleted");
    } catch { showToast("Delete failed"); }
  };

  const markRead = async (id: string) => {
    try {
      await adminApi.markRead(id);
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, read: true } : x)));
    } catch {}
  };

  const deleteMessage = async (id: string) => {
    try {
      await adminApi.deleteMessage(id);
      setMessages((m) => m.filter((x) => x.id !== id));
    } catch {}
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "projects", label: "Projects", icon: "📁" },
    { id: "experience", label: "Experience", icon: "💼" },
    { id: "skills", label: "Skills", icon: "⚡" },
    { id: "messages", label: "Messages", icon: "✉️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const unreadCount = messages.filter((m) => !m.read).length;

  const inputCls = "w-full bg-os-bg border border-os-border rounded px-3 py-2 text-sm text-os-text font-mono focus:outline-none focus:border-os-accent transition-colors";
  const btnPrimary = "px-4 py-2 rounded bg-os-accent text-white text-sm font-mono font-semibold hover:bg-os-accent/80 disabled:opacity-50 transition-colors";
  const btnDanger = "px-3 py-1.5 rounded bg-os-red/20 text-os-red text-xs font-mono hover:bg-os-red/30 transition-colors";

  return (
    <div className="min-h-screen bg-os-bg text-os-text font-mono flex">
      {/* Sidebar */}
      <div className="w-56 bg-os-surface border-r border-os-border p-4 flex flex-col shrink-0">
        <div className="mb-6">
          <div className="text-os-accent font-bold text-sm">AmineOS Admin</div>
          <div className="text-os-muted text-xs mt-1">Content Management</div>
        </div>

        <nav className="flex-1 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                tab === t.id ? "bg-os-accent/15 text-os-accent" : "text-os-text/70 hover:bg-os-border/30"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.id === "messages" && unreadCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-os-red text-white text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={onLogout} className="mt-4 px-3 py-2 rounded bg-os-border/30 text-os-muted text-sm hover:bg-os-border/50 transition-colors">
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 px-4 py-2 rounded-lg bg-os-accent text-white text-sm font-mono shadow-lg z-50 animate-pulse">
            {toast}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && profile && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            {(["name", "title", "subtitle", "email", "phone", "location", "github", "linkedin"] as const).map((field) => (
              <div key={field}>
                <label className="text-os-muted text-xs block mb-1 capitalize">{field}</label>
                <input
                  className={inputCls}
                  value={(profile as Record<string, string>)[field] || ""}
                  onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="text-os-muted text-xs block mb-1">Bio</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={profile.available}
                  onChange={(e) => setProfile({ ...profile, available: e.target.checked })}
                  className="accent-os-accent"
                />
                Available for PFE
              </label>
            </div>
            <button onClick={saveProfile} disabled={saving} className={btnPrimary}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}

        {/* Projects tab */}
        {tab === "projects" && (
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Projects ({projects.length})</h2>
            </div>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="bg-os-surface border border-os-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm">{p.featured && "⭐ "}{p.title}</h3>
                      <p className="text-os-muted text-xs mt-1">{p.description}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {p.techStack.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-os-border/30 text-os-muted text-[10px]">{t}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => deleteProject(p.id)} className={btnDanger}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience tab */}
        {tab === "experience" && (
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Experience ({experience.length})</h2>
            <div className="space-y-3">
              {experience.map((e) => (
                <div key={e.id} className="bg-os-surface border border-os-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm">{e.role}</h3>
                      <p className="text-os-accent text-xs">{e.company} · {e.type}</p>
                      <p className="text-os-muted text-xs mt-1">{e.startDate} – {e.current ? "Present" : e.endDate}</p>
                    </div>
                    <button onClick={() => deleteExp(e.id)} className={btnDanger}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills tab */}
        {tab === "skills" && (
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Skills ({skills.length})</h2>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((s) => (
                <div key={s.id} className="bg-os-surface border border-os-border rounded p-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm">{s.name}</span>
                    <span className="text-os-muted text-xs ml-2">({s.category})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-os-border/30 rounded-full overflow-hidden">
                      <div className="h-full bg-os-accent rounded-full" style={{ width: `${s.level}%` }} />
                    </div>
                    <span className="text-os-muted text-xs w-8 text-right">{s.level}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages tab */}
        {tab === "messages" && (
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-4">
              Messages ({messages.length})
              {unreadCount > 0 && <span className="text-os-accent text-sm ml-2">({unreadCount} unread)</span>}
            </h2>
            <div className="space-y-3">
              {messages.length === 0 && (
                <p className="text-os-muted text-sm">No messages yet.</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`bg-os-surface border rounded-lg p-4 ${m.read ? "border-os-border" : "border-os-accent/40"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-sm">{m.name}</span>
                      <span className="text-os-muted text-xs ml-2">&lt;{m.email}&gt;</span>
                      {!m.read && <span className="ml-2 px-1.5 py-0.5 rounded bg-os-accent/20 text-os-accent text-[10px]">NEW</span>}
                    </div>
                    <div className="flex gap-2">
                      {!m.read && (
                        <button onClick={() => markRead(m.id)} className="text-os-accent text-xs hover:underline">
                          Mark read
                        </button>
                      )}
                      <button onClick={() => deleteMessage(m.id)} className={btnDanger}>Delete</button>
                    </div>
                  </div>
                  {m.subject && <div className="text-os-text/80 text-sm font-semibold">{m.subject}</div>}
                  <p className="text-os-text/70 text-xs mt-1 leading-relaxed">{m.body}</p>
                  <div className="text-os-muted text-[10px] mt-2">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab === "settings" && config && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-xl font-bold mb-4">Site Settings</h2>
            <div>
              <label className="text-os-muted text-xs block mb-1">OS Name</label>
              <input className={inputCls} value={config.osName} onChange={(e) => setConfig({ ...config, osName: e.target.value })} />
            </div>
            <div>
              <label className="text-os-muted text-xs block mb-1">OS Version</label>
              <input className={inputCls} value={config.osVersion} onChange={(e) => setConfig({ ...config, osVersion: e.target.value })} />
            </div>
            <div>
              <label className="text-os-muted text-xs block mb-1">Accent Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={config.accentColor} onChange={(e) => setConfig({ ...config, accentColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                <input className={inputCls} value={config.accentColor} onChange={(e) => setConfig({ ...config, accentColor: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-os-muted text-xs block mb-1">Default Mode</label>
              <select
                className={inputCls}
                value={config.defaultMode}
                onChange={(e) => setConfig({ ...config, defaultMode: e.target.value })}
              >
                <option value="desk">Desk Mode</option>
                <option value="os">OS Mode</option>
              </select>
            </div>
            <button
              onClick={async () => {
                setSaving(true);
                try {
                  await adminApi.updateConfig(config);
                  showToast("Settings saved!");
                } catch { showToast("Save failed"); }
                setSaving(false);
              }}
              disabled={saving}
              className={btnPrimary}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
