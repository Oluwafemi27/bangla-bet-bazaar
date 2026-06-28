import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Dice5 } from "lucide-react";
import { useState } from "react";
import bottleCallThumb from "@/assets/bottle-call-thumb.jpg";

export const Route = createFileRoute("/slots")({
  head: () => ({ meta: [{ title: "স্লট মেশিন — বাজি কিং" }] }),
  component: Slots,
});

// ── Inline SVG logos – zero external dependencies ──────────────────────────
const LOGOS: Record<string, string> = {
  crazy777: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a0000"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#c7bg)" opacity=".9"/>
    <defs>
      <linearGradient id="c7bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff2222"/>
        <stop offset="100%" stop-color="#7b0000"/>
      </linearGradient>
    </defs>
    <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="900" font-size="36" fill="#FFD700" stroke="#fff" stroke-width="1.2">777</text>
  </svg>`,

  superace: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#000d2e"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#sabg)"/>
    <defs>
      <linearGradient id="sabg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a3a7a"/>
        <stop offset="100%" stop-color="#0a1a40"/>
      </linearGradient>
    </defs>
    <rect x="20" y="12" width="40" height="56" rx="6" fill="#fff"/>
    <text x="40" y="38" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="20" fill="#cc0000">A</text>
    <text x="40" y="58" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#cc0000">♠</text>
  </svg>`,

  crazyhunter: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#0d1a00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#chbg)"/>
    <defs>
      <linearGradient id="chbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a4000"/>
        <stop offset="100%" stop-color="#0a2000"/>
      </linearGradient>
    </defs>
    <!-- Crosshair -->
    <circle cx="40" cy="40" r="22" fill="none" stroke="#ff4400" stroke-width="3"/>
    <circle cx="40" cy="40" r="14" fill="none" stroke="#ff4400" stroke-width="2"/>
    <circle cx="40" cy="40" r="5" fill="#ff4400"/>
    <line x1="40" y1="14" x2="40" y2="26" stroke="#ff4400" stroke-width="2.5"/>
    <line x1="40" y1="54" x2="40" y2="66" stroke="#ff4400" stroke-width="2.5"/>
    <line x1="14" y1="40" x2="26" y2="40" stroke="#ff4400" stroke-width="2.5"/>
    <line x1="54" y1="40" x2="66" y2="40" stroke="#ff4400" stroke-width="2.5"/>
  </svg>`,

  fortunegems: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#001a2e"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#fgbg)"/>
    <defs>
      <linearGradient id="fgbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#003d6b"/>
        <stop offset="100%" stop-color="#001a2e"/>
      </linearGradient>
      <linearGradient id="gem1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00eeff"/>
        <stop offset="100%" stop-color="#0088cc"/>
      </linearGradient>
      <linearGradient id="gem2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff44ee"/>
        <stop offset="100%" stop-color="#aa0088"/>
      </linearGradient>
      <linearGradient id="gem3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#44ff88"/>
        <stop offset="100%" stop-color="#009944"/>
      </linearGradient>
    </defs>
    <polygon points="40,10 52,22 52,38 40,50 28,38 28,22" fill="url(#gem1)" stroke="#fff" stroke-width="1"/>
    <polygon points="18,44 26,52 18,60 10,52" fill="url(#gem2)" stroke="#fff" stroke-width="1"/>
    <polygon points="62,44 70,52 62,60 54,52" fill="url(#gem3)" stroke="#fff" stroke-width="1"/>
  </svg>`,

  goldenempire: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a1000"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#gebg)"/>
    <defs>
      <linearGradient id="gebg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d2800"/>
        <stop offset="100%" stop-color="#1a1000"/>
      </linearGradient>
    </defs>
    <!-- Crown -->
    <path d="M14 54 L14 34 L26 46 L40 20 L54 46 L66 34 L66 54 Z" fill="url(#crg)" stroke="#fff8" stroke-width="1.5"/>
    <circle cx="14" cy="34" r="5" fill="#FFD700"/>
    <circle cx="40" cy="20" r="5" fill="#FFD700"/>
    <circle cx="66" cy="34" r="5" fill="#FFD700"/>
    <rect x="12" y="54" width="56" height="8" rx="3" fill="#FFD700"/>
    <defs>
      <linearGradient id="crg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFD700"/>
        <stop offset="100%" stop-color="#B8860B"/>
      </linearGradient>
    </defs>
  </svg>`,

  luckycoming: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#001a00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#lcbg)"/>
    <defs>
      <linearGradient id="lcbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#003300"/>
        <stop offset="100%" stop-color="#001500"/>
      </linearGradient>
    </defs>
    <!-- 4-leaf clover -->
    <circle cx="40" cy="28" r="13" fill="#22cc44"/>
    <circle cx="40" cy="52" r="13" fill="#22cc44"/>
    <circle cx="28" cy="40" r="13" fill="#22cc44"/>
    <circle cx="52" cy="40" r="13" fill="#22cc44"/>
    <circle cx="40" cy="40" r="7" fill="#004400"/>
    <rect x="38" y="52" width="4" height="14" rx="2" fill="#22cc44"/>
  </svg>`,

  pharaohtreasure: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a1200"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#ptbg)"/>
    <defs>
      <linearGradient id="ptbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d2e00"/>
        <stop offset="100%" stop-color="#1a1200"/>
      </linearGradient>
    </defs>
    <!-- Pyramid -->
    <polygon points="40,10 68,62 12,62" fill="url(#pyrg)" stroke="#FFD70088" stroke-width="1.5"/>
    <!-- Eye of Horus simplified -->
    <ellipse cx="40" cy="44" rx="10" ry="6" fill="#001a3d" stroke="#FFD700" stroke-width="1"/>
    <circle cx="40" cy="44" r="4" fill="#4fc3f7"/>
    <circle cx="40" cy="44" r="2" fill="#001a3d"/>
    <defs>
      <linearGradient id="pyrg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFD700"/>
        <stop offset="100%" stop-color="#8B6914"/>
      </linearGradient>
    </defs>
  </svg>`,

  boxingking: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a0000"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#bkbg)"/>
    <defs>
      <linearGradient id="bkbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d0000"/>
        <stop offset="100%" stop-color="#1a0000"/>
      </linearGradient>
    </defs>
    <!-- Boxing glove -->
    <rect x="24" y="28" width="32" height="26" rx="10" fill="#cc2200"/>
    <rect x="24" y="44" width="32" height="14" rx="6" fill="#aa1800"/>
    <rect x="28" y="52" width="24" height="8" rx="3" fill="#fff2" />
    <rect x="24" y="28" width="6" height="18" rx="3" fill="#aa1800"/>
    <rect x="50" y="28" width="6" height="18" rx="3" fill="#aa1800"/>
    <text x="40" y="42" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="11" fill="#FFD700">KING</text>
  </svg>`,

  megafortune: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a1400"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#mfbg)"/>
    <defs>
      <linearGradient id="mfbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d3000"/>
        <stop offset="100%" stop-color="#1a1400"/>
      </linearGradient>
    </defs>
    <!-- Money bag -->
    <ellipse cx="40" cy="48" rx="22" ry="20" fill="#FFD700"/>
    <ellipse cx="40" cy="26" rx="10" ry="8" fill="#FFD700"/>
    <rect x="35" y="18" width="10" height="8" rx="2" fill="#FFD700"/>
    <text x="40" y="52" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="20" fill="#8B6914">৳</text>
  </svg>`,

  bookofdead: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#0d0d00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#bdbg)"/>
    <defs>
      <linearGradient id="bdbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2a1a00"/>
        <stop offset="100%" stop-color="#0d0900"/>
      </linearGradient>
    </defs>
    <!-- Book -->
    <rect x="16" y="16" width="48" height="54" rx="4" fill="#3d2800"/>
    <rect x="18" y="18" width="44" height="50" rx="3" fill="#5a3c00"/>
    <line x1="40" y1="18" x2="40" y2="68" stroke="#3d2800" stroke-width="3"/>
    <!-- Ankh symbol -->
    <ellipse cx="40" cy="34" rx="7" ry="9" fill="none" stroke="#FFD700" stroke-width="2.5"/>
    <line x1="40" y1="43" x2="40" y2="60" stroke="#FFD700" stroke-width="2.5"/>
    <line x1="30" y1="50" x2="50" y2="50" stroke="#FFD700" stroke-width="2.5"/>
  </svg>`,

  starburst: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#0a0020"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#sbbg)"/>
    <defs>
      <linearGradient id="sbbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#200040"/>
        <stop offset="100%" stop-color="#0a0020"/>
      </linearGradient>
    </defs>
    <!-- Star burst rays -->
    <polygon points="40,6 44,36 74,40 44,44 40,74 36,44 6,40 36,36" fill="url(#stbg)" stroke="#fff4" stroke-width="1"/>
    <polygon points="40,16 43,36 64,28 50,44 64,52 43,44 40,64 37,44 16,52 30,44 16,28 37,36" fill="url(#stbg2)" opacity="0.7"/>
    <circle cx="40" cy="40" r="10" fill="#fff" opacity="0.9"/>
    <defs>
      <linearGradient id="stbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff9900"/>
        <stop offset="100%" stop-color="#ff4400"/>
      </linearGradient>
      <linearGradient id="stbg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffee00"/>
        <stop offset="100%" stop-color="#ff6600"/>
      </linearGradient>
    </defs>
  </svg>`,

  goldrush: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a1000"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#grbg)"/>
    <defs>
      <linearGradient id="grbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d2800"/>
        <stop offset="100%" stop-color="#1a1000"/>
      </linearGradient>
    </defs>
    <!-- Gold bars -->
    <rect x="12" y="28" width="56" height="18" rx="4" fill="#FFD700" stroke="#8B6914" stroke-width="1.5"/>
    <rect x="12" y="50" width="56" height="14" rx="4" fill="#e6c200" stroke="#8B6914" stroke-width="1.5"/>
    <text x="40" y="38" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="10" fill="#7a5800">GOLD</text>
    <!-- Sparkles -->
    <text x="20" y="22" font-size="14" fill="#FFD700">★</text>
    <text x="54" y="22" font-size="10" fill="#FFD700">★</text>
  </svg>`,

  dragongold: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a0000"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#dgbg)"/>
    <defs>
      <linearGradient id="dgbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d0000"/>
        <stop offset="100%" stop-color="#1a0000"/>
      </linearGradient>
    </defs>
    <!-- Dragon simplified -->
    <ellipse cx="42" cy="42" rx="20" ry="16" fill="#cc2200"/>
    <polygon points="42,16 54,30 30,30" fill="#cc2200"/>
    <ellipse cx="34" cy="36" rx="4" ry="4" fill="#FFD700"/>
    <ellipse cx="50" cy="36" rx="4" ry="4" fill="#FFD700"/>
    <circle cx="34" cy="36" r="2" fill="#000"/>
    <circle cx="50" cy="36" r="2" fill="#000"/>
    <!-- Fire -->
    <path d="M32 54 Q36 44 40 54 Q44 44 48 54" fill="none" stroke="#ff6600" stroke-width="3"/>
    <path d="M36 58 Q40 48 44 58" fill="none" stroke="#FFD700" stroke-width="2"/>
  </svg>`,

  fruitparty: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#001a00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#fpbg)"/>
    <defs>
      <linearGradient id="fpbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#003300"/>
        <stop offset="100%" stop-color="#001500"/>
      </linearGradient>
    </defs>
    <!-- Watermelon -->
    <path d="M40 58 C22 58 14 46 14 38 L66 38 C66 46 58 58 40 58Z" fill="#e74c3c"/>
    <path d="M14 38 L66 38 Q40 16 14 38Z" fill="#27ae60"/>
    <circle cx="28" cy="46" r="2.5" fill="#333"/>
    <circle cx="40" cy="50" r="2.5" fill="#333"/>
    <circle cx="52" cy="46" r="2.5" fill="#333"/>
    <!-- Cherry top right -->
    <circle cx="60" cy="24" r="7" fill="#e74c3c"/>
    <path d="M60 17 Q52 8 44 16" stroke="#22aa22" stroke-width="2" fill="none"/>
  </svg>`,

  sweetbonanza: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a0020"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#swbg)"/>
    <defs>
      <linearGradient id="swbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d0050"/>
        <stop offset="100%" stop-color="#1a0020"/>
      </linearGradient>
    </defs>
    <!-- Candy -->
    <circle cx="40" cy="38" r="20" fill="url(#cndg)" stroke="#fff4" stroke-width="1"/>
    <path d="M22 28 Q40 16 58 28" stroke="#fff5" stroke-width="6" fill="none"/>
    <path d="M22 38 Q40 26 58 38" stroke="#fff5" stroke-width="5" fill="none"/>
    <path d="M22 48 Q40 36 58 48" stroke="#fff5" stroke-width="4" fill="none"/>
    <rect x="36" y="56" width="8" height="14" rx="3" fill="#ff44aa"/>
    <defs>
      <linearGradient id="cndg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff44aa"/>
        <stop offset="100%" stop-color="#aa0066"/>
      </linearGradient>
    </defs>
  </svg>`,

  wolfgold: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#000a1a"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#wgbg)"/>
    <defs>
      <linearGradient id="wgbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#001a3d"/>
        <stop offset="100%" stop-color="#000a1a"/>
      </linearGradient>
    </defs>
    <!-- Wolf head simplified -->
    <ellipse cx="40" cy="46" rx="22" ry="20" fill="#667"/>
    <!-- Ears -->
    <polygon points="24,30 18,10 34,26" fill="#556"/>
    <polygon points="56,30 62,10 46,26" fill="#556"/>
    <polygon points="26,28 22,14 34,26" fill="#ff9988"/>
    <polygon points="54,28 58,14 46,26" fill="#ff9988"/>
    <!-- Eyes -->
    <ellipse cx="32" cy="40" rx="5" ry="4" fill="#FFD700"/>
    <ellipse cx="48" cy="40" rx="5" ry="4" fill="#FFD700"/>
    <circle cx="32" cy="40" r="2.5" fill="#000"/>
    <circle cx="48" cy="40" r="2.5" fill="#000"/>
    <!-- Moon -->
    <circle cx="62" cy="18" r="9" fill="#FFD700" opacity=".8"/>
    <circle cx="66" cy="16" r="7" fill="#001a3d"/>
  </svg>`,

  firejoker: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a0a00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#fjbg)"/>
    <defs>
      <linearGradient id="fjbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d1500"/>
        <stop offset="100%" stop-color="#1a0800"/>
      </linearGradient>
    </defs>
    <!-- Flames -->
    <path d="M40 68 C24 68 12 54 16 36 C20 24 28 20 28 20 C24 32 32 36 32 36 C28 24 36 12 40 8 C44 12 52 24 48 36 C48 36 56 32 52 20 C52 20 60 24 64 36 C68 54 56 68 40 68Z" fill="url(#firebg)"/>
    <path d="M40 62 C30 62 24 52 26 40 C28 32 34 28 34 28 C32 36 38 40 38 40 C36 32 40 22 40 18 C44 22 44 32 44 40 C44 40 48 36 46 28 C46 28 52 32 54 40 C56 52 50 62 40 62Z" fill="url(#firebg2)" opacity="0.9"/>
    <defs>
      <linearGradient id="firebg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFD700"/>
        <stop offset="60%" stop-color="#ff6600"/>
        <stop offset="100%" stop-color="#cc0000"/>
      </linearGradient>
      <linearGradient id="firebg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff"/>
        <stop offset="50%" stop-color="#FFD700"/>
        <stop offset="100%" stop-color="#ff4400"/>
      </linearGradient>
    </defs>
  </svg>`,

  reelking: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a1000"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#rkbg)"/>
    <defs>
      <linearGradient id="rkbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d2800"/>
        <stop offset="100%" stop-color="#1a1000"/>
      </linearGradient>
    </defs>
    <!-- Slot reels representation -->
    <rect x="10" y="20" width="18" height="40" rx="4" fill="#222" stroke="#FFD700" stroke-width="1.5"/>
    <rect x="31" y="20" width="18" height="40" rx="4" fill="#222" stroke="#FFD700" stroke-width="1.5"/>
    <rect x="52" y="20" width="18" height="40" rx="4" fill="#222" stroke="#FFD700" stroke-width="1.5"/>
    <text x="19" y="42" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#FFD700">7</text>
    <text x="40" y="42" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#FFD700">7</text>
    <text x="61" y="42" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#FFD700">7</text>
    <!-- Win line -->
    <line x1="8" y1="40" x2="72" y2="40" stroke="#ff4444" stroke-width="2" stroke-dasharray="4,2"/>
  </svg>`,

  luckylady: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#001a00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#llbg)"/>
    <defs>
      <linearGradient id="llbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#003300"/>
        <stop offset="100%" stop-color="#001500"/>
      </linearGradient>
    </defs>
    <!-- Horseshoe -->
    <path d="M40 14 C20 14 10 28 10 44 C10 56 18 66 28 66 L28 56 C22 56 20 50 20 44 C20 34 30 24 40 24 C50 24 60 34 60 44 C60 50 58 56 52 56 L52 66 C62 66 70 56 70 44 C70 28 60 14 40 14Z" fill="#22cc44" stroke="#009900" stroke-width="1"/>
    <text x="40" y="52" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="16" fill="#FFD700">★</text>
  </svg>`,

  nightfortune: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#050010"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#nfbg)"/>
    <defs>
      <linearGradient id="nfbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#150030"/>
        <stop offset="100%" stop-color="#050010"/>
      </linearGradient>
    </defs>
    <!-- Moon -->
    <circle cx="42" cy="38" r="20" fill="#FFD700"/>
    <circle cx="50" cy="32" r="17" fill="#150030"/>
    <!-- Stars -->
    <text x="16" y="24" font-size="12" fill="#fff" opacity=".8">★</text>
    <text x="60" y="60" font-size="8" fill="#fff" opacity=".6">★</text>
    <text x="12" y="56" font-size="6" fill="#fff" opacity=".5">★</text>
    <text x="64" y="22" font-size="10" fill="#fff" opacity=".7">★</text>
  </svg>`,

  // Extra games
  mahjong: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#001a0d"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#mjbg)"/>
    <defs>
      <linearGradient id="mjbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#003322"/>
        <stop offset="100%" stop-color="#001508"/>
      </linearGradient>
    </defs>
    <rect x="12" y="14" width="24" height="30" rx="3" fill="#f0e0c0" stroke="#8B6914" stroke-width="1.5"/>
    <rect x="44" y="14" width="24" height="30" rx="3" fill="#f0e0c0" stroke="#8B6914" stroke-width="1.5"/>
    <rect x="28" y="36" width="24" height="30" rx="3" fill="#f0e0c0" stroke="#8B6914" stroke-width="1.5"/>
    <text x="24" y="32" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#cc0000">竹</text>
    <text x="56" y="32" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#cc0000">万</text>
    <text x="40" y="54" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#22aa44">中</text>
  </svg>`,

  roulette: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#001a00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#rlbg)"/>
    <defs>
      <linearGradient id="rlbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#003300"/>
        <stop offset="100%" stop-color="#001500"/>
      </linearGradient>
    </defs>
    <!-- Roulette wheel -->
    <circle cx="40" cy="40" r="28" fill="#222" stroke="#FFD700" stroke-width="2"/>
    <circle cx="40" cy="40" r="22" fill="none" stroke="#FFD700" stroke-width="1" stroke-dasharray="6,3"/>
    <!-- Sections -->
    <path d="M40 40 L40 12 A28 28 0 0 1 65 55 Z" fill="#cc0000" opacity=".8"/>
    <path d="M40 40 L65 55 A28 28 0 0 1 15 55 Z" fill="#111" opacity=".8"/>
    <path d="M40 40 L15 55 A28 28 0 0 1 40 12 Z" fill="#cc0000" opacity=".6"/>
    <circle cx="40" cy="40" r="8" fill="#FFD700"/>
    <circle cx="40" cy="40" r="4" fill="#222"/>
    <!-- Ball -->
    <circle cx="40" cy="16" r="3.5" fill="#fff"/>
  </svg>`,

  baccarat: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#001a00"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#bcbg)"/>
    <defs>
      <linearGradient id="bcbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#003300"/>
        <stop offset="100%" stop-color="#001500"/>
      </linearGradient>
    </defs>
    <!-- Cards -->
    <rect x="10" y="20" width="28" height="40" rx="4" fill="#fff" stroke="#ccc" stroke-width="1"/>
    <rect x="22" y="26" width="28" height="40" rx="4" fill="#fff" stroke="#ccc" stroke-width="1"/>
    <text x="24" y="44" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#cc0000">♥</text>
    <text x="36" y="50" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#222">♠</text>
    <text x="24" y="32" font-size="10" fill="#cc0000" font-weight="bold">K</text>
    <text x="36" y="38" font-size="10" fill="#222" font-weight="bold">A</text>
  </svg>`,

  coinflipslot: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="14" fill="#1a1000"/>
    <rect x="4" y="4" width="72" height="72" rx="11" fill="url(#cfbg)"/>
    <defs>
      <linearGradient id="cfbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3d3000"/>
        <stop offset="100%" stop-color="#1a1400"/>
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="26" fill="url(#coinbg)" stroke="#FFD70088" stroke-width="2"/>
    <circle cx="40" cy="40" r="20" fill="none" stroke="#FFD70044" stroke-width="1"/>
    <text x="40" y="44" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="22" fill="#8B6914">৳</text>
    <defs>
      <linearGradient id="coinbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFD700"/>
        <stop offset="100%" stop-color="#B8860B"/>
      </linearGradient>
    </defs>
  </svg>`,
};

