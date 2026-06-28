import { createFileRoute } from "@tanstack/react-router";
import { Component, type ReactNode } from "react";
import { BottleCallGame } from "@/components/bottle-call/BottleCallGame";

class BottleCallErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e?.message || String(e) }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, textAlign: "center", color: "#ff6b6b", background: "#1a1a1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Bottle Call Game Error
        </div>
        <div style={{ fontSize: 12, opacity: .7, marginBottom: 16, fontFamily: "monospace", wordBreak: "break-all", maxWidth: 400 }}>
          {this.state.error}
        </div>
        <button onClick={() => this.setState({ error: null })}
          style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #ff6b6b",
            background: "rgba(255,107,107,.1)", color: "#ff6b6b", cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
    return this.props.children;
  }
}

function BottleCallGameWithErrorBoundary() {
  return (
    <BottleCallErrorBoundary>
      <BottleCallGame />
    </BottleCallErrorBoundary>
  );
}

export const Route = createFileRoute("/bottle-call-game")({
  head: () => ({
    meta: [
      { title: "Bottle Call — Spin & Predict" },
      { name: "description", content: "Call the bottle: heads or tails. Spin, predict and chain streaks." },
    ],
  }),
  component: BottleCallGameWithErrorBoundary,
});
