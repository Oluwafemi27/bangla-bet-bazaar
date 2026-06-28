import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback, Component, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Trophy, Flame, PawPrint, Handshake, XCircle, Sparkles, Bomb, Circle } from "lucide-react";

/* ── Game-level error boundary — shows the real JS error instead of blank ── */
class GameErrorBoundary extends Component<
  { children: ReactNode; game: string },
  { error: string | null }
> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e?.message || String(e) }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, textAlign: "center", color: "#ff6b6b" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          {this.props.game} ক্র্যাশ হয়েছে
        </div>
        <div style={{ fontSize: 11, opacity: .7, marginBottom: 16, fontFamily: "monospace", wordBreak: "break-all" }}>
          {this.state.error}
        </div>
        <button onClick={() => this.setState({ error: null })}
          style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #ff6b6b",
            background: "rgba(255,107,107,.1)", color: "#ff6b6b", cursor: "pointer" }}>
          রিসেট
        </button>
      </div>
    );
    return this.props.children;
  }
}


export const Route = createFileRoute("/casino")({
  head: () => ({ meta: [{ title: "ক্যাসিনো — বাজি কিং" }] }),
  component: Casino,
});

/* ══════════════════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════════════════ */
type GameId = "lobby" | "blackjack" | "roulette" | "dragon_tiger";
type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { suit: Suit; value: string; num: number };

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════════ */
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const NUM: Record<string, number> = {
  A: 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10,
};

function makeDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const v of VALUES) d.push({ suit: s, value: v, num: NUM[v] });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function bjTotal(cards: Card[]): number {
  let total = cards.reduce((s, c) => s + c.num, 0);
  let aces = cards.filter((c) => c.value === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

const isRed = (s: Suit) => s === "♥" || s === "♦";

/* ══════════════════════════════════════════════════════════════════════════
   CSS-IN-JS STYLES (injected once)
══════════════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&display=swap');

@keyframes casinoGlow {
  0%,100% { opacity:.7; } 50% { opacity:1; }
}
@keyframes cardDeal {
  from { opacity:0; transform: translateY(-30px) rotate(-8deg) scale(.8); }
  to   { opacity:1; transform: translateY(0)     rotate(0deg)  scale(1); }
}
@keyframes chipBounce {
  0%,100% { transform:scale(1); }
  50%     { transform:scale(1.12); }
}
@keyframes rouletteSpin {
  from { transform:rotate(0deg); }
  to   { transform:rotate(3600deg); }
}
@keyframes roulletteBall {
  from { transform:rotate(0deg) translateX(90px); }
  to   { transform:rotate(-1800deg) translateX(90px); }
}
@keyframes resultPop {
  0%   { opacity:0; transform:scale(.5) translateY(20px); }
  60%  { transform:scale(1.08) translateY(-4px); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes floatUp {
  0%   { opacity:1; transform:translateY(0); }
  100% { opacity:0; transform:translateY(-60px); }
}
@keyframes pulse-ring {
  0%   { box-shadow:0 0 0 0 rgba(240,192,64,.4); }
  100% { box-shadow:0 0 0 20px rgba(240,192,64,0); }
}
@keyframes tableShine {
  0%,100% { opacity:.04; }
  50%     { opacity:.09; }
}

.casino-font { font-family:'Cinzel',serif; }

.card-enter { animation: cardDeal .35s cubic-bezier(.34,1.56,.64,1) both; }

.chip-active { animation: chipBounce .4s ease infinite; }

.shimmer-text {
  background: linear-gradient(90deg,#f0c040 0%,#fff8d6 40%,#f0c040 60%,#c9870a 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 3s linear infinite;
}

.result-pop { animation: resultPop .5s cubic-bezier(.34,1.56,.64,1) both; }

.glow-pulse { animation: pulse-ring 1.5s ease-out infinite; }

.float-win {
  position:absolute; pointer-events:none;
  animation: floatUp 1.2s ease-out forwards;
  font-size:22px; font-weight:800; color:#00ffb3;
  text-shadow: 0 0 12px #00ffb3;
}

.casino-btn {
  position:relative; overflow:hidden;
  transition: transform .15s, box-shadow .15s;
}
.casino-btn:hover  { transform:translateY(-2px); }
.casino-btn:active { transform:scale(.97); }
.casino-btn::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.15) 50%,transparent 70%);
  transform:translateX(-100%); transition:transform .4s;
}
.casino-btn:hover::after { transform:translateX(100%); }

/* ── Glassmorphism ───────────────────────────────────────────────────── */
.glass {
  background: linear-gradient(155deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.02) 100%);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255,255,255,.09);
  position: relative;
}
.glass::before {
  content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background: linear-gradient(135deg, rgba(255,255,255,.14) 0%, transparent 35%);
  mix-blend-mode: overlay;
}
.glass-edge {
  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -1px 0 rgba(0,0,0,.3);
}

/* ── Neumorphism (soft dual-shadow on the dark surface) ─────────────── */
.neu {
  background: linear-gradient(145deg, #0d1326, #060914);
  box-shadow:
    8px 8px 18px rgba(0,0,0,.55),
    -6px -6px 16px rgba(255,255,255,.025),
    inset 0 1px 0 rgba(255,255,255,.04);
}
.neu-inset {
  background: linear-gradient(145deg, #060914, #0d1326);
  box-shadow:
    inset 5px 5px 12px rgba(0,0,0,.6),
    inset -4px -4px 10px rgba(255,255,255,.02);
}
.neu-btn {
  transition: box-shadow .18s, transform .12s;
}
.neu-btn:active {
  box-shadow: inset 4px 4px 10px rgba(0,0,0,.55), inset -3px -3px 8px rgba(255,255,255,.02);
  transform: scale(.98);
}

/* ── Futuristic glow accents ─────────────────────────────────────────── */
@keyframes borderFlow {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.holo-border {
  position: relative; border-radius: inherit;
}
.holo-border::after {
  content:''; position:absolute; inset:-1.5px; border-radius:inherit; z-index:-1;
  background: linear-gradient(90deg,#f0c040,#00e5ff,#8b5cf6,#f0c040);
  background-size: 300% 100%;
  animation: borderFlow 6s linear infinite;
  opacity: .55; filter: blur(2px);
}
@keyframes neonFlicker {
  0%,100% { filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 14px currentColor); }
  50%     { filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 9px currentColor); }
}
.icon-glow { animation: neonFlicker 2.4s ease-in-out infinite; }

@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
.scan-sheen { position:absolute; inset:0; overflow:hidden; border-radius:inherit; pointer-events:none; }
.scan-sheen::before {
  content:''; position:absolute; left:0; right:0; height:40%;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,.06), transparent);
  animation: scanline 3.5s linear infinite;
}

