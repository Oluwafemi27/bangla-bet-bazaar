import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/bottle-call")({
  head: () => ({ meta: [{ title: "বোতল কল — বাজি কিং" }] }),
  component: BottleCall,
});

const GAME_URL = "https://6a3383d32ebed4f21454a908.discover.playabl.ai/";

function BottleCall() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0e1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      {/* Back */}
      <div style={{ position: "absolute", top: 16, left: 16 }}>
        <Link
          to="/"
          style={{
            color: "#c9a227",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← ফিরে যান
        </Link>
      </div>

      {/* Bottle illustration */}
      <div style={{ fontSize: "80px", marginBottom: "16px", lineHeight: 1 }}>
        🍾
      </div>

      {/* Title */}
      <h1
        style={{
          color: "#ffffff",
          fontSize: "28px",
          fontWeight: 800,
          margin: "0 0 8px",
          textAlign: "center",
        }}
      >
        বোতল কল
      </h1>
      <p
        style={{
          color: "#9ca3af",
          fontSize: "14px",
          margin: "0 0 32px",
          textAlign: "center",
          maxWidth: "260px",
          lineHeight: 1.5,
        }}
      >
        হেডস বা টেইলস কল করুন, বোতল ঘুরান এবং স্ট্রিক তাড়া করুন!
      </p>

      {/* Play button */}
      <a
        href={GAME_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "linear-gradient(135deg, #c9a227, #f0c040)",
          color: "#0a0e1a",
          fontWeight: 800,
          fontSize: "18px",
          padding: "16px 40px",
          borderRadius: "50px",
          textDecoration: "none",
          boxShadow: "0 0 24px rgba(201,162,39,0.5)",
          letterSpacing: "0.02em",
        }}
      >
        ▶ এখনই খেলুন
      </a>

      <p
        style={{
          color: "#4b5563",
          fontSize: "12px",
          marginTop: "16px",
          textAlign: "center",
        }}
      >
        নতুন ট্যাবে খুলবে
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          marginTop: "48px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "24px",
          width: "100%",
          maxWidth: "320px",
          justifyContent: "center",
        }}
      >
        {[
          { label: "ধরন", value: "আর্কেড" },
          { label: "কৌশল", value: "চান্স" },
          { label: "গতি", value: "দ্রুত" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div
              style={{ color: "#c9a227", fontWeight: 700, fontSize: "15px" }}
            >
              {s.value}
            </div>
            <div style={{ color: "#6b7280", fontSize: "11px", marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
