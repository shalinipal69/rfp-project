const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateVendorId } = require('../utils/idGenerator');


router.post('/', async(req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const v = await prisma.vendor.create({ data: { id: await generateVendorId(), name, email, phone } });
    res.json(v);
});

router.get('/', async(req, res) => {
    const list = await prisma.vendor.findMany();
    res.json(list);
});

module.exports = router;