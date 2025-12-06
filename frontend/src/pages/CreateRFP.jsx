import React, { useState } from "react";
import axios from "axios";

export default function CreateRFP() {
  const [text, setText] = useState("");
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(false);

  const base = import.meta.env.VITE_API_URL || "http://localhost:4000";

  async function generate() {
    if (!text.trim()) {
      alert("Please describe your RFP before generating");
      return;
    }

    setLoading(true);
    setRfp(null);

    try {
      const res = await axios.post(base + "/api/rfps", { text });
      setRfp(res.data);
    } catch (e) {
      alert("Error: " + (e?.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: 20,
        background: "#fafafa",
        borderRadius: 10,
        border: "1px solid #eee",
        marginTop: 20,
      }}
    >
      <h2 style={{ marginBottom: 10 }}>Create RFP</h2>

      <p style={{ opacity: 0.7, marginBottom: 15 }}>
        Describe your requirement and let AI generate a structured RFP.
      </p>

      {/* ---------------- TEXTAREA ---------------- */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Example:  
I need 50 laptops with 8GB RAM, delivery within 16 days, budget 5,50,000 INR."
        rows={6}
        style={{
          width: "100%",
          padding: 15,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 15,
          outline: "none",
          resize: "vertical",
          background: "#fff",
        }}
      />

      {/* ---------------- BUTTON ---------------- */}
      <button
        onClick={generate}
        disabled={loading}
        style={{
          marginTop: 15,
          padding: "12px 20px",
          background: loading ? "#777" : "black",
          color: "white",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 16,
          border: "none",
        }}
      >
        {loading ? "Generating..." : " Generate RFP"}
      </button>

      {/* ---------------- RESULT CARD ---------------- */}
      {rfp && (
  <div
    style={{
      marginTop: 25,
      padding: 20,
      background: "#fff",
      borderRadius: 10,
      border: "1px solid #eee",
    }}
  >
    <h3>RFP Generated Successfully </h3>

    <p>
      <b>RFP ID:</b> {rfp.id}
    </p>

    {/* ---- PARSE STRUCTURED JSON ---- */}
    {(() => {
      let parsed = rfp.structuredJson;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = { error: "Invalid JSON", raw: rfp.structuredJson };
        }
      }

      return (
        <>
          <h4 style={{ marginTop: 20 }}>AI Structured RFP Summary</h4>

          <div
            style={{
              background: "#fafafa",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          >
            <p><b>Title:</b> {parsed.title || "—"}</p>

            {parsed.items?.length > 0 && (
              <>
                <p><b>Items:</b></p>
                <ul>
                  {parsed.items.map((it, i) => (
                    <li key={i}>
                      {it.quantity} × {it.name}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p>
              <b>Budget:</b>{" "}
              {parsed.budget
                ? `${parsed.budget.amount} ${parsed.budget.currency}`
                : "—"}
            </p>

            <p><b>Delivery Days:</b> {parsed.delivery_days || "—"}</p>
            <p><b>Payment Terms:</b> {parsed.payment_terms || "—"}</p>
            <p><b>Warranty:</b> {parsed.warranty || "—"}</p>
          </div>

          {/* RAW JSON VIEW */}
          <details style={{ marginTop: 15 }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              Show Raw JSON
            </summary>

            <pre
              style={{
                background: "#f6f6f6",
                padding: 15,
                borderRadius: 8,
                fontSize: 14,
                whiteSpace: "pre-wrap",
                border: "1px solid #ddd",
                marginTop: 10,
              }}
            >
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </details>
        </>
      );
    })()}
  </div>
)}


    </div>
  );
}