.game-card { transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s; }
.game-card:hover { transform: translateY(-3px) scale(1.012); }
`;

function InjectStyles() {
  useEffect(() => {
    if (document.getElementById("casino-styles")) return;
    const s = document.createElement("style");
    s.id = "casino-styles";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => { document.getElementById("casino-styles")?.remove(); };
  }, []);
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
   SHARED UI ATOMS
══════════════════════════════════════════════════════════════════════════ */
function PlayingCard({ card, hidden = false, delay = 0 }: { card?: Card; hidden?: boolean; delay?: number }) {
  if (hidden || !card) return (
    <div style={{
      width: 64, height: 90, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(135deg,#1a2744 0%,#0d1635 100%)",
      border: "1.5px solid rgba(100,120,200,.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 18px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)",
      animation: `cardDeal .35s ${delay}s cubic-bezier(.34,1.56,.64,1) both`,
    }}>
      <div style={{
        width: 46, height: 68, borderRadius: 6,
        backgroundImage: "repeating-linear-gradient(45deg,rgba(100,120,200,.12) 0,rgba(100,120,200,.12) 2px,transparent 2px,transparent 8px)",
        border: "1px solid rgba(100,120,200,.2)",
      }} />
    </div>
  );

  const red = isRed(card.suit);
  return (
    <div style={{
      width: 64, height: 90, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(160deg,#ffffff 0%,#f0f0f0 100%)",
      border: "1.5px solid rgba(255,255,255,.2)",
      display: "flex", flexDirection: "column", padding: "5px 7px",
      boxShadow: "0 4px 18px rgba(0,0,0,.6), 0 0 12px rgba(240,192,64,.15)",
      animation: `cardDeal .35s ${delay}s cubic-bezier(.34,1.56,.64,1) both`,
      position: "relative", cursor: "default",
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1, color: red ? "#d11" : "#111", fontFamily: "monospace" }}>
        {card.value}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1, color: red ? "#d11" : "#111" }}>{card.suit}</div>
      <div style={{
        position: "absolute", bottom: 5, right: 7,
        fontSize: 13, fontWeight: 800, color: red ? "#d11" : "#111",
        transform: "rotate(180deg)", lineHeight: 1, fontFamily: "monospace",
      }}>
        {card.value}
      </div>
      <div style={{
        position: "absolute", bottom: 5, right: 7,
        fontSize: 14, color: red ? "#d11" : "#111", lineHeight: 1,
        transform: "rotate(180deg)",
      }}>
        {card.suit}
      </div>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: 28, color: red ? "#d11" : "#111", opacity: .18,
      }}>
        {card.suit}
      </div>
    </div>
  );
}

function ChipRow({ bet, onChip, balance }: { bet: number; onChip: (v: number) => void; balance: number }) {
  const chips = [10, 25, 50, 100, 500];
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
      {chips.map((v) => {
        const colors: Record<number, [string, string]> = {
          10:  ["#3b82f6","#1d4ed8"],
          25:  ["#22c55e","#15803d"],
          50:  ["#f59e0b","#b45309"],
          100: ["#ef4444","#b91c1c"],
          500: ["#8b5cf6","#6d28d9"],
        };
        const [c1, c2] = colors[v];
        return (
          <button
            key={v}
            onClick={() => onChip(v)}
            disabled={balance < v}
            className="casino-btn neu-btn"
            style={{
              width: 54, height: 54, borderRadius: "50%",
              background: `radial-gradient(circle at 32% 28%,${c1},${c2} 70%)`,
              border: `3px dashed rgba(255,255,255,.5)`,
              outline: `3px solid ${c1}99`,
              outlineOffset: "-7px",
              color: "#fff", fontWeight: 800, fontSize: 12,
              boxShadow: `0 6px 16px ${c2}99, 0 0 18px ${c1}55, inset 0 2px 2px rgba(255,255,255,.35), inset 0 -3px 6px rgba(0,0,0,.35)`,
              cursor: balance < v ? "not-allowed" : "pointer",
              opacity: balance < v ? .4 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

function StatPill({ label, value, color = "#f0c040" }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: "rgba(0,0,0,.45)", borderRadius: 10,
      border: `1px solid ${color}22`, padding: "7px 16px", textAlign: "center",
    }}>
      <div style={{ fontSize: 9, color, letterSpacing: 2, marginBottom: 2, opacity: .7 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, textShadow: `0 0 10px ${color}88` }}>{value}</div>
    </div>
  );
}

function TableFelt({ children, accent = "#1a5c2a" }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="glass-edge" style={{
      borderRadius: 22, padding: "25px 21px", position: "relative", overflow: "hidden",
      background: `radial-gradient(ellipse at 50% 30%,${accent} 0%,#0a1a10 100%)`,
      border: "1px solid rgba(255,255,255,.1)",
      boxShadow: `0 0 70px ${accent}55, 0 20px 50px rgba(0,0,0,.5), inset 0 0 40px rgba(0,0,0,.4)`,
    }}>
      {/* Felt texture lines */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 22, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.012) 3px,rgba(255,255,255,.012) 4px)",
        animation: "tableShine 4s ease infinite",
      }} />
      {/* Glass sheen across the top */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 22, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,.08) 0%, transparent 30%)",
      }} />
      {/* Inner oval */}
      <div style={{
        position: "absolute", inset: "10%", borderRadius: "50%",
        border: "1px solid rgba(255,255,255,.08)", pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   GAME LOGOS (SVG — replace emoji icons)
══════════════════════════════════════════════════════════════════════════ */
function BlackjackLogo({ color = "#22c55e", size = 34 }: { color?: string; size?: number }) {
  const id = "bj-grad";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <g transform="translate(24,24) rotate(-12)">
        <rect x="-15" y="-19" width="22" height="30" rx="4" fill="#0a0e1a" stroke={color} strokeWidth="1.4" opacity=".55" />
      </g>
      <g transform="translate(24,24) rotate(8)">
        <rect x="-7" y="-15" width="22" height="30" rx="4" fill="url(#bj-grad)" stroke={color} strokeWidth="1.6" />
        <text x="-1.5" y="-3" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0a0e1a" fontFamily="monospace">21</text>
        <path d="M3 4 L5.5 9 L11 9.6 L7 13.2 L8.2 18.6 L3 15.8 L-2.2 18.6 L-1 13.2 L-5 9.6 L0.5 9 Z" fill={color} opacity=".85" />
      </g>
    </svg>
  );
}

function RouletteLogo({ color = "#ef4444", size = 34 }: { color?: string; size?: number }) {
  const segs = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" fill="#0a0e1a" stroke={color} strokeWidth="1.5" opacity=".9" />
      {Array.from({ length: segs }).map((_, i) => {
        const a1 = (i / segs) * 360;
        const a2 = ((i + 1) / segs) * 360;
        const mid = (a1 + a2) / 2;
        const r1 = 8, r2 = 19;
        const toXY = (a: number, r: number) => [24 + r * Math.cos((a * Math.PI) / 180), 24 + r * Math.sin((a * Math.PI) / 180)];
        const [x1, y1] = toXY(a1, r1), [x2, y2] = toXY(a1, r2), [x3, y3] = toXY(a2, r2), [x4, y4] = toXY(a2, r1);
        const fill = i % 2 === 0 ? color : "#fff8d6";
        return <path key={i} d={`M${x1},${y1} L${x2},${y2} A${r2},${r2} 0 0,1 ${x3},${y3} L${x4},${y4} Z`} fill={fill} opacity={i % 2 === 0 ? 0.9 : 0.18} />;
      })}
      <circle cx="24" cy="24" r="7.5" fill="url(#rl-hub)" stroke={color} strokeWidth="1.4" />
      <defs>
        <radialGradient id="rl-hub" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff8d6" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <circle cx="24" cy="6.5" r="2.1" fill="#fff" opacity=".95" />
    </svg>
  );
}

