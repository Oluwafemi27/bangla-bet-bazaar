import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Dice5 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/slots")({
  head: () => ({ meta: [{ title: "স্লট মেশিন — বাজি কিং" }] }),
  component: Slots,
});

const slotGames = [
  { name: "Crazy777", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/0037-20e3.svg", multiplier: "3333x", provider: "JILI", color: "#ef4444" },
  { name: "Super Ace", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f0cf.svg", multiplier: "1500x", provider: "JILI", color: "#3b82f6" },
  { name: "Crazy Hunter", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f3af.svg", multiplier: "2000x", provider: "JILI", color: "#f59e0b" },
  { name: "Fortune Gems", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f48e.svg", multiplier: "375x", provider: "JILI", color: "#06b6d4" },
  { name: "Golden Empire", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f451.svg", multiplier: "2000x", provider: "JILI", color: "#f0c040" },
  { name: "Lucky Coming", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f340.svg", multiplier: "1111x", provider: "JILI", color: "#10b981" },
  { name: "Pharaoh Treasure", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f3fa.svg", multiplier: "5000x", provider: "JILI", color: "#d97706" },
  { name: "Boxing King", tag: "hot", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f94a.svg", multiplier: "2000x", provider: "JILI", color: "#ef4444" },
  { name: "মেগা ফরচুন", tag: "megawin", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f4b0.svg", multiplier: "500x", provider: "Popular", color: "#f0c040" },
  { name: "বুক অফ ডেড", tag: "popular", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f4d6.svg", multiplier: "250x", provider: "Popular", color: "#8b5cf6" },
  { name: "স্টারবার্স্ট", tag: "popular", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/2b50.svg", multiplier: "200x", provider: "Popular", color: "#f59e0b" },
  { name: "গোল্ড রাশ", tag: "new", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f947.svg", multiplier: "300x", provider: "New", color: "#f0c040" },
  { name: "ড্রাগন গোল্ড", tag: "popular", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f409.svg", multiplier: "400x", provider: "Popular", color: "#ef4444" },
  { name: "ফ্রুট পার্টি", tag: "popular", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f349.svg", multiplier: "150x", provider: "Popular", color: "#10b981" },
  { name: "সুইট বনানজা", tag: "megawin", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f36d.svg", multiplier: "350x", provider: "Popular", color: "#ec4899" },
  { name: "ওল্ফ গোল্ড", tag: "new", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f43a.svg", multiplier: "280x", provider: "New", color: "#6366f1" },
  { name: "ফায়ার জোকার", tag: "popular", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f0cf.svg", multiplier: "220x", provider: "Popular", color: "#ef4444" },
  { name: "রিল কিং", tag: "megawin", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f451.svg", multiplier: "600x", provider: "Popular", color: "#f0c040" },
  { name: "লাকি লেডি", tag: "new", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f340.svg", multiplier: "180x", provider: "New", color: "#10b981" },
  { name: "নাইট অফ ফর্চুন", tag: "popular", logo: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f319.svg", multiplier: "310x", provider: "Popular", color: "#8b5cf6" },
];

function Slots() {
  const [filter, setFilter] = useState<"all" | "hot" | "popular" | "new" | "megawin">("all");
  const navigate = useNavigate();
  const filtered = filter === "all" ? slotGames : slotGames.filter((s) => s.tag === filter);
  const filters = [
    { id: "all", label: "সব" },
    { id: "hot", label: "HOT" },
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
            <button key={i} onClick={() => navigate({ to: "/slots/play" })}
              className="rounded-xl border border-border/60 bg-card-gradient p-3 hover:gold-border hover:glow-gold text-left relative overflow-hidden group">
              {g.tag === "hot" && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center gap-0.5">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M12 2c0 0-4 4-4 9a4 4 0 0 0 8 0c0-5-4-9-4-9zm0 14a2 2 0 0 1-2-2c0-3 2-6 2-6s2 3 2 6a2 2 0 0 1-2 2z"/></svg>
                  HOT
                </div>
              )}
              {g.tag === "megawin" && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center gap-0.5">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  WIN
                </div>
              )}
              {g.tag === "new" && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
                  NEW
                </div>
              )}
              <div className="aspect-square rounded-lg bg-secondary/40 flex items-center justify-center mb-2 relative overflow-hidden"
                style={{ background: `radial-gradient(ellipse at center, ${g.color}22, transparent)`, border: `1px solid ${g.color}33` }}>
                <img
                  src={g.logo}
                  alt={g.name}
                  className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute top-1 left-1 text-white text-[9px] font-bold px-1 rounded"
                  style={{ background: `${g.color}cc` }}>
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
