import React from "react";

export default function VendorProposalCard({ vendorName, extracted }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        marginBottom: 25,
        padding: 20,
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <h3>{vendorName}</h3>

      {/* ---------------- ITEM BREAKDOWN ---------------- */}
      {Array.isArray(extracted.items) && extracted.items.length > 0 && (
        <>
          <h4 style={{ marginTop: 15 }}>Item Breakdown</h4>
          {extracted.items.map((it, idx) => (
            <div
              key={idx}
              style={{
                padding: 10,
                marginBottom: 10,
                border: "1px solid #eee",
                borderRadius: 8,
              }}
            >
              <p><b>Item:</b> {it.item}</p>
              <p><b>Unit Price:</b> {it.unit_price}</p>
              <p><b>Quantity:</b> {it.quantity}</p>
            </div>
          ))}
        </>
      )}

      {/* ---------------- MAIN DETAILS TABLE ---------------- */}
      <h4 style={{ marginTop: 20 }}>Extracted Proposal Details</h4>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 10,
        }}
      >
        <tbody>
          <tr>
            <td><b>Total Cost</b></td>
            <td>
              {extracted.total_cost ?? "—"}{" "}
              {extracted.currency ? `(${extracted.currency})` : ""}
            </td>
          </tr>

          <tr>
            <td><b>Delivery</b></td>
            <td>
              {extracted.delivery_days
                ? `${extracted.delivery_days} days`
                : "—"}
            </td>
          </tr>

          <tr>
            <td><b>Warranty</b></td>
            <td>
              {extracted.warranty_years
                ? `${extracted.warranty_years} years`
                : "—"}
            </td>
          </tr>

        </tbody>
      </table>

      {/* ---------------- RAW MESSAGE ---------------- */}
      {extracted.raw && (
        <>
          <h4 style={{ marginTop: 20 }}>Raw Vendor Message</h4>
          <pre
            style={{
              background: "#f6f6f6",
              padding: 15,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {extracted.raw}
          </pre>
        </>
      )}
    </div>
  );
}
