import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import RFPStructuredView from "../components/RFPStructuredView";
import VendorProposalCard from "../components/VendorProposalCard";
import ComparisonTable from "../components/ComparisonTable";
import AIRecommendation from "../components/AIRecommendation";

export default function RFPDetail() {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [comparison, setComparison] = useState(null);

  const base = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    axios.get(base + `/api/rfps/${id}`).then((res) => setRfp(res.data));
  }, [id]);

  async function compare() {
    const res = await axios.get(base + `/api/rfps/${id}/compare`);
    setComparison(res.data);
  }

  if (!rfp) return <div>Loading...</div>;

  /* ----- SAFE PARSE STRUCTURED JSON ------ */
  let parsed = rfp.structuredJson;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = { error: "Invalid JSON", raw: rfp.structuredJson };
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>RFP Details</h2>
      <p><b>ID:</b> {rfp.id}</p>

      {/* ================ AI PARSED STRUCTURE ================= */}
      <h3>AI Parsed RFP Structure</h3>
      <div
        style={{
          background: "#fafafa",
          padding: 20,
          borderRadius: 8,
          border: "1px solid #eee",
          marginBottom: 40,
        }}
      >
        <RFPStructuredView data={parsed} />
      </div>

      {/* ================ VENDOR PROPOSALS ================= */}
      <h3>Vendor Proposals</h3>

      {rfp.proposals.length === 0 && (
        <p style={{ opacity: 0.7 }}>No proposals received yet.</p>
      )}

      {rfp.proposals.map((p) => {
        let extracted = {};

        try {
          extracted = JSON.parse(p.extractedJson);
        } catch {
          extracted = { raw: p.extractedJson };
        }

        return (
          <VendorProposalCard
            key={p.id}
            vendorName={p.vendor?.name}
            extracted={extracted}
          />
        );
      })}

      {/* ================ COMPARE BUTTON ================= */}
      <button
        onClick={compare}
        style={{
          marginTop: 20,
          padding: "12px 20px",
          background: "black",
          color: "white",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
         Compare Proposals (AI)
      </button>

      {/* ================ AI COMPARISON TABLE ================= */}
      {comparison && <ComparisonTable comparison={comparison} />}

      {/* ================ AI RECOMMENDATION ================= */}
      {comparison && <AIRecommendation comparison={comparison} />}
    </div>
  );
}
