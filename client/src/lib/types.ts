export interface Profile {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  avatarUrl: string;
  resumeUrl: string;
  available: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDesc?: string;
  techStack: string[];
  category: string;
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  type: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
  techStack: string[];
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon?: string;
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  schoolUrl?: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  gpa?: string;
  order: number;
}

export interface Competition {
  id: string;
  title: string;
  organizer?: string;
  date: string;
  result?: string;
  description?: string;
  image?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  url?: string;
  image?: string;
  category?: string;
}

export interface Club {
  id: string;
  name: string;
  role?: string;
  description?: string;
  period?: string;
  image?: string;
  achievements: string[];
  order: number;
}

export interface Design {
  id: string;
  title: string;
  description?: string;
  category?: string;
  image?: string;
  tools: string[];
  order: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface SiteConfig {
  osName: string;
  osVersion: string;
  bootText?: string;
  terminalGreeting?: string;
  deskWallpaper: string;
  osWallpaper: string;
  accentColor: string;
  enableDesk: boolean;
  enableOs: boolean;
  defaultMode: string;
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  experience: Experience[];
  skills: Skill[];
  education: Education[];
  competitions: Competition[];
  certifications: Certification[];
  clubs: Club[];
  designs: Design[];
  config: SiteConfig;
}

// Window system types
export interface WindowState {
  id: string;
  title: string;
  icon: string;
  component: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  isOpen: boolean;
}
