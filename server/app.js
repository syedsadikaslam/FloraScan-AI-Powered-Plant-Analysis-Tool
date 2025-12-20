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

const fsPromises = fs.promises;

// __dirname fix for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

/* ===============================
   REQUIRED MIDDLEWARE
================================ */

// CORS – FRONTEND URL YAHAN AATA HAI
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // ✅ local frontend (Vite)
      "https://florascanai.vercel.app", // ✅ deployed frontend
    ],
    methods: ["GET", "POST"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

/* ===============================
   FIX: Render upload folder issue
================================ */

const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// configure multer
const upload = multer({ dest: uploadDir });

/* ===============================
   GOOGLE GEMINI INIT
================================ */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ===============================
   ROOT ROUTE (Health Check)
================================ */

app.get("/", (req, res) => {
  res.send("🌿 FloraScan API is running successfully");
});

/* ===============================
   ANALYZE ROUTE
================================ */

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const imagePath = req.file.path;

    const imageData = await fsPromises.readFile(imagePath, {
      encoding: "base64",
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      "Analyze this plant image and provide detailed analysis of its species, health, care recommendations, characteristics, care instructions, and interesting facts. Respond in plain text only.",
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: imageData,
        },
      },
    ]);

    const plantInfo = result.response.text();

    // remove uploaded image
    await fsPromises.unlink(imagePath);

    res.json({
      result: plantInfo,
      image: `data:${req.file.mimetype};base64,${imageData}`,
    });
  } catch (error) {
    console.error("❌ Error analyzing image:", error);
    res.status(500).json({
      error: "An error occurred while analyzing the image",
    });
  }
});

/* ===============================
   DOWNLOAD PDF ROUTE
================================ */

app.post("/download", async (req, res) => {
  const { result, image } = req.body;

  try {
    const reportsDir = path.join(__dirname, "reports");
    await fsPromises.mkdir(reportsDir, { recursive: true });

    const filename = `plant_analysis_report_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fontSize(24).text("Plant Analysis Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.fontSize(12).text(result || "No analysis data provided");

    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      doc.moveDown();
      doc.image(buffer, { fit: [500, 300], align: "center" });
    }

    doc.end();

    writeStream.on("finish", async () => {
      res.download(filePath, async () => {
        await fsPromises.unlink(filePath);
      });
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).json({
      error: "An error occurred while generating the PDF report",
    });
  }
});

/* ===============================
   START SERVER
================================ */

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
