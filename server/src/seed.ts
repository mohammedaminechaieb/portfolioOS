import bcrypt from "bcryptjs";
import prisma from "./lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin ──
  const hashedPw = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { email: "m.amine.chaieb@gmail.com" },
    update: {},
    create: {
      email: "m.amine.chaieb@gmail.com",
      password: hashedPw,
      name: "Mohamed Amine Chaieb",
    },
  });
  console.log("  ✓ Admin created (email: m.amine.chaieb@gmail.com, pw: admin123)");

  // ── Profile ──
  await prisma.profile.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      name: "Mohamed Amine Chaieb",
      title: "Full-Stack Developer",
      subtitle: "3rd-year Computer Engineering @ ENSI · Seeking PFE",
      bio: "Computer engineering student who builds complete web and mobile apps with React, Node.js/Express, FastAPI, Flutter and MongoDB, from REST API design to deployment. Delivered a mobile app to a company during an internship and co-built a multilingual voice assistant with a React/Capacitor app.",
      email: "m.amine.chaieb@gmail.com",
      phone: "+216 29 663 667",
      location: "Tunisia",
      github: "https://github.com/mohammedaminechaieb",
      linkedin: "https://linkedin.com/in/mohammedaminechaieb",
      available: true,
    },
  });
  console.log("  ✓ Profile");

  // ── Projects ──
  const projects = [
    {
      title: "GOB — Multilingual Voice Assistant",
      slug: "gob-voice-assistant",
      description: "A multilingual (FR/EN/AR) AI voice agent that turns spoken commands into real actions — emails, reminders, smart-home control via an ESP32 robot — through an MQTT + n8n action pipeline.",
      longDesc: "Co-built in a team of 3 as a capstone project at ENSI. Architecture: React/Capacitor mobile app → FastAPI backend → faster-whisper STT → 3-level intent classifier (rules → MiniLM embeddings → TF-IDF+LR) → Mistral-7B via OpenRouter for dialogue → Action Builder + state machine + HMAC-SHA256 signing → n8n workflows → MQTT → ESP32 PlatformIO firmware. Tested with pytest: 20 end-to-end scenarios, 87% coverage on critical backend modules, conversation latency about 3.8 s (team result). Also integrated Piper/Wyoming TTS and Picovoice wake word.",
      techStack: ["React", "Capacitor", "FastAPI", "Python", "MQTT", "n8n", "ESP32", "Mistral-7B", "SQLite", "Docker"],
      category: "ai",
      featured: true,
      order: 1,
    },
    {
      title: "Avatar-ID — ID Card Detection App",
      slug: "avatar-id",
      description: "A Flutter mobile app that detects a Tunisian ID card in the live camera feed and captures both sides automatically using OpenCV computer vision.",
      longDesc: "Built in 6 weeks during an internship at Codingaholic. Uses adaptive Canny edge detection, CLAHE histogram equalization, contour/polygon scoring, perspective warp, Laplacian blur check and glare detection. Runs at 92 fps front/back classification on real samples, capture in about 2 s. Clean Architecture with opencv_dart for Dart FFI bindings.",
      techStack: ["Flutter", "Dart", "OpenCV", "opencv_dart"],
      category: "mobile",
      featured: true,
      order: 2,
    },
    {
      title: "Verbal Aggression Detection",
      slug: "verbal-aggression-detection",
      description: "An end-to-end architecture for detecting verbal aggression in smart cities: ESP32 microphone → FastAPI → CNN, LSTM and CRNN acoustic models → speech-to-text → language analysis → fusion layer.",
      techStack: ["ESP32", "FastAPI", "Python", "MongoDB", "CNN", "LSTM", "REST API"],
      category: "ai",
      featured: true,
      order: 3,
    },
    {
      title: "Portfolio Website",
      slug: "portfolio-v1",
      description: "React frontend with Netlify hosting, Node.js/Express/Render backend, MongoDB Atlas database, admin dashboard for content management.",
      techStack: ["React", "Node.js", "Express", "MongoDB", "Netlify", "Render"],
      category: "web",
      liveUrl: "https://mohammed-amine-chaieb.netlify.app",
      order: 4,
    },
    {
      title: "AESAT Association Website",
      slug: "aesat-website",
      description: "A dynamic landing page with member management, event pages and Angular authentication, built in a team for the AESAT student association.",
      techStack: ["HTML", "CSS", "JavaScript", "PHP"],
      category: "web",
      order: 5,
    },
    {
      title: "Task Tracker",
      slug: "task-tracker",
      description: "Figma-designed landing page with Angular authentication and a React dashboard for task management.",
      techStack: ["Figma", "React", "Angular"],
      category: "web",
      order: 6,
    },
    {
      title: "The System",
      slug: "the-system",
      description: "A habit, sleep and fitness tracker with dashboard, streaks, a skippable soft-lock screen, and an AI dashboard powered by the Gemini API.",
      techStack: ["React", "Gemini API"],
      category: "web",
      order: 7,
    },
  ];

  for (const p of projects) {
    const existing = await prisma.project.findFirst({ where: { slug: p.slug } });
    if (!existing) await prisma.project.create({ data: p });
  }
  console.log(`  ✓ ${projects.length} Projects`);

  // ── Experience ──
  const experiences = [
    {
      role: "Mobile Developer Intern",
      company: "Codingaholic",
      location: "Tunisia",
      type: "internship",
      startDate: "2026-06",
      endDate: "2026-08",
      description: "Built Avatar-ID, a Flutter ID-card detection app using OpenCV computer vision.",
      highlights: [
        "Designed and built a Flutter app detecting Tunisian ID cards in the live camera feed",
        "Implemented adaptive Canny, CLAHE, contour scoring and perspective warp pipeline",
        "Achieved 92 fps front/back classification, capture in ~2 seconds on real samples",
      ],
      techStack: ["Flutter", "Dart", "OpenCV"],
      order: 1,
    },
    {
      role: "Capstone Project — GOB Voice Assistant",
      company: "ENSI",
      location: "Tunisia",
      type: "capstone",
      startDate: "2025-09",
      endDate: "2026-06",
      description: "Co-built a multilingual voice assistant with action pipeline, ESP32 robot and mobile app.",
      highlights: [
        "Contributed to the action pipeline (Action Builder, n8n workflows) and part of llm_client",
        "Built the Android package of the React/Capacitor app, tested on Android 9, 11 and 13",
        "20 end-to-end scenarios with pytest, 87% coverage on critical modules",
      ],
      techStack: ["React", "Capacitor", "FastAPI", "MQTT", "n8n", "ESP32"],
      order: 2,
    },
    {
      role: "Research Assistant — Verbal Aggression Detection",
      company: "RIADI Laboratory, ENSI",
      location: "Tunisia",
      type: "research",
      startDate: "2025-06",
      endDate: "2025-07",
      description: "Designed an end-to-end architecture: ESP32 microphone amplifier, REST API, CNN/LSTM/CRNN acoustic models, speech-to-text, language analysis and fusion layer.",
      highlights: [
        "Designed full pipeline from ESP32 capture to REST API to model ensemble",
        "Implemented CNN, LSTM and CRNN models for acoustic aggression classification",
        "Integrated speech-to-text with language analysis as a fusion layer",
      ],
      techStack: ["ESP32", "FastAPI", "MongoDB", "Python", "CNN", "LSTM"],
      order: 3,
    },
  ];

  for (const e of experiences) {
    const existing = await prisma.experience.findFirst({ where: { company: e.company, role: e.role } });
    if (!existing) await prisma.experience.create({ data: e });
  }
  console.log(`  ✓ ${experiences.length} Experiences`);

  // ── Skills ──
  const skills = [
    // Languages
    { name: "Python", category: "language", level: 90, order: 1 },
    { name: "JavaScript", category: "language", level: 85, order: 2 },
    { name: "C/C++", category: "language", level: 80, order: 3 },
    { name: "Dart", category: "language", level: 75, order: 4 },
    { name: "SQL", category: "language", level: 75, order: 5 },
    { name: "TypeScript", category: "language", level: 70, order: 6 },
    // Frontend
    { name: "React", category: "frontend", level: 85, order: 1 },
    { name: "HTML/CSS", category: "frontend", level: 90, order: 2 },
    { name: "Flutter", category: "frontend", level: 75, order: 3 },
    { name: "Tailwind CSS", category: "frontend", level: 80, order: 4 },
    { name: "Next.js", category: "frontend", level: 70, order: 5 },
    // Backend
    { name: "Node.js/Express", category: "backend", level: 85, order: 1 },
    { name: "FastAPI", category: "backend", level: 85, order: 2 },
    { name: "REST APIs", category: "backend", level: 90, order: 3 },
    { name: "JWT Auth", category: "backend", level: 80, order: 4 },
    // Database
    { name: "MongoDB", category: "database", level: 80, order: 1 },
    { name: "PostgreSQL", category: "database", level: 70, order: 2 },
    { name: "SQLite", category: "database", level: 75, order: 3 },
    // DevOps
    { name: "Git", category: "devops", level: 85, order: 1 },
    { name: "Docker", category: "devops", level: 70, order: 2 },
    { name: "Render", category: "devops", level: 75, order: 3 },
    { name: "Vercel", category: "devops", level: 75, order: 4 },
    // AI/ML
    { name: "OpenCV", category: "ai", level: 75, order: 1 },
    { name: "scikit-learn", category: "ai", level: 70, order: 2 },
    { name: "CNN/LSTM", category: "ai", level: 65, order: 3 },
    // Embedded/IoT
    { name: "ESP32", category: "embedded", level: 70, order: 1 },
    { name: "MQTT", category: "embedded", level: 70, order: 2 },
    { name: "PlatformIO", category: "embedded", level: 65, order: 3 },
    // Tools
    { name: "Figma", category: "tools", level: 70, order: 1 },
    { name: "Postman", category: "tools", level: 80, order: 2 },
  ];

  // Clear and re-seed skills
  await prisma.skill.deleteMany({});
  for (const s of skills) {
    await prisma.skill.create({ data: s });
  }
  console.log(`  ✓ ${skills.length} Skills`);

  // ── Education ──
  const education = [
    {
      degree: "National Engineering Degree, Computer Engineering",
      school: "ENSI — École Nationale des Sciences de l'Informatique",
      location: "University of Manouba, Tunisia",
      startDate: "2024",
      endDate: "2027",
      current: true,
      description: "Specialization in software engineering, AI and embedded systems.",
      order: 1,
    },
    {
      degree: "Preparatory Cycle, Mathematics–Physics",
      school: "Faculty of Science Tunis",
      location: "University El Manar, Tunisia",
      startDate: "2022",
      endDate: "2024",
      description: "Intensive two-year program in mathematics, physics and computer science fundamentals.",
      order: 2,
    },
  ];

  for (const e of education) {
    const existing = await prisma.education.findFirst({ where: { school: e.school, degree: e.degree } });
    if (!existing) await prisma.education.create({ data: e });
  }
  console.log(`  ✓ ${education.length} Education`);

  // ── Competitions ──
  const competitions = [
    {
      title: "TuniHack 10.0",
      organizer: "Sponsorship, logistics, CTF challenges",
      date: new Date("2025-01-01"),
      result: "Sponsorship team",
      order: 1,
    },
    {
      title: "Code & Conquer 2nd ed.",
      date: new Date("2025-04-01"),
      result: "Participant",
      order: 2,
    },
    {
      title: "ENSI Programming Contest 4.0",
      organizer: "ENSI Competitive Programming Club & Open Source Software Club",
      date: new Date("2024-12-01"),
      result: "Participant",
      order: 3,
    },
  ];

  for (const c of competitions) {
    const existing = await prisma.competition.findFirst({ where: { title: c.title } });
    if (!existing) await prisma.competition.create({ data: c });
  }
  console.log(`  ✓ ${competitions.length} Competitions`);

  // ── Certifications ──
  const certs = [
    { title: "Programming Hero: Python", issuer: "Programming Hero", date: new Date("2024-10-01"), order: 1 },
    { title: "Ethical Hacking", issuer: "Programming Hub", date: new Date("2024-10-01"), order: 2 },
  ];

  for (const c of certs) {
    const existing = await prisma.certification.findFirst({ where: { title: c.title } });
    if (!existing) await prisma.certification.create({ data: c });
  }
  console.log(`  ✓ ${certs.length} Certifications`);

  // ── Site Config ──
  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      osName: "AmineOS",
      osVersion: "3.0",
      accentColor: "#0ea5e9",
      defaultMode: "desk",
    },
  });
  console.log("  ✓ Site Config");

  console.log("\n✅ Seed complete!");
  console.log("   Admin login: m.amine.chaieb@gmail.com / admin123");
  console.log("   ⚠️  Change the password after first login!\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());