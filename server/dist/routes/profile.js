"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/profile — public
router.get("/", async (_req, res) => {
    try {
        let profile = await prisma_1.default.profile.findUnique({ where: { id: "main" } });
        if (!profile) {
            profile = await prisma_1.default.profile.create({ data: { id: "main", bio: "" } });
        }
        res.json(profile);
    }
    catch {
        res.status(500).json({ error: "Server error" });
    }
});
// PUT /api/profile — admin only
router.put("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        delete data.id;
        const profile = await prisma_1.default.profile.upsert({
            where: { id: "main" },
            update: data,
            create: { id: "main", bio: data.bio || "", ...data },
        });
        res.json(profile);
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
//# sourceMappingURL=profile.js.map