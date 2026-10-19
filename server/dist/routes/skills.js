"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    try {
        const items = await prisma_1.default.skill.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
        res.json(items);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const item = await prisma_1.default.skill.create({ data: req.body });
        res.status(201).json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.put("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        delete data.id;
        const item = await prisma_1.default.skill.update({ where: { id: req.params.id }, data });
        res.json(item);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
router.delete("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        await prisma_1.default.skill.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=skills.js.map