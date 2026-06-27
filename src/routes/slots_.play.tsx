import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import SlotGames from "@/pages/SlotGames";

export const Route = createFileRoute("/slots/play")({
  head: () => ({ meta: [{ title: "স্লট গেম — বাজি কিং" }] }),
  component: SlotGamePage,
});

function SlotGamePage() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => navigate({ to: "/slots" })}
          style={{
            position: "absolute", top: 12, left: 12, zIndex: 100,
            padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 13,
            fontWeight: 700, cursor: "pointer", backdropFilter: "blur(10px)",
          }}
        >
          ← স্লট
        </button>
        <SlotGames />
      </div>
    </AppShell>
  );
}
