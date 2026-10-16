"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminApi
      .me()
      .then(() => setAuthed(true))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminApi.login(email, password);
      localStorage.setItem("admin_token", token);
      setAuthed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthed(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-os-bg flex items-center justify-center">
        <div className="text-os-accent font-mono animate-pulse">Checking auth...</div>
      </div>
    );
  }

  if (authed) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-os-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-os-surface border border-os-border rounded-xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="text-xl font-bold text-os-text font-mono">AmineOS Admin</h1>
            <p className="text-os-muted text-xs mt-1">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-os-muted text-xs font-mono block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-os-bg border border-os-border rounded-lg px-3 py-2.5 text-sm text-os-text font-mono focus:outline-none focus:border-os-accent transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="text-os-muted text-xs font-mono block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-os-bg border border-os-border rounded-lg px-3 py-2.5 text-sm text-os-text font-mono focus:outline-none focus:border-os-accent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="text-os-red text-xs font-mono">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-os-accent text-white font-mono text-sm font-semibold hover:bg-os-accent/80 disabled:opacity-50 transition-colors"
            >
              {loading ? "Authenticating..." : "Login →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