function DragonTigerLogo({ color = "#8b5cf6", size = 34 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <clipPath id="dt-clip"><circle cx="24" cy="24" r="20" /></clipPath>
        <linearGradient id="dt-d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8a8a" /><stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="dt-t" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#7dd3fc" /><stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20.5" fill="#0a0e1a" stroke={color} strokeWidth="1.4" />
      <g clipPath="url(#dt-clip)">
        <path d="M4 4 L44 4 L4 44 Z" fill="url(#dt-d)" opacity=".9" />
        <path d="M44 44 L4 44 L44 4 Z" fill="url(#dt-t)" opacity=".9" />
        <path d="M4 4 L44 44" stroke="#fff" strokeWidth="1.2" opacity=".5" />
      </g>
      <text x="13" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="serif">D</text>
      <text x="35" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="serif">T</text>
      <circle cx="24" cy="24" r="3.2" fill="#f0c040" stroke="#fff" strokeWidth=".6" />
    </svg>
  );
}

function GameLogo({ id, color, size }: { id: GameId; color?: string; size?: number }) {
  if (id === "blackjack") return <BlackjackLogo color={color} size={size} />;
  if (id === "roulette") return <RouletteLogo color={color} size={size} />;
  if (id === "dragon_tiger") return <DragonTigerLogo color={color} size={size} />;
  return null;
}

/* ── Result badge (replaces emoji in outcome messages) ───────────────── */
type MsgTone = "win" | "lose" | "tie" | "bust" | "info";
type Msg = { tone: MsgTone; text: string } | null;

const TONE_STYLE: Record<MsgTone, { color: string; bg: string; border: string; Icon: any }> = {
  win:  { color: "#00ff88", bg: "rgba(0,255,136,.12)",  border: "rgba(0,255,136,.35)",  Icon: Trophy },
  lose: { color: "#ff6b6b", bg: "rgba(255,60,60,.09)",  border: "rgba(255,60,60,.25)",  Icon: XCircle },
  tie:  { color: "#f0c040", bg: "rgba(240,192,64,.1)",  border: "rgba(240,192,64,.3)",  Icon: Handshake },
  bust: { color: "#ff6b6b", bg: "rgba(255,60,60,.1)",   border: "rgba(255,60,60,.3)",   Icon: Bomb },
  info: { color: "#f0c040", bg: "rgba(240,192,64,.08)", border: "rgba(240,192,64,.2)",  Icon: Sparkles },
};

function ResultBadge({ msg }: { msg: Msg }) {
  if (!msg) return null;
  const { color, bg, border, Icon } = TONE_STYLE[msg.tone];
  return (
    <div className="result-pop glass" style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      textAlign: "center", padding: "10px 20px", borderRadius: 12, marginBottom: 12,
      background: bg, border: `1px solid ${border}`, color, fontSize: 14, fontWeight: 700,
      boxShadow: `0 0 22px ${border}, inset 0 1px 0 rgba(255,255,255,.06)`,
    }}>
      <Icon size={16} className="icon-glow" style={{ color, flexShrink: 0 }} />
      <span>{msg.text}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BLACKJACK
══════════════════════════════════════════════════════════════════════════ */
type BJPhase = "bet" | "play" | "done";

