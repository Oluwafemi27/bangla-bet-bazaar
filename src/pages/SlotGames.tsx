import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Symbol {
  id: string;
  label: string;
  value: number;
  color: string;
  svg: string;
}

interface Game {
  id: string;
  name: string;
  theme: string;
  accentColor: string;
  glowColor: string;
  reels: number;
  rows: number;
  minBet: number;
  maxBet: number;
  rtp: number;
  volatility: "Low" | "Medium" | "High";
  jackpot: number;
  symbols: Symbol[];
}

interface WinLine {
  line: number[];
  symbol: Symbol;
  multiplier: number;
  payout: number;
}

// ─── SVG Symbol Icons ─────────────────────────────────────────────────────────
const symbolSVGs: Record<string, string> = {
  diamond: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 38,15 20,38 2,15" fill="url(#dg)" stroke="#fff" stroke-width="1.5"/><polygon points="20,2 38,15 20,20 2,15" fill="rgba(255,255,255,0.3)"/><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a8edff"/><stop offset="100%" stop-color="#2271ff"/></linearGradient></defs></svg>`,
  seven: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="5" y="32" font-size="30" font-weight="900" font-family="Arial" fill="url(#sg)">7</text><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe066"/><stop offset="100%" stop-color="#ff6b00"/></linearGradient></defs></svg>`,
  crown: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 30 L4 16 L12 24 L20 8 L28 24 L36 16 L36 30 Z" fill="url(#cg)" stroke="#fff" stroke-width="1"/><circle cx="4" cy="16" r="3" fill="#FFD700"/><circle cx="20" cy="8" r="3" fill="#FFD700"/><circle cx="36" cy="16" r="3" fill="#FFD700"/><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs></svg>`,
  bell: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4 C12 4 8 12 8 20 L8 28 L32 28 L32 20 C32 12 28 4 20 4Z" fill="url(#bg)" stroke="#fff" stroke-width="1"/><rect x="16" y="28" width="8" height="4" rx="2" fill="#e0a800"/><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFA500"/></linearGradient></defs></svg>`,
  cherry: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="28" r="7" fill="url(#chg1)"/><circle cx="27" cy="28" r="7" fill="url(#chg2)"/><path d="M13 21 Q20 4 27 21" stroke="#2d7a2d" stroke-width="2" fill="none"/><defs><linearGradient id="chg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#c0000a"/></linearGradient><linearGradient id="chg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#c0000a"/></linearGradient></defs></svg>`,
  bar: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="14" width="34" height="12" rx="3" fill="url(#barg)" stroke="#fff" stroke-width="1"/><text x="20" y="24" text-anchor="middle" font-size="9" font-weight="900" font-family="Arial" fill="#fff">BAR</text><defs><linearGradient id="barg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#555"/><stop offset="100%" stop-color="#222"/></linearGradient></defs></svg>`,
  star: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="20,3 24.5,14.5 37,14.5 26.5,21.5 30.5,33 20,26 9.5,33 13.5,21.5 3,14.5 15.5,14.5" fill="url(#stg)" stroke="#fff" stroke-width="1"/><defs><linearGradient id="stg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffb00"/><stop offset="100%" stop-color="#ff9800"/></linearGradient></defs></svg>`,
  wild: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="10" width="34" height="20" rx="4" fill="url(#wg)" stroke="rgba(255,255,255,0.6)" stroke-width="1"/><text x="20" y="25" text-anchor="middle" font-size="10" font-weight="900" font-family="Arial" fill="#fff">WILD</text><defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs></svg>`,
  scatter: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="url(#scg)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/><text x="20" y="24" text-anchor="middle" font-size="8" font-weight="900" font-family="Arial" fill="#fff">FREE</text><defs><linearGradient id="scg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs></svg>`,
  // Fruit theme
  watermelon: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 36 C8 36 4 28 4 20 L36 20 C36 28 32 36 20 36Z" fill="#e74c3c"/><path d="M4 20 L36 20 Q20 4 4 20Z" fill="#27ae60"/><circle cx="13" cy="26" r="2" fill="#333"/><circle cx="20" cy="28" r="2" fill="#333"/><circle cx="27" cy="26" r="2" fill="#333"/></svg>`,
  lemon: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="22" rx="14" ry="12" fill="url(#lg)" stroke="#e6b800" stroke-width="1"/><path d="M20 10 Q24 4 26 2" stroke="#27ae60" stroke-width="2" fill="none"/><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe566"/><stop offset="100%" stop-color="#f0b800"/></linearGradient></defs></svg>`,
  grape: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="22" r="6" fill="url(#gg)"/><circle cx="26" cy="22" r="6" fill="url(#gg)"/><circle cx="20" cy="14" r="6" fill="url(#gg)"/><circle cx="20" cy="30" r="5" fill="url(#gg)"/><path d="M20 8 Q22 4 24 2" stroke="#555" stroke-width="2" fill="none"/><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c77dff"/><stop offset="100%" stop-color="#7209b7"/></linearGradient></defs></svg>`,
  // Egyptian theme
  ankh: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="12" rx="7" ry="9" fill="none" stroke="url(#ang)" stroke-width="3"/><line x1="20" y1="21" x2="20" y2="37" stroke="url(#ang)" stroke-width="3"/><line x1="10" y1="26" x2="30" y2="26" stroke="url(#ang)" stroke-width="3"/><defs><linearGradient id="ang" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs></svg>`,
  eye: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20 Q20 6 36 20 Q20 34 4 20Z" fill="#1a0a00" stroke="url(#eyg)" stroke-width="1.5"/><circle cx="20" cy="20" r="6" fill="url(#eyg2)"/><circle cx="20" cy="20" r="3" fill="#fff"/><circle cx="21" cy="19" r="1" fill="#333"/><defs><linearGradient id="eyg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient><linearGradient id="eyg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4fc3f7"/><stop offset="100%" stop-color="#0288d1"/></linearGradient></defs></svg>`,
  scarab: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="22" rx="10" ry="13" fill="url(#scg2)"/><path d="M10 16 Q6 10 8 4" stroke="#27ae60" stroke-width="2" fill="none"/><path d="M30 16 Q34 10 32 4" stroke="#27ae60" stroke-width="2" fill="none"/><line x1="10" y1="20" x2="4" y2="18" stroke="#1a7a2a" stroke-width="2"/><line x1="30" y1="20" x2="36" y2="18" stroke="#1a7a2a" stroke-width="2"/><defs><linearGradient id="scg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4caf50"/><stop offset="100%" stop-color="#1b5e20"/></linearGradient></defs></svg>`,
};

// ─── Game Definitions ─────────────────────────────────────────────────────────
const GAMES: Game[] = [
  {
    id: "classic",
    name: "Lucky 7s",
    theme: "Classic Casino",
    accentColor: "#FFD700",
    glowColor: "255, 215, 0",
    reels: 3,
    rows: 3,
    minBet: 10,
    maxBet: 1000,
    rtp: 96.5,
    volatility: "Medium",
    jackpot: 250000,
    symbols: [
      { id: "seven", label: "7", value: 500, color: "#ff6b00", svg: symbolSVGs.seven },
      { id: "diamond", label: "Diamond", value: 200, color: "#2271ff", svg: symbolSVGs.diamond },
      { id: "crown", label: "Crown", value: 100, color: "#FFD700", svg: symbolSVGs.crown },
      { id: "bell", label: "Bell", value: 50, color: "#FFA500", svg: symbolSVGs.bell },
      { id: "bar", label: "BAR", value: 30, color: "#888", svg: symbolSVGs.bar },
      { id: "cherry", label: "Cherry", value: 20, color: "#c0000a", svg: symbolSVGs.cherry },
      { id: "wild", label: "Wild", value: 0, color: "#a855f7", svg: symbolSVGs.wild },
      { id: "scatter", label: "Free", value: 0, color: "#10b981", svg: symbolSVGs.scatter },
    ],
  },
  {
    id: "fruits",
    name: "Tropical Fruits",
    theme: "Fruit Fiesta",
    accentColor: "#10b981",
    glowColor: "16, 185, 129",
    reels: 5,
    rows: 3,
    minBet: 20,
    maxBet: 2000,
    rtp: 97.2,
    volatility: "Low",
    jackpot: 500000,
    symbols: [
      { id: "watermelon", label: "Melon", value: 300, color: "#e74c3c", svg: symbolSVGs.watermelon },
      { id: "grape", label: "Grape", value: 150, color: "#7209b7", svg: symbolSVGs.grape },
      { id: "lemon", label: "Lemon", value: 80, color: "#f0b800", svg: symbolSVGs.lemon },
      { id: "cherry", label: "Cherry", value: 40, color: "#c0000a", svg: symbolSVGs.cherry },
      { id: "star", label: "Star", value: 25, color: "#ff9800", svg: symbolSVGs.star },
      { id: "bell", label: "Bell", value: 15, color: "#FFA500", svg: symbolSVGs.bell },
      { id: "wild", label: "Wild", value: 0, color: "#a855f7", svg: symbolSVGs.wild },
      { id: "scatter", label: "Free", value: 0, color: "#10b981", svg: symbolSVGs.scatter },
    ],
  },
  {
    id: "egypt",
    name: "Pharaoh's Gold",
    theme: "Ancient Egypt",
    accentColor: "#B8860B",
    glowColor: "184, 134, 11",
    reels: 5,
    rows: 4,
    minBet: 50,
    maxBet: 5000,
    rtp: 95.8,
    volatility: "High",
    jackpot: 1000000,
    symbols: [
      { id: "ankh", label: "Ankh", value: 1000, color: "#FFD700", svg: symbolSVGs.ankh },
      { id: "eye", label: "Eye of Ra", value: 500, color: "#4fc3f7", svg: symbolSVGs.eye },
      { id: "scarab", label: "Scarab", value: 200, color: "#4caf50", svg: symbolSVGs.scarab },
      { id: "crown", label: "Crown", value: 100, color: "#FFD700", svg: symbolSVGs.crown },
      { id: "diamond", label: "Diamond", value: 50, color: "#2271ff", svg: symbolSVGs.diamond },
      { id: "bar", label: "BAR", value: 30, color: "#888", svg: symbolSVGs.bar },
      { id: "wild", label: "Wild", value: 0, color: "#a855f7", svg: symbolSVGs.wild },
      { id: "scatter", label: "Free", value: 0, color: "#10b981", svg: symbolSVGs.scatter },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeightedSymbol(symbols: Symbol[], extraWild = false): Symbol {
  const weights = symbols.map((s) => {
    if (s.id === "wild") return extraWild ? 8 : 3;
    if (s.id === "scatter") return 4;
    return Math.max(3, 20 - s.value / 30);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < symbols.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return symbols[i];
  }
  return symbols[symbols.length - 1];
}

function checkWins(
  grid: Symbol[][],
  bet: number,
  game: Game
): { wins: WinLine[]; totalPayout: number; freeSpins: number } {
  const wins: WinLine[] = [];
  let totalPayout = 0;
  let freeSpins = 0;
  const rows = game.rows;
  const reels = game.reels;

  // Check each row
  for (let row = 0; row < rows; row++) {
    let matchSymbol: Symbol | null = null;
    let matchCount = 0;
    for (let reel = 0; reel < reels; reel++) {
      const sym = grid[reel][row];
      if (sym.id === "wild") {
        matchCount++;
        continue;
      }
      if (matchSymbol === null) {
        matchSymbol = sym;
        matchCount++;
      } else if (sym.id === matchSymbol.id) {
        matchCount++;
      } else break;
    }
    if (matchCount >= 3 && matchSymbol) {
      const multiplier = matchCount === reels ? 10 : matchCount === 4 ? 5 : 2;
      const payout = Math.round(matchSymbol.value * multiplier * (bet / 100));
      wins.push({ line: [row], symbol: matchSymbol, multiplier, payout });
      totalPayout += payout;
    }
  }

  // Count scatters
  let scatterCount = 0;
  for (let reel = 0; reel < reels; reel++) {
    for (let row = 0; row < rows; row++) {
      if (grid[reel][row].id === "scatter") scatterCount++;
    }
  }
  if (scatterCount >= 3) freeSpins = scatterCount * 3;

  return { wins, totalPayout, freeSpins };
}

// ─── Reel Component ───────────────────────────────────────────────────────────
function Reel({
  symbols,
  spinning,
  finalSymbols,
  delay,
  rows,
  winningRows,
  accentColor,
}: {
  symbols: Symbol[];
  spinning: boolean;
  finalSymbols: Symbol[];
  delay: number;
  rows: number;
  winningRows: number[];
  accentColor: string;
}) {
  const [displaySymbols, setDisplaySymbols] = useState<Symbol[]>(finalSymbols);
  const [isSpinning, setIsSpinning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (spinning) {
      setIsSpinning(true);
      intervalRef.current = setInterval(() => {
        setDisplaySymbols(
          Array.from({ length: rows }, () =>
            symbols[Math.floor(Math.random() * symbols.length)]
          )
        );
      }, 80);

      timeoutRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplaySymbols(finalSymbols);
        setIsSpinning(false);
      }, delay);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [spinning, finalSymbols, delay, symbols, rows]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "8px",
        background: "rgba(0,0,0,0.4)",
        borderRadius: "12px",
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: isSpinning
          ? `0 0 20px rgba(${accentColor
              .replace("#", "")
              .match(/.{2}/g)!
              .map((h) => parseInt(h, 16))
              .join(",")},0.4) inset`
          : "none",
        transition: "box-shadow 0.3s ease",
        minWidth: "70px",
      }}
    >
      {displaySymbols.map((sym, i) => (
        <div
          key={i}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: winningRows.includes(i) && !isSpinning
              ? `rgba(255,255,255,0.15)`
              : "rgba(255,255,255,0.05)",
            border: winningRows.includes(i) && !isSpinning
              ? `2px solid ${accentColor}`
              : "2px solid transparent",
            boxShadow: winningRows.includes(i) && !isSpinning
              ? `0 0 16px ${accentColor}80, 0 0 32px ${accentColor}40`
              : "none",
            transition: "all 0.3s ease",
            animation: isSpinning ? "reelSpin 0.1s linear" : winningRows.includes(i) ? "winPulse 0.6s ease infinite alternate" : "none",
          }}
          dangerouslySetInnerHTML={{ __html: sym.svg }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SlotGames() {
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(selectedGame.minBet);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<Symbol[][]>(() =>
    Array.from({ length: selectedGame.reels }, () =>
      Array.from({ length: selectedGame.rows }, () =>
        selectedGame.symbols[Math.floor(Math.random() * selectedGame.symbols.length)]
      )
    )
  );
  const [pendingGrid, setPendingGrid] = useState<Symbol[][]>(grid);
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [totalWin, setTotalWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<{ win: number; bet: number }[]>([]);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const autoRef = useRef(false);

  // Reset when game changes
  useEffect(() => {
    setGrid(
      Array.from({ length: selectedGame.reels }, () =>
        Array.from({ length: selectedGame.rows }, () =>
          selectedGame.symbols[Math.floor(Math.random() * selectedGame.symbols.length)]
        )
      )
    );
    setBet(selectedGame.minBet);
    setWinLines([]);
    setTotalWin(0);
    setMessage(null);
    setFreeSpins(0);
    autoRef.current = false;
    setAutoSpin(false);
  }, [selectedGame]);

  const spin = useCallback(() => {
    if (spinning) return;
    if (freeSpins === 0 && balance < bet) {
      setMessage("Insufficient balance!");
      return;
    }
    if (freeSpins === 0) setBalance((b) => b - bet);
    else setFreeSpins((f) => f - 1);

    setMessage(null);
    setWinLines([]);
    setTotalWin(0);
    setSpinning(true);

    const newGrid: Symbol[][] = Array.from({ length: selectedGame.reels }, () =>
      Array.from({ length: selectedGame.rows }, () =>
        getWeightedSymbol(selectedGame.symbols, Math.random() < 0.1)
      )
    );
    setPendingGrid(newGrid);

    const spinDuration = turboMode ? 600 : 1800;
    setTimeout(() => {
      setGrid(newGrid);
      const { wins, totalPayout, freeSpins: newFree } = checkWins(newGrid, bet, selectedGame);
      setWinLines(wins);
      setTotalWin(totalPayout);
      if (totalPayout > 0) {
        setBalance((b) => b + totalPayout);
        setMessage(
          totalPayout >= bet * 50
            ? "MEGA WIN!"
            : totalPayout >= bet * 20
            ? "BIG WIN!"
            : "WIN!"
        );
      }
      if (newFree > 0) {
        setFreeSpins((f) => f + newFree);
        setMessage(`${newFree} FREE SPINS!`);
      }
      setHistory((h) => [{ win: totalPayout, bet }, ...h.slice(0, 9)]);
      setSpinning(false);
    }, spinDuration);
  }, [spinning, balance, bet, freeSpins, selectedGame, turboMode]);

  // Auto spin logic
  useEffect(() => {
    autoRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    if (!spinning && autoRef.current) {
      const t = setTimeout(() => {
        if (autoRef.current) spin();
      }, turboMode ? 200 : 600);
      return () => clearTimeout(t);
    }
  }, [spinning, spin, turboMode]);

  const winningRows = Array.from(new Set(winLines.flatMap((w) => w.line)));

  const accent = selectedGame.accentColor;
  const glow = selectedGame.glowColor;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)",
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      color: "#fff",
      padding: "16px",
    }}>
      <style>{`
        @keyframes reelSpin {
          0% { transform: translateY(-4px); opacity: 0.7; }
          100% { transform: translateY(4px); opacity: 1; }
        }
        @keyframes winPulse {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.5) rotate(180deg); opacity: 0; }
        }
        .spin-btn:hover { transform: scale(1.04); }
        .spin-btn:active { transform: scale(0.97); }
        .game-card:hover { transform: translateY(-3px); }
        .bet-btn:hover { background: rgba(255,255,255,0.15) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        padding: "16px 20px",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px",
            background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px",
            boxShadow: `0 0 16px rgba(${glow},0.5)`,
          }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
              <circle cx="7" cy="12" r="1.5" fill="white"/><circle cx="12" cy="12" r="1.5" fill="white"/><circle cx="17" cy="12" r="1.5" fill="white"/>
              <circle cx="7" cy="17" r="1.5" fill="white"/><circle cx="12" cy="17" r="1.5" fill="white"/><circle cx="17" cy="17" r="1.5" fill="white"/>
              <rect x="8" y="3" width="3" height="4" rx="1" fill="white"/><rect x="13" y="3" width="3" height="4" rx="1" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px" }}>Bangla Bet Bazaar</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Premium Slot Games</div>
          </div>
        </div>

        {/* Balance */}
        <div style={{
          padding: "10px 20px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>BALANCE</div>
          <div style={{ fontWeight: 800, fontSize: "20px", color: accent, letterSpacing: "-0.5px" }}>
            ৳{balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Game Selector */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
        {GAMES.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => { if (!spinning) setSelectedGame(game); }}
            style={{
              flex: "0 0 auto",
              padding: "14px 18px",
              borderRadius: "14px",
              cursor: "pointer",
              background: selectedGame.id === game.id
                ? `linear-gradient(135deg, rgba(${game.glowColor},0.25), rgba(${game.glowColor},0.1))`
                : "rgba(255,255,255,0.04)",
              border: selectedGame.id === game.id
                ? `1px solid rgba(${game.glowColor},0.5)`
                : "1px solid rgba(255,255,255,0.08)",
              boxShadow: selectedGame.id === game.id
                ? `0 0 20px rgba(${game.glowColor},0.3), 0 4px 12px rgba(0,0,0,0.3)`
                : "0 2px 8px rgba(0,0,0,0.2)",
              transition: "all 0.25s ease",
              backdropFilter: "blur(10px)",
              minWidth: "160px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px", color: selectedGame.id === game.id ? game.accentColor : "#fff" }}>
              {game.name}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>{game.theme}</div>
            <div style={{ display: "flex", gap: "8px", fontSize: "10px" }}>
              <span style={{ color: "#10b981" }}>RTP {game.rtp}%</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{game.volatility}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Game Area */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {/* Slot Machine */}
        <div style={{
          flex: "1 1 auto",
          padding: "24px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(30px)",
          border: `1px solid rgba(${glow},0.2)`,
          boxShadow: `0 0 60px rgba(${glow},0.08), 0 8px 32px rgba(0,0,0,0.5)`,
        }}>
          {/* Game Title + Jackpot */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "2px" }}>{selectedGame.theme}</div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: accent, letterSpacing: "-1px", animation: "glow-pulse 2s ease infinite" }}>
              {selectedGame.name}
            </div>
            <div style={{
              marginTop: "8px",
              display: "inline-block",
              padding: "6px 16px",
              background: `linear-gradient(90deg, rgba(${glow},0.2), rgba(${glow},0.1))`,
              borderRadius: "20px",
              border: `1px solid rgba(${glow},0.3)`,
              fontSize: "13px",
              fontWeight: 700,
              color: accent,
            }}>
              JACKPOT ৳{selectedGame.jackpot.toLocaleString()}
            </div>
          </div>

          {/* Win Message */}
          {message && (
            <div style={{
              textAlign: "center",
              marginBottom: "16px",
              padding: "10px",
              borderRadius: "12px",
              background: totalWin > 0
                ? `linear-gradient(90deg, rgba(${glow},0.3), rgba(${glow},0.1))`
                : "rgba(239,68,68,0.2)",
              border: totalWin > 0
                ? `1px solid rgba(${glow},0.5)`
                : "1px solid rgba(239,68,68,0.4)",
              fontSize: "18px",
              fontWeight: 900,
              color: totalWin > 0 ? accent : "#ef4444",
              letterSpacing: "2px",
              animation: "winPulse 0.4s ease",
            }}>
              {message}
              {totalWin > 0 && <span style={{ marginLeft: "10px", fontSize: "14px" }}>+৳{totalWin.toLocaleString()}</span>}
            </div>
          )}

          {/* Free Spins Badge */}
          {freeSpins > 0 && (
            <div style={{
              textAlign: "center",
              marginBottom: "12px",
              padding: "8px",
              borderRadius: "10px",
              background: "rgba(16,185,129,0.2)",
              border: "1px solid rgba(16,185,129,0.4)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#10b981",
            }}>
              {freeSpins} Free Spins Remaining
            </div>
          )}

          {/* Reels */}
          <div style={{
            display: "flex",
            gap: "6px",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "16px",
            border: `1px solid rgba(${glow},0.1)`,
            boxShadow: `inset 0 2px 20px rgba(0,0,0,0.5), 0 0 30px rgba(${glow},0.05)`,
            marginBottom: "20px",
            overflowX: "auto",
          }}>
            {Array.from({ length: selectedGame.reels }, (_, i) => (
              <Reel
                key={`${selectedGame.id}-${i}`}
                symbols={selectedGame.symbols}
                spinning={spinning}
                finalSymbols={pendingGrid[i] || grid[i]}
                delay={turboMode ? 200 + i * 80 : 800 + i * 200}
                rows={selectedGame.rows}
                winningRows={winningRows}
                accentColor={accent}
              />
            ))}
          </div>

          {/* Win Lines Display */}
          {winLines.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              {winLines.map((win, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  marginBottom: "4px",
                  border: `1px solid rgba(${glow},0.2)`,
                  fontSize: "13px",
                }}>
                  <div style={{ width: "28px", height: "28px" }} dangerouslySetInnerHTML={{ __html: win.symbol.svg }} />
                  <span style={{ flex: 1 }}>{win.symbol.label} × {win.multiplier}x</span>
                  <span style={{ fontWeight: 700, color: accent }}>+৳{win.payout.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bet Controls */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "16px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: "16px",
          }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", minWidth: "30px" }}>BET</div>
            <button className="bet-btn" onClick={() => setBet((b) => Math.max(selectedGame.minBet, b - selectedGame.minBet))} style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: "18px", cursor: "pointer", transition: "background 0.2s",
            }}>-</button>
            <div style={{
              flex: 1, textAlign: "center", fontWeight: 800, fontSize: "18px", color: accent,
            }}>৳{bet.toLocaleString()}</div>
            <button className="bet-btn" onClick={() => setBet((b) => Math.min(selectedGame.maxBet, b + selectedGame.minBet))} style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: "18px", cursor: "pointer", transition: "background 0.2s",
            }}>+</button>
            <button className="bet-btn" onClick={() => setBet(Math.min(selectedGame.maxBet, bet * 2))} style={{
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: "12px", cursor: "pointer", fontWeight: 600, transition: "background 0.2s",
            }}>×2</button>
            <button className="bet-btn" onClick={() => setBet(selectedGame.maxBet)} style={{
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: "12px", cursor: "pointer", fontWeight: 600, transition: "background 0.2s",
            }}>MAX</button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Spin */}
            <button
              className="spin-btn"
              onClick={spin}
              disabled={spinning}
              style={{
                flex: 2,
                padding: "18px",
                borderRadius: "14px",
                background: spinning
                  ? "rgba(255,255,255,0.1)"
                  : `linear-gradient(135deg, ${accent}, ${accent}aa)`,
                border: "none",
                color: "#000",
                fontWeight: 900,
                fontSize: "16px",
                cursor: spinning ? "not-allowed" : "pointer",
                boxShadow: spinning ? "none" : `0 0 30px rgba(${glow},0.5), 0 4px 16px rgba(0,0,0,0.4)`,
                transition: "all 0.2s ease",
                letterSpacing: "1px",
              }}
            >
              {spinning ? "SPINNING..." : freeSpins > 0 ? `FREE SPIN (${freeSpins})` : "SPIN"}
            </button>

            {/* Auto Spin */}
            <button
              onClick={() => setAutoSpin((a) => !a)}
              style={{
                flex: 1,
                padding: "18px",
                borderRadius: "14px",
                background: autoSpin
                  ? "rgba(239,68,68,0.2)"
                  : "rgba(255,255,255,0.06)",
                border: autoSpin
                  ? "1px solid rgba(239,68,68,0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: autoSpin ? "#ef4444" : "#fff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {autoSpin ? "STOP AUTO" : "AUTO"}
            </button>

            {/* Turbo */}
            <button
              onClick={() => setTurboMode((t) => !t)}
              style={{
                flex: 1,
                padding: "18px",
                borderRadius: "14px",
                background: turboMode
                  ? "rgba(251,191,36,0.2)"
                  : "rgba(255,255,255,0.06)",
                border: turboMode
                  ? "1px solid rgba(251,191,36,0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: turboMode ? "#fbbf24" : "#fff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              TURBO
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div style={{
          flex: "0 0 220px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}>
          {/* Game Info */}
          <div style={{
            padding: "18px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", marginBottom: "12px" }}>
              GAME INFO
            </div>
            {[
              { label: "Reels", value: `${selectedGame.reels}×${selectedGame.rows}` },
              { label: "RTP", value: `${selectedGame.rtp}%` },
              { label: "Volatility", value: selectedGame.volatility },
              { label: "Min Bet", value: `৳${selectedGame.minBet}` },
              { label: "Max Bet", value: `৳${selectedGame.maxBet.toLocaleString()}` },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: "13px",
              }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: "#fff" }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Symbol Paytable */}
          <div style={{
            padding: "18px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", marginBottom: "12px" }}>
              PAYTABLE
            </div>
            {selectedGame.symbols.filter((s) => s.value > 0).map((sym) => (
              <div key={sym.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ width: "28px", height: "28px", flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: sym.svg }} />
                <span style={{ flex: 1, fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{sym.label}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: accent }}>×{sym.value}</span>
              </div>
            ))}
          </div>

          {/* Spin History */}
          <div style={{
            padding: "18px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", marginBottom: "12px" }}>
              RECENT SPINS
            </div>
            {history.length === 0 ? (
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "8px 0" }}>No spins yet</div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: "12px",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>৳{h.bet}</span>
                  <span style={{ fontWeight: 600, color: h.win > 0 ? "#10b981" : "rgba(255,255,255,0.3)" }}>
                    {h.win > 0 ? `+৳${h.win.toLocaleString()}` : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
