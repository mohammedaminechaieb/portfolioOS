import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { authMiddleware, signToken, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken(admin.id);
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { id: true, email: true, name: true },
    });
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(admin);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/password
router.put("/password", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
    if (!admin) { res.status(404).json({ error: "Not found" }); return; }

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) { res.status(401).json({ error: "Wrong current password" }); return; }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: req.adminId }, data: { password: hashed } });
    res.json({ message: "Password updated" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
