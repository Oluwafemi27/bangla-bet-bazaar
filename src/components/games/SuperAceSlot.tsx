import { useCallback, useMemo, useRef, useState } from "react";
import "./superace.css";

/* ============================================================
 * Super Ace — JILI-style 6x5 tumbling reels slot
 * Symbols: A, K, Q, J, 10, 9, WILD (Ace), SCATTER (chip)
 * Tumbling/cascade reels. Wild lands -> multiplier x2..x10.
 * 4+ Scatters -> Free Spins with rising multiplier.
 * Max win cap: 1500x. RTP target ~96.7% (visual demo only).
 *
 * Ported from the ace-of-gold-slots source repo and embedded directly
 * (no iframe / external host dependency). The mascot/chip/backdrop
 * images from the source project live in Lovable's hosted asset
 * storage and aren't portable outside it, so they're replaced here
 * with CSS + emoji equivalents that keep the same visual language.
 * ============================================================ */

type Sym = "A" | "K" | "Q" | "J" | "T" | "N" | "W" | "S";

const ROWS = 5;
const COLS = 6;
const PAYLINES = 20;

const SUITS = ["♠", "♥", "♣", "♦"] as const;
type Suit = (typeof SUITS)[number];

const SYM_META: Record<Sym, { label: string; rare: number }> = {
  A: { label: "A", rare: 14 },
  K: { label: "K", rare: 14 },
  Q: { label: "Q", rare: 16 },
  J: { label: "J", rare: 18 },
  T: { label: "10", rare: 20 },
  N: { label: "9", rare: 22 },
  W: { label: "WILD", rare: 3 },
  S: { label: "SCATTER", rare: 4 },
};

const PAYS: Record<Sym, [number, number, number, number]> = {
  A: [1.0, 2.5, 8.0, 20.0],
  K: [0.7, 2.0, 6.0, 15.0],
  Q: [0.5, 1.5, 4.5, 12.0],
  J: [0.4, 1.2, 3.5, 9.0],
  T: [0.3, 1.0, 2.5, 7.0],
  N: [0.25, 0.8, 2.0, 5.0],
  W: [0, 0, 0, 0],
  S: [0, 0, 0, 0],
};

const REGULAR: Sym[] = ["A", "K", "Q", "J", "T", "N"];

function weightedPick(): Sym {
  const entries: [Sym, number][] = (Object.keys(SYM_META) as Sym[]).map((k) => [k, SYM_META[k].rare]);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    if ((r -= w) <= 0) return k;
  }
  return "N";
}

function newGrid(): Sym[][] {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => weightedPick()));
}

function evaluate(grid: Sym[][]): { wins: { cells: [number, number][]; sym: Sym; pay: number }[]; scatters: [number, number][] } {
  const wins: { cells: [number, number][]; sym: Sym; pay: number }[] = [];
  const scatters: [number, number][] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === "S") scatters.push([r, c]);
    }
  }

  for (const sym of REGULAR) {
    const cells: [number, number][] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === sym || grid[r][c] === "W") cells.push([r, c]);
      }
    }
    if (cells.length >= 3) {
      const count = Math.min(cells.length, 6);
      const payIdx = Math.min(count - 3, 3);
      const pay = PAYS[sym][payIdx] * (PAYLINES / 20);
      if (pay > 0) wins.push({ cells, sym, pay });
    }
  }

  return { wins, scatters };
}

function cascade(grid: Sym[][], removeMask: boolean[][]): Sym[][] {
  const out = grid.map((row) => [...row]);
  for (let c = 0; c < COLS; c++) {
    const col: Sym[] = [];
    for (let r = ROWS - 1; r >= 0; r--) if (!removeMask[r][c]) col.push(out[r][c]);
    while (col.length < ROWS) col.push(weightedPick());
    for (let r = ROWS - 1; r >= 0; r--) out[r][c] = col[ROWS - 1 - r];
  }
  return out;
}

