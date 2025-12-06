const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getNextId(model, prefix) {
    const last = await prisma[model].findFirst({
        orderBy: { id: "desc" }
    });

    if (!last) return `${prefix}-0001`;

    const lastNumber = Number(last.id.replace(`${prefix}-`, ""));
    const nextNumber = lastNumber + 1;

    return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

async function generateRfpId() {
    return await getNextId("rFP", "RFP");
}

async function generateVendorId() {
    return await getNextId("vendor", "VEN");
}

async function generateProposalId() {
    return await getNextId("proposal", "PROP");
}

module.exports = {
    generateRfpId,
    generateVendorId,
    generateProposalId
};