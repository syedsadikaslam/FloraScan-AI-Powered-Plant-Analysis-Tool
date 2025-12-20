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

/* ================= UPLOAD SETUP ================= */
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

/* ================= GEMINI INIT ================= */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("🌿 FloraScan API is running");
});

/* ================= ANALYZE ROUTE ================= */
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file received" });
    }

    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath, "base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent([
      "Analyze this plant image and provide:\n1. Plant species\n2. Health condition\n3. Care instructions\n4. Interesting facts\nRespond in clear plain text.",
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    const text =
      result?.response?.text?.() ||
      "Unable to analyze the plant. Please try another image.";

    fs.unlinkSync(imagePath);

    res.json({
      result: text,
      image: `data:${req.file.mimetype};base64,${imageData}`,
    });
  } catch (error) {
    console.error("❌ ANALYZE ERROR:", error.message);
    res.status(500).json({ error: "Plant analysis failed" });
  }
});

/* ================= PDF ROUTE (🔥 FULLY UPGRADED) ================= */
app.post("/download", (req, res) => {
  try {
    console.log("🔥 NEW ADVANCED PDF FORMAT RUNNING");

    const { result, image } = req.body;

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=FloraScan_Report.pdf"
    );

    doc.pipe(res);

    /* ===== DATE (TOP RIGHT) ===== */
    const today = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Date: ${today}`, { align: "right" });

    doc.moveDown(0.5);

    /* ===== TITLE ===== */
    doc
      .fontSize(20)
      .fillColor("green")
      .font("Helvetica-Bold")
      .text("Plant Analysis Report");

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1);

    /* ===== IMAGE (SAME PAGE) ===== */
    if (image) {
      const base64 = image.includes(",")
        ? image.split(",")[1]
        : image;

      const buffer = Buffer.from(base64, "base64");

      doc.image(buffer, {
        fit: [350, 300],
        align: "center",
      });

      doc.moveDown(1.5);
    }

    /* ===== ANALYSIS TEXT ===== */
    doc
      .fontSize(12)
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("Analysis Result");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(result || "No analysis data provided", {
        lineGap: 4,
      });

    /* ===== FOOTER ===== */
    doc.moveDown(3);
    doc
      .fontSize(9)
      .fillColor("gray")
      .text("Developed by Sadik", {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("❌ PDF ERROR:", error.message);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

/* ================= START SERVER ================= */
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
