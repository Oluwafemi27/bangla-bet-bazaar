import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/bottle-call")({
  head: () => ({ meta: [{ title: "বোতল কল — বাজি কিং" }] }),
  component: BottleCall,
});

function BottleCall() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0e1a",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Back bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          background: "#0a0e1a",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
          minHeight: "44px",
        }}
      >
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
        <span
          style={{
            marginLeft: "auto",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          🍾 বোতল কল
        </span>
      </div>

      {/* Game iframe */}
      <iframe
        src="https://6a3383d32ebed4f21454a908.discover.playabl.ai/?hideBadge=true"
        title="Bottle Call"
        style={{
          flex: 1,
          width: "100%",
          border: "none",
          display: "block",
          minHeight: 0,
        }}
        allow="autoplay; fullscreen; clipboard-write; accelerometer; gyroscope"
        allowFullScreen
      />
    </div>
  );
}
