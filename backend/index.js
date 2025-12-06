require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

const rfpRouter = require('./controllers/rfp.controller');
const vendorRouter = require('./controllers/vendor.controller');
const emailRouter = require('./controllers/email.controller');

app.use('/api/rfps', rfpRouter);
app.use('/api/vendors', vendorRouter);
app.use('/api/email', emailRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));