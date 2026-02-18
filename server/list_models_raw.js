import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Fetching available models from:", url.replace(apiKey, "HIDDEN_KEY"));

async function listModels() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        const models = data.models || [];
        const modelNames = models.map(m => m.name.replace("models/", "")).join("\n");

        fs.writeFileSync("models_list.txt", modelNames);
        console.log("✅ Written models to models_list.txt");

    } catch (error) {
        console.error("❌ Failed to list models:", error.message);
        fs.writeFileSync("models_list.txt", "Error: " + error.message);
    }
}

listModels();
