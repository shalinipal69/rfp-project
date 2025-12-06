const Groq = require("groq-sdk");
require("dotenv").config();

async function listModels() {
    try {
        const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const response = await client.models.list();
        console.log("Available Groq Models:");
        for (const m of response.data) {
            console.log(" -", m.id);
        }
    } catch (err) {
        console.error("Failed to list models:", err);
    }
}

listModels();