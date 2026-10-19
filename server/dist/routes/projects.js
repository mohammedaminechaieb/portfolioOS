"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/projects — public
router.get("/", async (req, res) => {
    try {
        const category = req.query.category;
        const featured = req.query.featured === "true" ? true : undefined;
        const projects = await prisma_1.default.project.findMany({
            where: {
                ...(category ? { category } : {}),
                ...(featured !== undefined ? { featured } : {}),
            },
            orderBy: { order: "asc" },
        });
        res.json(projects);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// GET /api/projects/:slug — public
router.get("/:slug", async (req, res) => {
    try {
        const project = await prisma_1.default.project.findUnique({ where: { slug: req.params.slug } });
        if (!project) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json(project);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// POST /api/projects — admin
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const project = await prisma_1.default.project.create({ data: req.body });
        res.status(201).json(project);
    }
    catch (err) {
        if (err.code === "P2002") {
            res.status(409).json({ error: "Slug already exists" });
            return;
        }
        res.status(500).json({ error: "Server error" });
    }
});
// PUT /api/projects/:id — admin
router.put("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        delete data.id;
        const project = await prisma_1.default.project.update({ where: { id: req.params.id }, data });
        res.json(project);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// DELETE /api/projects/:id — admin
router.delete("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        await prisma_1.default.project.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map