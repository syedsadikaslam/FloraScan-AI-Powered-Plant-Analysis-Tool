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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

/* ================= CORS FIX ================= */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

/* ================= UPLOAD DIR ================= */
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: uploadDir });

/* ================= GEMINI ================= */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("🌿 FloraScan API is running");
});

/* ================= ANALYZE ================= */
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath, "base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent([
      "Analyze this plant image. Give species, health, care tips, and facts.",
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    fs.unlinkSync(imagePath);

    res.json({
      result: response.response.text(),
      image: `data:${req.file.mimetype};base64,${imageData}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Plant analysis failed" });
  }
});

/* ================= PDF ================= */
app.post("/download", async (req, res) => {
  const { result, image } = req.body;

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=FloraScan_Report.pdf");

  doc.pipe(res);
  doc.fontSize(20).text("Plant Analysis Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(result);

  if (image) {
    const base64 = image.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    doc.addPage().image(buffer, { fit: [500, 300], align: "center" });
  }

  doc.end();
});

/* ================= START ================= */
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
