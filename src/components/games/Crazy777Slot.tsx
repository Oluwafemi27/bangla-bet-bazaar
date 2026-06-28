import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./crazy777.css";

/* ============================================================
 * Crazy777 — fiery Vegas-style 5x3 slot, 20 paylines, 3333x max win.
 * Ported from the crazy-777-forge source repo and embedded directly
 * (no iframe / external host dependency).
 * ============================================================ */

type Sym = "seven" | "bar" | "bell" | "cherry" | "diamond" | "wild" | "scatter";

const SYMBOLS: Sym[] = ["seven", "bar", "bell", "cherry", "diamond", "wild", "scatter"];

const REEL_STRIPS: Sym[][] = [
  buildStrip({ cherry: 8, bell: 7, bar: 6, diamond: 5, seven: 3, wild: 2, scatter: 1 }),
  buildStrip({ cherry: 7, bell: 8, bar: 6, diamond: 5, seven: 3, wild: 2, scatter: 1 }),
  buildStrip({ cherry: 7, bell: 7, bar: 6, diamond: 6, seven: 3, wild: 3, scatter: 2 }),
  buildStrip({ cherry: 7, bell: 7, bar: 7, diamond: 5, seven: 3, wild: 2, scatter: 1 }),
  buildStrip({ cherry: 8, bell: 6, bar: 7, diamond: 5, seven: 3, wild: 2, scatter: 1 }),
];

