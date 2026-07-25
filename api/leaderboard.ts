import type { IncomingMessage, ServerResponse } from "http";
import { getDb } from "./_db";
import { dailySeed } from "../src/engine/rng";

const MAX_NAME_LEN = 20;
const MIN_MOVES = 1;
const MAX_MOVES = 10000;
const MAX_DAILY_SUBMITS_PER_IP = 10;
const IP_WINDOW_MS = 24 * 60 * 60 * 1000;
const TOP_N = 50;

interface ScoreDoc {
  name: string;
  seed: number;
  moves: number;
  numColors: number;
  ip: string;
  createdAt: Date;
}

interface LeaderboardRow {
  name: string;
  moves: number;
  numColors: number;
}

type VercelReq = IncomingMessage & {
  query?: Record<string, string | string[]>;
  body?: unknown;
  socket?: { remoteAddress?: string };
};

type VercelRes = ServerResponse & {
  status(code: number): VercelRes;
  json(body: unknown): void;
};

function getClientIp(req: VercelReq): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string") return xff.split(",")[0].trim();
  if (Array.isArray(xff) && xff.length) return xff[0].trim();
  const xRealIp = req.headers["x-real-ip"];
  if (typeof xRealIp === "string") return xRealIp;
  return req.socket?.remoteAddress || "0.0.0.0";
}

function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LEN);
  if (!trimmed) return null;
  if (!/^[\p{L}\p{N} ._-]+$/u.test(trimmed)) return null;
  return trimmed;
}

function toInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i < min || i > max) return null;
  return i;
}

export default async function handler(req: VercelReq, res: VercelRes): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const db = await getDb();
    const col = db.collection<ScoreDoc>("scores");
    await col.createIndexes([
      { key: { name: 1, seed: 1 }, unique: true },
      { key: { seed: 1, moves: 1 } },
      { key: { ip: 1, createdAt: -1 } },
    ]);

    if (req.method === "GET") {
      const mode = req.query?.mode ?? "daily";
      const modeStr = Array.isArray(mode) ? mode[0] : mode;

      if (modeStr === "alltime") {
        const rows = await col
          .aggregate<LeaderboardRow>([
            { $sort: { moves: 1 } },
            {
              $group: {
                _id: "$name",
                name: { $first: "$name" },
                moves: { $first: "$moves" },
                numColors: { $first: "$numColors" },
              },
            },
            { $sort: { moves: 1 } },
            { $limit: TOP_N },
            { $project: { _id: 0, name: 1, moves: 1, numColors: 1 } },
          ])
          .toArray();
        res.status(200).json({ leaderboard: rows });
        return;
      }

      const seedParam = req.query?.seed;
      const seed = toInt(Array.isArray(seedParam) ? seedParam[0] : seedParam, 0, 0xffffffff);
      if (seed === null) {
        res.status(400).json({ error: "Missing or invalid seed" });
        return;
      }
      const rows = await col
        .find({ seed }, { projection: { _id: 0, name: 1, moves: 1, numColors: 1 } })
        .sort({ moves: 1 })
        .limit(TOP_N)
        .toArray();
      res.status(200).json({ leaderboard: rows });
      return;
    }

    // POST
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = sanitizeName(body.name);
    if (!name) {
      res.status(400).json({ error: "Invalid name (max 20 chars, alnum/space/._-)" });
      return;
    }
    const moves = toInt(body.moves, MIN_MOVES, MAX_MOVES);
    if (moves === null) {
      res.status(400).json({ error: "Invalid moves" });
      return;
    }
    const numColors = toInt(body.numColors, 3, 9) ?? 4;
    const seed = toInt(body.seed, 0, 0xffffffff);
    if (seed === null) {
      res.status(400).json({ error: "Invalid seed" });
      return;
    }

    // Only allow submitting for today's daily seed (±1 day for tz slack)
    const today = dailySeed();
    if (Math.abs(seed - today) > 1) {
      res.status(400).json({ error: "Seed is not today's daily puzzle" });
      return;
    }

    const ip = getClientIp(req);
    const since = new Date(Date.now() - IP_WINDOW_MS);
    const recentCount = await col.countDocuments({ ip, createdAt: { $gt: since } });
    if (recentCount >= MAX_DAILY_SUBMITS_PER_IP) {
      res.status(429).json({ error: "Too many submissions today. Try again tomorrow." });
      return;
    }

    const now = new Date();
    const existing = await col.findOne({ name, seed });
    if (existing) {
      if (moves < existing.moves) {
        await col.updateOne({ name, seed }, { $set: { moves, numColors, createdAt: now } });
      }
    } else {
      try {
        await col.insertOne({ name, seed, moves, numColors, ip, createdAt: now });
      } catch (err: unknown) {
        if (err && typeof err === "object" && (err as { code?: number }).code === 11000) {
          await col.updateOne({ name, seed }, { $set: { moves, numColors, createdAt: now } });
        } else {
          throw err;
        }
      }
    }

    const rows = await col
      .find({ seed }, { projection: { _id: 0, name: 1, moves: 1, numColors: 1 } })
      .sort({ moves: 1 })
      .limit(TOP_N)
      .toArray();
    res.status(200).json({ leaderboard: rows, submitted: { name, moves, seed } });
  } catch (err: unknown) {
    console.error("leaderboard error", err);
    res.status(500).json({ error: "Internal error" });
  }
}
