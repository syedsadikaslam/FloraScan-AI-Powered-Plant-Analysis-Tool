import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

/* ================= BASIC SETUP ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

/* ================= UPLOAD ================= */
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: uploadDir });

/* ================= GEMINI ================= */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY NOT FOUND");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("🌿 FloraScan API is running");
});

/* ================= ANALYZE ================= */
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    // 🔒 SAFETY CHECK
    if (!req.file) {
      return res.status(400).json({
        error: "No image file received by server",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key not configured on server",
      });
    }

    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath, "base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      "Analyze this plant image. Give species, health status, care tips, and interesting facts.",
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    const text =
      result?.response?.text?.() ||
      "Unable to analyze plant. Try another image.";

    fs.unlinkSync(imagePath);

    res.json({
      result: text,
      image: `data:${req.file.mimetype};base64,${imageData}`,
    });
  } catch (error) {
    console.error("❌ ANALYZE ERROR:", error.message);
    res.status(500).json({
      error: error.message || "Plant analysis failed",
    });
  }
});

/* ================= PDF ================= */
app.post("/download", (req, res) => {
  try {
    const { result, image } = req.body;

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=FloraScan_Report.pdf"
    );

    doc.pipe(res);
    doc.fontSize(20).text("Plant Analysis Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(result || "No analysis data");

    if (image) {
      const base64 = image.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      doc.addPage().image(buffer, { fit: [500, 300], align: "center" });
    }

    doc.end();
  } catch (err) {
    console.error("❌ PDF ERROR:", err.message);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

/* ================= START ================= */
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
