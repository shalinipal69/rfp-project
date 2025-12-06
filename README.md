This project is an AI-powered Request for Proposal (RFP) automation system that helps procurement teams:

✅ Generate structured RFPs using AI
✅ Send RFPs to selected vendors via email
✅ Allow vendors to reply with proposals
✅ Automatically parse vendor proposals using AI
✅ Compare proposals & generate AI recommendations
✅ Provide clear vendor insights & scoring

It fully automates a process that usually requires manual reading, extraction, and comparison.

#Project Architecture

frontend/     → React app (UI)
backend/      → Node.js + Express API
database/     → SQLite (via Prisma ORM)
AI Layer      → Groq API (Qwen 32B)
Email Layer   → Nodemailer (Ethereal)

AI Features

1️ AI-Generated RFP Structure

User enters a natural-language requirement like:

"I need 50 laptops with 8GB RAM and 20 monitors. Budget 5,00,000 INR, delivery in 20 days."

AI extracts:

{
  "title": "Purchase of Laptops and Monitors",
  "items": [
    { "name": "laptop", "quantity": 50, "specs": {} },
    { "name": "monitor", "quantity": 20, "spects": {} }
  ],
  "budget": { "amount": 500000, "currency": "INR" },
  "delivery_days": 20,
  "payment_terms": null,
  "warranty": "2 years"
}

2️. AI-Parsed Vendor Proposals

Vendors reply via email:

"We offer 50 laptops at 90,000 each and 20 monitors at 15,000 each. Delivery 15 days, warranty 2.5 years."

AI extracts:
{
  "total_cost": 6000000,
  "currency": "INR",
  "delivery_days": 15,
  "warranty_years": 2.5,
  "unit_prices": [
    { "item": "laptop", "unit_price": 90000, "quantity": 50 },
    { "item": "monitor", "unit_price": 15000, "quantity": 20 }
  ]
}
Fallback regex automatically fills missing values.

3️. AI-Powered Comparison & Recommendation

The backend computes:

Cost Score (lower = better)
Delivery Score (faster = better)
Warranty Score (higher = better)
Penalty for incomplete info

Then AI generates:

Summary
Vendor strengths/weaknesses
Recommendation
Final decision

!----------------------------------------------------------------------------------

 Tech Stack

Frontend
React + Vite
Axios
Modular UI components
Reusable layered views (RFPStructuredView, Proposal cards, comparison tables)

Backend
Node.js + Express
Prisma ORM
SQLite Database
AI integration (Groq Qwen 32B)
Nodemailer (Ethereal)

Database
SQLite local file dev.db

⚙️ Setup Instructions

✔️ Clone the repo
git clone https://github.com/your-repo.git
cd your-project


!-----------------------------------------------

🛠️ Backend Setup
1️⃣ Install dependencies
cd backend
npm install

2️⃣ Create .env
PORT=4000
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
FROM_EMAIL=your_ethereal_user
DATABASE_URL="file:./dev.db"
GROQ_API_KEY=your_groq_key

3️⃣ Prisma database setup
npx prisma migrate dev --name init

4️⃣ Start backend
node index.js

Backend runs at:
👉 http://localhost:4000



!------------------------------

🎨 Frontend Setup
1️⃣ Install dependencies
cd frontend
npm install

2️⃣ (Optional) Create .env
VITE_API_URL=http://localhost:4000

3️⃣ Start frontend
npm run dev

Frontend runs at:
👉 http://localhost:5173

!------------------------------------

🔄 Project Workflow
1️⃣ Create RFP

User describes requirement → AI extracts structured RFP JSON → Saved in DB → Displayed nicely.

2️⃣ Add vendors
Each vendor has:
Name
Email
Auto-generated Vendor ID (VEN-0001 etc.)

3️⃣ Send RFP to selected vendors
UI lets the user pick vendors per RFP.
Email is sent via Ethereal (for testing).

4️⃣ Vendor replies
Vendors reply like:
Subject: [RFP:RFP-0001] My Proposal
Body: We offer 50 laptops at 80,000 each…


Backend receives proposal via API: POST /api/email/inbound


AI processes email → saves structured proposal.

5️⃣ View RFP Details Shows:
AI structured RFP
Vendor proposals
Parsed details
Item breakdown

6️⃣ Compare proposals
Click Compare Proposals (AI)
You get:

Comparison Table
Best vendor
AI insights
Strengths/Weaknesses
Final recommendation


!--------------------------------------------------------------------------

🧪 Test Data

Sample RFP (use in Create RFP)-
I need 50 laptops and 20 monitor with a total budget 5000000 rupees in 20 days with 2 years of warranty.

Sample Vendors- 
Name	Email
shalini vendor 1	shalini069pal@gmail.com
shalini vendor 2	palshalini069@gmail.com
Add them in UI → Vendors page.

Sample Vendor Proposal Emails

1️⃣ Vendor 2 (Better Delivery)

curl --location 'http://localhost:4000/api/email/inbound' \
--header 'Content-Type: application/json' \
--data-raw '{
  "from": "palshalini069@gmail.com",
  "subject": "[RFP:RFP-0001] Proposal",
  "text": "We offer 50 laptops at 90000 rupees each and 20 monitors 15000 rupees each. Delivery in 15 days. Warranty 2.5 years."
}'

2️⃣ Vendor 1 (Cheaper)

curl --location 'http://localhost:4000/api/email/inbound' \
--header 'Content-Type: application/json' \
--data-raw '{
  "from": "shalini069pal@gmail.com",
  "subject": "[RFP:RFP-0001] Proposal",
  "text": "We offer 50 laptops at 80000 rupees each and 20 monitors 20000 rupees each. Delivery in 18 days. Warranty 2 years."
}'

🧮 Scoring Logic (Backend)
costScore = 100000 / totalCost
deliveryScore = 500 / deliveryDays
warrantyScore = warrantyYears * 10
penalty = (4 - completenessScore) * 5

finalScore = costScore + deliveryScore + warrantyScore - penalty
Highest score = best vendor.


📌 Notes

Ethereal email is only for testing (emails visible in browser).
AI models sometimes return formatting noise → cleaned automatically.
Regex fallback ensures proposal parsing even when AI fails.

Final Output Example

AI will return:

Best Vendor
Comparison Table
Full Vendor Insights
Final Recommendation
Clear Decision Statement

Example:
Select Shalini Vendor 2 for faster delivery and longer warranty despite the higher cost.

Final Words

This project demonstrates:

Full-stack application 
End-to-end AI integration
Real-time email automation
Smart vendor evaluation & scoring
Clean modular UI
