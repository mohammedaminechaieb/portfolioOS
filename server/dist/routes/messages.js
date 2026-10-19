"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/messages — public (contact form)
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, body } = req.body;
        if (!name || !email || !body) {
            res.status(400).json({ error: "Name, email and message required" });
            return;
        }
        const message = await prisma_1.default.message.create({
            data: { name, email, subject: subject || "", body },
        });
        res.status(201).json({ message: "Message sent", id: message.id });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// GET /api/messages — admin
router.get("/", auth_1.authMiddleware, async (_req, res) => {
    try {
        const messages = await prisma_1.default.message.findMany({ orderBy: { createdAt: "desc" } });
        res.json(messages);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// PUT /api/messages/:id/read — admin
router.put("/:id/read", auth_1.authMiddleware, async (req, res) => {
    try {
        const message = await prisma_1.default.message.update({
            where: { id: req.params.id },
            data: { read: true },
        });
        res.json(message);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// DELETE /api/messages/:id — admin
router.delete("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        await prisma_1.default.message.delete({ where: { id: req.params.id } });
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map