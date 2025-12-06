import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function RFPList() {
  const [list, setList] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState({});
  const [sendingStatus, setSendingStatus] = useState({}); // NEW: per-RFP button status

  const base = import.meta.env.VITE_API_URL || "http://localhost:4000";

  async function fetchRFPs() {
    const res = await axios.get(base + "/api/rfps");
    setList(res.data);

    const init = {};
    res.data.forEach((r) => {
      init[r.id] = {};
      vendors.forEach((v) => (init[r.id][v.id] = false));
    });
    setSelected(init);
  }

  async function fetchVendors() {
    const res = await axios.get(base + "/api/vendors");
    setVendors(res.data);
  }

  useEffect(() => {
    fetchVendors().then(fetchRFPs);
  }, []);

  function toggleVendor(rfpId, vendorId) {
    setSelected((prev) => ({
      ...prev,
      [rfpId]: {
        ...prev[rfpId],
        [vendorId]: !prev[rfpId]?.[vendorId],
      },
    }));
  }

  async function sendRfp(rfpId) {
    const vendorIds = Object.keys(selected[rfpId]).filter(
      (vId) => selected[rfpId][vId]
    );

    if (vendorIds.length === 0) {
      alert("Select at least one vendor!");
      return;
    }

    // set status → "loading"
    setSendingStatus((prev) => ({
      ...prev,
      [rfpId]: "loading",
    }));

    try {
      await axios.post(base + `/api/rfps/${rfpId}/send`, { vendorIds });

      // set status → "success"
      setSendingStatus((prev) => ({
        ...prev,
        [rfpId]: "success",
      }));

      setTimeout(() => {
        setSendingStatus((prev) => ({
          ...prev,
          [rfpId]: null,
        }));
      }, 2000);
    } catch (error) {
      // set status → "error"
      setSendingStatus((prev) => ({
        ...prev,
        [rfpId]: "error",
      }));
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2 style={{ marginBottom: 20 }}>RFPs</h2>

      {list.map((r) => {
        const status = sendingStatus[r.id];

        return (
          <div
            key={r.id}
            style={{
              padding: 20,
              marginBottom: 20,
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 10,
              boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <Link
  to={`/rfp/${r.id}`}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 15px",
    background: "#f7f7f7",
    borderRadius: 8,
    border: "1px solid #e0e0e0",
    textDecoration: "none",
    color: "blueviolet",
    marginBottom: "10px",
    transition: "0.2s",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "#f7f7f7")}
>
  <span style={{ fontSize: 18, fontWeight: "bold" }}>
    {r.structuredJson?.title || r.originalText.slice(0, 60)}
  </span>

  <span style={{ fontSize: 20, opacity: 0.6 }}>→</span>
</Link>


            <p style={{ marginTop: 5, opacity: 0.7 }}>
              RFP ID: <b>{r.id}</b>
            </p>

            <h4 style={{ marginTop: 20, marginBottom: 10 }}>
              📨 Select Vendors
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "10px",
              }}
            >
              {vendors.map((v) => (
                <label
                  key={v.id}
                  style={{
                    padding: 10,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    background:
                      selected[r.id]?.[v.id] === true ? "#f0f8ff" : "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected[r.id]?.[v.id] || false}
                    onChange={() => toggleVendor(r.id, v.id)}
                  />
                  <div>
                    <b>{v.name}</b>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>{v.email}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* ---------------- SEND BUTTON with STATES ---------------- */}
            <button
              onClick={() => sendRfp(r.id)}
              disabled={status === "loading"}
              style={{
                marginTop: 10,
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                background:
                  status === "success"
                    ? "green"
                    : status === "error"
                    ? "red"
                    : "black",
                color: "white",
                transition: ".2s",
              }}
            >
              {status === "loading" && "Sending..."}
              {status === "success" && "Sent ✓"}
              {status === "error" && "Retry!"}
              {!status && "Send RFP"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
