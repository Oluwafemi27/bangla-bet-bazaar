import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";

export const Route = createFileRoute("/bottle-call")({
  head: () => ({ meta: [{ title: "কয়েন ফ্লিপ — বাজি কিং" }] }),
  component: CoinFlip,
});

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Side = "heads" | "tails";
type Phase = "idle" | "picking" | "flipping" | "result";

/* ─── Coin Canvas ────────────────────────────────────────────────────────── */
function drawCoin(canvas: HTMLCanvasElement, angle: number) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(cx, cy) - 6;

  ctx.clearRect(0, 0, W, H);

  const cosA = Math.cos(angle);
  const scaleX = Math.abs(cosA) < 0.04 ? 0.04 : Math.abs(cosA);
  const isHeads = cosA >= 0;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scaleX, 1);

  // Outer metallic ring
  const ringGrad = ctx.createLinearGradient(-R, -R, R, R);
  if (isHeads) {
    ringGrad.addColorStop(0, "#00ffe0");
    ringGrad.addColorStop(0.5, "#007a6e");
    ringGrad.addColorStop(1, "#003d38");
  } else {
    ringGrad.addColorStop(0, "#ffe066");
    ringGrad.addColorStop(0.5, "#c9870a");
    ringGrad.addColorStop(1, "#7a4c00");
  }
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, 2 * Math.PI);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Rim highlight
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, 2 * Math.PI);
  ctx.strokeStyle = isHeads ? "rgba(0,255,224,0.7)" : "rgba(255,224,102,0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner face
  const faceGrad = ctx.createRadialGradient(-R * 0.2, -R * 0.2, R * 0.05, 0, 0, R * 0.85);
  if (isHeads) {
    faceGrad.addColorStop(0, "#0a4a45");
    faceGrad.addColorStop(1, "#021a18");
  } else {
    faceGrad.addColorStop(0, "#4a3200");
    faceGrad.addColorStop(1, "#1a0e00");
  }
  ctx.beginPath();
  ctx.arc(0, 0, R - 9, 0, 2 * Math.PI);
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Inner glow ring
  ctx.beginPath();
  ctx.arc(0, 0, R - 9, 0, 2 * Math.PI);
  ctx.strokeStyle = isHeads ? "rgba(0,255,224,0.25)" : "rgba(255,200,50,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Decorative inner circle
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.55, 0, 2 * Math.PI);
  ctx.strokeStyle = isHeads ? "rgba(0,255,224,0.15)" : "rgba(255,200,50,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Symbol (H or T)
  ctx.fillStyle = isHeads ? "#00ffe0" : "#ffe066";
  ctx.font = `bold ${Math.round(R * 0.52)}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = isHeads ? "#00ffe0" : "#ffe066";
  ctx.shadowBlur = 18;
  ctx.fillText(isHeads ? "H" : "T", 0, -4);
  ctx.shadowBlur = 0;

  // Sub label
  ctx.font = `600 ${Math.round(R * 0.155)}px 'Segoe UI', sans-serif`;
  ctx.fillStyle = isHeads ? "rgba(0,255,224,0.55)" : "rgba(255,224,102,0.55)";
  ctx.fillText(isHeads ? "HEADS" : "TAILS", 0, R * 0.48);

  ctx.restore();
}

/* ─── Particle System ────────────────────────────────────────────────────── */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

function spawnParticles(cx: number, cy: number, won: boolean): Particle[] {
  const colors = won
    ? ["#00ffe0", "#00d4b8", "#ffffff", "#b0fff5"]
    : ["#ff4d4d", "#ff8080", "#ff2020", "#ffaaaa"];
  return Array.from({ length: 28 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1, maxLife: 0.6 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 5,
    };
  });
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
function CoinFlip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pRafRef = useRef<number>(0);
  const angleRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [pick, setPick] = useState<Side | null>(null);
  const [result, setResult] = useState<Side | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(245);
  const [message, setMessage] = useState("হেডস বা টেইলস বেছে নিন");
  const [won, setWon] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (c) drawCoin(c, angleRef.current);
  }, []);

  useEffect(() => { draw(); }, [draw]);

  // Particle animation loop
  const animateParticles = useCallback(() => {
    const pc = particleCanvasRef.current;
    if (!pc) return;
    const ctx = pc.getContext("2d")!;
    ctx.clearRect(0, 0, pc.width, pc.height);
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    for (const p of particlesRef.current) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15;
      p.life -= 0.022;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    if (particlesRef.current.length > 0) {
      pRafRef.current = requestAnimationFrame(animateParticles);
    }
  }, []);

  const handlePick = (side: Side) => {
    if (phase !== "idle") return;
    setPick(side);
    setPhase("picking");
    setWon(null);
    setShowResult(false);
    setResult(null);
    setMessage(`আপনি ${side === "heads" ? "হেডস" : "টেইলস"} বেছেছেন — FLIP চাপুন!`);
  };

  const handleFlip = useCallback(() => {
    if (phase !== "picking" || !pick) return;
    setPhase("flipping");
    setMessage("কয়েন ঘুরছে...");

    const outcome: Side = Math.random() < 0.5 ? "heads" : "tails";
    const targetFace = outcome === "heads" ? 0 : Math.PI;
    const totalSpins = (6 + Math.floor(Math.random() * 4)) * Math.PI * 2;
    const finalAngle = totalSpins + targetFace;
    const duration = 2400 + Math.random() * 700;
    const startAngle = angleRef.current;
    const startTime = performance.now();

    function easeOut(t: number) { return 1 - Math.pow(1 - t, 3.5); }

    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      angleRef.current = startAngle + (finalAngle - startAngle) * easeOut(t);
      draw();
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        angleRef.current = targetFace;
        draw();
        const didWin = outcome === pick;
        setResult(outcome);
        setWon(didWin);
        setPhase("result");
        setShowResult(true);

        // Spawn particles
        const pc = particleCanvasRef.current;
        if (pc) {
          particlesRef.current = spawnParticles(pc.width / 2, pc.height / 2, didWin);
          cancelAnimationFrame(pRafRef.current);
          animateParticles();
        }

        if (didWin) {
          setStreak(s => {
            const ns = s + 1;
            setScore(sc => {
              const ns2 = sc + 10 + ns * 5;
              setBest(b => Math.max(b, ns2));
              return ns2;
            });
            return ns;
          });
          setMessage(`✓ ${outcome === "heads" ? "হেডস" : "টেইলস"}! আপনি জিতেছেন!`);
        } else {
          setStreak(0);
          setMessage(`✗ ${outcome === "heads" ? "হেডস" : "টেইলস"}! এবার হলো না!`);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [phase, pick, draw, animateParticles]);

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    angleRef.current = 0;
    draw();
    setPick(null); setResult(null); setWon(null);
    setPhase("idle"); setShowResult(false);
    setMessage("হেডস বা টেইলস বেছে নিন");
  };

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(pRafRef.current);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "radial-gradient(ellipse at 50% 0%, #0d2e2b 0%, #060d1a 55%, #020509 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#fff", padding: "20px 16px", userSelect: "none", position: "relative",
      overflow: "hidden",
    }}>

      {/* Background grid lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(0,255,224,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,224,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Ambient orbs */}
      <div style={{
        position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)",
        width: "500px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,255,224,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "50%", transform: "translateX(-50%)",
        width: "400px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(201,162,39,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Back link */}
      <div style={{ position: "absolute", top: 16, left: 16 }}>
        <Link to="/" style={{
          color: "#00ffe0", fontSize: "13px", fontWeight: 600,
          textDecoration: "none", opacity: 0.8,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          ← ফিরে যান
        </Link>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{
          fontSize: "26px", fontWeight: 800, margin: "0 0 4px",
          background: "linear-gradient(135deg, #00ffe0 0%, #00b8a9 50%, #ffe066 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: "0.04em", textShadow: "none",
        }}>
          কয়েন ফ্লিপ
        </h1>
        <p style={{ color: "rgba(0,255,224,0.4)", fontSize: "11px", margin: 0, letterSpacing: 2 }}>
          COIN FLIP
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "SCORE", value: score, color: "#00ffe0" },
          { label: "STREAK", value: `x${streak}`, color: streak >= 3 ? "#ffe066" : "#00ffe0" },
          { label: "BEST", value: best, color: "#ffe066" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "rgba(0,0,0,0.5)",
            border: `1px solid ${color}22`,
            borderRadius: 10,
            padding: "8px 18px",
            textAlign: "center",
            minWidth: 78,
            boxShadow: `0 0 12px ${color}11`,
          }}>
            <div style={{ fontSize: 9, color: color, letterSpacing: 2, marginBottom: 3, opacity: 0.8 }}>
              {label}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, color,
              textShadow: `0 0 12px ${color}88`,
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Message bar */}
      <div style={{
        background: "rgba(0,0,0,0.45)",
        border: `1px solid ${won === true ? "rgba(0,255,224,0.3)" : won === false ? "rgba(255,77,77,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 8, padding: "9px 22px", marginBottom: 22,
        fontSize: 13, letterSpacing: 0.4, minWidth: 240, textAlign: "center",
        color: won === true ? "#00ffe0" : won === false ? "#ff6b6b" : "#aaa",
        boxShadow: won === true ? "0 0 16px rgba(0,255,224,0.12)" : won === false ? "0 0 16px rgba(255,77,77,0.12)" : "none",
        transition: "all 0.4s ease",
      }}>
        {message}
      </div>

      {/* Coin + particle canvas stack */}
      <div style={{ position: "relative", marginBottom: 28 }}>

        {/* Outer glow ring animated */}
        <div style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          border: `1.5px solid ${phase === "flipping" ? "rgba(0,255,224,0.6)" : won === true ? "rgba(0,255,224,0.4)" : won === false ? "rgba(255,77,77,0.4)" : "rgba(0,255,224,0.15)"}`,
          boxShadow: phase === "flipping"
            ? "0 0 30px rgba(0,255,224,0.3), inset 0 0 30px rgba(0,255,224,0.1)"
            : won === true ? "0 0 40px rgba(0,255,224,0.25)"
            : won === false ? "0 0 40px rgba(255,77,77,0.2)"
            : "none",
          transition: "all 0.4s ease",
          pointerEvents: "none",
        }} />

        {/* Second outer ring */}
        <div style={{
          position: "absolute", inset: -28, borderRadius: "50%",
          border: "1px solid rgba(0,255,224,0.06)",
          pointerEvents: "none",
        }} />

        {/* Particle canvas (overlay) */}
        <canvas
          ref={particleCanvasRef}
          width={240} height={240}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none", zIndex: 10,
          }}
        />

        {/* Main coin canvas */}
        <canvas
          ref={canvasRef}
          width={200} height={200}
          style={{
            borderRadius: "50%", display: "block",
            cursor: phase === "picking" ? "pointer" : "default",
            filter: phase === "flipping" ? "brightness(1.15)" : "brightness(1)",
            transition: "filter 0.3s",
          }}
          onClick={phase === "picking" ? handleFlip : undefined}
        />

        {/* Idle overlay */}
        {phase === "idle" && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 2, pointerEvents: "none",
          }}>
            <div style={{ fontSize: 22 }}>🪙</div>
            <div style={{ fontSize: 10, color: "rgba(0,255,224,0.7)", letterSpacing: 2 }}>COIN FLIP</div>
          </div>
        )}

        {/* Tap to flip overlay */}
        {phase === "picking" && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(0,255,224,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{ fontSize: 10, color: "rgba(0,255,224,0.8)", letterSpacing: 2, fontWeight: 700 }}>
              TAP TO FLIP
            </div>
          </div>
        )}
      </div>

      {/* Win/Loss result badge */}
      {showResult && (
        <div style={{
          marginBottom: 16, padding: "7px 28px", borderRadius: 20,
          background: won ? "rgba(0,255,224,0.1)" : "rgba(255,77,77,0.1)",
          border: `1px solid ${won ? "rgba(0,255,224,0.5)" : "rgba(255,77,77,0.5)"}`,
          fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
          color: won ? "#00ffe0" : "#ff6b6b",
          boxShadow: won ? "0 0 20px rgba(0,255,224,0.2)" : "0 0 20px rgba(255,77,77,0.2)",
        }}>
          {won ? "🏆 জয়!" : "💀 হার!"}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>

        {/* HEADS button */}
        <SideBtn
          label="হেডস" sublabel="HEADS"
          active={pick === "heads"}
          color="#00ffe0"
          disabled={phase !== "idle"}
          onClick={() => handlePick("heads")}
        />

        {/* Center FLIP / AGAIN button */}
        {phase === "picking" && (
          <FlipBtn label="FLIP" color="#8b5cf6" glow="#8b5cf6" onClick={handleFlip} />
        )}
        {phase === "result" && (
          <FlipBtn label="আবার" color="#00ffe0" glow="#00ffe0" onClick={reset} />
        )}
        {(phase === "idle" || phase === "flipping") && (
          <div style={{ width: 58, height: 58 }} />
        )}

        {/* TAILS button */}
        <SideBtn
          label="টেইলস" sublabel="TAILS"
          active={pick === "tails"}
          color="#ffe066"
          disabled={phase !== "idle"}
          onClick={() => handlePick("tails")}
        />
      </div>

      {phase === "idle" && (
        <p style={{ marginTop: 18, fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>
          একটি পাশ বেছে নিন
        </p>
      )}
    </div>
  );
}

/* ─── Side Button ────────────────────────────────────────────────────────── */
function SideBtn({ label, sublabel, active, color, disabled, onClick }: {
  label: string; sublabel: string; active: boolean;
  color: string; disabled: boolean; onClick: () => void;
}) {
  const rgb = color === "#00ffe0" ? "0,255,224" : "255,224,102";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: active ? `rgba(${rgb},0.12)` : "rgba(0,0,0,0.45)",
      border: `1.5px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
      borderRadius: 12, padding: "12px 18px",
      color: active ? color : "rgba(255,255,255,0.45)",
      fontWeight: 700, fontSize: 13, letterSpacing: 1,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled && !active ? 0.45 : 1,
      transition: "all 0.2s ease",
      minWidth: 96, textAlign: "center",
      boxShadow: active ? `0 0 20px rgba(${rgb},0.2), inset 0 0 12px rgba(${rgb},0.05)` : "none",
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: active ? color : "rgba(255,255,255,0.15)",
        margin: "0 auto 6px",
        boxShadow: active ? `0 0 8px ${color}` : "none",
        transition: "all 0.2s",
      }} />
      <div>{label}</div>
      <div style={{ fontSize: 9, opacity: 0.5, marginTop: 2, letterSpacing: 2 }}>{sublabel}</div>
    </button>
  );
}

/* ─── Flip/Again Button ──────────────────────────────────────────────────── */
function FlipBtn({ label, color, glow, onClick }: {
  label: string; color: string; glow: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
      border: `2px solid ${color}`,
      borderRadius: "50%", width: 58, height: 58,
      color, fontWeight: 800, fontSize: 11, letterSpacing: 1,
      cursor: "pointer",
      boxShadow: `0 0 20px ${glow}55, 0 0 40px ${glow}22`,
      transition: "all 0.15s ease",
    }}>
      {label}
    </button>
  );
}