type Tag = "all" | "hot" | "popular" | "new" | "megawin";

interface SlotGame {
  name: string;
  nameBn?: string;
  tag: Exclude<Tag, "all">;
  logoKey: string;
  multiplier: string;
  provider: string;
  color: string;
  route?: string;
  thumbnail?: string;
}

const slotGames: SlotGame[] = [
  { name: "Crazy 777",    tag: "hot",      logoKey: "crazy777",       multiplier: "3333x", provider: "JILI",    color: "#ef4444" },
  { name: "Super Ace",    tag: "hot",      logoKey: "superace",       multiplier: "1500x", provider: "JILI",    color: "#3b82f6" },
  { name: "Crazy Hunter", tag: "hot",      logoKey: "crazyhunter",    multiplier: "2000x", provider: "JILI",    color: "#f59e0b" },
  { name: "Fortune Gems", tag: "hot",      logoKey: "fortunegems",    multiplier: "375x",  provider: "JILI",    color: "#06b6d4" },
  { name: "Golden Empire",tag: "hot",      logoKey: "goldenempire",   multiplier: "2000x", provider: "JILI",    color: "#f0c040" },
  { name: "Lucky Coming", tag: "hot",      logoKey: "luckycoming",    multiplier: "1111x", provider: "JILI",    color: "#10b981" },
  { name: "Pharaoh Treasure", tag: "hot", logoKey: "pharaohtreasure",multiplier: "5000x", provider: "JILI",    color: "#d97706" },
  { name: "Boxing King",  tag: "hot",      logoKey: "boxingking",     multiplier: "2000x", provider: "JILI",    color: "#ef4444" },
  { name: "মেগা ফরচুন",   tag: "megawin", logoKey: "megafortune",    multiplier: "500x",  provider: "Popular", color: "#f0c040" },
  { name: "বুক অফ ডেড",   tag: "popular", logoKey: "bookofdead",     multiplier: "250x",  provider: "Popular", color: "#8b5cf6" },
  { name: "স্টারবার্স্ট",  tag: "popular", logoKey: "starburst",      multiplier: "200x",  provider: "Popular", color: "#f59e0b" },
  { name: "গোল্ড রাশ",    tag: "new",     logoKey: "goldrush",       multiplier: "300x",  provider: "New",     color: "#f0c040" },
  { name: "ড্রাগন গোল্ড",  tag: "popular", logoKey: "dragongold",     multiplier: "400x",  provider: "Popular", color: "#ef4444" },
  { name: "ফ্রুট পার্টি",  tag: "popular", logoKey: "fruitparty",     multiplier: "150x",  provider: "Popular", color: "#10b981" },
  { name: "সুইট বনানজা",  tag: "megawin", logoKey: "sweetbonanza",   multiplier: "350x",  provider: "Popular", color: "#ec4899" },
  { name: "ওল্ফ গোল্ড",   tag: "new",     logoKey: "wolfgold",       multiplier: "280x",  provider: "New",     color: "#6366f1" },
  { name: "ফায়ার জোকার",  tag: "popular", logoKey: "firejoker",      multiplier: "220x",  provider: "Popular", color: "#ef4444" },
  { name: "রিল কিং",      tag: "megawin", logoKey: "reelking",       multiplier: "600x",  provider: "Popular", color: "#f0c040" },
  { name: "লাকি লেডি",    tag: "new",     logoKey: "luckylady",      multiplier: "180x",  provider: "New",     color: "#10b981" },
  { name: "নাইট ফর্চুন",   tag: "popular", logoKey: "nightfortune",   multiplier: "310x",  provider: "Popular", color: "#8b5cf6" },
  { name: "মাহজং",         tag: "new",     logoKey: "mahjong",        multiplier: "450x",  provider: "JILI",    color: "#10b981" },
  { name: "রুলেট মাস্টার", tag: "popular", logoKey: "roulette",       multiplier: "360x",  provider: "Live",    color: "#ef4444" },
  { name: "ব্যাকারেট কিং",  tag: "popular", logoKey: "baccarat",       multiplier: "190x",  provider: "Live",    color: "#22cc44" },
  { name: "কয়েন ম্যানিয়া", tag: "new",    logoKey: "coinflipslot",   multiplier: "800x",  provider: "New",     color: "#FFD700" },
  { name: "Bottle Call",  tag: "hot",    logoKey: "",               multiplier: "500x",  provider: "Arcade",  color: "#37fff1", route: "/bottle-call-game", thumbnail: bottleCallThumb },
];

