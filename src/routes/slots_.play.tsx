import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SlotGames from "@/pages/SlotGames";

export const Route = createFileRoute("/slots/play")({
  head: () => ({ meta: [{ title: "স্লট গেম — বাজি কিং" }] }),
  component: SlotGamePage,
});

function SlotGamePage() {
  const navigate = useNavigate();
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
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
      <SlotGames />
    </div>
  );
}
