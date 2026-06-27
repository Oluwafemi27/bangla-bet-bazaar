import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Sym {
  id: string;
  label: string;
  value: number;
  color: string;
  svg: string;
}

interface Game {
  id: string;
  name: string;
  nameBn: string;
  theme: string;
  accentColor: string;
  glowRgb: string;
  reels: number;
  rows: number;
  minBet: number;
  maxBet: number;
  rtp: number;
  volatility: "Low" | "Medium" | "High";
  jackpot: number;
  symbols: Sym[];
}

interface WinLine {
  line: number[];
  symbol: Sym;
  multiplier: number;
  payout: number;
}

// ─── Inline SVG symbols ──────────────────────────────────────────────────────
const S: Record<string, string> = {
  seven: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff176"/><stop offset="100%" stop-color="#ff6d00"/>
    </linearGradient></defs>
    <text x="24" y="40" text-anchor="middle" font-family="Arial Black,sans-serif"
      font-weight="900" font-size="40" fill="url(#sg)">7</text>
    <text x="24" y="40" text-anchor="middle" font-family="Arial Black,sans-serif"
      font-weight="900" font-size="40" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.4">7</text>
  </svg>`,

  diamond: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#b2ebf2"/><stop offset="100%" stop-color="#0288d1"/>
      </linearGradient>
      <filter id="df"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#29b6f6" flood-opacity="0.8"/></filter>
    </defs>
    <polygon points="24,3 44,18 24,45 4,18" fill="url(#dg)" filter="url(#df)"/>
    <polygon points="24,3 44,18 24,20 4,18" fill="rgba(255,255,255,0.35)"/>
    <line x1="4" y1="18" x2="44" y2="18" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  </svg>`,

  crown: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe57f"/><stop offset="100%" stop-color="#f9a825"/>
    </linearGradient></defs>
    <path d="M6 36 L6 20 L16 30 L24 10 L32 30 L42 20 L42 36 Z" fill="url(#cg)" stroke="#fff8" stroke-width="1"/>
    <circle cx="6" cy="20" r="4" fill="#FFD600"/><circle cx="24" cy="10" r="4" fill="#FFD600"/>
    <circle cx="42" cy="20" r="4" fill="#FFD600"/>
    <rect x="5" y="36" width="38" height="5" rx="2" fill="#f9a825"/>
  </svg>`,

  bell: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff176"/><stop offset="100%" stop-color="#f57f17"/>
    </linearGradient></defs>
    <path d="M24 5 C14 5 10 14 10 24 L10 34 L38 34 L38 24 C38 14 34 5 24 5Z" fill="url(#bg)" stroke="#fff4" stroke-width="1"/>
    <ellipse cx="24" cy="5" rx="4" ry="3" fill="#f9a825"/>
    <rect x="18" y="34" width="12" height="5" rx="3" fill="#e65100"/>
  </svg>`,

  cherry: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ch1" cx="35%" cy="30%">
        <stop offset="0%" stop-color="#ff8a80"/><stop offset="100%" stop-color="#b71c1c"/>
      </radialGradient>
      <radialGradient id="ch2" cx="35%" cy="30%">
        <stop offset="0%" stop-color="#ff8a80"/><stop offset="100%" stop-color="#b71c1c"/>
      </radialGradient>
    </defs>
    <path d="M16 26 Q24 6 32 26" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="12" cy="33" r="9" fill="url(#ch1)"/><circle cx="12" cy="29" r="3" fill="rgba(255,255,255,0.3)"/>
    <circle cx="30" cy="33" r="9" fill="url(#ch2)"/><circle cx="30" cy="29" r="3" fill="rgba(255,255,255,0.3)"/>
  </svg>`,

  bar: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="brg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#616161"/><stop offset="100%" stop-color="#212121"/>
    </linearGradient></defs>
    <rect x="4" y="16" width="40" height="16" rx="4" fill="url(#brg)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="24" y="28" text-anchor="middle" font-family="Arial Black,sans-serif"
      font-weight="900" font-size="12" fill="#fff" letter-spacing="1">BAR</text>
    <rect x="4" y="14" width="40" height="3" rx="2" fill="rgba(255,255,255,0.12)"/>
  </svg>`,

  star: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="stg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff176"/><stop offset="100%" stop-color="#ff6f00"/>
    </linearGradient></defs>
    <polygon points="24,4 28.5,17 43,17 31.5,25 36,38 24,30 12,38 16.5,25 5,17 19.5,17"
      fill="url(#stg)" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/>
  </svg>`,

  wild: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ce93d8"/><stop offset="100%" stop-color="#6a1b9a"/>
    </linearGradient></defs>
    <rect x="3" y="13" width="42" height="22" rx="6" fill="url(#wg)" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
    <text x="24" y="29" text-anchor="middle" font-family="Arial Black,sans-serif"
      font-weight="900" font-size="13" fill="#fff" letter-spacing="0.5">WILD</text>
    <rect x="3" y="13" width="42" height="6" rx="6" fill="rgba(255,255,255,0.12)"/>
  </svg>`,

  scatter: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="scg" cx="40%" cy="35%">
      <stop offset="0%" stop-color="#69f0ae"/><stop offset="100%" stop-color="#00695c"/>
    </radialGradient></defs>
    <circle cx="24" cy="24" r="20" fill="url(#scg)" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
    <text x="24" y="21" text-anchor="middle" font-family="Arial Black,sans-serif"
      font-weight="900" font-size="8" fill="#fff">FREE</text>
    <text x="24" y="32" text-anchor="middle" font-family="Arial Black,sans-serif"
      font-weight="900" font-size="8" fill="#fff">SPIN</text>
  </svg>`,

  // Fruit
  watermelon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 44 C10 44 4 32 4 24 L44 24 C44 32 38 44 24 44Z" fill="#e53935"/>
    <path d="M4 24 L44 24 Q24 4 4 24Z" fill="#388e3c"/>
    <line x1="4" y1="24" x2="44" y2="24" stroke="#fff3" stroke-width="1"/>
    <circle cx="16" cy="31" r="2.5" fill="#1b5e20"/><circle cx="24" cy="35" r="2.5" fill="#1b5e20"/>
    <circle cx="32" cy="31" r="2.5" fill="#1b5e20"/>
  </svg>`,

  lemon: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="lg" cx="35%" cy="30%">
      <stop offset="0%" stop-color="#fff176"/><stop offset="100%" stop-color="#f9a825"/>
    </radialGradient></defs>
    <ellipse cx="24" cy="27" rx="17" ry="14" fill="url(#lg)" stroke="#f57f17" stroke-width="1"/>
    <path d="M24 13 Q28 6 30 3" stroke="#388e3c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  grape: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="gg" cx="35%" cy="30%">
      <stop offset="0%" stop-color="#e040fb"/><stop offset="100%" stop-color="#4a148c"/>
    </radialGradient></defs>
    <circle cx="17" cy="26" r="8" fill="url(#gg)"/><circle cx="31" cy="26" r="8" fill="url(#gg)"/>
    <circle cx="24" cy="17" r="8" fill="url(#gg)"/><circle cx="24" cy="35" r="7" fill="url(#gg)"/>
    <circle cx="17" cy="23" r="3" fill="rgba(255,255,255,0.25)"/>
    <circle cx="31" cy="23" r="3" fill="rgba(255,255,255,0.25)"/>
    <circle cx="24" cy="14" r="3" fill="rgba(255,255,255,0.25)"/>
    <path d="M24 9 Q26 4 28 2" stroke="#555" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  // Egypt
  ankh: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="ang" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe57f"/><stop offset="100%" stop-color="#f9a825"/>
    </linearGradient></defs>
    <ellipse cx="24" cy="15" rx="8" ry="10" fill="none" stroke="url(#ang)" stroke-width="4"/>
    <line x1="24" y1="25" x2="24" y2="44" stroke="url(#ang)" stroke-width="4" stroke-linecap="round"/>
    <line x1="11" y1="31" x2="37" y2="31" stroke="url(#ang)" stroke-width="4" stroke-linecap="round"/>
  </svg>`,

  eye: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="eyg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe57f"/><stop offset="100%" stop-color="#f9a825"/>
      </linearGradient>
      <radialGradient id="eyg2" cx="40%" cy="35%">
        <stop offset="0%" stop-color="#81d4fa"/><stop offset="100%" stop-color="#0277bd"/>
      </radialGradient>
    </defs>
    <path d="M4 24 Q24 8 44 24 Q24 40 4 24Z" fill="#1a0a00" stroke="url(#eyg)" stroke-width="2"/>
    <circle cx="24" cy="24" r="8" fill="url(#eyg2)"/>
    <circle cx="24" cy="24" r="4" fill="#000"/>
    <circle cx="26" cy="22" r="1.5" fill="#fff"/>
  </svg>`,

  scarab: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="scg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#69f0ae"/><stop offset="100%" stop-color="#1b5e20"/>
    </linearGradient></defs>
    <ellipse cx="24" cy="27" rx="12" ry="16" fill="url(#scg2)"/>
    <path d="M12 20 Q7 12 9 5" stroke="#2e7d32" stroke-width="2.5" fill="none"/>
    <path d="M36 20 Q41 12 39 5" stroke="#2e7d32" stroke-width="2.5" fill="none"/>
    <line x1="12" y1="24" x2="4" y2="21" stroke="#1b5e20" stroke-width="2.5"/>
    <line x1="36" y1="24" x2="44" y2="21" stroke="#1b5e20" stroke-width="2.5"/>
    <line x1="12" y1="29" x2="4" y2="29" stroke="#1b5e20" stroke-width="2"/>
    <line x1="36" y1="29" x2="44" y2="29" stroke="#1b5e20" stroke-width="2"/>
  </svg>`,
};

// ─── Games ───────────────────────────────────────────────────────────────────
const GAMES: Game[] = [
  {
    id: "classic", name: "Lucky 7s", nameBn: "লাকি ৭s",
    theme: "Classic Casino", accentColor: "#FFD700", glowRgb: "255,215,0",
    reels: 3, rows: 3, minBet: 10, maxBet: 1000, rtp: 96.5, volatility: "Medium", jackpot: 250000,
    symbols: [
      { id: "seven",   label: "৭",       value: 500, color: "#ff6d00", svg: S.seven   },
      { id: "diamond", label: "ডায়মন্ড", value: 200, color: "#29b6f6", svg: S.diamond },
      { id: "crown",   label: "মুকুট",   value: 100, color: "#FFD600", svg: S.crown   },
      { id: "bell",    label: "বেল",     value: 50,  color: "#f57f17", svg: S.bell    },
      { id: "bar",     label: "BAR",     value: 30,  color: "#757575", svg: S.bar     },
      { id: "cherry",  label: "চেরি",    value: 20,  color: "#b71c1c", svg: S.cherry  },
      { id: "wild",    label: "WILD",    value: 0,   color: "#8e24aa", svg: S.wild    },
      { id: "scatter", label: "FREE",    value: 0,   color: "#00897b", svg: S.scatter },
    ],
  },
  {
    id: "fruits", name: "Tropical Fruits", nameBn: "ট্রপিক্যাল ফ্রুটস",
    theme: "Fruit Fiesta", accentColor: "#00e676", glowRgb: "0,230,118",
    reels: 5, rows: 3, minBet: 20, maxBet: 2000, rtp: 97.2, volatility: "Low", jackpot: 500000,
    symbols: [
      { id: "watermelon", label: "তরমুজ", value: 300, color: "#e53935", svg: S.watermelon },
      { id: "grape",      label: "আঙুর",  value: 150, color: "#8e24aa", svg: S.grape      },
      { id: "lemon",      label: "লেবু",  value: 80,  color: "#f9a825", svg: S.lemon      },
      { id: "cherry",     label: "চেরি",  value: 40,  color: "#b71c1c", svg: S.cherry     },
      { id: "star",       label: "তারা",  value: 25,  color: "#ff6f00", svg: S.star       },
      { id: "bell",       label: "বেল",   value: 15,  color: "#f57f17", svg: S.bell       },
      { id: "wild",       label: "WILD",  value: 0,   color: "#8e24aa", svg: S.wild       },
      { id: "scatter",    label: "FREE",  value: 0,   color: "#00897b", svg: S.scatter    },
    ],
  },
  {
    id: "egypt", name: "Pharaoh's Gold", nameBn: "ফারাওর সোনা",
    theme: "Ancient Egypt", accentColor: "#ffd740", glowRgb: "255,215,64",
    reels: 5, rows: 4, minBet: 50, maxBet: 5000, rtp: 95.8, volatility: "High", jackpot: 1000000,
    symbols: [
      { id: "ankh",    label: "আঙখ",      value: 1000, color: "#ffd740", svg: S.ankh    },
      { id: "eye",     label: "রা-র চোখ", value: 500,  color: "#29b6f6", svg: S.eye     },
      { id: "scarab",  label: "স্কারাব",  value: 200,  color: "#00e676", svg: S.scarab  },
      { id: "crown",   label: "মুকুট",    value: 100,  color: "#FFD600", svg: S.crown   },
      { id: "diamond", label: "ডায়মন্ড", value: 50,   color: "#29b6f6", svg: S.diamond },
      { id: "bar",     label: "BAR",      value: 30,   color: "#757575", svg: S.bar     },
      { id: "wild",    label: "WILD",     value: 0,    color: "#8e24aa", svg: S.wild    },
      { id: "scatter", label: "FREE",     value: 0,    color: "#00897b", svg: S.scatter },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function weightedPick(syms: Sym[], boostWild = false): Sym {
  const w = syms.map(s =>
    s.id === "wild" ? (boostWild ? 8 : 3) :
    s.id === "scatter" ? 4 :
    Math.max(3, 20 - s.value / 30)
  );
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < syms.length; i++) { r -= w[i]; if (r <= 0) return syms[i]; }
  return syms[syms.length - 1];
}

function checkWins(grid: Sym[][], bet: number, g: Game): { wins: WinLine[]; payout: number; freeSpins: number } {
  const wins: WinLine[] = [];
  let payout = 0;
  let freeSpins = 0;

  for (let row = 0; row < g.rows; row++) {
    let sym: Sym | null = null;
    let count = 0;
    for (let reel = 0; reel < g.reels; reel++) {
      const s = grid[reel][row];
      if (s.id === "wild") { count++; continue; }
      if (!sym) { sym = s; count++; }
      else if (s.id === sym.id) count++;
      else break;
    }
    if (count >= 3 && sym) {
      const mult = count === g.reels ? 10 : count === 4 ? 5 : 2;
      const p = Math.round(sym.value * mult * (bet / 100));
      wins.push({ line: [row], symbol: sym, multiplier: mult, payout: p });
      payout += p;
    }
  }

  let scatters = 0;
  for (let r = 0; r < g.reels; r++)
    for (let row = 0; row < g.rows; row++)
      if (grid[r][row].id === "scatter") scatters++;
  if (scatters >= 3) freeSpins = scatters * 3;

  return { wins, payout, freeSpins };
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return "255,215,0";
  return m.map(h => parseInt(h, 16)).join(",");
}

// ─── Reel ────────────────────────────────────────────────────────────────────
function Reel({ syms, spinning, final, delay, rows, winRows, accent }: {
  syms: Sym[]; spinning: boolean; final: Sym[]; delay: number;
  rows: number; winRows: number[]; accent: string;
}) {
  const [display, setDisplay] = useState<Sym[]>(final);
  const [live, setLive] = useState(false);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const to = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (spinning) {
      setLive(true);
      iv.current = setInterval(() => {
        setDisplay(Array.from({ length: rows }, () => syms[Math.floor(Math.random() * syms.length)]));
      }, 70);
      to.current = setTimeout(() => {
        clearInterval(iv.current!);
        setDisplay(final);
        setLive(false);
      }, delay);
    }
    return () => { clearInterval(iv.current!); clearTimeout(to.current!); };
  }, [spinning, final, delay, syms, rows]);

  const rgb = hexToRgb(accent);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 6,
      background: "linear-gradient(180deg,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.4) 100%)",
      borderRadius: 16, padding: 8,
      border: live ? `1px solid rgba(${rgb},0.6)` : "1px solid rgba(255,255,255,0.06)",
      boxShadow: live ? `0 0 24px rgba(${rgb},0.35), inset 0 0 16px rgba(${rgb},0.08)` : "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
      minWidth: 72,
    }}>
      {display.map((sym, i) => {
        const win = winRows.includes(i) && !live;
        return (
          <div key={i} style={{
            width: 64, height: 64, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: win
              ? `radial-gradient(ellipse at center, rgba(${rgb},0.25) 0%, rgba(${rgb},0.05) 100%)`
              : "rgba(255,255,255,0.04)",
            border: win ? `2px solid rgba(${rgb},0.8)` : "2px solid rgba(255,255,255,0.06)",
            boxShadow: win ? `0 0 20px rgba(${rgb},0.5), 0 0 40px rgba(${rgb},0.2), inset 0 0 12px rgba(${rgb},0.15)` : "none",
            transition: "all 0.25s",
            animation: win ? "winPulse 0.7s ease infinite alternate" : live ? "reelBlur 0.08s linear" : "none",
          }}
            dangerouslySetInnerHTML={{ __html: sym.svg }}
          />
        );
      })}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function SlotGames() {
  const [game, setGame] = useState<Game>(GAMES[0]);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(GAMES[0].minBet);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<Sym[][]>(() =>
    Array.from({ length: GAMES[0].reels }, () =>
      Array.from({ length: GAMES[0].rows }, () =>
        GAMES[0].symbols[Math.floor(Math.random() * GAMES[0].symbols.length)])));
  const [pending, setPending] = useState<Sym[][]>(grid);
  const [wins, setWins] = useState<WinLine[]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<{ win: number; bet: number }[]>([]);
  const [auto, setAuto] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const autoRef = useRef(false);

  useEffect(() => {
    setGrid(Array.from({ length: game.reels }, () =>
      Array.from({ length: game.rows }, () =>
        game.symbols[Math.floor(Math.random() * game.symbols.length)])));
    setBet(game.minBet); setWins([]); setTotalWin(0);
    setMsg(null); setFreeSpins(0); autoRef.current = false; setAuto(false);
  }, [game]);

  const spin = useCallback(() => {
    if (spinning) return;
    if (freeSpins === 0 && balance < bet) { setMsg("ব্যালেন্স অপর্যাপ্ত!"); return; }
    if (freeSpins === 0) setBalance(b => b - bet);
    else setFreeSpins(f => f - 1);
    setMsg(null); setWins([]); setTotalWin(0); setSpinning(true);

    const ng: Sym[][] = Array.from({ length: game.reels }, () =>
      Array.from({ length: game.rows }, () => weightedPick(game.symbols, Math.random() < 0.1)));
    setPending(ng);

    const dur = turbo ? 600 : 1800;
    setTimeout(() => {
      setGrid(ng);
      const { wins: w, payout, freeSpins: fs } = checkWins(ng, bet, game);
      setWins(w); setTotalWin(payout);
      if (payout > 0) {
        setBalance(b => b + payout);
        setMsg(payout >= bet * 50 ? "MEGA WIN!" : payout >= bet * 20 ? "BIG WIN!" : "WIN!");
      }
      if (fs > 0) { setFreeSpins(f => f + fs); setMsg(`${fs} FREE SPINS!`); }
      setHistory(h => [{ win: payout, bet }, ...h.slice(0, 9)]);
      setSpinning(false);
    }, dur);
  }, [spinning, balance, bet, freeSpins, game, turbo]);

  useEffect(() => { autoRef.current = auto; }, [auto]);
  useEffect(() => {
    if (!spinning && autoRef.current) {
      const t = setTimeout(() => { if (autoRef.current) spin(); }, turbo ? 200 : 600);
      return () => clearTimeout(t);
    }
  }, [spinning, spin, turbo]);

  const winRows = Array.from(new Set(wins.flatMap(w => w.line)));
  const acc = game.accentColor;
  const rgb = game.glowRgb;

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse 100% 60% at 50% 0%, rgba(${rgb},0.08) 0%, transparent 60%),
        linear-gradient(180deg, #080b18 0%, #060812 100%)`,
      fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif",
      color: "#fff", padding: "12px 14px",
    }}>
      <style>{`
        @keyframes winPulse {
          from { transform: scale(1); filter: brightness(1); }
          to   { transform: scale(1.08); filter: brightness(1.3); }
        }
        @keyframes reelBlur { 0%{opacity:.7;transform:translateY(-3px)} 100%{opacity:1;transform:translateY(3px)} }
        @keyframes glowPulse {
          0%,100%{opacity:.8;text-shadow:0 0 20px rgba(${rgb},.6),0 0 40px rgba(${rgb},.3)}
          50%{opacity:1;text-shadow:0 0 30px rgba(${rgb},.9),0 0 60px rgba(${rgb},.5),0 0 80px rgba(${rgb},.2)}
        }
        @keyframes msgBounce {
          0%{transform:scale(.8) translateY(8px);opacity:0}
          60%{transform:scale(1.08) translateY(-3px)}
          100%{transform:scale(1) translateY(0);opacity:1}
        }
        @keyframes jackpotTick {
          0%,100%{transform:scale(1)}
          50%{transform:scale(1.03)}
        }
        .slot-glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .slot-neuro {
          background: linear-gradient(145deg, #0e1225, #090c1a);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 6px 6px 18px rgba(0,0,0,0.55), -3px -3px 10px rgba(255,255,255,0.025),
                      inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .bet-btn-neuro {
          background: linear-gradient(145deg,#1a1f3a,#0f1228);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          color: rgba(255,255,255,.6);
          font-size: 12px;
          font-weight: 700;
          padding: 9px 6px;
          cursor: pointer;
          transition: all .15s;
          box-shadow: 3px 3px 8px rgba(0,0,0,.45),-1px -1px 4px rgba(255,255,255,.025);
          text-align: center;
        }
        .bet-btn-neuro:hover {
          border-color: rgba(${rgb},.45);
          color: ${acc};
          box-shadow: 3px 3px 8px rgba(0,0,0,.45),0 0 14px rgba(${rgb},.2);
          transform: translateY(-1px);
        }
        .action-btn {
          border: none; cursor: pointer; font-weight: 900; font-size: 14px;
          letter-spacing: .04em; border-radius: 14px; padding: 16px;
          transition: all .2s; position: relative; overflow: hidden;
        }
        .action-btn::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg,rgba(255,255,255,.14) 0%,transparent 55%);
          pointer-events:none;
        }
        .spin-btn {
          flex: 2;
          background: linear-gradient(135deg, ${acc} 0%, ${acc}bb 50%, ${acc} 100%);
          background-size: 200% 100%;
          color: #000;
          box-shadow: 0 4px 24px rgba(${rgb},.5), 0 1px 0 rgba(255,255,255,.25) inset;
        }
        .spin-btn:hover:not(:disabled){
          background-position: 100% 0;
          box-shadow: 0 6px 36px rgba(${rgb},.7), 0 1px 0 rgba(255,255,255,.2) inset;
          transform: translateY(-2px);
        }
        .spin-btn:active:not(:disabled){transform:translateY(0);}
        .spin-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}
        .auto-btn {
          flex:1;
          background: ${auto ? 'rgba(239,68,68,.18)' : 'linear-gradient(145deg,#1a1f3a,#0f1228)'};
          border: 1px solid ${auto ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.07)'};
          color: ${auto ? '#f87171' : 'rgba(255,255,255,.55)'};
          box-shadow: ${auto ? '0 0 18px rgba(239,68,68,.2)' : '4px 4px 10px rgba(0,0,0,.45)'};
        }
        .auto-btn:hover{transform:translateY(-1px);}
        .turbo-btn {
          flex:1;
          background: ${turbo ? 'rgba(251,191,36,.18)' : 'linear-gradient(145deg,#1a1f3a,#0f1228)'};
          border: 1px solid ${turbo ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.07)'};
          color: ${turbo ? '#fbbf24' : 'rgba(255,255,255,.55)'};
          box-shadow: ${turbo ? '0 0 18px rgba(251,191,36,.2)' : '4px 4px 10px rgba(0,0,0,.45)'};
        }
        .turbo-btn:hover{transform:translateY(-1px);}
        .game-tab {
          flex:0 0 auto; padding: 12px 16px; border-radius:14px;
          cursor:pointer; transition:all .22s; backdrop-filter:blur(10px);
          min-width: 140px; border: 1px solid transparent;
        }
        .paytable-row {
          display:flex; align-items:center; gap:10px; padding:7px 0;
          border-bottom:1px solid rgba(255,255,255,.05);
        }
        .history-row {
          display:flex; justify-content:space-between; padding:6px 0;
          border-bottom:1px solid rgba(255,255,255,.04); font-size:12px;
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="slot-glass" style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 20px", marginBottom:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:42, height:42, borderRadius:12,
            background:`linear-gradient(135deg,${acc},${acc}88)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 0 20px rgba(${rgb},.55), inset 0 1px 0 rgba(255,255,255,.2)`,
          }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" fill="rgba(255,255,255,.2)" stroke="white" strokeWidth="1.5"/>
              <circle cx="7" cy="12" r="1.5" fill="white"/><circle cx="12" cy="12" r="1.5" fill="white"/>
              <circle cx="17" cy="12" r="1.5" fill="white"/><circle cx="7" cy="17" r="1.5" fill="white"/>
              <circle cx="12" cy="17" r="1.5" fill="white"/><circle cx="17" cy="17" r="1.5" fill="white"/>
              <rect x="8" y="3" width="3" height="4" rx="1" fill="white"/>
              <rect x="13" y="3" width="3" height="4" rx="1" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:17, letterSpacing:"-0.4px" }}>
              {game.nameBn}
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.45)", marginTop:1 }}>
              {game.theme}
            </div>
          </div>
        </div>

        {/* Balance */}
        <div style={{
          padding:"10px 20px",
          background:"linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.02))",
          borderRadius:14, border:"1px solid rgba(255,255,255,.09)", textAlign:"center",
          boxShadow:"4px 4px 14px rgba(0,0,0,.4),-2px -2px 6px rgba(255,255,255,.025)",
        }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", letterSpacing:".12em", textTransform:"uppercase" }}>
            ব্যালেন্স
          </div>
          <div style={{
            fontWeight:900, fontSize:22, color:acc, letterSpacing:"-0.5px",
            textShadow:`0 0 20px rgba(${rgb},.6)`,
          }}>
            ৳{balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Game selector ───────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:10, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
        {GAMES.map(g => (
          <div key={g.id} className="game-tab"
            onClick={() => { if (!spinning) setGame(g); }}
            style={{
              background: game.id === g.id
                ? `linear-gradient(135deg,rgba(${g.glowRgb},.22),rgba(${g.glowRgb},.08))`
                : "linear-gradient(145deg,rgba(255,255,255,.03),rgba(255,255,255,.01))",
              borderColor: game.id === g.id
                ? `rgba(${g.glowRgb},.55)` : "rgba(255,255,255,.06)",
              boxShadow: game.id === g.id
                ? `0 0 24px rgba(${g.glowRgb},.3), 0 4px 12px rgba(0,0,0,.35)`
                : "4px 4px 12px rgba(0,0,0,.3),-2px -2px 6px rgba(255,255,255,.02)",
            }}
          >
            <div style={{
              fontWeight:800, fontSize:14, marginBottom:3,
              color: game.id === g.id ? g.accentColor : "#fff",
            }}>{g.name}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:6 }}>{g.theme}</div>
            <div style={{ display:"flex", gap:8, fontSize:10 }}>
              <span style={{ color:"#00e676" }}>RTP {g.rtp}%</span>
              <span style={{ color:"rgba(255,255,255,.35)" }}>{g.volatility}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>

        {/* ── Slot machine ──────────────────────────────────────────── */}
        <div className="slot-glass" style={{
          flex:"1 1 auto", padding:20, minWidth:0,
          boxShadow:`0 0 60px rgba(${rgb},.07), 0 8px 40px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.05)`,
          border:`1px solid rgba(${rgb},.15)`,
        }}>

          {/* Title + Jackpot */}
          <div style={{ textAlign:"center", marginBottom:18 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", letterSpacing:".2em", textTransform:"uppercase", marginBottom:4 }}>
              {game.theme}
            </div>
            <div style={{
              fontSize:28, fontWeight:900, letterSpacing:"-1px",
              color: acc,
              animation:"glowPulse 2.5s ease infinite",
            }}>
              {game.name}
            </div>
            <div style={{
              marginTop:10, display:"inline-block",
              padding:"6px 20px",
              background:`linear-gradient(90deg,rgba(${rgb},.18),rgba(${rgb},.08),rgba(${rgb},.18))`,
              borderRadius:30, border:`1px solid rgba(${rgb},.35)`,
              fontSize:13, fontWeight:800, color:acc,
              animation:"jackpotTick 2s ease infinite",
              boxShadow:`0 0 16px rgba(${rgb},.25)`,
            }}>
              JACKPOT ৳{game.jackpot.toLocaleString()}
            </div>
          </div>

          {/* Win message */}
          {msg && (
            <div style={{
              textAlign:"center", marginBottom:14, padding:"10px 16px",
              borderRadius:14, animation:"msgBounce .4s cubic-bezier(.34,1.56,.64,1)",
              background: totalWin > 0
                ? `linear-gradient(90deg,rgba(${rgb},.28),rgba(${rgb},.1))`
                : "rgba(239,68,68,.2)",
              border: totalWin > 0
                ? `1px solid rgba(${rgb},.55)` : "1px solid rgba(239,68,68,.4)",
              fontSize:20, fontWeight:900, letterSpacing:"2px",
              color: totalWin > 0 ? acc : "#f87171",
              boxShadow: totalWin > 0
                ? `0 0 30px rgba(${rgb},.3)` : "0 0 20px rgba(239,68,68,.2)",
            }}>
              {msg}
              {totalWin > 0 && (
                <span style={{ marginLeft:12, fontSize:15 }}>+৳{totalWin.toLocaleString()}</span>
              )}
            </div>
          )}

          {/* Free spins */}
          {freeSpins > 0 && (
            <div style={{
              textAlign:"center", marginBottom:12, padding:"8px 16px",
              borderRadius:10,
              background:"rgba(0,230,118,.12)", border:"1px solid rgba(0,230,118,.4)",
              fontSize:14, fontWeight:700, color:"#00e676",
              boxShadow:"0 0 16px rgba(0,230,118,.2)",
            }}>
              {freeSpins} ফ্রি স্পিন বাকি আছে
            </div>
          )}

          {/* Reels */}
          <div style={{
            display:"flex", gap:6, justifyContent:"center",
            padding:"18px 16px",
            background:`linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.35) 100%)`,
            borderRadius:18,
            border:`1px solid rgba(${rgb},.1)`,
            boxShadow:`inset 0 2px 24px rgba(0,0,0,.55),0 0 30px rgba(${rgb},.06)`,
            marginBottom:18, overflowX:"auto",
          }}>
            {Array.from({ length: game.reels }, (_, i) => (
              <Reel key={`${game.id}-${i}`}
                syms={game.symbols} spinning={spinning}
                final={pending[i] ?? grid[i]}
                delay={turbo ? 200 + i * 70 : 800 + i * 200}
                rows={game.rows} winRows={winRows} accent={acc}
              />
            ))}
          </div>

          {/* Win lines */}
          {wins.length > 0 && (
            <div style={{ marginBottom:14 }}>
              {wins.map((w, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
                  marginBottom:4, borderRadius:10,
                  background:`rgba(${rgb},.06)`,
                  border:`1px solid rgba(${rgb},.2)`, fontSize:13,
                }}>
                  <div style={{ width:28, height:28 }} dangerouslySetInnerHTML={{ __html: w.symbol.svg }}/>
                  <span style={{ flex:1, color:"rgba(255,255,255,.7)" }}>
                    {w.symbol.label} × {w.multiplier}x
                  </span>
                  <span style={{ fontWeight:800, color:acc }}>+৳{w.payout.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bet controls */}
          <div className="slot-neuro" style={{
            display:"flex", alignItems:"center", gap:10, padding:"14px 16px", marginBottom:14,
          }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.35)", letterSpacing:".12em", textTransform:"uppercase", minWidth:28 }}>
              BET
            </div>
            <button className="bet-btn-neuro"
              style={{ width:34, height:34, padding:0 }}
              onClick={() => setBet(b => Math.max(game.minBet, b - game.minBet))}>
              −
            </button>
            <div style={{
              flex:1, textAlign:"center", fontWeight:900, fontSize:20, color:acc,
              textShadow:`0 0 16px rgba(${rgb},.5)`,
            }}>
              ৳{bet.toLocaleString()}
            </div>
            <button className="bet-btn-neuro"
              style={{ width:34, height:34, padding:0 }}
              onClick={() => setBet(b => Math.min(game.maxBet, b + game.minBet))}>
              +
            </button>
            <button className="bet-btn-neuro"
              onClick={() => setBet(b => Math.min(game.maxBet, b * 2))}>×2</button>
            <button className="bet-btn-neuro"
              onClick={() => setBet(game.maxBet)}>MAX</button>
          </div>

          {/* Quick bet amounts */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
            {[10, 50, 100, 500].filter(v => v >= game.minBet && v <= game.maxBet).map(v => (
              <button key={v} className="bet-btn-neuro"
                style={{ borderColor: bet === v ? `rgba(${rgb},.5)` : undefined, color: bet === v ? acc : undefined }}
                onClick={() => setBet(v)}>
                ৳{v >= 1000 ? `${v/1000}K` : v}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", gap:10 }}>
            <button className="action-btn spin-btn"
              onClick={spin} disabled={spinning}>
              {spinning ? "স্পিনিং..." : freeSpins > 0 ? `FREE (${freeSpins})` : "SPIN ▶"}
            </button>
            <button className="action-btn auto-btn"
              onClick={() => setAuto(a => !a)}>
              {auto ? "STOP" : "AUTO"}
            </button>
            <button className="action-btn turbo-btn"
              onClick={() => setTurbo(t => !t)}>
              {turbo ? "⚡ ON" : "⚡"}
            </button>
          </div>
        </div>

        {/* ── Side panel ────────────────────────────────────────────── */}
        <div style={{ flex:"0 0 200px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* Game info */}
          <div className="slot-neuro" style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,.35)", letterSpacing:".18em", textTransform:"uppercase", marginBottom:12 }}>
              গেম তথ্য
            </div>
            {[
              ["রিল", `${game.reels}×${game.rows}`],
              ["RTP", `${game.rtp}%`],
              ["ভোলাটিলিটি", game.volatility],
              ["ন্যূনতম বাজি", `৳${game.minBet}`],
              ["সর্বোচ্চ বাজি", `৳${game.maxBet.toLocaleString()}`],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,.05)", fontSize:12,
              }}>
                <span style={{ color:"rgba(255,255,255,.45)" }}>{lbl}</span>
                <span style={{ fontWeight:700, color:"#fff" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Paytable */}
          <div className="slot-neuro" style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,.35)", letterSpacing:".18em", textTransform:"uppercase", marginBottom:12 }}>
              পেটেবল
            </div>
            {game.symbols.filter(s => s.value > 0).map(sym => (
              <div key={sym.id} className="paytable-row">
                <div style={{ width:28, height:28, flexShrink:0 }}
                  dangerouslySetInnerHTML={{ __html: sym.svg }}/>
                <span style={{ flex:1, fontSize:11, color:"rgba(255,255,255,.55)" }}>{sym.label}</span>
                <span style={{ fontSize:12, fontWeight:800, color:acc }}>×{sym.value}</span>
              </div>
            ))}
          </div>

          {/* History */}
          <div className="slot-neuro" style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,.35)", letterSpacing:".18em", textTransform:"uppercase", marginBottom:12 }}>
              সাম্প্রতিক স্পিন
            </div>
            {history.length === 0
              ? <div style={{ fontSize:11, color:"rgba(255,255,255,.25)", textAlign:"center", padding:"8px 0" }}>কোনো স্পিন নেই</div>
              : history.map((h, i) => (
                <div key={i} className="history-row">
                  <span style={{ color:"rgba(255,255,255,.4)" }}>৳{h.bet}</span>
                  <span style={{ fontWeight:700, color: h.win > 0 ? "#00e676" : "rgba(255,255,255,.25)" }}>
                    {h.win > 0 ? `+৳${h.win.toLocaleString()}` : "—"}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
