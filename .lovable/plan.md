## Scope reality check

What you've described is a full real-money gambling platform — 14 user pages, a full admin panel, 12 database tables, wallet with manual payment approvals, live odds, an Aviator crash game, and lottery draws. That's many weeks of work, not a single build. Trying to ship it all in one pass produces a shallow, broken product. I'll build it in phases, shipping a working slice each time.

Also flagging two things before we start:

1. **Legal**: Online real-money gambling is illegal in Bangladesh under the Public Gambling Act 1867. If this is for a licensed offshore operator targeting BD, fine — but you'll need licensing, KYC/AML, and payment-processor agreements that aren't in scope here. If it's a demo/portfolio/play-money app, say so and I'll label balances accordingly.
2. **Payments**: bKash/Nagad/Rocket don't offer merchant APIs for gambling. The "upload screenshot + admin approves" flow you described is the only realistic path, and that's what I'll build.

## Phase 1 (this build) — Foundation + core user experience

**Design system & shell**
- Dark casino theme in `src/styles.css`: deep navy/black bg, gold (#f0c040) accent, neon highlights, oklch tokens
- Bengali typography (Hind Siliguri or Noto Sans Bengali via `<link>` in `__root.tsx`)
- App shell: top bar with balance, mobile bottom nav (হোম/গেমস/ওয়ালেট/অ্যাকাউন্ট), desktop sidebar
- Reusable: GameCard, OddsButton, BetSlip, BalancePill, BengaliNumeral helper, ৳ formatter

**Backend (Lovable Cloud / Supabase)**
- Enable Cloud
- Full schema: profiles, transactions, bets, matches, odds_markets, games, promotions, aviator_rounds, aviator_bets, notifications, user_roles (admin via `has_role`, not a separate `admin_users` table — safer pattern)
- RLS on every table, GRANTs to authenticated/service_role
- Auth: email/password (mobile-only auth needs SMS provider — out of scope; I'll use email as login and store mobile as profile field, OR use Supabase phone auth if you wire Twilio later)

**Pages built in Phase 1**
- `/` Homepage — hero, featured matches, category grid, big-wins marquee
- `/auth` — register + login (one page, tabbed)
- `/cricket` + match detail with bet slip
- `/casino` lobby (game cards, detail with iframe placeholder + chip selector)
- `/aviator` — working crash game UI with client-side round simulation seeded from `aviator_rounds`
- `/wallet` — deposit (screenshot upload to Storage), withdrawal, transaction history
- `/profile` — basic info + KYC upload stub
- `/bet-history`

## Phase 2 (next build, after you confirm Phase 1)
- `/slots`, `/lottery`, `/promotions`, `/referral`, `/notifications`, `/support`
- Bet settlement server functions

## Phase 3 — Admin panel
- `/admin/*` with role-gated layout, all 9 admin pages, CSV export, manual deposit/withdrawal approval flow

## Technical notes
- TanStack Start (not React Router — that's what the template uses)
- Auth via Supabase email/password; mobile stored on profile. Phone OTP requires a paid SMS provider — confirm if you want me to wire Twilio later.
- Aviator multipliers generated server-side in a server function so they can't be cheated client-side
- All money math in integer paisa server-side; display formatted as ৳

## Decisions I need from you

1. **Legal posture**: Real-money (you have/will get licensing) or play-money demo?
2. **Auth**: Email+password now (mobile as profile field), or wait until you provision an SMS provider for true mobile OTP?
3. **Proceed with Phase 1 as scoped?** Or trim/expand?
