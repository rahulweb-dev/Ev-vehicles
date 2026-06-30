"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚡</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#111827", margin: "0 0 0.5rem" }}>EV News India</h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>A critical error occurred. Please reload the page.</p>
          <button
            onClick={reset}
            style={{ background: "#16a34a", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem 2rem", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
