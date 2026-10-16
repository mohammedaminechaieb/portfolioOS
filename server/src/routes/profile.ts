import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/profile — public
router.get("/", async (_req: Request, res: Response) => {
  try {
    let profile = await prisma.profile.findUnique({ where: { id: "main" } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { id: "main", bio: "" } });
    }
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/profile — admin only
router.put("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    delete data.id;
    const profile = await prisma.profile.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", bio: data.bio || "", ...data },
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
