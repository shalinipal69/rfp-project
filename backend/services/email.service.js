const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
});

async function sendRfpEmail({ to, subject, html, text }) {
    const info = await transport.sendMail({
        from: process.env.FROM_EMAIL || 'rfp@example.com',
        to,
        subject,
        text,
        html
    });
    return info;
}

transport.verify(function(error, success) {
    if (error) {
        console.error("❌ SMTP Connection Failed:", error.message);
    } else {
        console.log("✔ SMTP Connected Successfully, Ready to Send Emails!");
    }
});


module.exports = { sendRfpEmail };