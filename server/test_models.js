import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found in .env");
    process.exit(1);
}

console.log("🔑 API Key found (starts with):", apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
    try {
        // There isn't a direct "listModels" helper in the simple usage of some SDK versions,
        // but checking a basic model usually works.
        // However, for debugging 404, we want to see what works.

        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro"
        ];

        const apiVersionsToTry = ["v1beta", "v1"];

        console.log("\n🔍 Testing Model Availability...");

        for (const apiVersion of apiVersionsToTry) {
            console.log(`\n--- Testing with API Version: ${apiVersion} ---`);
            for (const modelName of modelsToTry) {
                process.stdout.write(`Testing ${modelName}... `);
                try {
                    const model = genAI.getGenerativeModel({ model: modelName, apiVersion: apiVersion });
                    const result = await model.generateContent("Hello, are you there?");
                    const response = await result.response;
                    process.stdout.write(`✅ Success! Response: ${response.text().substring(0, 20)}...\n`);
                } catch (error) {
                    process.stdout.write(`❌ Failed\n`);
                    console.error("FULL ERROR:", error);
                }
            }
        }

    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

checkModels();
