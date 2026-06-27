import { createFileRoute } from "@tanstack/react-router";
import SlotGames from "@/pages/SlotGames";

export const Route = createFileRoute("/slots/play")({
  head: () => ({ meta: [{ title: "স্লট গেম — বাজি কিং" }] }),
  component: SlotGames,
});
