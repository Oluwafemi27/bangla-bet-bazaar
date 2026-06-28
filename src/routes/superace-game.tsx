import { createFileRoute, useNavigate } from "@tanstack/react-router";

function SuperAceGame() {
  const navigate = useNavigate();
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column" }}>
      <button
        onClick={() => navigate({ to: "/slots" })}
        style={{
          position: "absolute", top: 12, left: 12, zIndex: 200,
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 30,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(6,8,17,0.9)",
          backdropFilter: "blur(16px)",
          color: "rgba(255,255,255,0.85)", fontSize: 13,
          fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        ← স্লট
      </button>
      <iframe
        src="https://6a405a4970ec745387fe1dbe.discover.playabl.ai?hideBadge=true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
        allow="fullscreen; autoplay"
        allowFullScreen
        title="Super Ace"
      />
    </div>
  );
}

export const Route = createFileRoute("/superace-game")({
  head: () => ({ meta: [{ title: "Super Ace — বাজি কিং" }] }),
  component: SuperAceGame,
});
