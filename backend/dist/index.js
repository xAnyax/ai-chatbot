import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat";
import authRoutes from "./routes/auth";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use((err, _req, res, _next) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
//# sourceMappingURL=index.js.map