function Blackjack({ balance, setBalance }: { balance: number; setBalance: (n: number) => void }) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [bet, setBet] = useState(0);
  const [phase, setPhase] = useState<BJPhase>("bet");
  const [msg, setMsg] = useState<Msg>(null);
  const [floats, setFloats] = useState<{ id: number; text: string }[]>([]);
  const floatId = useRef(0);
  // Refs to avoid stale closures in finish()
  const balanceRef = useRef(balance);
  const betRef = useRef(bet);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { betRef.current = bet; }, [bet]);

  const addFloat = (text: string) => {
    const id = floatId.current++;
    setFloats((f) => [...f, { id, text }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1200);
  };

  const deal = () => {
    if (bet === 0) { setMsg({ tone: "info", text: "আগে বাজি ধরুন!" }); return; }
    const d = makeDeck();
    const p = [d[0], d[2]];
    const de = [d[1], d[3]];
    setDeck(d.slice(4));
    setPlayer(p);
    setDealer(de);
    setPhase("play");
    setMsg(null);
    if (bjTotal(p) === 21) finish(p, de, d.slice(4), true);
  };

  const finish = useCallback((p: Card[], de: Card[], remaining: Card[], natural = false) => {
    const currentBalance = balanceRef.current;
    const currentBet = betRef.current;
    let dealerHand = [...de];
    let rem = [...remaining];
    while (bjTotal(dealerHand) < 17) {
      dealerHand = [...dealerHand, rem[0]];
      rem = rem.slice(1);
    }
    setDealer(dealerHand);
    setPhase("done");
    const pt = bjTotal(p), dt = bjTotal(dealerHand);
    if (natural && pt === 21) {
      const win = Math.floor(currentBet * 2.5);
      setBalance(currentBalance + win); // balance already had bet deducted
      setMsg({ tone: "win", text: "ব্ল্যাকজ্যাক! ১.৫x জয়!" });
      addFloat(`+৳${win}`);
    } else if (pt > 21) {
      setMsg({ tone: "bust", text: "বাস্ট! হেরে গেলেন।" });
    } else if (dt > 21 || pt > dt) {
      const win = currentBet * 2;
      setBalance(currentBalance + win);
      setMsg({ tone: "win", text: "আপনি জিতেছেন!" });
      addFloat(`+৳${win}`);
    } else if (pt === dt) {
      setBalance(currentBalance + currentBet); // refund bet
      setMsg({ tone: "tie", text: "টাই! বাজি ফেরত।" });
      addFloat("টাই");
    } else {
      setMsg({ tone: "lose", text: "ডিলার জিতেছে।" });
    }
  }, [setBalance]);

  const hit = () => {
    const newCard = deck[0];
    const newPlayer = [...player, newCard];
    const newDeck = deck.slice(1);
    setPlayer(newPlayer);
    setDeck(newDeck);
    if (bjTotal(newPlayer) > 21) finish(newPlayer, dealer, newDeck);
  };

  const stand = () => finish(player, dealer, deck);

  const dbl = () => {
    if (balance < bet) return;
    setBalance(balance - bet);
    setBet((b) => {
      const newBet = b * 2;
      betRef.current = newBet;
      return newBet;
    });
    const newCard = deck[0];
    const newPlayer = [...player, newCard];
    finish(newPlayer, dealer, deck.slice(1));
  };

  const reset = () => {
    setPlayer([]); setDealer([]); setBet(0);
    setPhase("bet"); setMsg(null); setDeck([]);
  };

  const addChip = (v: number) => {
    if (balance < v) return;
    setBet((b) => b + v);
    setBalance(balance - v);
  };

  const pt = bjTotal(player), dt = bjTotal(dealer);
  const won = phase === "done" && (pt <= 21 && (dt > 21 || pt >= dt));

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <TableFelt accent="#1a5c2a">
        {/* Float wins */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
          {floats.map((f) => (
            <div key={f.id} className="float-win" style={{ textAlign: "center" }}>{f.text}</div>
          ))}
        </div>

        {/* Dealer hand */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
            ডিলার {phase === "done" ? `— ${dt}` : ""}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", minHeight: 90 }}>
            {dealer.map((c, i) => (
              <PlayingCard key={i} card={c} hidden={phase === "play" && i === 1} delay={i * 0.1} />
            ))}
            {dealer.length === 0 && [0, 1].map((i) => (
              <div key={i} style={{
                width: 64, height: 90, borderRadius: 10,
                border: "1.5px dashed rgba(255,255,255,.1)",
                background: "rgba(0,0,0,.2)",
              }} />
            ))}
          </div>
        </div>

        {/* Message */}
        <ResultBadge msg={msg} />

        {/* Player hand */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>
            আপনি — {pt > 0 ? pt : ""}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", minHeight: 90 }}>
            {player.map((c, i) => (
              <PlayingCard key={i} card={c} delay={i * 0.1} />
            ))}
            {player.length === 0 && [0, 1].map((i) => (
              <div key={i} style={{
                width: 64, height: 90, borderRadius: 10,
                border: "1.5px dashed rgba(255,255,255,.1)",
                background: "rgba(0,0,0,.2)",
              }} />
            ))}
          </div>
        </div>
      </TableFelt>

      {/* Controls */}
      <div style={{ marginTop: 20 }}>
        {phase === "bet" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: 2, marginBottom: 4 }}>বাজি</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f0c040", textShadow: "0 0 16px #f0c04088" }}>
                ৳{bet}
              </div>
            </div>
            <ChipRow bet={bet} onChip={addChip} balance={balance} />
            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center" }}>
              {bet > 0 && (
                <button className="casino-btn" onClick={() => { setBalance(balance + bet); setBet(0); }} style={{
                  padding: "11px 22px", borderRadius: 10, border: "1px solid rgba(255,255,255,.15)",
                  background: "rgba(255,255,255,.07)", color: "#aaa", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>
                  রিসেট
                </button>
              )}
              <button className="casino-btn" onClick={deal} disabled={bet === 0} style={{
                padding: "11px 32px", borderRadius: 10, border: "none",
                background: bet === 0 ? "rgba(240,192,64,.2)" : "linear-gradient(135deg,#f0c040,#c9870a)",
                color: bet === 0 ? "#888" : "#0a0e1a", fontWeight: 800, fontSize: 14,
                cursor: bet === 0 ? "not-allowed" : "pointer",
                boxShadow: bet > 0 ? "0 0 20px rgba(240,192,64,.4)" : "none",
              }}>
                ডিল করুন
              </button>
            </div>
          </>
        )}

        {phase === "play" && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {[
              { label: "হিট", onClick: hit, color: "#3b82f6", glow: "#3b82f6" },
              { label: "স্ট্যান্ড", onClick: stand, color: "#f0c040", glow: "#f0c040" },
              { label: "ডাবল", onClick: dbl, color: "#22c55e", glow: "#22c55e", disabled: balance < bet || player.length > 2 },
            ].map(({ label, onClick, color, glow, disabled }) => (
              <button key={label} className="casino-btn" onClick={onClick} disabled={disabled} style={{
                padding: "12px 24px", borderRadius: 10, border: `1.5px solid ${color}55`,
                background: `rgba(${color === "#f0c040" ? "240,192,64" : color === "#3b82f6" ? "59,130,246" : "34,197,94"},.12)`,
                color, fontWeight: 800, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? .4 : 1,
                boxShadow: `0 0 16px ${glow}33`,
              }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center" }}>
            <button className="casino-btn glow-pulse" onClick={reset} style={{
              padding: "13px 40px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#f0c040,#c9870a)",
              color: "#0a0e1a", fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: "0 0 24px rgba(240,192,64,.45)",
            }}>
              আবার খেলুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROULETTE
══════════════════════════════════════════════════════════════════════════ */
const ROULETTE_NUMS = [
  0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26
];
const RED_NUMS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

type RouletteBet = { type: string; label: string; payout: number; nums: number[] };

const ROULETTE_BETS: RouletteBet[] = [
  { type: "red",   label: "লাল",     payout: 2, nums: RED_NUMS },
  { type: "black", label: "কালো",    payout: 2, nums: Array.from({length:36},(_,i)=>i+1).filter(n=>!RED_NUMS.includes(n)) },
  { type: "even",  label: "জোড়",    payout: 2, nums: Array.from({length:36},(_,i)=>i+1).filter(n=>n%2===0) },
  { type: "odd",   label: "বিজোড়",  payout: 2, nums: Array.from({length:36},(_,i)=>i+1).filter(n=>n%2!==0) },
  { type: "1-18",  label: "১-১৮",   payout: 2, nums: Array.from({length:18},(_,i)=>i+1) },
  { type: "19-36", label: "১৯-৩৬",  payout: 2, nums: Array.from({length:18},(_,i)=>i+19) },
  { type: "1st12", label: "১ম ১২",  payout: 3, nums: Array.from({length:12},(_,i)=>i+1) },
  { type: "2nd12", label: "২য় ১২",  payout: 3, nums: Array.from({length:12},(_,i)=>i+13) },
  { type: "3rd12", label: "৩য় ১২",  payout: 3, nums: Array.from({length:12},(_,i)=>i+25) },
];

function Roulette({ balance, setBalance }: { balance: number; setBalance: (n: number) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<RouletteBet | null>(null);
  const [betAmt, setBetAmt] = useState(0);
  const [msg, setMsg] = useState<Msg>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  // Refs to capture current values for the 4s setTimeout
  const balanceRef = useRef(balance);
  const betAmtRef = useRef(betAmt);
  const selectedBetRef = useRef(selectedBet);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { betAmtRef.current = betAmt; }, [betAmt]);
  useEffect(() => { selectedBetRef.current = selectedBet; }, [selectedBet]);

  const addChip = (v: number) => {
    if (!selectedBet) { setMsg({ tone: "info", text: "আগে একটি বেট বাছুন!" }); return; }
    if (balance < v) return;
    setBetAmt((b) => b + v);
    setBalance(balance - v);
  };

  const spin = () => {
    if (!selectedBet || betAmt === 0) { setMsg({ tone: "info", text: "বেট করুন তারপর স্পিন করুন!" }); return; }
    setSpinning(true);
    setResult(null);
    setMsg({ tone: "info", text: "বল ঘুরছে..." });

    const resultNum = ROULETTE_NUMS[Math.floor(Math.random() * ROULETTE_NUMS.length)];
    const idx = ROULETTE_NUMS.indexOf(resultNum);
    const segAngle = 360 / ROULETTE_NUMS.length;
    const targetAngle = wheelAngle + 1440 + (idx * segAngle);

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(.1,.5,.1,1)";
      wheelRef.current.style.transform = `rotate(${targetAngle}deg)`;
    }
    if (ballRef.current) {
      ballRef.current.style.transition = "transform 4s cubic-bezier(.15,.6,.1,1)";
      ballRef.current.style.transform = `rotate(${-targetAngle * 2.3}deg) translateX(90px)`;
    }

    setTimeout(() => {
      setWheelAngle(targetAngle % 360);
      setSpinning(false);
      setResult(resultNum);
      const currentBalance = balanceRef.current;
      const currentBet = betAmtRef.current;
      const currentSelectedBet = selectedBetRef.current;
      const won = currentSelectedBet?.nums.includes(resultNum);
      if (won && currentSelectedBet) {
        const winAmt = currentBet * currentSelectedBet.payout;
        setBalance(currentBalance + winAmt); // balance already has bet deducted
        setMsg({ tone: "win", text: `${resultNum} — জয়! +৳${winAmt}` });
      } else {
        setMsg({ tone: "lose", text: `${resultNum} — হার।` });
      }
      setBetAmt(0);
    }, 4200);
  };

  const numColor = (n: number) => n === 0 ? "#16a34a" : RED_NUMS.includes(n) ? "#dc2626" : "#1e1e1e";

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      {/* Wheel */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, position: "relative" }}>
        <div style={{
          width: 220, height: 220, borderRadius: "50%", position: "relative",
          border: "4px solid rgba(240,192,64,.5)",
          boxShadow: "0 0 40px rgba(240,192,64,.2), 0 0 80px rgba(0,0,0,.6), inset 0 0 20px rgba(0,0,0,.5)",
        }}>
          {/* Wheel segments with numbers */}
          <div ref={wheelRef} style={{
            width: "100%", height: "100%", borderRadius: "50%",
            position: "absolute", inset: 0,
          }}>
            <svg viewBox="0 0 220 220" width="220" height="220" style={{ position: "absolute", inset: 0 }}>
              {ROULETTE_NUMS.map((n, i) => {
                const total = ROULETTE_NUMS.length;
                const seg = (2 * Math.PI) / total;
                const startAngle = i * seg - Math.PI / 2;
                const endAngle = (i + 1) * seg - Math.PI / 2;
                const cx = 110, cy = 110, r = 108;
                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);
                const midAngle = (startAngle + endAngle) / 2;
                const labelR = 80;
                const lx = cx + labelR * Math.cos(midAngle);
                const ly = cy + labelR * Math.sin(midAngle);
                const color = n === 0 ? "#16a34a" : RED_NUMS.includes(n) ? "#dc2626" : "#111827";
                const labelDeg = (midAngle * 180) / Math.PI + 90;
                return (
                  <g key={i}>
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                      fill={color}
                      stroke="rgba(240,192,64,0.3)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={total > 20 ? "7" : "9"}
                      fontWeight="bold"
                      transform={`rotate(${labelDeg}, ${lx}, ${ly})`}
                      style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                      {n}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {/* Center hub */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 44, height: 44, borderRadius: "50%",
            background: "radial-gradient(circle,#c9a227,#7a5c00)",
            border: "3px solid #f0c040",
            boxShadow: "0 0 16px rgba(240,192,64,.6)",
            zIndex: 10,
          }} />
          {/* Ball */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transformOrigin: "0 0", zIndex: 5,
          }}>
            <div ref={ballRef} style={{
              width: 12, height: 12, borderRadius: "50%", marginLeft: -6, marginTop: -6,
              background: "radial-gradient(circle at 35% 30%,#fff,#ccc)",
              boxShadow: "0 2px 6px rgba(0,0,0,.8)",
              transform: "translateX(90px)",
            }} />
          </div>
        </div>
        {/* Pointer */}
        <div style={{
          position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "16px solid #f0c040",
          filter: "drop-shadow(0 0 6px #f0c040)",
          zIndex: 20,
        }} />
        {result !== null && (
          <div style={{
            position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
            padding: "4px 16px", borderRadius: 20, fontWeight: 800, fontSize: 18,
            background: numColor(result), color: "#fff",
            boxShadow: `0 0 20px ${numColor(result)}88`,
            border: "2px solid rgba(255,255,255,.2)",
          }}>
            {result}
          </div>
        )}
      </div>

      {/* Message */}
      <div style={{ marginBottom: 14 }}><ResultBadge msg={msg} /></div>

      {/* Bet grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 14 }}>
        {ROULETTE_BETS.map((b) => (
          <button key={b.type} className="casino-btn" onClick={() => setSelectedBet(b)} style={{
            padding: "10px 6px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            border: `1.5px solid ${selectedBet?.type === b.type ? "#f0c040" : "rgba(255,255,255,.1)"}`,
            background: selectedBet?.type === b.type ? "rgba(240,192,64,.15)" : "rgba(0,0,0,.35)",
            color: selectedBet?.type === b.type ? "#f0c040" : "#ccc",
            boxShadow: selectedBet?.type === b.type ? "0 0 14px rgba(240,192,64,.2)" : "none",
            cursor: "pointer",
          }}>
            <div>{b.label}</div>
            <div style={{ fontSize: 10, opacity: .6, marginTop: 2 }}>{b.payout}x</div>
          </button>
        ))}
      </div>

      <ChipRow bet={betAmt} onChip={addChip} balance={balance} />
      {betAmt > 0 && (
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#f0c040" }}>
          বাজি: ৳{betAmt}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button className="casino-btn glow-pulse" onClick={spin} disabled={spinning || betAmt === 0} style={{
          padding: "13px 44px", borderRadius: 12, border: "none",
          background: spinning || betAmt === 0 ? "rgba(240,192,64,.2)" : "linear-gradient(135deg,#f0c040,#c9870a)",
          color: spinning || betAmt === 0 ? "#666" : "#0a0e1a",
          fontWeight: 800, fontSize: 15, cursor: spinning || betAmt === 0 ? "not-allowed" : "pointer",
          boxShadow: !spinning && betAmt > 0 ? "0 0 28px rgba(240,192,64,.45)" : "none",
        }}>
          {spinning ? "ঘুরছে..." : "স্পিন করুন"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DRAGON TIGER
══════════════════════════════════════════════════════════════════════════ */
type DTBet = "dragon" | "tiger" | "tie" | null;
type DTPhase = "bet" | "reveal" | "done";

function DragonTiger({ balance, setBalance }: { balance: number; setBalance: (n: number) => void }) {
  const [phase, setPhase] = useState<DTPhase>("bet");
  const [dragon, setDragon] = useState<Card | null>(null);
  const [tiger, setTiger] = useState<Card | null>(null);
  const [bet, setBet] = useState<DTBet>(null);
  const [betAmt, setBetAmt] = useState(0);
  const [msg, setMsg] = useState<Msg>(null);
  const [revealStep, setRevealStep] = useState(0);
  // Refs for stale closure safety inside setTimeouts
  const balanceRef = useRef(balance);
  const betAmtRef = useRef(betAmt);
  const betRef = useRef(bet);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { betAmtRef.current = betAmt; }, [betAmt]);
  useEffect(() => { betRef.current = bet; }, [bet]);

  const addChip = (v: number) => {
    if (!bet) { setMsg({ tone: "info", text: "আগে Dragon, Tiger বা Tie বেছে নিন!" }); return; }
    if (balance < v) return;
    setBetAmt((b) => b + v);
    setBalance(balance - v);
  };

  const deal = () => {
    if (!bet || betAmt === 0) { setMsg({ tone: "info", text: "বাজি ধরুন!" }); return; }
    const deck = makeDeck();
    setDragon(deck[0]);
    setTiger(deck[1]);
    setPhase("reveal");
    setRevealStep(0);
    setMsg(null);

    setTimeout(() => setRevealStep(1), 600);
    setTimeout(() => {
      setRevealStep(2);
      setPhase("done");
      const currentBalance = balanceRef.current;
      const currentBetAmt = betAmtRef.current;
      const currentBet = betRef.current;
      const dv = deck[0].num, tv = deck[1].num;
      let outcome: DTBet = dv > tv ? "dragon" : tv > dv ? "tiger" : "tie";
      const outcomeName = outcome === "dragon" ? "ড্রাগন" : outcome === "tiger" ? "টাইগার" : "টাই";
      if (outcome === currentBet) {
        const payout = currentBet === "tie" ? 8 : 2;
        const win = currentBetAmt * payout;
        setBalance(currentBalance + win); // balance already has bet deducted
        setMsg({ tone: "win", text: `${outcomeName} জিতেছে! +৳${win}` });
      } else {
        setMsg({ tone: outcome === "tie" ? "tie" : "lose", text: `${outcomeName} — আপনি হেরেছেন।` });
      }
    }, 1400);
  };

  const reset = () => {
    setDragon(null); setTiger(null); setBet(null);
    setBetAmt(0); setMsg(null); setPhase("bet"); setRevealStep(0);
  };

  const sides = [
    { id: "dragon" as DTBet, label: "ড্রাগন",  Icon: Flame,    color: "#ef4444", glow: "rgba(239,68,68,.4)", payout: "2x" },
    { id: "tie"    as DTBet, label: "টাই",     Icon: Handshake,color: "#22c55e", glow: "rgba(34,197,94,.4)",  payout: "8x" },
    { id: "tiger"  as DTBet, label: "টাইগার", Icon: PawPrint, color: "#3b82f6", glow: "rgba(59,130,246,.4)", payout: "2x" },
  ];

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <TableFelt accent="#1a1a3e">
        {/* Bet selector */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {sides.map((s) => (
            <button key={s.id} className="casino-btn" onClick={() => phase === "bet" && setBet(s.id)} style={{
              flex: 1, padding: "12px 8px", borderRadius: 12, cursor: phase === "bet" ? "pointer" : "default",
              border: `2px solid ${bet === s.id ? s.color : "rgba(255,255,255,.1)"}`,
              background: bet === s.id ? `rgba(${s.color === "#ef4444" ? "239,68,68" : s.color === "#22c55e" ? "34,197,94" : "59,130,246"},.15)` : "rgba(0,0,0,.35)",
              color: bet === s.id ? s.color : "#888",
              fontWeight: 800, fontSize: 13, textAlign: "center",
              boxShadow: bet === s.id ? `0 0 20px ${s.glow}` : "none",
              transition: "all .2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <s.Icon size={14} className={bet === s.id ? "icon-glow" : ""} style={{ color: bet === s.id ? s.color : "#888" }} />
                {s.label}
              </div>
              <div style={{ fontSize: 10, marginTop: 3, opacity: .6 }}>{s.payout}</div>
            </button>
          ))}
        </div>

        {/* Cards area */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, minHeight: 110 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#ef444488", letterSpacing: 2, marginBottom: 6 }}>ড্রাগন</div>
            {revealStep >= 1 && dragon
              ? <PlayingCard card={dragon} delay={0} />
              : <div style={{ width: 64, height: 90, borderRadius: 10, border: "1.5px dashed rgba(239,68,68,.2)", background: "rgba(239,68,68,.04)" }} />
            }
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "2px solid rgba(240,192,64,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,.4)",
            fontSize: 11, color: "#f0c040", fontWeight: 700,
          }}>VS</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#3b82f688", letterSpacing: 2, marginBottom: 6 }}>টাইগার</div>
            {revealStep >= 2 && tiger
              ? <PlayingCard card={tiger} delay={0} />
              : <div style={{ width: 64, height: 90, borderRadius: 10, border: "1.5px dashed rgba(59,130,246,.2)", background: "rgba(59,130,246,.04)" }} />
            }
          </div>
        </div>
      </TableFelt>

      {/* Message */}
      <div style={{ marginTop: 14 }}><ResultBadge msg={msg} /></div>

      {/* Controls */}
      <div style={{ marginTop: 16 }}>
        {phase === "bet" && (
          <>
            <ChipRow bet={betAmt} onChip={addChip} balance={balance} />
            {betAmt > 0 && (
              <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#f0c040" }}>বাজি: ৳{betAmt}</div>
            )}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button className="casino-btn" onClick={deal} disabled={!bet || betAmt === 0} style={{
                padding: "13px 44px", borderRadius: 12, border: "none",
                background: (!bet || betAmt === 0) ? "rgba(240,192,64,.2)" : "linear-gradient(135deg,#f0c040,#c9870a)",
                color: (!bet || betAmt === 0) ? "#666" : "#0a0e1a",
                fontWeight: 800, fontSize: 15, cursor: (!bet || betAmt === 0) ? "not-allowed" : "pointer",
                boxShadow: bet && betAmt > 0 ? "0 0 24px rgba(240,192,64,.4)" : "none",
              }}>
                ডিল করুন
              </button>
            </div>
          </>
        )}
        {phase === "done" && (
          <div style={{ textAlign: "center" }}>
            <button className="casino-btn glow-pulse" onClick={reset} style={{
              padding: "13px 40px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#f0c040,#c9870a)",
              color: "#0a0e1a", fontWeight: 800, fontSize: 15, cursor: "pointer",
              boxShadow: "0 0 24px rgba(240,192,64,.45)",
            }}>
              আবার খেলুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LOBBY
══════════════════════════════════════════════════════════════════════════ */
const GAMES = [
  {
    id: "blackjack" as GameId,
    name: "ব্ল্যাকজ্যাক",
    nameEn: "Blackjack",
    desc: "২১ এ পৌঁছান, ডিলারকে হারান",
    accent: "#22c55e",
    accentRgb: "34,197,94",
    tag: "ক্লাসিক",
  },
  {
    id: "roulette" as GameId,
    name: "রুলেট",
    nameEn: "Roulette",
    desc: "চাকা ঘুরান, ভাগ্য পরীক্ষা করুন",
    accent: "#ef4444",
    accentRgb: "239,68,68",
    tag: "জনপ্রিয়",
  },
  {
    id: "dragon_tiger" as GameId,
    name: "ড্রাগন টাইগার",
    nameEn: "Dragon Tiger",
    desc: "ড্রাগন না টাইগার — কে জিতবে?",
    accent: "#8b5cf6",
    accentRgb: "139,92,246",
    tag: "লাইভ",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   ROOT CASINO COMPONENT
══════════════════════════════════════════════════════════════════════════ */
function Casino() {
  const [activeGame, setActiveGame] = useState<GameId>("lobby");
  const [balance, setBalance] = useState(5000);

  const game = GAMES.find((g) => g.id === activeGame);

  return (
    <AppShell>
      <InjectStyles />
      <div style={{
        maxWidth: 600, margin: "0 auto", padding: "16px 16px 32px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,.06) 0%, transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(240,192,64,.05) 0%, transparent 50%)",
      }}>

        {/* Balance bar */}
        <div className="glass glass-edge" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderRadius: 16, padding: "12px 18px", marginBottom: 20,
          boxShadow: "0 0 30px rgba(240,192,64,.07), 0 8px 24px rgba(0,0,0,.35)",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: 2 }}>ব্যালেন্স</div>
            <div className="shimmer-text" style={{ fontSize: 22, fontWeight: 800 }}>৳{balance.toLocaleString()}</div>
          </div>
          {activeGame !== "lobby" && (
            <button onClick={() => setActiveGame("lobby")} className="neu-btn" style={{
              background: "rgba(240,192,64,.08)", border: "1px solid rgba(240,192,64,.3)",
              borderRadius: 10, padding: "8px 16px", color: "#f0c040",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 0 14px rgba(240,192,64,.15)",
            }}>
              ← লবি
            </button>
          )}
        </div>

        {/* Lobby */}
        {activeGame === "lobby" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 className="casino-font shimmer-text" style={{ fontSize: 30, margin: "0 0 4px" }}>
                ক্যাসিনো লবি
              </h1>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13, margin: 0 }}>
                আপনার গেম বেছে নিন
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {GAMES.map((g) => (
                <button key={g.id} className="casino-btn game-card" onClick={() => setActiveGame(g.id)} style={{
                  textAlign: "left", borderRadius: 18, padding: 0, border: "none",
                  cursor: "pointer", overflow: "hidden", display: "block", width: "100%",
                  background: "transparent",
                }}>
                  <div className="glass glass-edge" style={{
                    background: `linear-gradient(135deg, rgba(${g.accentRgb},.10) 0%, rgba(255,255,255,.03) 60%, rgba(${g.accentRgb},.05) 100%)`,
                    border: `1px solid ${g.accent}3a`,
                    borderRadius: 18, padding: "18px 20px", position: "relative",
                    boxShadow: `0 0 36px ${g.accent}1c, 0 10px 26px rgba(0,0,0,.4)`,
                    display: "flex", alignItems: "center", gap: 16,
                  }}>
                    <div className="scan-sheen" />
                    <div className="neu" style={{
                      width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1.5px solid ${g.accent}55`,
                      boxShadow: `0 0 22px ${g.accent}3d, inset 0 1px 0 rgba(255,255,255,.05)`,
                      position: "relative", zIndex: 1,
                    }}>
                      <GameLogo id={g.id} color={g.accent} size={36} />
                    </div>
                    <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{g.name}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          background: `${g.accent}22`, color: g.accent,
                          border: `1px solid ${g.accent}55`, letterSpacing: 1,
                          boxShadow: `0 0 10px ${g.accent}33`,
                        }}>
                          {g.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>{g.desc}</div>
                    </div>
                    <div style={{ color: g.accent, fontSize: 20, opacity: .8, position: "relative", zIndex: 1 }}>›</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Active game */}
        {activeGame !== "lobby" && game && (
          <>
            {/* Game header */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div className="neu holo-border" style={{
                width: 64, height: 64, borderRadius: 18, margin: "0 auto 10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 26px ${game.accent}40`,
              }}>
                <GameLogo id={game.id} color={game.accent} size={38} />
              </div>
              <h2 className="casino-font" style={{
                fontSize: 22, margin: "0 0 2px",
                background: `linear-gradient(135deg,${game.accent},#fff)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {game.name}
              </h2>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", letterSpacing: 2 }}>{game.nameEn}</div>
            </div>

            {activeGame === "blackjack"   && <GameErrorBoundary game="Blackjack"><Blackjack    balance={balance} setBalance={setBalance} /></GameErrorBoundary>}
            {activeGame === "roulette"    && <GameErrorBoundary game="Roulette"><Roulette     balance={balance} setBalance={setBalance} /></GameErrorBoundary>}
            {activeGame === "dragon_tiger"&& <GameErrorBoundary game="Dragon Tiger"><DragonTiger  balance={balance} setBalance={setBalance} /></GameErrorBoundary>}
          </>
        )}
      </div>
    </AppShell>
  );
}
