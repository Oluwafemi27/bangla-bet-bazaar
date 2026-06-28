import { createFileRoute, useNavigate } from "@tanstack/react-router";

function SuperAceGame() {
  const navigate = useNavigate();
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Back button */}
      <button
        onClick={() => navigate({ to: "/slots" })}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 200,
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 30,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(6,8,17,0.85)",
          backdropFilter: "blur(16px)",
          color: "rgba(255,255,255,0.75)", fontSize: 13,
          fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
      >
        ← স্লট
      </button>
      <iframe
        src="https://6a405a4970ec745387fe1dbe.discover.playabl.ai"
        style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
        allow="fullscreen"
        title="Super Ace"
      />
    </div>
  );
}

export const Route = createFileRoute("/superace-game")({
  head: () => ({ meta: [{ title: "Super Ace — বাজি কিং" }] }),
  component: SuperAceGame,
});
