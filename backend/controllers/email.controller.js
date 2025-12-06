const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateProposalId } = require("../utils/idGenerator");
const { callAI } = require("../services/ai.service");
const { proposalPrompt } = require("../prompts/proposalPrompt");

// --------- FALLBACK EXTRACTION HELPERS ---------

function fallbackExtractCost(text) {
    const patterns = [
        /total\s*cost[:\s]*\$?(\d[\d,\.]*)/i,
        /\$([\d,\.]+)/,
        /(\d[\d,\.]*)\s*usd/i,
        /cost[:\s]*\$?(\d[\d,\.]*)/i
    ];
    for (const p of patterns) {
        const m = text.match(p);
        if (m) return Number(m[1].replace(/,/g, ""));
    }
    return null;
}

function fallbackExtractCurrency(text) {
    if (/\$|usd/i.test(text)) return "USD";
    if (/₹|inr/i.test(text)) return "INR";
    if (/€|eur/i.test(text)) return "EUR";
    return null;
}

function fallbackExtractDelivery(text) {
    const m = text.match(/delivery\s*(?:in)?\s*(\d+)\s*days?/i);
    return m ? Number(m[1]) : null;
}

function fallbackExtractWarranty(text) {
    const m = text.match(/warranty\s*(\d+)\s*years?/i);
    return m ? Number(m[1]) : null;
}

// ---------------------------------------------------

router.post("/inbound", async(req, res) => {
    try {
        const { from, subject, text } = req.body;

        if (!from || !subject || !text) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Normalize vendor email
        const vendorEmail = from.trim().toLowerCase();

        // Check vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { email: vendorEmail }
        });

        if (!vendor) {
            return res.status(400).json({
                error: "Vendor not found",
                details: `Email ${vendorEmail} does not match any vendor`
            });
        }

        // Extract RFP ID from subject: [RFP:RFP-0001]
        const match = subject.match(/\[RFP:(.*?)\]/);
        const rfpId = match ? match[1] : null;

        if (!rfpId) {
            return res.status(400).json({
                error: "Invalid subject format",
                details: "No RFP ID found in subject"
            });
        }

        // Check RFP exists
        const rfp = await prisma.rFP.findUnique({ where: { id: rfpId } });

        if (!rfp) {
            return res.status(400).json({
                error: "RFP not found",
                details: `RFP ID ${rfpId} does not exist`
            });
        }

        // -----------------------------------------
        // 🧠 RUN GROQ AI
        // -----------------------------------------
        let aiJson = {};
        try {
            const aiResp = await callAI(proposalPrompt(text));

            // Clean Groq/Qwen noise: <think>, markdown, etc.
            const cleaned = aiResp
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

            aiJson = JSON.parse(cleaned);
        } catch (err) {
            console.error("AI vendor parsing failed:", err);
            aiJson = { raw: text, parse_error: String(err) };
        }

        // -----------------------------------------
        // FALLBACK EXTRACTION (if AI misses fields)
        // -----------------------------------------

        // --- Total Cost ---
        if (!aiJson.total_cost) {
            const fallbackCost = fallbackExtractCost(text);
            if (fallbackCost) aiJson.total_cost = fallbackCost;
        }

        // --- Currency ---
        if (!aiJson.currency) {
            aiJson.currency = fallbackExtractCurrency(text);
        }

        // --- Delivery Days ---
        if (!aiJson.delivery_days) {
            aiJson.delivery_days = fallbackExtractDelivery(text);
        }

        // --- Warranty ---
        if (!aiJson.warranty_years) {
            aiJson.warranty_years = fallbackExtractWarranty(text);
        }

        // --- Calculate total_cost from unit prices ---
        if (!aiJson.total_cost && aiJson.unit_prices.length) {
            let total = 0;
            for (const item of aiJson.unit_prices) {
                if (item.unit_price && item.quantity) {
                    total += item.unit_price * item.quantity;
                }
            }
            if (total > 0) aiJson.total_cost = total;
        }

        // -----------------------------------------
        // SAVE PROPOSAL
        // -----------------------------------------

        const proposal = await prisma.proposal.create({
            data: {
                id: await generateProposalId(),
                vendorId: vendor.id,
                rfpId: rfpId,
                extractedJson: JSON.stringify(aiJson),
                totalCost: aiJson.total_cost || null,
                deliveryTime: aiJson.delivery_days ?
                    String(aiJson.delivery_days) : null,
                warranty: aiJson.warranty_years ?
                    String(aiJson.warranty_years) : null
            }
        });

        res.json({ success: true, proposal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "inbound failed", details: String(err) });
    }
});

module.exports = router;