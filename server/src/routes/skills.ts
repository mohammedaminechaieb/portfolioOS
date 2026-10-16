import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
    res.json(items);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.skill.create({ data: req.body });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body; delete data.id;
    const item = await prisma.skill.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
