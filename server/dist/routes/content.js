"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/* ── Education ─────────────────────────────────── */
router.get("/education", async (_req, res) => {
    try {
        const items = await prisma_1.default.education.findMany({ orderBy: { order: "asc" } });
        res.json(items);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.post("/education", auth_1.authMiddleware, async (req, res) => {
    try {
        const item = await prisma_1.default.education.create({ data: req.body });
        res.status(201).json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.put("/education/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        delete data.id;
        const item = await prisma_1.default.education.update({ where: { id: req.params.id }, data });
        res.json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.delete("/education/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        await prisma_1.default.education.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
/* ── Competitions ──────────────────────────────── */
router.get("/competitions", async (_req, res) => {
    try {
        const items = await prisma_1.default.competition.findMany({ orderBy: { order: "asc" } });
        res.json(items);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.post("/competitions", auth_1.authMiddleware, async (req, res) => {
    try {
        const item = await prisma_1.default.competition.create({ data: req.body });
        res.status(201).json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.put("/competitions/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        delete data.id;
        const item = await prisma_1.default.competition.update({ where: { id: req.params.id }, data });
        res.json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.delete("/competitions/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        await prisma_1.default.competition.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
/* ── Certifications ────────────────────────────── */
router.get("/certifications", async (_req, res) => {
    try {
        const items = await prisma_1.default.certification.findMany({ orderBy: { order: "asc" } });
        res.json(items);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.post("/certifications", auth_1.authMiddleware, async (req, res) => {
    try {
        const item = await prisma_1.default.certification.create({ data: req.body });
        res.status(201).json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.put("/certifications/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        delete data.id;
        const item = await prisma_1.default.certification.update({ where: { id: req.params.id }, data });
        res.json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.delete("/certifications/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        await prisma_1.default.certification.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
/* ── Site Config ───────────────────────────────── */
router.get("/config", async (_req, res) => {
    try {
        let config = await prisma_1.default.siteConfig.findUnique({ where: { id: "main" } });
        if (!config)
            config = await prisma_1.default.siteConfig.create({ data: { id: "main" } });
        res.json(config);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.put("/config", auth_1.authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        delete data.id;
        const config = await prisma_1.default.siteConfig.upsert({
            where: { id: "main" },
            update: data,
            create: { id: "main", ...data },
        });
        res.json(config);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=content.js.map