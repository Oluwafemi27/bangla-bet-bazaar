import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Dice5 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/slots")({
  head: () => ({ meta: [{ title: "স্লট মেশিন — বাজি কিং" }] }),
  component: Slots,
});

const slotGames = [
  // JILI games from screenshots
  { name: "Crazy777", tag: "hot", emoji: "7️⃣", multiplier: "3333x", provider: "JILI" },
  { name: "Super Ace", tag: "hot", emoji: "🃏", multiplier: "1500x", provider: "JILI" },
  { name: "Crazy Hunter", tag: "hot", emoji: "🎯", multiplier: "2000x", provider: "JILI" },
  { name: "Fortune Gems", tag: "hot", emoji: "💎", multiplier: "375x", provider: "JILI" },
  { name: "Golden Empire", tag: "hot", emoji: "👑", multiplier: "2000x", provider: "JILI" },
  { name: "Lucky Coming", tag: "hot", emoji: "🐘", multiplier: "1111x", provider: "JILI" },
  { name: "Pharaoh Treasure", tag: "hot", emoji: "🏛️", multiplier: "5000x", provider: "JILI" },
  { name: "Boxing King", tag: "hot", emoji: "🥊", multiplier: "2000x", provider: "JILI" },
  // Original games
  { name: "মেগা ফরচুন", tag: "megawin", emoji: "💰", multiplier: "500x", provider: "Popular" },
  { name: "বুক অফ ডেড", tag: "popular", emoji: "📕", multiplier: "250x", provider: "Popular" },
  { name: "স্টারবার্স্ট", tag: "popular", emoji: "⭐", multiplier: "200x", provider: "Popular" },
  { name: "গোল্ড রাশ", tag: "new", emoji: "🪙", multiplier: "300x", provider: "New" },
  { name: "ড্রাগন গোল্ড", tag: "popular", emoji: "🐉", multiplier: "400x", provider: "Popular" },
  { name: "ফ্রুট পার্টি", tag: "popular", emoji: "🍉", multiplier: "150x", provider: "Popular" },
  { name: "সুইট বনানজা", tag: "megawin", emoji: "🍬", multiplier: "350x", provider: "Popular" },
  { name: "ওল্ফ গোল্ড", tag: "new", emoji: "🐺", multiplier: "280x", provider: "New" },
  { name: "ফায়ার জোকার", tag: "popular", emoji: "🔥", multiplier: "220x", provider: "Popular" },
  { name: "রিল কিং", tag: "megawin", emoji: "👑", multiplier: "600x", provider: "Popular" },
  { name: "লাকি লেডি", tag: "new", emoji: "🍀", multiplier: "180x", provider: "New" },
  { name: "নাইট অফ ফর্চুন", tag: "popular", emoji: "🌙", multiplier: "310x", provider: "Popular" },
];

function Slots() {
  const [filter, setFilter] = useState<"all" | "hot" | "popular" | "new" | "megawin">("all");
  const filtered = filter === "all" ? slotGames : slotGames.filter((s) => s.tag === filter);
  const filters = [
    { id: "all", label: "সব" },
    { id: "hot", label: "🔥 হট" },
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
            <button key={i} className="rounded-xl border border-border/60 bg-card-gradient p-3 hover:gold-border hover:glow-gold text-left relative overflow-hidden">
              {g.tag === "hot" && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
                  🔥
                </div>
              )}
              <div className="aspect-square rounded-lg bg-secondary/40 flex items-center justify-center text-5xl mb-2 relative">
                {g.emoji}
                <div className="absolute top-1 left-1 bg-red-600/90 text-white text-[9px] font-bold px-1 rounded">
                  {g.multiplier}
                </div>
              </div>
              <div className="font-display text-sm leading-tight">{g.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{g.provider}</span>
                <span className="text-xs text-gold">খেলুন →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