export function SuperAceSlot() {
  const [started, setStarted] = useState(false);
  const [grid, setGrid] = useState<Sym[][]>(() => newGrid());
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(1);
  const [lastWin, setLastWin] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [removed, setRemoved] = useState<boolean[][] | null>(null);
  const [winFlash, setWinFlash] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [coinRainSeed, setCoinRainSeed] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [message, setMessage] = useState<string>("");
  const stopRef = useRef(false);

  const audioCtx = useRef<AudioContext | null>(null);
  const ensureAudio = () => {
    if (!audioCtx.current) {
      try {
        audioCtx.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch { /* noop */ }
    }
    return audioCtx.current;
  };

  const playTone = (freq: number, dur = 0.12, type: OscillatorType = "sine", gain = 0.08) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = 0; g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  };

  const sfxShuffle = () => { for (let i = 0; i < 6; i++) setTimeout(() => playTone(400 + Math.random() * 400, 0.05, "square", 0.04), i * 30); };
  const sfxChip = () => playTone(900, 0.08, "triangle", 0.06);
  const sfxWin = () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.18, "triangle", 0.1), i * 90)); };
  const sfxBig = () => { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => playTone(f, 0.22, "sawtooth", 0.08), i * 80)); };

  const doSpin = useCallback(async () => {
    if (spinning) return;
    const cost = freeSpins > 0 ? 0 : bet;
    if (balance < cost) { setMessage("Insufficient balance"); return; }
    setMessage("");
    setBalance((b) => b - cost);
    if (freeSpins > 0) setFreeSpins((f) => f - 1);
    setSpinning(true);
    setLastWin(0);
    sfxShuffle();

    let current = newGrid();
    setGrid(current);
    await new Promise((r) => setTimeout(r, 380));

    let totalWin = 0;
    let chainMult = freeSpins > 0 ? Math.min(10, 2 + Math.floor(Math.random() * 4)) : 1;
    setMultiplier(chainMult);
    let cascadeCount = 0;

    while (!stopRef.current) {
      const { wins, scatters } = evaluate(current);
      if (wins.length === 0) break;

      const mask: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      let baseWin = 0;
      for (const w of wins) {
        for (const [r, c] of w.cells) mask[r][c] = true;
        baseWin += w.pay * bet;
      }

      const hasWild = wins.some((w) => w.cells.some(([r, c]) => current[r][c] === "W"));
      if (hasWild) {
        const m = [2, 2, 3, 3, 5, 5, 8, 10][Math.floor(Math.random() * 8)];
        chainMult = Math.min(10, chainMult * (cascadeCount === 0 ? m : 2));
        setMultiplier(chainMult);
        setShowMascot(true);
        setTimeout(() => setShowMascot(false), 1500);
        sfxBig();
      }

      const cycleWin = baseWin * chainMult;
      totalWin += cycleWin;
      sfxWin();
      setRemoved(mask);
      await new Promise((r) => setTimeout(r, 420));
      current = cascade(current, mask);
      setRemoved(null);
      setGrid(current);
      cascadeCount++;
      await new Promise((r) => setTimeout(r, 360));

      if (scatters.length >= 4 && freeSpins === 0) {
        const fs = 8 + (scatters.length - 4) * 4;
        setFreeSpins(fs);
        setMessage(`🎉 ${fs} FREE SPINS!`);
        sfxBig();
      }
    }

    totalWin = Math.min(totalWin, bet * 1500);
    if (totalWin > 0) {
      setLastWin(totalWin);
      setBalance((b) => b + totalWin);
      if (totalWin >= bet * 50) {
        setWinFlash(true);
        setCoinRainSeed((s) => s + 1);
        setTimeout(() => setWinFlash(false), 700);
        sfxBig();
      }
    }
    sfxChip();
    setSpinning(false);
  }, [spinning, bet, balance, freeSpins]);

  const coins = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);

  if (!started) {
    return (
      <div className="super-ace-shell sa-fixed-fill grid place-items-center">
        <button
          onClick={() => { setStarted(true); ensureAudio(); }}
          className="grid place-items-center gap-3 px-6 py-8 text-center"
        >
          <div className="sa-font-display sa-gold-text text-5xl sm:text-6xl font-black tracking-tight leading-none">SUPER ACE</div>
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">JILI · Tumbling Reels · 1500× Max Win</div>
          <div className="sa-mascot-emoji mt-2" aria-label="Ace Wild">🂡</div>
          <div className="mt-4 rounded-full border border-amber-300/60 bg-black/60 px-5 py-2 text-sm font-bold text-amber-100 shadow-[0_0_24px_rgba(255,200,80,0.35)]">
            ▶ Tap to Play
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="super-ace-shell sa-fixed-fill flex flex-col">
      <header className="relative flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <div className="flex flex-col items-start gap-1">
          <div className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-amber-200 border border-amber-300/40">JILI</div>
          <div className="-rotate-6 rounded bg-gradient-to-r from-red-700 to-red-500 px-2 py-0.5 text-[11px] font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-amber-300/60">
            1500× MAX
          </div>
        </div>

        <div className="sa-font-display sa-gold-text text-2xl sm:text-3xl font-black tracking-tight leading-none">SUPER ACE</div>

        <div className="flex flex-col items-end gap-1">
          <div className="rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-2 py-0.5 text-[10px] font-black text-white shadow-[0_0_12px_rgba(255,80,0,0.6)] border border-amber-200/60">
            🔥 HOT
          </div>
          {freeSpins > 0 && (
            <div className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-black">
              FREE × {freeSpins}
            </div>
          )}
        </div>
      </header>

      <main className="relative flex-1 px-2 pb-2">
        <div className="sa-panel-glass relative h-full w-full overflow-hidden rounded-2xl p-2">
          <div className="relative grid h-full w-full grid-cols-6 gap-1.5">
            {Array.from({ length: COLS }).map((_, c) => (
              <div key={c} className="grid grid-rows-5 gap-1.5">
                {Array.from({ length: ROWS }).map((_, r) => {
                  const sym = grid[r][c];
                  const isRemoving = removed?.[r][c];
                  return <Cell key={`${r}-${c}-${sym}`} sym={sym} r={r} c={c} removing={!!isRemoving} />;
                })}
              </div>
            ))}
          </div>

          {multiplier > 1 && (
            <div className="absolute right-3 top-3 rounded-lg bg-black/80 px-2 py-1 text-sm font-black text-amber-300 border border-amber-300/60 shadow-[0_0_16px_rgba(255,200,80,0.5)]">
              × {multiplier}
            </div>
          )}

          {showMascot && <div className="sa-mascot-pop sa-mascot-emoji pointer-events-none absolute left-1/2 top-1/2" aria-hidden>🂡</div>}

          {winFlash && <div className="sa-win-flash pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-200/40 via-amber-400/30 to-transparent" />}

          {winFlash && (
            <div key={coinRainSeed} className="pointer-events-none absolute inset-0 overflow-hidden">
              {coins.map((i) => (
                <div
                  key={i}
                  className="sa-coin-rain absolute text-2xl"
                  style={{
                    left: `${(i * 53) % 100}%`,
                    top: `-${Math.random() * 20}vh`,
                    animationDelay: `${Math.random() * 0.6}s`,
                  }}
                  aria-hidden
                >
                  🪙
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className="pointer-events-none absolute inset-x-0 top-1/3 text-center">
              <div className="inline-block rounded-full bg-black/85 px-5 py-2 text-lg font-black text-amber-300 border border-amber-300/70 shadow-[0_0_24px_rgba(255,200,80,0.6)]">
                {message}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative grid grid-cols-3 items-center gap-2 px-3 pb-4 pt-2">
        <div className="sa-panel-glass rounded-xl px-3 py-2">
          <div className="text-[9px] uppercase tracking-widest text-amber-200/70">Balance</div>
          <div className="sa-font-display text-base font-black text-amber-100 leading-none">{balance.toFixed(2)}</div>
          <div className="mt-1 text-[9px] uppercase tracking-widest text-amber-200/70">Win</div>
          <div className="sa-font-display text-sm font-black text-amber-300 leading-none">{lastWin.toFixed(2)}</div>
        </div>

        <div className="flex flex-col items-center">
          <button
            disabled={spinning}
            onClick={doSpin}
            aria-label="Spin"
            className="sa-chip-btn relative grid h-24 w-24 place-items-center rounded-full sa-font-display text-xl font-black text-amber-950 disabled:opacity-70"
          >
            <span className="absolute inset-2 grid place-items-center rounded-full">
              {spinning ? "…" : freeSpins > 0 ? "FREE" : "SPIN"}
            </span>
          </button>
        </div>

        <div className="sa-panel-glass flex flex-col items-end gap-1 rounded-xl px-3 py-2">
          <div className="text-[9px] uppercase tracking-widest text-amber-200/70">Bet</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBet((b) => Math.max(0.2, +(b - 0.2).toFixed(2)))}
              className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-amber-200 border border-amber-300/40"
            >−</button>
            <div className="sa-font-display min-w-[3rem] text-center text-base font-black text-amber-100">{bet.toFixed(2)}</div>
            <button
              onClick={() => setBet((b) => Math.min(50, +(b + 0.2).toFixed(2)))}
              className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-amber-200 border border-amber-300/40"
            >+</button>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-amber-200/70">{PAYLINES} lines</div>
        </div>
      </footer>
    </div>
  );
}

function suitFor(sym: Sym, r: number, c: number): Suit {
  const h = (r * 31 + c * 17 + sym.charCodeAt(0) * 7) % 4;
  return SUITS[h];
}

function Cell({ sym, r, c, removing }: { sym: Sym; r: number; c: number; removing: boolean }) {
  const meta = SYM_META[sym];
  const suit = suitFor(sym, r, c);
  const isRed = suit === "♥" || suit === "♦";
  const rankColor = isRed ? "#c0202a" : "#1a1a1a";

  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-[10px] ${removing ? "sa-pop-out sa-win-glow" : "sa-tumble-in"}`}
      style={{
        background:
          sym === "W"
            ? "linear-gradient(160deg,#0f3a28,#062014)"
            : sym === "S"
              ? "radial-gradient(circle at 50% 35%,#3a2a08,#0a0a0a)"
              : "linear-gradient(180deg,#fff4d4 0%,#ffe7a8 55%,#e7c071 100%)",
        boxShadow: "inset 0 0 0 2px #c8973a, inset 0 0 0 3px #2a1a05, 0 2px 4px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {sym === "W" ? (
        <>
          <span className="text-3xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]" aria-label="Wild">🂡</span>
          <span className="absolute bottom-0.5 sa-font-display text-[9px] font-black tracking-widest text-amber-300">WILD</span>
        </>
      ) : sym === "S" ? (
        <span className="text-3xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]" aria-label="Scatter">🪙</span>
      ) : (
        <div className="relative grid place-items-center leading-none" style={{ color: rankColor }}>
          <span
            className="sa-font-display select-none font-black"
            style={{
              fontSize: meta.label.length > 1 ? "1.35rem" : "1.75rem",
              textShadow: "0 1px 0 rgba(255,255,255,0.5)",
              letterSpacing: "-0.02em",
            }}
          >
            {meta.label}
          </span>
          <span className="select-none font-black" style={{ fontSize: "1.4rem", marginTop: "-2px", lineHeight: 1 }}>
            {suit}
          </span>
        </div>
      )}
    </div>
  );
}