function buildStrip(weights: Partial<Record<Sym, number>>): Sym[] {
  const out: Sym[] = [];
  for (const s of SYMBOLS) {
    const n = weights[s] ?? 0;
    for (let i = 0; i < n; i++) out.push(s);
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const PAYTABLE: Record<Exclude<Sym, "scatter" | "wild">, [number, number, number]> = {
  seven: [50, 250, 1000],
  diamond: [25, 100, 400],
  bar: [15, 60, 200],
  bell: [10, 40, 150],
  cherry: [5, 20, 80],
};

const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2], [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1], [1, 2, 2, 2, 1],
  [1, 0, 1, 0, 1], [1, 2, 1, 2, 1],
  [0, 1, 1, 1, 0], [2, 1, 1, 1, 2],
  [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
  [1, 1, 0, 1, 1], [1, 1, 2, 1, 1],
  [0, 0, 2, 0, 0], [2, 2, 0, 2, 2],
  [0, 2, 0, 2, 0],
];

function randomWindow(strip: Sym[]): [Sym, Sym, Sym] {
  const i = Math.floor(Math.random() * strip.length);
  return [strip[i % strip.length], strip[(i + 1) % strip.length], strip[(i + 2) % strip.length]];
}

type Grid = Sym[][];

function spinGrid(): Grid {
  return REEL_STRIPS.map((s) => randomWindow(s));
}

interface WinLine { line: number; sym: Sym; count: number; payout: number; positions: [number, number][]; }

function evaluate(grid: Grid, bet: number): { wins: WinLine[]; total: number; scatters: number } {
  const wins: WinLine[] = [];
  let total = 0;
  let scatters = 0;
  for (let r = 0; r < 5; r++) for (let row = 0; row < 3; row++) if (grid[r][row] === "scatter") scatters++;

  for (let li = 0; li < PAYLINES.length; li++) {
    const line = PAYLINES[li];
    const lineSyms = line.map((row, r) => grid[r][row]);
    let base: Sym | null = null;
    for (const s of lineSyms) { if (s !== "wild" && s !== "scatter") { base = s; break; } }
    if (!base) base = "seven";
    if ((base as Sym) === "scatter") continue;
    let count = 0;
    const positions: [number, number][] = [];
    for (let r = 0; r < 5; r++) {
      const s = lineSyms[r];
      if (s === base || s === "wild") { count++; positions.push([r, line[r]]); }
      else break;
    }
    if (count >= 3) {
      const table = PAYTABLE[base as keyof typeof PAYTABLE];
      const mult = table[count - 3];
      const payout = (mult * bet) / 20;
      wins.push({ line: li, sym: base, count, payout, positions });
      total += payout;
    }
  }
  return { wins, total, scatters };
}

export function Crazy777Slot() {
  const [grid, setGrid] = useState<Grid>(() => spinGrid());
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(20);
  const [lastWin, setLastWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [winCells, setWinCells] = useState<Set<string>>(new Set());
  const [fxKey, setFxKey] = useState(0);
  const reelTimers = useRef<number[]>([]);

  const winSet = useMemo(() => winCells, [winCells]);

  const playClink = useCallback(() => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; o.type = "triangle";
      g.gain.value = 0.0001;
      const t = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.start(t); o.stop(t + 0.26);
    } catch { /* noop */ }
  }, []);

  const doSpin = useCallback(() => {
    if (spinning) return;
    const isFree = freeSpins > 0;
    if (!isFree && balance < bet) return;
    if (!isFree) setBalance((b) => b - bet);
    setSpinning(true);
    setLastWin(0);
    setWinCells(new Set());
    setToast(null);

    const target = spinGrid();
    reelTimers.current.forEach((t) => clearTimeout(t));
    reelTimers.current = [];
    const tempGrid: Grid = grid.map((c) => [...c] as [Sym, Sym, Sym]);

    for (let r = 0; r < 5; r++) {
      const t = window.setTimeout(() => {
        tempGrid[r] = target[r];
        setGrid(tempGrid.map((c) => [...c] as [Sym, Sym, Sym]));
        if (r === 4) {
          const { wins, total, scatters } = evaluate(target, bet);
          const win = total * multiplier;
          if (scatters >= 3) {
            const award = 8 + (scatters - 3) * 2;
            setFreeSpins((fs) => fs + award);
            setMultiplier((m) => Math.min(3333, Math.max(m, 3)));
            setToast(`FREE SPINS +${award}`);
          }
          if (win > 0) {
            const cells = new Set<string>();
            wins.forEach((w) => w.positions.forEach(([rr, row]) => cells.add(`${rr}:${row}`)));
            setWinCells(cells);
            setLastWin(win);
            setBalance((b) => b + win);
            setFxKey((k) => k + 1);
            playClink();
            if (win >= bet * 10) {
              setShake(true);
              setToast(`BIG WIN  +${Math.round(win)}`);
              window.setTimeout(() => setShake(false), 600);
            }
          }
          if (isFree) {
            setFreeSpins((fs) => Math.max(0, fs - 1));
            if (freeSpins - 1 <= 0) setMultiplier(1);
          }
          setSpinning(false);
        }
      }, 350 + r * 220);
      reelTimers.current.push(t);
    }
  }, [spinning, balance, bet, grid, freeSpins, multiplier, playClink]);

  useEffect(() => () => { reelTimers.current.forEach((t) => clearTimeout(t)); }, []);

  useEffect(() => {
    if (!spinning && freeSpins > 0) {
      const t = window.setTimeout(() => doSpin(), 900);
      return () => clearTimeout(t);
    }
  }, [spinning, freeSpins, doSpin]);

  const adjustBet = (dir: 1 | -1) => {
    const steps = [10, 20, 50, 100, 200, 500];
    const i = steps.indexOf(bet);
    const next = steps[Math.max(0, Math.min(steps.length - 1, (i < 0 ? 1 : i) + dir))];
    setBet(next);
  };

  return (
    <div className="c7-shell">
      <div className={`c7-stage ${shake ? "c7-shake" : ""}`}>
        <div className="c7-topbar">
          <div className="c7-brand">JILI</div>
          <div className="c7-hot">🔥 HOT</div>
          <div className="c7-maxbanner">
            <b>3333x</b>
            <span>MAX WIN</span>
          </div>
        </div>

        <h1 className="c7-title"><em>CRAZY</em><em>777</em></h1>
        {freeSpins > 0 && <div className="c7-freespin">FREE SPINS · {freeSpins} · x{multiplier}</div>}

        <div className="c7-cabinet">
          <div className="c7-reels">
            {grid.map((col, r) => (
              <Reel key={r} reelIndex={r} target={col} spinning={spinning} winSet={winSet} fxKey={fxKey} />
            ))}
          </div>
          {toast && <div className="c7-wintoast" key={toast + fxKey}>{toast}</div>}
        </div>

        <div className="c7-hud">
          <div>
            <div className="c7-pill">
              <span className="lbl">Balance</span>
              <span className="val">{Math.floor(balance)}</span>
            </div>
            <div className="c7-betctrl">
              <button onClick={() => adjustBet(-1)} aria-label="bet down">−</button>
              <div className="c7-pill" style={{ padding: "4px 14px" }}>
                <span className="lbl">Bet</span>
                <span className="val" style={{ fontSize: "1.1rem" }}>{bet}</span>
              </div>
              <button onClick={() => adjustBet(1)} aria-label="bet up">+</button>
            </div>
          </div>

          <button className="c7-spin" disabled={spinning} onClick={doSpin}>
            {spinning ? "···" : freeSpins > 0 ? "FREE" : "SPIN"}
          </button>

          <div>
            <div className="c7-pill">
              <span className="lbl">Last Win</span>
              <span className="val">{Math.floor(lastWin)}</span>
            </div>
            <div className="c7-pill" style={{ marginTop: 6 }}>
              <span className="lbl">Lines</span>
              <span className="val" style={{ fontSize: "1.1rem" }}>20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reel({
  reelIndex,
  target,
  spinning,
  winSet,
  fxKey,
}: {
  reelIndex: number;
  target: [Sym, Sym, Sym] | Sym[];
  spinning: boolean;
  winSet: Set<string>;
  fxKey: number;
}) {
  const blur = useMemo(() => {
    const arr: Sym[] = [];
    const strip = REEL_STRIPS[reelIndex];
    for (let i = 0; i < 18; i++) arr.push(strip[Math.floor(Math.random() * strip.length)]);
    return arr;
  }, [reelIndex, spinning ? fxKey + reelIndex : 0]);

  return (
    <div className="c7-reel">
      <div
        className="c7-strip"
        style={
          spinning
            ? { transform: "translateY(-78%)", transition: `transform ${0.35 + reelIndex * 0.22}s cubic-bezier(.4,.05,.2,1)` }
            : { transform: "translateY(0)", transition: "transform 0.2s ease-out" }
        }
      >
        {(spinning ? blur : (target as Sym[])).map((s, row) => {
          const key = `${reelIndex}:${row}`;
          const isWin = !spinning && winSet.has(key);
          return (
            <div key={row} className="c7-cell" data-win={isWin ? "1" : "0"}>
              <div className={`c7-symbol s-${s}`} />
              {isWin && <div className="c7-fx" data-on="1" key={fxKey} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
