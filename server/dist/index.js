"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const profile_1 = __importDefault(require("./routes/profile"));
const projects_1 = __importDefault(require("./routes/projects"));
const experience_1 = __importDefault(require("./routes/experience"));
const skills_1 = __importDefault(require("./routes/skills"));
const messages_1 = __importDefault(require("./routes/messages"));
const content_1 = __importDefault(require("./routes/content"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "5mb" }));
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/profile", profile_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/experience", experience_1.default);
app.use("/api/skills", skills_1.default);
app.use("/api/messages", messages_1.default);
app.use("/api", content_1.default); // /api/education, /api/competitions, etc.
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Catch-all for unknown API routes
app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "Not found" });
});
app.listen(PORT, () => {
    console.log(`\n🚀 Portfolio API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
exports.default = app;
//# sourceMappingURL=index.js.map