import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/aviator")({
  head: () => ({ meta: [{ title: "অ্যাভিয়েটর — বাজি কিং" }] }),
  component: Aviator,
});

function nextCrash(): number {
  const r = Math.random();
  if (r < 0.03) return 1.0;
  const m = 1 + Math.pow(Math.random(), 2.2) * 24;
  return +Math.max(1.0, m).toFixed(2);
}

// ─── SVG Plane component ────────────────────────────────────────────────────
function SvgPlane({ crashed, multiplier }: { crashed: boolean; multiplier: number }) {
  const tilt = crashed ? 75 : Math.min(35, (multiplier - 1) * 4);
  return (
    <svg
      width="56" height="28"
      viewBox="0 0 56 28"
      style={{
        transform: `rotate(-${tilt}deg)`,
        transition: "transform 0.15s ease-out",
        filter: crashed
          ? "grayscale(1) drop-shadow(0 0 4px rgba(255,60,60,0.5))"
          : "drop-shadow(0 0 8px rgba(240,192,64,0.9)) drop-shadow(0 2px 12px rgba(255,140,0,0.6))",
      }}
    >
      {/* Engine exhaust flame */}
      {!crashed && (
        <g>
          <ellipse cx="5" cy="14" rx="6" ry="3" fill="url(#flame1)" opacity="0.9" />
          <ellipse cx="3" cy="14" rx="4" ry="2" fill="url(#flame2)" opacity="0.8" />
        </g>
      )}
      {/* Main fuselage */}
      <path d="M 10 13 L 48 11 L 52 14 L 48 17 L 10 15 Z" fill="url(#fuselage)" />
      {/* Nose cone */}
      <path d="M 48 11 Q 56 14 48 17 Z" fill="url(#nose)" />
      {/* Main wing */}
      <path d="M 28 13 L 20 4 L 16 4 L 22 13 Z" fill="url(#wing)" />
      <path d="M 28 15 L 20 24 L 16 24 L 22 15 Z" fill="url(#wing)" opacity="0.85" />
      {/* Tail fin */}
      <path d="M 12 13 L 8 6 L 11 6 L 14 13 Z" fill="url(#tail)" />
      <path d="M 12 15 L 8 20 L 11 20 L 14 15 Z" fill="url(#tail)" opacity="0.7" />
      {/* Window */}
      <ellipse cx="40" cy="13.5" rx="3" ry="2.5" fill="url(#window)" />
      <ellipse cx="40" cy="13.5" rx="2" ry="1.5" fill="rgba(160,220,255,0.6)" />
      {/* Wing stripe */}
      <line x1="17" y1="8" x2="22" y2="13" stroke="rgba(255,200,50,0.5)" strokeWidth="0.8" />
      <defs>
        <linearGradient id="fuselage" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#e8e8f0" />
          <stop offset="100%" stopColor="#b0b0c0" />
        </linearGradient>
        <linearGradient id="nose" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d0d0e0" />
          <stop offset="100%" stopColor="#f0c040" />
        </linearGradient>
        <linearGradient id="wing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ccccdd" />
          <stop offset="100%" stopColor="#9090a8" />
        </linearGradient>
        <linearGradient id="tail" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e0ee" />
          <stop offset="100%" stopColor="#8888a0" />
        </linearGradient>
        <radialGradient id="window" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#e0f4ff" />
          <stop offset="100%" stopColor="#4a90d9" />
        </radialGradient>
        <linearGradient id="flame1" x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#ff6600" stopOpacity="0" />
          <stop offset="60%" stopColor="#ff9900" />
          <stop offset="100%" stopColor="#ffdd00" />
        </linearGradient>
        <linearGradient id="flame2" x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff0a0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Canvas chart ────────────────────────────────────────────────────────────
function AviatorChart({
  phase, multiplier, crashAt,
}: { phase: string; multiplier: number; crashAt: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const animFrameRef = useRef<number>(0);

  // Plane position on canvas
  const planePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (phase === "betting") {
      pointsRef.current = [];
    }
  }, [phase]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    if (phase === "betting") {
      // Idle shimmer text
      ctx.fillStyle = "rgba(240,192,64,0.1)";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "center";
      ctx.fillText("পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন", W / 2, H / 2);
      return;
    }

    // Build the curve path
    const pts = pointsRef.current;
    const maxX = W * 0.88;
    const maxY = H * 0.82;
    const originX = 44;
    const originY = H - 36;

    if (phase === "flying" || phase === "crashed") {
      // Map multiplier to canvas coords — logarithmic feel
      const t = Math.log(multiplier) / Math.log(Math.max(1.05, crashAt));
      const cx = originX + t * maxX;
      const cy = originY - t * t * maxY;

      const newPt = { x: Math.min(cx, originX + maxX), y: Math.max(cy, originY - maxY) };
      // Only push if meaningfully different
      const last = pts[pts.length - 1];
      if (!last || Math.abs(newPt.x - last.x) > 0.5 || Math.abs(newPt.y - last.y) > 0.5) {
        pts.push(newPt);
      }
    }

    if (pts.length < 2) {
      // Dot at origin
      ctx.beginPath();
      ctx.arc(originX, originY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f0c040";
      ctx.fill();
      return;
    }

    const crashed = phase === "crashed";
    const lineColor = crashed ? "#ef4444" : "#f0c040";

    // Glow fill beneath curve
    const grad = ctx.createLinearGradient(originX, originY - maxY, originX, originY);
    grad.addColorStop(0, crashed ? "rgba(239,68,68,0.35)" : "rgba(240,192,64,0.30)");
    grad.addColorStop(0.6, crashed ? "rgba(239,68,68,0.08)" : "rgba(240,192,64,0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    for (const p of pts) ctx.lineTo(p.x, p.y);
    ctx.lineTo(pts[pts.length - 1].x, originY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Main curve line with glow
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) {
        ctx.lineTo(pts[0].x, pts[0].y);
      } else {
        const mx = (pts[i - 1].x + pts[i].x) / 2;
        const my = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, mx, my);
      }
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(originX, H - 10);
    ctx.lineTo(originX, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(W - 10, originY);
    ctx.stroke();

    // Multiplier labels on Y axis
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    const yLabels = [1, 2, 5, 10, 20];
    for (const lbl of yLabels) {
      if (lbl > crashAt * 1.2) continue;
      const t2 = Math.log(lbl) / Math.log(Math.max(1.05, crashAt));
      const ly = originY - t2 * t2 * maxY;
      ctx.fillText(`${lbl}x`, originX - 6, ly + 4);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(originX, ly);
      ctx.lineTo(W - 10, ly);
      ctx.stroke();
    }

    // Plane at tip of curve
    const tip = pts[pts.length - 1];
    planePos.current = tip;

    // Dot pulse at plane position
    if (!crashed) {
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(240,192,64,0.3)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#f0c040";
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239,68,68,0.5)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
    }
  }, [phase, multiplier, crashAt]);

  useEffect(() => {
    const loop = () => {
      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });
    ro.observe(canvas);
    // initial size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    return () => ro.disconnect();
  }, []);

  // Plane overlay position
  const [planePct, setPlanePct] = useState({ left: "8%", bottom: "8%" });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !planePos.current.x) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const pct = {
      left: `${(planePos.current.x / W) * 100}%`,
      bottom: `${((H - planePos.current.y) / H) * 100}%`,
    };
    setPlanePct(pct);
  });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {/* Plane overlay at curve tip */}
      <div
        style={{
          position: "absolute",
          left: planePct.left,
          bottom: planePct.bottom,
          transform: "translate(-50%, 50%)",
          transition: "left 0.08s linear, bottom 0.08s linear",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <SvgPlane crashed={phase === "crashed"} multiplier={multiplier} />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
function Aviator() {
  const { user, profile, refresh } = useAuth();
  const [phase, setPhase] = useState<"betting" | "flying" | "crashed">("betting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashAt, setCrashAt] = useState(0);
  const [history, setHistory] = useState<number[]>([2.31, 1.05, 5.42, 1.78, 1.21, 3.04, 8.91, 1.43, 2.10, 1.66]);
  const [betAmount, setBetAmount] = useState(100);
  const [autoCashout, setAutoCashout] = useState<number | "">("");
  const [activeBet, setActiveBet] = useState<{ amount: number } | null>(null);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(6);
  const rafRef = useRef<number | undefined>(undefined);
  const startTime = useRef(0);

  useEffect(() => {
    if (phase !== "betting") return;
    setCountdown(6);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          const cr = nextCrash();
          setCrashAt(cr);
          setMultiplier(1.0);
          setCashedAt(null);
          startTime.current = performance.now();
          setPhase("flying");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "flying") return;
    const tick = () => {
      const t = (performance.now() - startTime.current) / 1000;
      const m = +Math.pow(1.06, t * 6).toFixed(2);
      setMultiplier(m);
      if (activeBet && autoCashout && typeof autoCashout === "number" && m >= autoCashout && cashedAt === null) {
        doCashout(m);
      }
      if (m >= crashAt) {
        setPhase("crashed");
        setHistory((h) => [crashAt, ...h].slice(0, 10));
        if (activeBet && cashedAt === null) toast.error(`ক্র্যাশ ${crashAt}x — হেরেছেন`);
        setActiveBet(null);
        setTimeout(() => setPhase("betting"), 3000);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, crashAt]);

  const placeBet = async () => {
    if (!user) { toast.error("আগে লগইন করুন"); return; }
    if (phase !== "betting") { toast.error("পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন"); return; }
    const bal = Number(profile?.balance ?? 0);
    if (betAmount < 10 || betAmount > bal) { toast.error("ব্যালেন্স অপর্যাপ্ত"); return; }
    setActiveBet({ amount: betAmount });
    await supabase.from("profiles").update({ balance: bal - betAmount }).eq("id", user.id);
    await supabase.from("bets").insert({
      user_id: user.id, game_type: "aviator", odds: 1, amount: betAmount,
      potential_payout: betAmount, status: "pending",
    });
    refresh();
    toast.success("বাজি গ্রহণ করা হয়েছে");
  };

  const doCashout = async (m: number) => {
    if (!activeBet || !user) return;
    setCashedAt(m);
    const payout = +(activeBet.amount * m).toFixed(2);
    const bal = Number(profile?.balance ?? 0);
    await supabase.from("profiles").update({ balance: bal + payout }).eq("id", user.id);
    refresh();
    toast.success(`ক্যাশআউট ${m}x — জিতেছেন ${bdt(payout)}`);
  };

  const isCrashed = phase === "crashed";
  const isFlying = phase === "flying";

  return (
    <AppShell>
      <style>{`
        .av-root {
          max-width: 900px;
          margin: 0 auto;
          padding: 16px;
          font-family: var(--font-sans);
        }

        /* ── History pills ── */
        .av-history {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 10px;
          scrollbar-width: none;
          margin-bottom: 14px;
        }
        .av-history::-webkit-scrollbar { display: none; }
        .av-pill {
          flex-shrink: 0;
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.03em;
          border: 1px solid transparent;
          backdrop-filter: blur(8px);
          transition: transform 0.15s;
        }
        .av-pill:hover { transform: translateY(-1px); }
        .av-pill-high {
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.35);
          color: #34d399;
          box-shadow: 0 0 10px rgba(16,185,129,0.2);
        }
        .av-pill-mid {
          background: rgba(240,192,64,0.12);
          border-color: rgba(240,192,64,0.3);
          color: #f0c040;
          box-shadow: 0 0 10px rgba(240,192,64,0.15);
        }
        .av-pill-low {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #f87171;
          box-shadow: 0 0 8px rgba(239,68,68,0.15);
        }

        /* ── Game arena ── */
        .av-arena {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 8;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(240,192,64,0.2);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 8px 40px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.06);
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(240,192,64,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
            linear-gradient(160deg, #0c0f1e 0%, #060811 50%, #0a0d1a 100%);
          margin-bottom: 16px;
        }

        /* Starfield dots */
        .av-stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 65% 15%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 70%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 80%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 90%, rgba(255,255,255,0.2) 0%, transparent 100%);
          pointer-events: none;
        }

        /* ── Central multiplier display ── */
        .av-multiplier-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 5;
        }

        .av-mult-glass {
          background: rgba(6, 8, 17, 0.55);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 14px 36px 12px;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.07),
            inset 0 -1px 0 rgba(0,0,0,0.3);
          text-align: center;
        }

        .av-mult-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.5;
          margin-bottom: 2px;
        }

        .av-mult-value {
          font-size: clamp(36px, 7vw, 64px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .av-mult-fly { 
          background: linear-gradient(135deg, #f0c040, #ff9900, #f0c040);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .av-mult-crashed {
          color: #ef4444;
          text-shadow: 0 0 30px rgba(239,68,68,0.6);
          animation: crashShake 0.4s ease;
        }
        @keyframes crashShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .av-mult-betting {
          color: rgba(255,255,255,0.5);
        }

        .av-countdown-ring {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
        }
        .av-countdown-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f0c040;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        /* ── Cashout ring on fly ── */
        .av-cashed-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.4);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 800;
          color: #34d399;
          box-shadow: 0 0 20px rgba(16,185,129,0.25);
          z-index: 10;
        }

        /* ── Controls area ── */
        .av-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 540px) {
          .av-controls { grid-template-columns: 1fr; }
        }

        /* Neumorphic card */
        .av-neuro-card {
          background: linear-gradient(145deg, #13172b, #0d1020);
          border-radius: 18px;
          padding: 18px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow:
            6px 6px 16px rgba(0,0,0,0.5),
            -3px -3px 10px rgba(255,255,255,0.03),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .av-field-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
        }

        /* Neumorphic input */
        .av-input {
          width: 100%;
          background: linear-gradient(145deg, #0a0d1a, #111428);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          padding: 10px 14px;
          outline: none;
          box-shadow:
            inset 3px 3px 8px rgba(0,0,0,0.4),
            inset -1px -1px 4px rgba(255,255,255,0.03);
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .av-input:focus {
          border-color: rgba(240,192,64,0.4);
          box-shadow:
            inset 3px 3px 8px rgba(0,0,0,0.4),
            inset -1px -1px 4px rgba(255,255,255,0.03),
            0 0 0 2px rgba(240,192,64,0.15);
        }
        .av-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Quick chips */
        .av-chips {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 8px;
        }
        .av-chip {
          background: linear-gradient(145deg, #1a1f38, #10142a);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          color: rgba(255,255,255,0.65);
          font-size: 11px;
          font-weight: 700;
          padding: 7px 4px;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 3px 3px 8px rgba(0,0,0,0.35), -1px -1px 4px rgba(255,255,255,0.03);
          text-align: center;
        }
        .av-chip:hover {
          border-color: rgba(240,192,64,0.35);
          color: #f0c040;
          box-shadow: 3px 3px 8px rgba(0,0,0,0.35), 0 0 12px rgba(240,192,64,0.12);
          transform: translateY(-1px);
        }
        .av-chip:active { transform: translateY(0); }
        .av-chip:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* Bet / Cashout button */
        .av-btn-bet {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          position: relative;
          overflow: hidden;
        }
        .av-btn-bet::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        .av-btn-place {
          background: linear-gradient(135deg, #f0c040 0%, #c98a0a 50%, #f0c040 100%);
          background-size: 200% 100%;
          color: #0a0e1a;
          box-shadow: 0 4px 20px rgba(240,192,64,0.4), 0 1px 0 rgba(255,255,255,0.2) inset;
        }
        .av-btn-place:hover:not(:disabled) {
          background-position: 100% 0;
          box-shadow: 0 6px 28px rgba(240,192,64,0.55), 0 1px 0 rgba(255,255,255,0.2) inset;
          transform: translateY(-1px);
        }
        .av-btn-place:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .av-btn-cashout {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #10b981 100%);
          background-size: 200% 100%;
          color: #fff;
          box-shadow: 0 4px 20px rgba(16,185,129,0.45), 0 1px 0 rgba(255,255,255,0.15) inset;
          animation: cashoutPulse 1.2s ease-in-out infinite;
        }
        @keyframes cashoutPulse {
          0%,100% { box-shadow: 0 4px 20px rgba(16,185,129,0.45), 0 1px 0 rgba(255,255,255,0.15) inset; }
          50% { box-shadow: 0 4px 32px rgba(16,185,129,0.7), 0 1px 0 rgba(255,255,255,0.15) inset; }
        }
        .av-btn-cashout:hover:not(:disabled) {
          background-position: 100% 0;
          transform: translateY(-1px);
        }
        .av-btn-cashout:disabled {
          animation: none;
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .av-btn-wait {
          background: linear-gradient(135deg, #1e2340, #161b30);
          color: rgba(255,255,255,0.35);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: not-allowed;
          box-shadow: inset 3px 3px 8px rgba(0,0,0,0.4);
        }

        .av-disclaimer {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          margin-top: 12px;
          letter-spacing: 0.04em;
        }

        /* Auto cashout row */
        .av-auto-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
        }
        .av-auto-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
        }
        .av-auto-input {
          flex: 1;
          background: linear-gradient(145deg, #0a0d1a, #111428);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 10px;
          outline: none;
          box-shadow: inset 2px 2px 6px rgba(0,0,0,0.4);
          width: 100%;
          box-sizing: border-box;
        }
        .av-auto-input:focus {
          border-color: rgba(240,192,64,0.35);
        }
      `}</style>

      <div className="av-root">

        {/* History */}
        <div className="av-history">
          {history.map((h, i) => (
            <span
              key={i}
              className={`av-pill ${h >= 5 ? "av-pill-high" : h >= 2 ? "av-pill-mid" : "av-pill-low"}`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Arena */}
        <div className="av-arena">
          <div className="av-stars" />

          {/* Canvas chart with plane */}
          <AviatorChart phase={phase} multiplier={multiplier} crashAt={crashAt} />

          {/* Cashed-out badge */}
          {cashedAt && (
            <div className="av-cashed-badge">
              ✓ {cashedAt.toFixed(2)}x ক্যাশআউট
            </div>
          )}

          {/* Central multiplier overlay */}
          <div className="av-multiplier-wrap">
            <div className="av-mult-glass">
              {phase === "betting" && (
                <>
                  <div className="av-mult-label">পরবর্তী রাউন্ড</div>
                  <div className={`av-mult-value av-mult-betting`}>{countdown}s</div>
                  <div className="av-countdown-ring">
                    <div className="av-countdown-dot" />
                    <span>বাজি ধরুন</span>
                    <div className="av-countdown-dot" style={{ animationDelay: "0.5s" }} />
                  </div>
                </>
              )}
              {isFlying && (
                <>
                  <div className="av-mult-label">উড়ছে</div>
                  <div className={`av-mult-value ${cashedAt ? "" : "av-mult-fly"}`}
                    style={cashedAt ? { color: "#34d399" } : {}}>
                    {multiplier.toFixed(2)}x
                  </div>
                </>
              )}
              {isCrashed && (
                <>
                  <div className="av-mult-label" style={{ color: "#ef4444", opacity: 1 }}>ক্র্যাশ!</div>
                  <div className={`av-mult-value av-mult-crashed`}>{crashAt.toFixed(2)}x</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="av-controls">
          {/* Bet amount card */}
          <div className="av-neuro-card">
            <div className="av-field-label">বাজির পরিমাণ (৳)</div>
            <input
              type="number"
              min={10}
              value={betAmount}
              onChange={(e) => setBetAmount(+e.target.value)}
              disabled={!!activeBet}
              className="av-input"
            />
            <div className="av-chips">
              {[100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBetAmount(v)}
                  disabled={!!activeBet}
                  className="av-chip"
                >
                  ৳{v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
            </div>
            <div className="av-auto-row">
              <span className="av-auto-label">অটো</span>
              <input
                type="number"
                step="0.1"
                min={1.1}
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value ? +e.target.value : "")}
                placeholder="2.0x"
                className="av-auto-input"
              />
            </div>
          </div>

          {/* Action card */}
          <div className="av-neuro-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
            {!activeBet ? (
              <button
                onClick={placeBet}
                disabled={phase !== "betting"}
                className={`av-btn-bet ${phase === "betting" ? "av-btn-place" : "av-btn-wait"}`}
              >
                {phase === "betting"
                  ? `✈ বাজি ধরুন  (${countdown}s)`
                  : phase === "flying"
                  ? "উড়ছে... পরেরটায়"
                  : "অপেক্ষা করুন..."}
              </button>
            ) : (
              <button
                onClick={() => isFlying && doCashout(multiplier)}
                disabled={!isFlying || cashedAt !== null}
                className={`av-btn-bet ${isFlying && !cashedAt ? "av-btn-cashout" : "av-btn-wait"}`}
              >
                {cashedAt
                  ? `✓ ${cashedAt.toFixed(2)}x ক্যাশআউট হয়েছে`
                  : isFlying
                  ? `⚡ ক্যাশআউট  ${bdt(+(activeBet.amount * multiplier).toFixed(2))}`
                  : "ক্র্যাশ হয়েছে"}
              </button>
            )}
            <p className="av-disclaimer">১৮+ ব্যবহারকারীদের জন্য — দায়িত্বশীলভাবে খেলুন</p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
