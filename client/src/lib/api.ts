const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Public API ──
export const api = {
  getProfile: () => fetchAPI<any>("/api/profile"),
  getProjects: () => fetchAPI<any[]>("/api/projects"),
  getExperience: () => fetchAPI<any[]>("/api/experience"),
  getSkills: () => fetchAPI<any[]>("/api/skills"),
  getEducation: () => fetchAPI<any[]>("/api/education"),
  getCompetitions: () => fetchAPI<any[]>("/api/competitions"),
  getCertifications: () => fetchAPI<any[]>("/api/certifications"),
  getConfig: () => fetchAPI<any>("/api/config"),
  // newer endpoints: an older backend answers 404, so fall back to empty lists
  getClubs: () => fetchAPI<any[]>("/api/clubs").catch(() => [] as any[]),
  getDesigns: () => fetchAPI<any[]>("/api/designs").catch(() => [] as any[]),
  sendMessage: (data: { name: string; email: string; subject?: string; body: string }) =>
    fetchAPI<any>("/api/messages", { method: "POST", body: JSON.stringify(data) }),

  // Fetch everything in one go
  async getAll() {
    const [profile, projects, experience, skills, education, competitions, certifications, config, clubs, designs] =
      await Promise.all([
        this.getProfile(),
        this.getProjects(),
        this.getExperience(),
        this.getSkills(),
        this.getEducation(),
        this.getCompetitions(),
        this.getCertifications(),
        this.getConfig(),
        this.getClubs(),
        this.getDesigns(),
      ]);
    return { profile, projects, experience, skills, education, competitions, certifications, config, clubs, designs };
  },
};

// ── Admin API ──
export const adminApi = {
  login: (email: string, password: string) =>
    fetchAPI<{ token: string; admin: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => fetchAPI<any>("/api/auth/me", { headers: authHeaders() }),

  updateProfile: (data: any) =>
    fetchAPI<any>("/api/profile", { method: "PUT", body: JSON.stringify(data), headers: authHeaders() }),

  createProject: (data: any) =>
    fetchAPI<any>("/api/projects", { method: "POST", body: JSON.stringify(data), headers: authHeaders() }),
  updateProject: (id: string, data: any) =>
    fetchAPI<any>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data), headers: authHeaders() }),
  deleteProject: (id: string) =>
    fetchAPI<any>(`/api/projects/${id}`, { method: "DELETE", headers: authHeaders() }),

  createExperience: (data: any) =>
    fetchAPI<any>("/api/experience", { method: "POST", body: JSON.stringify(data), headers: authHeaders() }),
  updateExperience: (id: string, data: any) =>
    fetchAPI<any>(`/api/experience/${id}`, { method: "PUT", body: JSON.stringify(data), headers: authHeaders() }),
  deleteExperience: (id: string) =>
    fetchAPI<any>(`/api/experience/${id}`, { method: "DELETE", headers: authHeaders() }),

  createSkill: (data: any) =>
    fetchAPI<any>("/api/skills", { method: "POST", body: JSON.stringify(data), headers: authHeaders() }),
  updateSkill: (id: string, data: any) =>
    fetchAPI<any>(`/api/skills/${id}`, { method: "PUT", body: JSON.stringify(data), headers: authHeaders() }),
  deleteSkill: (id: string) =>
    fetchAPI<any>(`/api/skills/${id}`, { method: "DELETE", headers: authHeaders() }),

  getMessages: () => fetchAPI<any[]>("/api/messages", { headers: authHeaders() }),
  markRead: (id: string) =>
    fetchAPI<any>(`/api/messages/${id}/read`, { method: "PUT", headers: authHeaders() }),
  deleteMessage: (id: string) =>
    fetchAPI<any>(`/api/messages/${id}`, { method: "DELETE", headers: authHeaders() }),

  updateConfig: (data: any) =>
    fetchAPI<any>("/api/config", { method: "PUT", body: JSON.stringify(data), headers: authHeaders() }),
};
