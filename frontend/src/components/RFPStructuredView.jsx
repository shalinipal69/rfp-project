import React from "react";

export default function RFPStructuredView({ data }) {
  if (!data) return null;

  return (
    <div
      style={{
        background: "#fdfdfd",
        padding: 20,
        borderRadius: 8,
        border: "1px solid #eee",
        marginBottom: 25,
      }}
    >
      {/* TITLE */}
      <h3 style={{ marginBottom: 10 }}>{data.title || "RFP Details"}</h3>

      {/* ITEMS */}
      {data.items?.length > 0 ? (
        <>
          <h4>Items Requested</h4>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 15,
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th style={cellTh}>Item</th>
                <th style={cellTh}>Quantity</th>
                <th style={cellTh}>Specs</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td style={cellTd}>{item.name}</td>
                  <td style={cellTd}>{item.quantity}</td>
                  <td style={cellTd}>
                    {item.specs
                      ? Object.entries(item.specs)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No structured items extracted by AI.</p>
      )}

      {/* BUDGET */}
      {data.budget && (
        <p>
          <b>Budget:</b>{" "}
          {data.budget.amount
            ? `${data.budget.amount.toLocaleString()}`
            : "—"}{" "}
          {data.budget.currency ? `(${data.budget.currency})` : ""}
        </p>
      )}

      {/* DELIVERY */}
      <p>
        <b>Delivery Required:</b>{" "}
        {data.delivery_days ? `${data.delivery_days} days` : "—"}
      </p>
      <p>
        <b>Payment Terms:</b> 
        {data.payment_terms || "—"}
      </p>
      <p>
        <b>Warranty:</b> 
        {data.warranty || "—"}
      </p>
    </div>
  );
}

const cellTh = {
  padding: "8px",
  borderBottom: "2px solid #ddd",
  textAlign: "left",
};

const cellTd = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};
