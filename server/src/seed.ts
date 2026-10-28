import bcrypt from "bcryptjs";
import prisma from "./lib/prisma";

/**
 * Idempotent seed — safe to run any number of times.
 *
 *   npm run db:seed              fills in anything that is MISSING, never changes existing documents
 *   SEED_FORCE=1 npm run db:seed also UPDATES existing documents to match this file
 *                                (this overwrites edits made in the admin dashboard)
 *
 * Documents are matched by title / name (never duplicated), so running it on a database that
 * already has your data does nothing in the default mode. It is NOT run on deploy.
 * The data below mirrors the live database after duplicates were removed.
 */
const FORCE = process.env.SEED_FORCE === "1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = any;

async function sync(label: string, model: AnyModel, items: any[], whereOf: (i: any) => object) {
  let created = 0, updated = 0, kept = 0, dups = 0;
  for (const raw of items) {
    const { _alt, ...data } = raw;
    const where = [whereOf(data), ...((_alt || []) as any[]).map((a) => whereOf({ ...data, ...a }))];
    const found = await model.findMany({ where: { OR: where } });
    if (found.length > 1) dups++;
    if (found.length === 0) {
      await model.create({ data });
      created++;
    } else if (FORCE) {
      await model.update({ where: { id: found[0].id }, data });
      updated++;
    } else {
      kept++;
    }
  }
  console.log(
    `  ✓ ${label}: ${created} created, ${updated} updated, ${kept} already there` +
      (dups ? `  ⚠ ${dups} item(s) exist more than once — run scripts/dedupe.js` : "")
  );
}

async function main() {
  console.log(`🌱 Seeding database (${FORCE ? "FORCE: updating existing documents" : "safe mode: only adding what is missing"})...`);

  // ── Admin (never overwritten) ──
  const hashedPw = await bcrypt.hash("admin123", 12);
  await prisma.admin.upsert({
    where: { email: "m.amine.chaieb@gmail.com" },
    update: {},
    create: { email: "m.amine.chaieb@gmail.com", password: hashedPw, name: "Mohamed Amine Chaieb" },
  });
  console.log("  ✓ Admin (existing password is never changed)");

  // ── Profile ──
  const profile = {
    name: "Mohamed Amine Chaieb",
    title: "Full-Stack Developer",
    subtitle: "Computer Engineering Student at ENSI",
    bio: "Third-year computer engineering student at ENSI who builds software end to end: AI and speech systems, IoT and embedded devices, and web and mobile apps. Co-built GOB, a multilingual voice assistant (speech recognition at 4.2% WER, intent classifier at 0.91 weighted F1, n8n workflows passing 116 of 120 tests) and built a Flutter ID-card detection module at Codingaholic. Looking for a 6-month end-of-studies internship (PFE) in LLM applications, speech and edge AI.",
    email: "m.amine.chaieb@gmail.com",
    phone: "+216 29 663 667",
    location: "Tunisia",
    github: "https://github.com/mohammedaminechaieb",
    linkedin: "https://www.linkedin.com/in/mohamedaminechaieb/",
    portfolio: "https://amine-portfolio-cmtt.onrender.com",
    resumeUrl: "https://github.com/mohammedaminechaieb/mohammedaminechaieb/blob/main/CV/Mohamed_Amine_Chaieb_CV_EN.pdf",
    available: true,
  };
  const existingProfile = await prisma.profile.findUnique({ where: { id: "main" } });
  if (!existingProfile) await prisma.profile.create({ data: { id: "main", ...profile } });
  else if (FORCE) await prisma.profile.update({ where: { id: "main" }, data: profile });
  console.log("  ✓ Profile");

  // ── Site config ──
  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: FORCE ? { osName: "AmineOS", osVersion: "3.0", accentColor: "#0ea5e9", defaultMode: "desk" } : {},
    create: { id: "main", osName: "AmineOS", osVersion: "3.0", accentColor: "#0ea5e9", defaultMode: "desk" },
  });
  console.log("  ✓ Site config");

  // ── Content ──
  await sync("Projects", prisma.project, PROJECTS, (i) => ({ title: i.title }));
  await sync("Experience", prisma.experience, EXPERIENCE, (i) => ({ company: i.company, role: i.role }));
  await sync("Education", prisma.education, EDUCATION, (i) => ({ school: i.school, degree: i.degree }));
  await sync("Skills", prisma.skill, SKILLS, (i) => ({ name: i.name, category: i.category }));
  await sync("Competitions & events", prisma.competition, EVENTS, (i) => ({ title: i.title }));
  await sync("Certifications", prisma.certification, CERTS, (i) => ({ title: i.title }));
  await sync("Clubs", prisma.club, CLUBS, (i) => ({ name: i.name }));
  await sync("Designs", prisma.design, DESIGNS, (i) => ({ title: i.title, image: i.image }));

  console.log("\n✅ Seed complete!");
  if (!FORCE) console.log("   (Safe mode. Use SEED_FORCE=1 to also update existing documents.)\n");
}

