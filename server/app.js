import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ["https://florascanai.vercel.app", "http://localhost:5173", "https://florascan-ai-powered-plant-analysis-tool.onrender.com"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Global Request Logger
app.use((req, res, next) => {
  console.log(`📢 ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);

app.get("/", (req, res) => {
  res.send("🌿 FloraScan API is running");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

