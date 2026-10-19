import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// POST /api/messages — public (contact form)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, body } = req.body;
    if (!name || !email || !body) {
      res.status(400).json({ error: "Name, email and message required" });
      return;
    }
    const message = await prisma.message.create({
      data: { name, email, subject: subject || "", body },
    });
    res.status(201).json({ message: "Message sent", id: message.id });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/messages — admin
router.get("/", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/messages/:id/read — admin
router.put("/:id/read", authMiddleware, async (req: Request, res: Response) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id as string },
      data: { read: true },
    });
    res.json(message);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/messages/:id — admin
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;