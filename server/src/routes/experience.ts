import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.experience.findMany({ orderBy: { order: "asc" } });
    res.json(items);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.experience.create({ data: req.body });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body; delete data.id;
    const item = await prisma.experience.update({ where: { id: req.params.id as string }, data });
    res.json(item);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;