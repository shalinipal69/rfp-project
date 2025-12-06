import React from "react";

export default function ComparisonTable({ comparison }) {
  if (!comparison) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Detailed Comparison Table</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 10,
          fontSize: 16,
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5", height: "35px" }}>
            <th>Vendor</th>
            <th>Total Cost</th>
            <th>Delivery</th>
            <th>Warranty</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {comparison.comparisonTable.map((row, index) => (
            <tr key={index} style={{ height: "35px" }}>
              <td style={{ textAlign: "center" }}>{row.vendor}</td>
              <td style={{ textAlign: "center" }}>
                {row.totalCost?.toLocaleString() ?? "—"}
				{row.currency ?? "-"}
              </td>
              <td style={{ textAlign: "center" }}>
                {row.delivery ?? "—"} days
              </td>
              <td style={{ textAlign: "center" }}>
                {row.warranty ?? "—"} yrs
              </td>
              <td style={{ textAlign: "center" }}>
                {row.score?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
