import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
    analyzePlant,
    getHistory,
    getAnalysisById,
    chatWithAI,
    downloadPDF,
    testConnection,
} from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= UPLOAD SETUP (Needed for route) ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../upload");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

router.post("/analyze", protect, upload.single("image"), analyzePlant);
router.get("/history", protect, getHistory);
router.get("/history/:id", protect, getAnalysisById);
router.post("/chat", chatWithAI);
router.get("/test", testConnection);
router.post("/download", downloadPDF);

export default router;
