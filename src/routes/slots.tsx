import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Dice5 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/slots")({
  head: () => ({ meta: [{ title: "স্লট মেশিন — বাজি কিং" }] }),
  component: Slots,
});

const slotGames = [
  { name: "মেগা ফরচুন", tag: "megawin", emoji: "💎" },
  { name: "বুক অফ ডেড", tag: "popular", emoji: "📕" },
  { name: "স্টারবার্স্ট", tag: "popular", emoji: "⭐" },
  { name: "গোল্ড রাশ", tag: "new", emoji: "🪙" },
  { name: "ড্রাগন গোল্ড", tag: "popular", emoji: "🐉" },
  { name: "ফ্রুট পার্টি", tag: "popular", emoji: "🍉" },
  { name: "সুইট বনানজা", tag: "megawin", emoji: "🍬" },
  { name: "ওল্ফ গোল্ড", tag: "new", emoji: "🐺" },
  { name: "ফায়ার জোকার", tag: "popular", emoji: "🔥" },
  { name: "রিল কিং", tag: "megawin", emoji: "👑" },
  { name: "লাকি লেডি", tag: "new", emoji: "🍀" },
  { name: "নাইট অফ ফর্চুন", tag: "popular", emoji: "🌙" },
];

function Slots() {
  const [filter, setFilter] = useState<"all" | "popular" | "new" | "megawin">("all");
  const filtered = filter === "all" ? slotGames : slotGames.filter((s) => s.tag === filter);
  const filters = [
    { id: "all", label: "সব" },
    { id: "popular", label: "জনপ্রিয়" },
    { id: "new", label: "নতুন" },
    { id: "megawin", label: "মেগাউইন" },
  ] as const;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Dice5 className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">স্লট মেশিন</h1>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${filter === f.id ? "bg-gold-gradient text-gold-foreground" : "bg-secondary text-muted-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((g, i) => (
            <button key={i} className="rounded-xl border border-border/60 bg-card-gradient p-4 hover:gold-border hover:glow-gold text-left">
              <div className="aspect-square rounded-lg bg-secondary/40 flex items-center justify-center text-6xl mb-3">{g.emoji}</div>
              <div className="font-display">{g.name}</div>
              <div className="text-xs text-gold mt-1">খেলুন →</div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
