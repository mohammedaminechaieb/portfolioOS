import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/* ── Education ─────────────────────────────────── */

router.get("/education", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.education.findMany({ orderBy: { order: "asc" } });
    res.json(items);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/education", authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.education.create({ data: req.body });
    res.status(201).json(item);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/education/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body; delete data.id;
    const item = await prisma.education.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/education/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.education.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ error: "Server error" }); }
});

/* ── Competitions ──────────────────────────────── */

router.get("/competitions", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.competition.findMany({ orderBy: { order: "asc" } });
    res.json(items);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/competitions", authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.competition.create({ data: req.body });
    res.status(201).json(item);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/competitions/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body; delete data.id;
    const item = await prisma.competition.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/competitions/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.competition.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ error: "Server error" }); }
});

/* ── Certifications ────────────────────────────── */

router.get("/certifications", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.certification.findMany({ orderBy: { order: "asc" } });
    res.json(items);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/certifications", authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.certification.create({ data: req.body });
    res.status(201).json(item);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/certifications/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body; delete data.id;
    const item = await prisma.certification.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/certifications/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.certification.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ error: "Server error" }); }
});

/* ── Site Config ───────────────────────────────── */

router.get("/config", async (_req: Request, res: Response) => {
  try {
    let config = await prisma.siteConfig.findUnique({ where: { id: "main" } });
    if (!config) config = await prisma.siteConfig.create({ data: { id: "main" } });
    res.json(config);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/config", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body; delete data.id;
    const config = await prisma.siteConfig.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
    });
    res.json(config);
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
