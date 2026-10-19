import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/projects — public
router.get("/", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const featured = req.query.featured === "true" ? true : undefined;
    const projects = await prisma.project.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(featured !== undefined ? { featured } : {}),
      },
      orderBy: { order: "asc" },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/projects/:slug — public
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({ where: { slug: req.params.slug } });
    if (!project) { res.status(404).json({ error: "Not found" }); return; }
    res.json(project);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/projects — admin
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json(project);
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Slug already exists" });
      return;
    }
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/projects/:id — admin
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    delete data.id;
    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json(project);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/projects/:id — admin
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;