"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password required" });
            return;
        }
        const admin = await prisma_1.default.admin.findUnique({ where: { email } });
        if (!admin) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, admin.password);
        if (!valid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, auth_1.signToken)(admin.id);
        res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
// GET /api/auth/me
router.get("/me", auth_1.authMiddleware, async (req, res) => {
    try {
        const admin = await prisma_1.default.admin.findUnique({
            where: { id: req.adminId },
            select: { id: true, email: true, name: true },
        });
        if (!admin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }
        res.json(admin);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// PUT /api/auth/password
router.put("/password", auth_1.authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await prisma_1.default.admin.findUnique({ where: { id: req.adminId } });
        if (!admin) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, admin.password);
        if (!valid) {
            res.status(401).json({ error: "Wrong current password" });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.admin.update({ where: { id: req.adminId }, data: { password: hashed } });
        res.json({ message: "Password updated" });
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map