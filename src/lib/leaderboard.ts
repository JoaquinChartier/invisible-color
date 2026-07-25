import { dailySeed } from "../engine/rng";

export interface LeaderboardRow {
  name: string;
  moves: number;
  numColors: number;
}

export interface SubmitResult {
  leaderboard: LeaderboardRow[];
  submitted?: { name: string; moves: number; seed: number };
}

export async function fetchLeaderboard(mode: "daily" | "alltime", seed?: number): Promise<LeaderboardRow[]> {
  const params = new URLSearchParams({ mode });
  if (seed !== undefined) params.set("seed", String(seed));
  const res = await fetch(`/api/leaderboard?${params}`);
  if (!res.ok) throw new Error(`Failed to load leaderboard (${res.status})`);
  const data = (await res.json()) as { leaderboard: LeaderboardRow[] };
  return data.leaderboard;
}

export async function submitScore(name: string, seed: number, moves: number, numColors: number): Promise<SubmitResult> {
  const res = await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, seed, moves, numColors }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Submission failed (${res.status})`);
  }
  return (await res.json()) as SubmitResult;
}

export { dailySeed };