/* ═════════════════ DATA ═════════════════ */

const PROJECTS: any[] = [
  {
    "title": "GOB — Multilingual Voice Assistant",
    "_alt": [{ "title": "GOB — AI Multi-Agent Voice Assistant" }],
    "slug": "gob-voice-assistant",
    "description": "A multilingual (FR/EN/AR) AI voice agent that turns spoken commands into real actions (emails, reminders, smart-home control via an ESP32 robot) through an MQTT + n8n action pipeline.",
    "longDesc": "Co-built in a team of 3 as a capstone project at ENSI. Architecture: React/Capacitor mobile app → FastAPI backend → faster-whisper STT → 3-level intent classifier (rules → MiniLM embeddings → TF-IDF+LR) → Mistral-7B via OpenRouter for dialogue → Action Builder + state machine + HMAC-SHA256 signing → n8n workflows → MQTT → ESP32 PlatformIO firmware. Tested with pytest: 20 end-to-end scenarios, 87% coverage on critical backend modules, conversation latency about 3.8 s (team result). Also integrated Piper/Wyoming TTS and Picovoice wake word.",
    "techStack": [
      "React",
      "Capacitor",
      "FastAPI",
      "Python",
      "MQTT",
      "n8n",
      "ESP32",
      "Mistral-7B",
      "Whisper",
      "Piper TTS",
      "SQLite",
      "Docker"
    ],
    "category": "ai",
    "githubUrl": "https://github.com/Montassarnawara/gob-edge-ai",
    "featured": true,
    "order": 1
  },
  {
    "title": "Avatar-ID — ID Card Detection App",
    "_alt": [{ "title": "ID Detection & Auto-Capture" }],
    "slug": "avatar-id",
    "description": "A Flutter mobile app that detects a Tunisian ID card in the live camera feed and captures both sides automatically using OpenCV computer vision.",
    "longDesc": "Built in 6 weeks during an internship at Codingaholic. Uses adaptive Canny edge detection, CLAHE histogram equalization, contour/polygon scoring, perspective warp, Laplacian blur check and glare detection. Runs at 92 fps front/back classification on real samples, capture in about 2 s. Clean Architecture with opencv_dart for Dart FFI bindings.",
    "techStack": [
      "Flutter",
      "Dart",
      "OpenCV",
      "opencv_dart"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/detection_cin",
    "featured": true,
    "order": 2
  },
  {
    "title": "Verbal Aggression Detection",
    "_alt": [{ "title": "Verbal Aggression Detection in Smart Cities" }],
    "slug": "verbal-aggression-detection",
    "description": "An end-to-end architecture for detecting verbal aggression in smart cities: ESP32 microphone → FastAPI → CNN, LSTM and CRNN acoustic models → speech-to-text → language analysis → fusion layer.",
    "techStack": [
      "ESP32",
      "FastAPI",
      "Python",
      "MongoDB",
      "CNN",
      "LSTM",
      "REST API"
    ],
    "category": "ai",
    "featured": true,
    "order": 3
  },
  {
    "title": "The System — Personal Habit & Wellness Tracker",
    "_alt": [{ "title": "The System" }],
    "slug": "the-system",
    "description": "Full habit, exercise and sleep tracker with martial arts training guides (boxing, Tai Chi), a shared log, a dashboard, and a gamified soft-lock screen unlocked through daily tasks. Includes an AI dashboard powered by the Gemini API for personalized insights.",
    "techStack": [
      "Flutter",
      "Dart",
      "SQLite",
      "Gemini API"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/the_system_app",
    "featured": false,
    "order": 4
  },
  {
    "title": "AmineOS — Interactive Portfolio",
    "slug": "amineos",
    "_alt": [
      {
        "title": "Portfolio Website"
      }
    ],
    "description": "This portfolio: an interactive desk and a desktop OS built with Next.js and TypeScript, backed by a Node.js/Express API, Prisma and MongoDB Atlas, with an admin dashboard to manage the content. Deployed on Render.",
    "techStack": [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Node.js",
      "Express",
      "Prisma",
      "MongoDB",
      "Render"
    ],
    "category": "web",
    "liveUrl": "https://amine-portfolio-cmtt.onrender.com",
    "githubUrl": "https://github.com/mohammedaminechaieb/portfolioOS",
    "featured": true,
    "order": 5
  },
  {
    "title": "Fraud Detection",
    "slug": "fraud-detection",
    "description": "Fraud detection app and API in Python, containerized with Docker and deployed on Render.",
    "techStack": [
      "Python",
      "Docker",
      "Render"
    ],
    "category": "ai",
    "githubUrl": "https://github.com/mohammedaminechaieb/fraude",
    "featured": false,
    "order": 6
  },
  {
    "title": "Telco Customer Churn",
    "slug": "telco-churn",
    "description": "Data mining project on telecom customer churn: data preparation, model comparison and a Streamlit app backed by a FastAPI prediction API.",
    "techStack": [
      "Python",
      "scikit-learn",
      "Streamlit",
      "FastAPI"
    ],
    "category": "ai",
    "githubUrl": "https://github.com/mohammedaminechaieb/telco_churn",
    "featured": false,
    "order": 7
  },
  {
    "title": "AESAT Association Website",
    "_alt": [{ "title": "AESAT Website" }],
    "slug": "aesat-website",
    "description": "A dynamic landing page with member management, event pages and Angular authentication, built in a team for the AESAT student association.",
    "techStack": [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP"
    ],
    "category": "web",
    "featured": false,
    "order": 8
  },
  {
    "title": "Task Tracker",
    "_alt": [{ "title": "Task Tracker App" }],
    "slug": "task-tracker",
    "description": "Figma-designed landing page with Angular authentication and a React dashboard for task management, showcasing cross-framework development and UI design.",
    "techStack": [
      "Figma",
      "React",
      "Angular",
      "HTML",
      "CSS"
    ],
    "category": "web",
    "featured": false,
    "order": 9
  },
  {
    "title": "Hospital Organization System",
    "slug": "hospital-system",
    "description": "A hospital management system built with Odoo and custom Python modules. Handles patient records, doctor schedules, appointment bookings and internal workflow automation.",
    "techStack": [
      "Python",
      "Odoo"
    ],
    "category": "web",
    "featured": false,
    "order": 10
  },
  {
    "title": "EduSphere",
    "slug": "edusphere",
    "description": "A complete educational management system in pure C with a terminal interface: authentication, role-based access, course and student tracking, and file handling.",
    "techStack": [
      "C"
    ],
    "category": "other",
    "featured": false,
    "order": 11
  },
  {
    "title": "Platformer Game with Pygame",
    "slug": "pygame-platformer",
    "description": "A 2D platformer built with Python and Pygame. Sprites crafted in Aseprite, levels designed in Tiled. Gravity mechanics, interactive platforms and multiple levels.",
    "techStack": [
      "Python",
      "Pygame",
      "Aseprite",
      "Tiled"
    ],
    "category": "other",
    "featured": false,
    "order": 12
  },
  {
    "title": "HaptiKit",
    "slug": "haptikit",
    "description": "Custom vibration patterns per contact and app. A warm-up Android project with a haptic pattern editor, per-contact assignment, and export/import support.",
    "techStack": [
      "Kotlin",
      "Android SDK",
      "VibrationEffect API",
      "Room DB"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/Haptikit",
    "featured": false,
    "order": 13
  },
  {
    "title": "NightDeck",
    "slug": "nightdeck",
    "description": "Ambient bedside lock screen for Android: AMOLED clock, sleep sound mixer, bedtime reminders and a lock screen widget. First Flutter project.",
    "techStack": [
      "Flutter",
      "Dart",
      "audio_players",
      "home_widget",
      "local_notifications"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/nightdeck",
    "featured": false,
    "order": 14
  },
  {
    "title": "StatusBar+",
    "slug": "statusbar-plus",
    "description": "Reorder status bar icons and apply custom battery and clock styles. A short Android sprint using the Quick Settings Tile API and an Accessibility Service.",
    "techStack": [
      "Kotlin",
      "Quick Settings Tile API",
      "Accessibility Service",
      "Canvas"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/StatusBarPlus",
    "featured": false,
    "order": 15
  },
  {
    "title": "SoundSkin",
    "slug": "soundskin",
    "description": "Animated custom volume HUD overlay for Android. Intercepts system volume events and renders three animated skins (minimal, neon and retro VU meter) using WindowManager.",
    "techStack": [
      "Kotlin",
      "WindowManager",
      "AudioManager",
      "Custom View animations"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/SoundSkin",
    "featured": false,
    "order": 16
  },
  {
    "title": "LockForge",
    "slug": "lockforge",
    "description": "Drag-and-drop lock screen widget builder with live data widgets (weather, health, calendar), custom fonts, and theme export/import. Built with Flutter.",
    "techStack": [
      "Flutter",
      "Dart",
      "draggable_gridview",
      "WidgetKit",
      "MVVM"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/lockforge",
    "featured": false,
    "order": 17
  },
  {
    "title": "AuraLauncher",
    "slug": "auralauncher",
    "description": "Full Android launcher with home screen grid, app drawer, icon pack and shape theming, gesture navigation and focus mode layouts.",
    "techStack": [
      "Kotlin",
      "Launcher API",
      "Jetpack Compose",
      "Room DB"
    ],
    "category": "mobile",
    "githubUrl": "https://github.com/mohammedaminechaieb/AuraLauncher",
    "featured": false,
    "order": 18
  },
  {
    "title": "SmartNest",
    "slug": "smartnest",
    "description": "In progress. Smart home system: simulation first with an MQTT broker and React dashboard, then a real ESP32 hardware bridge. Automation rules engine, scene presets, energy tracking and voice hooks via ARIA.",
    "techStack": [
      "Python",
      "MQTT",
      "React",
      "TypeScript",
      "C++",
      "ESP32",
      "Raspberry Pi"
    ],
    "category": "iot",
    "featured": false,
    "order": 19
  },
  {
    "title": "ARIA",
    "slug": "aria",
    "description": "In progress. AI companion that controls SmartNest, researches the web, remembers context via vector memory, speaks with voice I/O, executes code and runs on a phone. Built on the Claude API with LangGraph orchestration.",
    "techStack": [
      "Python",
      "Claude API",
      "LangGraph",
      "ChromaDB",
      "Whisper",
      "FastAPI",
      "React Native"
    ],
    "category": "ai",
    "featured": false,
    "order": 20
  },
  {
    "title": "Ashen Protocol",
    "slug": "ashen-protocol",
    "description": "In progress. Post-apocalyptic action roguelite with tight combat, procedural room generation, 3 enemy types, a full boss fight, a relic/loot system and fragmented environmental narrative. Targets Android, PC and Web.",
    "techStack": [
      "Godot 4",
      "GDScript",
      "Aseprite",
      "FMOD"
    ],
    "category": "game",
    "featured": false,
    "order": 21
  }
];

const EXPERIENCE: any[] = [
  {
    "role": "Mobile Developer Intern",
    "company": "Codingaholic",
    "location": "Tunisia",
    "type": "internship",
    "startDate": "2026-06",
    "endDate": "2026-08",
    "current": false,
    "description": "Built Avatar-ID, a Flutter ID-card detection app using OpenCV computer vision.",
    "highlights": [
      "Designed and built a Flutter app detecting Tunisian ID cards in the live camera feed",
      "Implemented adaptive Canny, CLAHE, contour scoring and perspective warp pipeline",
      "Achieved 92 fps front/back classification, capture in ~2 seconds on real samples"
    ],
    "techStack": [
      "Flutter",
      "Dart",
      "OpenCV"
    ],
    "order": 1
  },
  {
    "role": "Capstone Project — GOB Voice Assistant",
    "company": "ENSI",
    "location": "Tunisia",
    "type": "capstone",
    "startDate": "2025-09",
    "endDate": "2026-06",
    "current": false,
    "description": "Co-built a multilingual voice assistant with action pipeline, ESP32 robot and mobile app.",
    "highlights": [
      "Contributed to the action pipeline (Action Builder, n8n workflows) and part of llm_client",
      "Built the Android package of the React/Capacitor app, tested on Android 9, 11 and 13",
      "20 end-to-end scenarios with pytest, 87% coverage on critical modules"
    ],
    "techStack": [
      "React",
      "Capacitor",
      "FastAPI",
      "MQTT",
      "n8n",
      "ESP32"
    ],
    "order": 2
  },
  {
    "role": "Research Assistant — Verbal Aggression Detection",
    "company": "RIADI Laboratory, ENSI",
    "location": "Tunisia",
    "type": "research",
    "startDate": "2025-06",
    "endDate": "2025-07",
    "current": false,
    "description": "Designed an end-to-end architecture: ESP32 microphone amplifier, REST API, CNN/LSTM/CRNN acoustic models, speech-to-text, language analysis and fusion layer.",
    "highlights": [
      "Designed full pipeline from ESP32 capture to REST API to model ensemble",
      "Implemented CNN, LSTM and CRNN models for acoustic aggression classification",
      "Integrated speech-to-text with language analysis as a fusion layer"
    ],
    "techStack": [
      "ESP32",
      "FastAPI",
      "MongoDB",
      "Python",
      "CNN",
      "LSTM"
    ],
    "order": 3
  }
];

const EDUCATION: any[] = [
  {
    "degree": "National Engineering Degree, Computer Engineering",
    "school": "ENSI — École Nationale des Sciences de l'Informatique",
    "location": "University of Manouba, Tunisia",
    "startDate": "2024",
    "endDate": "2027",
    "current": true,
    "description": "Specialization in software engineering, AI and embedded systems.",
    "order": 1
  },
  {
    "degree": "Preparatory Cycle, Mathematics–Physics",
    "school": "Faculty of Science Tunis",
    "location": "University El Manar, Tunisia",
    "startDate": "2022",
    "endDate": "2024",
    "current": false,
    "description": "Intensive two-year program in mathematics, physics and computer science fundamentals.",
    "order": 2
  }
];

// Levels are honest estimates for a third-year student: 80+ = used in many projects,
// 60-75 = used in real projects, 40-55 = learning / used a little.
const SKILLS: any[] = [
  {
    "name": "Python",
    "category": "language",
    "level": 85,
    "icon": "python",
    "order": 1
  },
  {
    "name": "JavaScript",
    "category": "language",
    "level": 75,
    "icon": "javascript",
    "order": 2
  },
  {
    "name": "C/C++",
    "category": "language",
    "level": 70,
    "icon": "cplusplus",
    "order": 3
  },
  {
    "name": "Dart",
    "category": "language",
    "level": 65,
    "icon": "dart",
    "order": 4
  },
  {
    "name": "SQL",
    "category": "language",
    "level": 70,
    "icon": "mysql",
    "order": 5
  },
  {
    "name": "TypeScript",
    "category": "language",
    "level": 60,
    "icon": "typescript",
    "order": 6
  },
  {
    "name": "Kotlin",
    "category": "language",
    "level": 50,
    "icon": "kotlin",
    "order": 7
  },
  {
    "name": "React",
    "category": "frontend",
    "level": 75,
    "icon": "react",
    "order": 1
  },
  {
    "name": "HTML/CSS",
    "category": "frontend",
    "level": 85,
    "icon": "html5",
    "order": 2
  },
  {
    "name": "Flutter",
    "category": "frontend",
    "level": 70,
    "icon": "flutter",
    "order": 3
  },
  {
    "name": "Tailwind CSS",
    "category": "frontend",
    "level": 75,
    "icon": "tailwindcss",
    "order": 4
  },
  {
    "name": "Next.js",
    "category": "frontend",
    "level": 60,
    "icon": "nextjs",
    "order": 5
  },
  {
    "name": "Angular",
    "category": "frontend",
    "level": 40,
    "icon": "angular",
    "order": 6
  },
  {
    "name": "Node.js/Express",
    "category": "backend",
    "level": 75,
    "icon": "nodejs",
    "order": 1
  },
  {
    "name": "FastAPI",
    "category": "backend",
    "level": 75,
    "icon": "fastapi",
    "order": 2
  },
  {
    "name": "REST APIs",
    "category": "backend",
    "level": 80,
    "icon": "🔗",
    "order": 3
  },
  {
    "name": "JWT Auth",
    "category": "backend",
    "level": 65,
    "icon": "🔐",
    "order": 4
  },
  {
    "name": "MongoDB",
    "category": "database",
    "level": 70,
    "icon": "mongodb",
    "order": 1
  },
  {
    "name": "PostgreSQL",
    "category": "database",
    "level": 55,
    "icon": "postgresql",
    "order": 2
  },
  {
    "name": "SQLite",
    "category": "database",
    "level": 70,
    "icon": "sqlite",
    "order": 3
  },
  {
    "name": "Git",
    "category": "devops",
    "level": 80,
    "icon": "git",
    "order": 1
  },
  {
    "name": "Docker",
    "category": "devops",
    "level": 55,
    "icon": "docker",
    "order": 2
  },
  {
    "name": "Render",
    "category": "devops",
    "level": 65,
    "icon": "☁️",
    "order": 3
  },
  {
    "name": "Vercel",
    "category": "devops",
    "level": 60,
    "icon": "vercel",
    "order": 4
  },
  {
    "name": "OpenCV",
    "category": "ai",
    "level": 65,
    "icon": "opencv",
    "order": 1
  },
  {
    "name": "scikit-learn",
    "category": "ai",
    "level": 60,
    "icon": "scikitlearn",
    "order": 2
  },
  {
    "name": "PyTorch",
    "category": "ai",
    "level": 50,
    "icon": "pytorch",
    "order": 3
  },
  {
    "name": "CNN/LSTM",
    "category": "ai",
    "level": 50,
    "icon": "🧠",
    "order": 4
  },
  {
    "name": "faster-Whisper",
    "category": "ai",
    "level": 65,
    "icon": "🎙️",
    "order": 5
  },
  {
    "name": "LLM APIs",
    "category": "ai",
    "level": 70,
    "icon": "🤖",
    "order": 6
  },
  {
    "name": "n8n",
    "category": "ai",
    "level": 70,
    "icon": "🔁",
    "order": 7
  },
  {
    "name": "ESP32",
    "category": "embedded",
    "level": 65,
    "icon": "📟",
    "order": 1
  },
  {
    "name": "MQTT",
    "category": "embedded",
    "level": 65,
    "icon": "📡",
    "order": 2
  },
  {
    "name": "PlatformIO",
    "category": "embedded",
    "level": 55,
    "icon": "🔩",
    "order": 3
  },
  {
    "name": "Figma",
    "category": "tools",
    "level": 60,
    "icon": "figma",
    "order": 1
  },
  {
    "name": "Postman",
    "category": "tools",
    "level": 70,
    "icon": "postman",
    "order": 2
  },
  {
    "name": "Canva",
    "category": "design",
    "level": 80,
    "icon": "canva",
    "order": 1
  },
  {
    "name": "Photoshop",
    "category": "design",
    "level": 55,
    "icon": "photoshop",
    "order": 2
  },
  {
    "name": "Illustrator",
    "category": "design",
    "level": 50,
    "icon": "illustrator",
    "order": 3
  }
];

const EVENTS: any[] = [
  {
    "title": "Code & Conquer — 2nd Edition",
    "organizer": "Competition",
    "result": "Organizer — Sponsorship Team",
    "description": "Part of the sponsorship team for the 2nd edition of Code & Conquer. Responsible for reaching out to potential sponsors, pitching the event, and securing partnerships and funding.",
    "image": "https://chaiebamine.github.io/portfolio/assets/events/c&c2.png",
    "order": 1,
    "date": new Date("2025-04-01")
  },
  {
    "title": "TuniHack 10.0",
    "organizer": "Hackathon",
    "result": "Organizer — Sponsorship, Logistics & Event Coordination",
    "description": "Core organizer for TuniHack. Secured sponsorships, designed and set up decorations, and coordinated both event days to ensure smooth execution.",
    "image": "",
    "order": 2,
    "date": new Date("2025-01-01")
  },
  {
    "title": "Forum ENSI — 19th Edition",
    "organizer": "Forum",
    "result": "Organizer — Stand Assistant (Focus Corporation)",
    "description": "Stand assistant for Focus Corporation. Welcomed the company team, guided attendees, provided information about seminars, and facilitated interactions between visitors and the company.",
    "image": "",
    "order": 3
  },
  {
    "title": "Go Data Science 4.0",
    "organizer": "Hackathon",
    "result": "Participant — Ranked 37th",
    "description": "12-hour healthcare-focused data science hackathon organized by the IEEE CIS ENSI Chapter. Engaged in workshops and built a solution under time pressure.",
    "image": "",
    "order": 4,
    "date": new Date("2025-02-01")
  },
  {
    "title": "ENSI Programming Contest 4.0 (EPC)",
    "organizer": "Competition",
    "result": "Participant",
    "description": "Flagship algorithmic competition organized by ECPC. Solved data structure and algorithm problems under time pressure, focused on logical reasoning and code optimization.",
    "image": "",
    "order": 5,
    "date": new Date("2024-12-01")
  }
];

const CERTS: any[] = [
  {
    "title": "Efficient LLM Customization",
    "issuer": "NVIDIA",
    "category": "AI/ML",
    "image": "https://chaiebamine.github.io/portfolio/assets/certificates/nvidia.jpg",
    "order": 1,
    "date": new Date("2024-10-01")
  },
  {
    "title": "Ethical Hacking",
    "issuer": "Programming Hub",
    "category": "Cybersecurity",
    "image": "",
    "order": 2,
    "date": new Date("2024-10-01")
  },
  {
    "title": "Python Programming",
    "issuer": "Programming Hero",
    "category": "Programming",
    "image": "",
    "order": 3,
    "date": new Date("2024-10-01")
  },
  {
    "title": "Certificate in Statistics",
    "issuer": "365DataScience",
    "category": "Data Science",
    "image": "",
    "order": 4
  },
  {
    "title": "Certificate in Linear Algebra",
    "issuer": "365DataScience",
    "category": "Data Science",
    "image": "",
    "order": 5
  },
  {
    "title": "Certificate in Probability",
    "issuer": "365DataScience",
    "category": "Data Science",
    "image": "",
    "order": 6
  },
  {
    "title": "English Certificate C1 (576/600)",
    "issuer": "British Council",
    "category": "Language",
    "image": "",
    "order": 7
  },
  {
    "title": "Introduction to Cybersecurity",
    "issuer": "Cisco Networking Academy",
    "category": "Cybersecurity",
    "image": "",
    "order": 8
  }
];

const CLUBS: any[] = [
  {
    "name": "Open Source Software ENSI Club",
    "role": "Member",
    "description": "Active member contributing to collaborative open source software projects and initiatives at ENSI.",
    "period": "Sep 2024 – Present",
    "image": "",
    "achievements": [],
    "order": 1
  },
  {
    "name": "ENSI Competitive Programming Club (ECPC)",
    "role": "Member",
    "description": "Member participating in algorithmic competitions and training sessions focused on data structures and problem solving.",
    "period": "Sep 2024 – Present",
    "image": "",
    "achievements": [
      "Participated in EPC 4.0"
    ],
    "order": 2
  },
  {
    "name": "ENSI Chess Club",
    "role": "Member",
    "description": "Active participant in club chess sessions and competitions.",
    "period": "Oct 2024 – Present",
    "image": "",
    "achievements": [],
    "order": 3
  },
  {
    "name": "Citoyen Positif et Sociable",
    "role": "Member",
    "description": "Civic engagement association promoting positive citizenship and social responsibility.",
    "period": "Sep 2024 – Present",
    "image": "",
    "achievements": [],
    "order": 4
  },
  {
    "name": "Lycée Khaireddine Ariana Youth Club",
    "role": "Senior Member",
    "description": "Long-standing senior member involved in organizing activities and mentoring younger members.",
    "period": "Oct 2021 – 2024",
    "image": "",
    "achievements": [],
    "order": 5
  }
];

const DESIGNS: any[] = [
  {
    "title": "Design 1",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design1.png",
    "tools": [
      "Canva",
      "Photoshop",
      "Illustrator"
    ],
    "order": 1
  },
  {
    "title": "Design 2",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design2.png",
    "tools": [
      "Canva",
      "Photoshop",
      "Illustrator"
    ],
    "order": 2
  },
  {
    "title": "Design 3",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design3.png",
    "tools": [
      "Canva"
    ],
    "order": 3
  },
  {
    "title": "Omra Design",
    "description": "Poster design for Omra-related event or announcement.",
    "category": "Poster",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/Omra.jpg",
    "tools": [
      "Canva",
      "Photoshop"
    ],
    "order": 4
  },
  {
    "title": "Omra Design 2",
    "description": "Poster design for Omra-related event or announcement.",
    "category": "Poster",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/omraa.jpg",
    "tools": [
      "Canva",
      "Photoshop"
    ],
    "order": 5
  },
  {
    "title": "Design 5",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design5.png",
    "tools": [
      "Canva"
    ],
    "order": 6
  },
  {
    "title": "Design 4",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design4.png",
    "tools": [
      "Canva",
      "Photoshop"
    ],
    "order": 7
  },
  {
    "title": "Design 6",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design6.png",
    "tools": [
      "Canva"
    ],
    "order": 8
  },
  {
    "title": "Design 7",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design7.png",
    "tools": [
      "Illustrator",
      "Photoshop"
    ],
    "order": 9
  },
  {
    "title": "Design 8",
    "description": "Graphic design created for various purposes.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/design8.png",
    "tools": [
      "Canva"
    ],
    "order": 10
  },
  {
    "title": "Card Back",
    "description": "Business card back design.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/card back.png",
    "tools": [
      "Illustrator",
      "Photoshop"
    ],
    "order": 11
  },
  {
    "title": "Card Front",
    "description": "Business card front design.",
    "category": "Graphic Design",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/card front.png",
    "tools": [
      "Illustrator",
      "Photoshop"
    ],
    "order": 12
  },
  {
    "title": "Logo Final",
    "description": "Final logo design.",
    "category": "Logo",
    "image": "https://chaiebamine.github.io/portfolio/assets/designs/logo final copy.png",
    "tools": [
      "Illustrator"
    ],
    "order": 13
  }
];

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });