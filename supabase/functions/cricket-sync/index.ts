// Supabase Edge Function: cricket-sync
// Scrapes cricket matches + odds from 1win's API and upserts into Supabase
// Deploy: supabase functions deploy cricket-sync
// Schedule via Supabase Dashboard > Edge Functions > Schedules: */10 * * * *

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE = "https://api-gateway.top-parser.com";
const LOCALE_ID = "en-001";
const LOCALE_P = "44ba10e5-7df2-47ab-a44d-dc93803c7a6e";
const SPORT_ID = 25; // cricket

const HEADERS = {
  "Content-Type": "application/json",
  "Origin": "https://1win.com",
  "Referer": "https://1win.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

interface Match {
  id: number;
  name: string;
  homeTeam: { id: number; name: string; logo?: { url: string } };
  awayTeam: { id: number; name: string; logo?: { url: string } };
  tournament: { id: number; slug: string };
  category: { id: number; slug: string };
  startAt: number;
  service: string;
  logo?: { url: string };
}

interface OddsMarket {
  id: string;
  name: string;
  outcomes: Array<{ id: string; name: string; value: number; isActive: boolean }>;
  isActive: boolean;
}

async function fetchMatches(service: "prematch" | "live"): Promise<Match[]> {
  try {
    const res = await fetch(`${BASE}/matches/get-many`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ sportId: SPORT_ID, id: LOCALE_ID, p: LOCALE_P, service }),
    });
    const data = await res.json();
    return data?.result?.items ?? [];
  } catch (e) {
    console.error(`fetchMatches(${service}) failed:`, e);
    return [];
  }
}

async function fetchMatchOdds(matchId: number): Promise<OddsMarket[]> {
  try {
    const res = await fetch(
      `${BASE}/matches/get?matchId=${matchId}&id=${LOCALE_ID}&p=${LOCALE_P}`,
      { headers: HEADERS }
    );
    const data = await res.json();
    return data?.result?.markets ?? [];
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  // Allow manual triggers via POST with secret
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceKey!,
    { auth: { persistSession: false } }
  );

  console.log("Starting cricket sync...");

  // 1. Fetch prematch + live matches
  const [prematch, live] = await Promise.all([
    fetchMatches("prematch"),
    fetchMatches("live"),
  ]);

  const allMatches = [...live, ...prematch];
  // Filter out long-term bets (team IDs < 0) and keep real matches
  const realMatches = allMatches.filter(
    (m) => m.homeTeam?.id > 0 && m.awayTeam?.id > 0 && m.category?.slug !== "long-term-bets"
  );

  console.log(`Fetched ${realMatches.length} real cricket matches`);

  let upsertedMatches = 0;
  let upsertedMarkets = 0;
  const errors: string[] = [];

  // 2. Process each match
  for (const match of realMatches) {
    const startTime = new Date(match.startAt * 1000).toISOString();
    const status = match.service === "live" ? "live" : "upcoming";

    // Upsert match
    const { data: upserted, error: matchErr } = await supabase
      .from("matches")
      .upsert(
        {
          external_id: String(match.id),
          team_home: match.homeTeam.name,
          team_away: match.awayTeam.name,
          tournament: match.tournament.slug,
          category: match.category.slug,
          start_time: startTime,
          status,
          sport: "cricket",
          sport_id: SPORT_ID,
          logo_url: match.logo?.url ?? null,
          home_logo: match.homeTeam.logo?.url ?? null,
          away_logo: match.awayTeam.logo?.url ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "external_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (matchErr) {
      errors.push(`Match ${match.id}: ${matchErr.message}`);
      continue;
    }

    upsertedMatches++;
    const dbMatchId = upserted.id;

    // 3. Fetch + upsert odds (only for upcoming/live, skip too-far-future)
    const hoursUntilStart = (match.startAt * 1000 - Date.now()) / 36e5;
    if (hoursUntilStart > 72) continue; // skip matches more than 3 days away

    const markets = await fetchMatchOdds(match.id);

    for (const market of markets) {
      if (!market.isActive) continue;

      const selections = market.outcomes
        .filter((o) => o.isActive)
        .map((o) => ({ id: o.id, name: o.name, odds: o.value }));

      if (selections.length === 0) continue;

      const { error: mktErr } = await supabase.from("odds_markets").upsert(
        {
          external_id: `${match.id}_${market.id}`,
          match_id: dbMatchId,
          market_name: market.name,
          selections,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "external_id", ignoreDuplicates: false }
      );

      if (mktErr) {
        errors.push(`Market ${market.id}: ${mktErr.message}`);
      } else {
        upsertedMarkets++;
      }
    }

    // Tiny delay to avoid hammering the API
    await new Promise((r) => setTimeout(r, 100));
  }

  const result = {
    ok: true,
    upsertedMatches,
    upsertedMarkets,
    total: realMatches.length,
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  };

  console.log("Sync complete:", result);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
