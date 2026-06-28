import { createFileRoute } from "@tanstack/react-router";
import { BottleCallGame } from "@/components/bottle-call/BottleCallGame";

export const Route = createFileRoute("/bottle-call-game")({
  head: () => ({
    meta: [
      { title: "Bottle Call — Spin & Predict" },
      { name: "description", content: "Call the bottle: heads or tails. Spin, predict and chain streaks." },
    ],
  }),
  component: BottleCallGame,
});
