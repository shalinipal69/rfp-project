const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateRfpId } = require('../utils/idGenerator');
const { callAI } = require('../services/ai.service');
const { rfpPrompt } = require("../prompts/rfpPrompt");
const { aiSummaryPrompt } = require("../prompts/aiSummaryPrompt")



/* ---------------- CREATE RFP ---------------- */
router.post('/', async(req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'text required' });

        let structured = {
            title: 'RFP',
            items: [],
            budget: null,
            delivery_days: null,
            payment_terms: null,
            warranty: null
        };

        try {
            const ai = await callAI(rfpPrompt(text));

            const cleaned = ai
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .trim();

            structured = JSON.parse(cleaned);
        } catch (err) {
            structured = {
                title: text.slice(0, 40),
                items: [],
                original_parsing_error: String(err)
            };
        }


        const rfp = await prisma.rFP.create({
            data: {
                id: await generateRfpId(),
                originalText: text,
                structuredJson: JSON.stringify(structured) // ✅ FIXED
            }
        });

        res.json(rfp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create RFP', details: err.message });
    }
});


/* ---------------- GET ALL ---------------- */
router.get('/', async(req, res) => {
    const list = await prisma.rFP.findMany({
        include: { proposals: true }
    });

    // Convert structuredJson STRING → JSON OBJECT
    const formatted = list.map(rfp => ({
        ...rfp,
        structuredJson: JSON.parse(rfp.structuredJson)
    }));

    res.json(formatted);
});


/* ---------------- GET SINGLE ---------------- */
router.get('/:id', async(req, res) => {
    const { id } = req.params;

    const rfp = await prisma.rFP.findUnique({
        where: { id },
        include: {
            proposals: {
                include: { vendor: true }
            }
        }
    });

    if (!rfp) return res.status(404).json({ error: 'RFP not found' });

    rfp.structuredJson = JSON.parse(rfp.structuredJson);

    res.json(rfp);
});


/* ---------------- SEND RFP TO VENDORS ---------------- */
router.post('/:id/send', async(req, res) => {
    const { id } = req.params;
    const { vendorIds } = req.body;
    const { sendRfpEmail } = require('../services/email.service');

    const rfp = await prisma.rFP.findUnique({ where: { id } });
    if (!rfp) return res.status(404).json({ error: 'RFP not found' });

    const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds || [] } }
    });

    const results = [];

    for (const v of vendors) {
        const subject = `[RFP:${rfp.id}]`;
        const text =
            "Please find our RFP below:\n\n" +
            JSON.stringify(JSON.parse(rfp.structuredJson), null, 2) +
            "\n\nPlease reply including the RFP id in the subject.";

        try {
            await sendRfpEmail({ to: v.email, subject, text, html: null });
            results.push({ vendor: v.email, ok: true });
        } catch (e) {
            results.push({ vendor: v.email, ok: false, error: String(e) });
        }
    }

    res.json({ results });
});


/* ---------------- 🔥 AI POWERED PROPOSAL COMPARISON ---------------- */
router.get("/:id/compare", async(req, res) => {
    const { id } = req.params;

    try {
        const rfp = await prisma.rFP.findUnique({
            where: { id },
            include: {
                proposals: {
                    include: { vendor: true }
                }
            }
        });

        if (!rfp || rfp.proposals.length === 0) {
            return res.status(404).json({ error: "No proposals found to compare" });
        }

        // -------------------- STEP 1: Load extracted JSON --------------------
        const parsed = rfp.proposals.map(p => {
            let data = {};
            try {
                data = JSON.parse(p.extractedJson);
            } catch (e) {
                data = { parse_error: true, raw: p.extractedJson };
            }

            return {
                vendor: p.vendor.name,
                vendorId: p.vendorId,
                raw: data.raw || "",
                totalCost: data.total_cost || p.totalCost || null,
                currency: data.currency || null,
                delivery: data.delivery_days || p.deliveryTime || null,
                warranty: data.warranty_years || p.warranty || null,
                items: data.unit_prices || data.items || [],
                completenessScore:
                    (data.total_cost ? 1 : 0) +
                    (data.currency ? 1 : 0) +
                    (data.delivery_days ? 1 : 0) +
                    (data.warranty_years ? 1 : 0)
            };
        });

        // -------------------- STEP 2: Compute SCORING --------------------
        const scored = parsed.map(p => {
            const costScore = p.totalCost ? 100000 / p.totalCost : 0; // lower cost → higher score
            const deliveryScore = p.delivery ? 500 / p.delivery : 0; // faster delivery → better
            const warrantyScore = p.warranty ? p.warranty * 10 : 0; // longer warranty → better
            const completenessPenalty = (4 - p.completenessScore) * 5; // missing fields → penalty

            const finalScore =
                costScore +
                deliveryScore +
                warrantyScore -
                completenessPenalty;

            return {...p, score: finalScore };
        });

        // Best vendor
        const best = scored.sort((a, b) => b.score - a.score)[0];

        // -------------------- STEP 3: AI SUMMARY GENERATION --------------------


        let aiSummary = {};
        try {
            const resp = await callAI(aiSummaryPrompt(scored));

            const cleaned = resp
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .trim();

            aiSummary = JSON.parse(cleaned);
        } catch (err) {
            aiSummary = { error: "AI summary failed", fallback_best: best };
        }

        // -------------------- FINAL RESULT --------------------
        return res.json({
            rfpId: id,
            bestVendor: best.vendor,
            bestVendorId: best.vendorId,
            comparisonTable: scored,
            aiSummary
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Comparison failed", details: err.message });
    }
});



module.exports = router;