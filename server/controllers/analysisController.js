import Analysis from "../models/Analysis.js";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFDocument from "pdfkit";

// @desc    Analyze plant image
// @route   POST /api/analysis/analyze
// @access  Public
export const analyzePlant = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file received" });
        }

        console.log("📸 Processing image:", req.file.path);

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // User has access to 2.5-flash!
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imagePath = req.file.path;
        const imageData = fs.readFileSync(imagePath, "base64");

        // Timeout Promise (30 seconds)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI Analysis Timed Out (30s) - Try again")), 30000)
        );

        console.log("🚀 Sending request to Gemini (1.5-flash)...");

        const aiRequest = model.generateContent([
            `Analyze this plant image and provide a detailed report in Markdown format. 
            Use the following structure:
            
            ## 🌿 **Plant Name**
            **Species:** [Scientific Name]
            **Common Name:** [Common Name]

            ## ❤️ **Health Status**
            [Brief assessment of the plant's health based on visual cues.]

            ## 💧 **Care Instructions**
            - **Light:** [Light requirements]
            - **Water:** [Watering needs]
            - **Soil:** [Soil type]
            - **Temperature:** [Ideal temperature range]
            - **Humidity:** [Humidity preferences]

            ## 🧠 **Interesting Facts**
            [2-3 interesting facts]

            ## ⚠️ **Potential Issues & Solutions**
            [Common pests/diseases and solutions]`,
            {
                inlineData: {
                    mimeType: req.file.mimetype,
                    data: imageData,
                },
            },
        ]);

        // Race: AI vs Timeout
        const result = await Promise.race([aiRequest, timeoutPromise]);

        console.log("✅ Response received from Gemini.");

        const text = result?.response?.text?.() || "Unable to analyze local plant. Please try again.";

        // Cleanup
        try { fs.unlinkSync(imagePath); } catch (e) { }

        // Save to DB
        const newAnalysis = new Analysis({
            user: req.user ? req.user._id : null,
            image: `data:${req.file.mimetype};base64,${imageData}`,
            result: text,
        });
        await newAnalysis.save();
        console.log("Saved analysis to DB:", newAnalysis._id);

        res.json({
            id: newAnalysis._id,
            result: text,
            image: newAnalysis.image,
        });
    } catch (error) {
        console.error("❌ ANALYZE ERROR:", error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ error: error.message || "Plant analysis failed" });
    }
};

// @desc    Get analysis history
// @route   GET /api/analysis/history
// @access  Public
export const getHistory = async (req, res) => {
    try {
        const history = await Analysis.find({ user: req.user._id }).sort({ date: -1 }).limit(20);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
};

// @desc    Get single analysis
// @route   GET /api/analysis/history/:id
// @access  Public
export const getAnalysisById = async (req, res) => {
    try {
        const item = await Analysis.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Not found" });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch item" });
    }
};

// @desc    Test connection
export const testConnection = (req, res) => {
    res.json({ message: "Backend is connected!", success: true });
};

// @desc    Chat with AI about a plant
// @route   POST /api/analysis/chat
// @access  Public
export const chatWithAI = async (req, res) => {
    const { message, context } = req.body;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `Context: You are a plant expert. The user previously analyzed a plant with this result: ${context}` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to answer any follow-up questions about this plant." }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: error.message || "Chat failed" });
    }
};

// @desc    Download PDF Report
// @route   POST /api/analysis/download
// @access  Public
export const downloadPDF = (req, res) => {
    try {
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
        const today = new Date().toLocaleDateString("en-GB");
        doc.fontSize(10).fillColor("gray").text(`Date: ${today}`, { align: "right" });
        doc.moveDown(0.5);

        /* ===== TITLE ===== */
        doc.fontSize(20).fillColor("green").font("Helvetica-Bold").text("Plant Analysis Report");
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        /* ===== IMAGE (SAME PAGE) ===== */
        if (image) {
            const base64 = image.includes(",") ? image.split(",")[1] : image;
            const buffer = Buffer.from(base64, "base64");
            doc.image(buffer, { fit: [350, 300], align: "center" });
            doc.moveDown(1.5);
        }

        /* ===== ANALYSIS TEXT ===== */
        doc.fontSize(12).fillColor("black").font("Helvetica-Bold").text("Analysis Result");
        doc.moveDown(0.5);

        // Strip emojis and special characters that PDFKit's standard font doesn't support
        const cleanText = (text) => {
            if (!text) return "";
            return text
                .replace(/[\u{1F600}-\u{1F6FF}]/gu, "") // Emoticons
                .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // Symbols & Pictographs
                .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // Transport & Map Symbols
                .replace(/[\u{1F700}-\u{1F77F}]/gu, "") // Alchemical Symbols
                .replace(/[\u{1F780}-\u{1F7FF}]/gu, "") // Geometric Shapes Extended
                .replace(/[\u{1F800}-\u{1F8FF}]/gu, "") // Supplemental Arrows-C
                .replace(/[\u{1F900}-\u{1F9FF}]/gu, "") // Supplemental Symbols and Pictographs
                .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "") // Chess Symbols
                .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "") // Symbols and Pictographs Extended-A
                .replace(/[\u2600-\u26FF]/gu, "")       // Misc symbols
                .replace(/[\u2700-\u27BF]/gu, "")       // Dingbats
                .replace(/\*\*/g, "");                  // Remove Markdown bold stars for cleaner plain text
        };

        const sanitizedResult = cleanText(result || "No analysis data provided");

        doc.fontSize(11).font("Helvetica").text(sanitizedResult, { lineGap: 4 });

        /* ===== FOOTER ===== */
        doc.moveDown(3);
        doc.fontSize(9).fillColor("gray").text("Developed by Sadik", { align: "center" });

        doc.end();
    } catch (error) {
        console.error("❌ PDF ERROR:", error.message);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
};
