import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Vendors() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [list, setList] = useState([]);

  const base = import.meta.env.VITE_API_URL || "http://localhost:4000";

  async function fetch() {
    const res = await axios.get(base + "/api/vendors");
    setList(res.data);
  }

  useEffect(() => {
    fetch();
  }, []);

  async function add() {
    if (!name.trim() || !email.trim()) {
      alert("Please enter both name and email");
      return;
    }
    try {
      await axios.post(base + "/api/vendors", { name, email });
      setName("");
      setEmail("");
      fetch();
    } catch (e) {
      alert("Error adding vendor");
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
      <h2 style={{ marginBottom: 15 }}>Vendor Directory</h2>

      {/* ---------- Input Section ---------- */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Vendor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 10,
            flex: 1,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 15,
          }}
        />
        <input
          placeholder="Vendor Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 10,
            flex: 1,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 15,
          }}
        />
        <button
          onClick={add}
          style={{
            padding: "10px 18px",
            background: "black",
            color: "white",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 15,
            border: "none",
          }}
        >
          Add
        </button>
      </div>

      {/* ---------- Vendor List ---------- */}
      <div>
        {list.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No vendors added yet.</p>
        ) : (
          list.map((v) => (
            <div
              key={v.id}
              style={{
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "white",
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
              style={{ 
                width: "50%",
                display: "flex",
                justifyContent: "space-between"
                 }}>
                <div style={{ fontSize: 16, fontWeight: "bold" }}>{v.name}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{v.email}</div>
              </div>
              <div
                style={{
                  color: "white",
                  background: "#4A90E2",
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 13,
                  alignSelf: "center",
                }}
              >
                {v.id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