const BadgeHot = () => (
  <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
      <path d="M12 2s-5 5-5 10a5 5 0 0010 0C17 7 12 2 12 2zm0 13a2 2 0 01-2-2c0-3 2-6 2-6s2 3 2 6a2 2 0 01-2 2z"/>
    </svg>
    HOT
  </div>
);

const BadgeMegawin = () => (
  <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    WIN
  </div>
);

const BadgeNew = () => (
  <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
    NEW
  </div>
);

function Slots() {
  const [filter, setFilter] = useState<Tag>("all");
  const navigate = useNavigate();

  const filtered = filter === "all" ? slotGames : slotGames.filter((g) => g.tag === filter);

  const filters: { id: Tag; label: string }[] = [
    { id: "all",     label: "সব" },
    { id: "hot",     label: "HOT" },
    { id: "popular", label: "জনপ্রিয়" },
    { id: "new",     label: "নতুন" },
    { id: "megawin", label: "মেগাউইন" },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Dice5 className="w-5 h-5 text-gold" />
          <h1 className="text-2xl font-display">স্লট মেশিন</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f.id
                  ? "bg-gold-gradient text-gold-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Game grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((g, i) => (
            <button
              key={i}
              onClick={() => navigate({ to: g.route ?? "/slots/play" })}
              className="rounded-xl border border-border/60 bg-card-gradient p-3 hover:gold-border hover:glow-gold text-left relative overflow-hidden group"
            >
              {/* Badge */}
              {g.tag === "hot"     && <BadgeHot />}
              {g.tag === "megawin" && <BadgeMegawin />}
              {g.tag === "new"     && <BadgeNew />}

              {/* Multiplier badge top-left */}
              <div
                className="absolute top-2 left-2 text-white text-[9px] font-bold px-1 rounded z-10"
                style={{ background: `${g.color}cc` }}
              >
                {g.multiplier}
              </div>

              {/* Logo area */}
              <div
                className="aspect-square rounded-lg mb-2 flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `radial-gradient(ellipse at center, ${g.color}22, transparent)`,
                  border: `1px solid ${g.color}33`,
                }}
              >
                {g.thumbnail ? (
                  <img
                    src={g.thumbnail}
                    alt={g.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                ) : (
                  <div
                    className="w-14 h-14 group-hover:scale-110 transition-transform duration-200"
                    dangerouslySetInnerHTML={{ __html: LOGOS[g.logoKey] ?? "" }}
                  />
                )}
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
