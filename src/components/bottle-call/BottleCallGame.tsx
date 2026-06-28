import { useCallback, useEffect, useRef, useState } from "react";
import bottleImg from "@/assets/bottle.png";

type Side = "heads" | "tails";
type Phase = "idle" | "calling" | "spinning" | "result";

const CALL_WINDOW_MS = 7000;
const SPIN_MS = 2600;
const MAX_MISSES = 5;
const BEST_KEY = "bottle-call:best";

export function BottleCallGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pick, setPick] = useState<Side | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [misses, setMisses] = useState(0);
  const [callMsLeft, setCallMsLeft] = useState(CALL_WINDOW_MS);
  const [angle, setAngle] = useState(-18);
  const [lastResult, setLastResult] = useState<{ win: boolean; side: Side; gained: number } | null>(null);

  const callStartRef = useRef(0);
  const callRafRef = useRef<number | null>(null);
  const angleRef = useRef(angle);
  useEffect(() => { angleRef.current = angle; }, [angle]);

  useEffect(() => {
    try {
      const v = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
      if (!Number.isNaN(v)) setBest(v);
    } catch {}
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      try { localStorage.setItem(BEST_KEY, String(score)); } catch {}
    }
  }, [score, best]);

  const stopCallTimer = useCallback(() => {
    if (callRafRef.current) cancelAnimationFrame(callRafRef.current);
    callRafRef.current = null;
  }, []);

  const startCalling = useCallback(() => {
    setPhase("calling");
    setPick(null);
    setLastResult(null);
    setCallMsLeft(CALL_WINDOW_MS);
    callStartRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - callStartRef.current;
      const left = Math.max(0, CALL_WINDOW_MS - elapsed);
      setCallMsLeft(left);
      if (left <= 0) {
        setMisses((m) => Math.min(MAX_MISSES, m + 1));
        setStreak(0);
        setPhase("idle");
        return;
      }
      callRafRef.current = requestAnimationFrame(tick);
    };
    callRafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => stopCallTimer(), [stopCallTimer]);

  const spin = useCallback(() => {
    if (!pick) return;
    stopCallTimer();
    setPhase("spinning");
    const result: Side = Math.random() < 0.5 ? "heads" : "tails";
    const spins = 5 + Math.floor(Math.random() * 4);
    const finalDeg = result === "heads" ? 270 : 90;
    const currentAngle = angleRef.current;
    const jitter = Math.random() * 30 - 15;
    const target = currentAngle + spins * 360 + ((finalDeg - ((currentAngle % 360) + 360) % 360) + 360) % 360 + jitter;
    setAngle(target);

    window.setTimeout(() => {
      const win = result === pick;
      const gained = win ? 10 + streak * 2 : 0;
      setLastResult({ win, side: result, gained });
      if (win) {
        setScore((s) => s + gained);
        setStreak((s) => s + 1);
      } else {
        setMisses((m) => Math.min(MAX_MISSES, m + 1));
        setStreak(0);
      }
      setPhase("result");
    }, SPIN_MS + 60);
  }, [pick, streak, stopCallTimer]);

  const nextRound = () => {
    if (misses >= MAX_MISSES) {
      setScore(0);
      setStreak(0);
      setMisses(0);
      setLastResult(null);
      setPick(null);
      setPhase("idle");
      return;
    }
    setPick(null);
    setLastResult(null);
    startCalling();
  };

  const gameOver = misses >= MAX_MISSES;
  const begin = () => {
    setScore(0);
    setStreak(0);
    setMisses(0);
    startCalling();
  };

  const secondsLeft = (callMsLeft / 1000).toFixed(1);
  const callPct = phase === "calling" ? 1 - callMsLeft / CALL_WINDOW_MS : 0;

  return (
    <div className="bottle-call">
      <div className="bc-bg" aria-hidden />
      <div className="vignette" aria-hidden />

      <div className="hud">
        <div className="hud-badge">
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div className="hud-badge">
          <span>Streak</span>
          <strong>x{streak}</strong>
        </div>
        <div className="hud-badge">
          <span>Best</span>
          <strong>{best}</strong>
        </div>
      </div>

      <div className="status-bar">
        <span>
          {phase === "calling" && "Pick a side, then spin"}
          {phase === "spinning" && "Spinning…"}
          {phase === "result" && (lastResult?.win ? "Called it!" : gameOver ? "Game over" : "Missed")}
          {phase === "idle" && (gameOver ? "Tap PICK to restart" : "Tap PICK to start")}
        </span>
        <strong>
          {phase === "calling" ? `${secondsLeft}s` : phase === "result" && lastResult?.win ? `+${lastResult.gained}` : "—"}
        </strong>
        <i style={{ transform: `scaleX(${callPct})` }} />
      </div>

      <div className="miss-row" aria-label="lives">
        {Array.from({ length: MAX_MISSES }).map((_, i) => (
          <span key={i} className={i < misses ? "spent" : ""} />
        ))}
      </div>

      <div className="arena">
        <div className="arena-ring" aria-hidden />
        <div className="arena-split" aria-hidden>
          <div className="half heads-half" />
          <div className="half tails-half" />
          <div className="arena-inner-ring" />
        </div>
        <div
          className={`bottle-wrap ${phase === "spinning" ? "spinning" : ""}`}
          style={{
            transform: `rotate(${angle}deg)`,
            transition:
              phase === "spinning"
                ? `transform ${SPIN_MS}ms cubic-bezier(.15,.7,.2,1)`
                : "transform .6s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <img
            src={bottleImg}
            alt="Bottle"
            draggable={false}
            width={576}
            height={1152}
            className="bottle-img"
          />
        </div>
      </div>

      <div className="choice-panel">
        <button
          className={`choice-button heads ${pick === "heads" ? "selected" : ""}`}
          disabled={phase !== "calling"}
          onClick={() => setPick("heads")}
        >
          <svg viewBox="0 0 32 32" aria-hidden>
            <defs>
              <radialGradient id="hg" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#9bfff7" />
                <stop offset="100%" stopColor="#0c6470" />
              </radialGradient>
            </defs>
            <circle cx="16" cy="16" r="13" fill="url(#hg)" stroke="#72fff5" strokeWidth="1.5" />
            <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="900" fill="#04181b">H</text>
          </svg>
          <span>Heads</span>
        </button>

        <button
          className="spin-button"
          disabled={(phase === "calling" && !pick) || phase === "spinning"}
          onClick={() => {
            if (phase === "idle" || gameOver) begin();
            else if (phase === "result") nextRound();
            else if (phase === "calling" && pick) spin();
          }}
        >
          {phase === "calling" ? "Spin" : phase === "result" ? (gameOver ? "Retry" : "Next") : "Pick"}
        </button>

        <button
          className={`choice-button tails ${pick === "tails" ? "selected" : ""}`}
          disabled={phase !== "calling"}
          onClick={() => setPick("tails")}
        >
          <svg viewBox="0 0 32 32" aria-hidden>
            <defs>
              <radialGradient id="tg" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffe1a3" />
                <stop offset="100%" stopColor="#5b3306" />
              </radialGradient>
            </defs>
            <circle cx="16" cy="16" r="13" fill="url(#tg)" stroke="#ffd279" strokeWidth="1.5" />
            <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="900" fill="#2a1604">T</text>
          </svg>
          <span>Tails</span>
        </button>
      </div>

      {phase === "result" && lastResult && (
        <div className="result-flash" aria-hidden>
          <div className={`flash ${lastResult.win ? "win" : "lose"}`} />
        </div>
      )}
    </div>
  );
}
