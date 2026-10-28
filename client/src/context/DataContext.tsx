"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import type { PortfolioData } from "@/lib/types";

// Fallback data so the site works without backend
const FALLBACK: PortfolioData = {
  profile: {
    id: "main",
    name: "Mohamed Amine Chaieb",
    title: "Full-Stack Developer",
    subtitle: "3rd-year Computer Engineering @ ENSI · Seeking PFE",
    bio: "Computer engineering student who builds complete web and mobile apps with React, Node.js/Express, FastAPI, Flutter and MongoDB.",
    email: "m.amine.chaieb@gmail.com",
    phone: "+216 29 663 667",
    location: "Tunisia",
    github: "https://github.com/mohammedaminechaieb",
    linkedin: "https://linkedin.com/in/mohammedaminechaieb",
    portfolio: "",
    avatarUrl: "",
    resumeUrl: "",
    available: true,
  },
  projects: [
    {
      id: "1", title: "GOB — Voice Assistant", slug: "gob",
      description: "Multilingual AI voice agent with ESP32 robot, MQTT pipeline and mobile app.",
      techStack: ["React", "Capacitor", "FastAPI", "MQTT", "n8n", "ESP32", "Mistral-7B"],
      category: "ai", featured: true, order: 1,
    },
    {
      id: "2", title: "Avatar-ID", slug: "avatar-id",
      description: "Flutter ID card detection using OpenCV computer vision. 92 fps classification.",
      techStack: ["Flutter", "Dart", "OpenCV"],
      category: "mobile", featured: true, order: 2,
    },
    {
      id: "3", title: "Verbal Aggression Detection", slug: "verbal-aggression",
      description: "ESP32 → FastAPI → CNN/LSTM acoustic models → speech-to-text → fusion layer.",
      techStack: ["ESP32", "FastAPI", "MongoDB", "CNN", "LSTM"],
      category: "ai", featured: true, order: 3,
    },
  ],
  experience: [
    {
      id: "1", role: "Mobile Developer Intern", company: "Codingaholic",
      location: "Tunisia", type: "internship", startDate: "2026-06", endDate: "2026-08",
      current: false, description: "Built Avatar-ID with Flutter and OpenCV.",
      highlights: ["Flutter ID card detection", "OpenCV computer vision pipeline", "92 fps classification"],
      techStack: ["Flutter", "Dart", "OpenCV"], order: 1,
    },
  ],
  skills: [
    { id: "1", name: "Python", category: "language", level: 90, order: 1 },
    { id: "2", name: "JavaScript", category: "language", level: 85, order: 2 },
    { id: "3", name: "React", category: "frontend", level: 85, order: 1 },
    { id: "4", name: "FastAPI", category: "backend", level: 85, order: 1 },
  ],
  education: [
    {
      id: "1", degree: "National Engineering Degree, Computer Engineering",
      school: "ENSI", location: "University of Manouba", startDate: "2024",
      endDate: "2027", current: true, order: 1,
    },
  ],
  competitions: [],
  certifications: [],
  clubs: [],
  designs: [],
  config: {
    osName: "AmineOS",
    osVersion: "3.0",
    accentColor: "#0ea5e9",
    deskWallpaper: "wood-dark",
    osWallpaper: "gradient-teal",
    enableDesk: true,
    enableOs: true,
    defaultMode: "desk",
  },
};

const DataContext = createContext<{
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}>({
  data: FALLBACK,
  loading: true,
  error: null,
  refresh: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const result = await api.getAll();
      setData(result as PortfolioData);
      setError(null);
    } catch (e: any) {
      console.warn("API unavailable, using fallback data:", e.message);
      setError(e.message);
      // Keep fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <DataContext.Provider value={{ data, loading, error, refresh: load }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
