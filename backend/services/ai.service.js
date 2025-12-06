const Groq = require("groq-sdk");
require("dotenv").config();

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function callAI(prompt) {
    try {
        const response = await client.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: [
                { role: "system", content: "Return ONLY clean JSON. Do NOT include <think> tags, explanations, or comments." },
                { role: "user", content: prompt }
            ],
            temperature: 0
        });

        let text = response.choices[0].message.content;

        //Remove Groq reasoning tags
        text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        return text;
    } catch (err) {
        console.error("GROQ AI ERROR:", err);
        throw new Error("Groq AI failed: " + err.message);
    }
}


module.exports = { callAI };