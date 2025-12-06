const nodemailer = require("nodemailer");

(async() => {
    const testAccount = await nodemailer.createTestAccount();
    console.log("✔ Ethereal Test Account Created:");
    console.log(testAccount);
})();