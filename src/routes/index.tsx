import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")(
  { component: ComingSoon }
);

function ComingSoon() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0a",
      fontFamily: "sans-serif",
    }}>
      <h1 style={{
        color: "#f5a623",
        fontSize: "2.5rem",
        fontWeight: "bold",
        letterSpacing: "0.05em",
        textAlign: "center",
      }}>
        Reply DM
      </h1>
    </div>
  );
}
