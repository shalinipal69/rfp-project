import React from "react";

export default function AIRecommendation({ comparison }) {
  if (!comparison) return null;

  const summary = comparison.aiSummary;

  return (
    <div
      style={{
        marginTop: 40,
        padding: 20,
        background: "#f8f8ff",
        borderRadius: 8,
        border: "1px solid #ddd",
      }}
    >
      <h2>AI Recommendation</h2>

      <h3>Best Vendor: {comparison.bestVendor}</h3>

      <p style={{ marginTop: 10 }}>
        {summary?.summary || "No summary available"}
      </p>

      <h4 style={{ marginTop: 20 }}>Recommendation</h4>
      <p>{summary?.recommendation}</p>

      <h4 style={{ marginTop: 20 }}>Final Decision</h4>
      <p>{summary?.decision}</p>

      {/* Vendor Strengths & Weaknesses */}
      {summary?.per_vendor && (
        <>
          <h3 style={{ marginTop: 30 }}>Vendor Insights</h3>

          {Object.entries(summary.per_vendor).map(([vendor, info]) => (
            <div
              key={vendor}
              style={{
                padding: 15,
                border: "1px solid #eee",
                borderRadius: 8,
                background: "#fff",
                marginTop: 15,
              }}
            >
              <h4>{vendor}</h4>

              <p><b>Strengths:</b></p>
              <ul>
                {info.strengths?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>

              <p><b>Weaknesses:</b></p>
              <ul>
                {info.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
