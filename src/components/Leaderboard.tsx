import { useEffect, useState } from "react";
import { fetchLeaderboard, submitScore, type LeaderboardRow } from "../lib/leaderboard";
import { hexToRgba, ACCENT, BG } from "./styles";

interface Props {
  open: boolean;
  onClose: () => void;
  initialMode: "daily" | "alltime";
  seed: number;
  autoSubmit?: { name: string; moves: number; numColors: number } | null;
}

export function Leaderboard({ open, onClose, initialMode, seed, autoSubmit }: Props) {
  const [mode, setMode] = useState<"daily" | "alltime">(initialMode);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [submittedSeed, setSubmittedSeed] = useState<number | null>(null);

  const load = async (m: "daily" | "alltime", s: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard(m, s);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void load(mode, seed);
  }, [open, mode, seed]);

  useEffect(() => {
    if (!open || !autoSubmit) return;
    if (submittedSeed === seed) return;
    void (async () => {
      setSubmitStatus("Submitting…");
      try {
        const res = await submitScore(autoSubmit.name, seed, autoSubmit.moves, autoSubmit.numColors);
        setRows(res.leaderboard);
        setSubmitStatus("Submitted!");
        setSubmittedSeed(seed);
      } catch (e) {
        setSubmitStatus(e instanceof Error ? e.message : "Submission failed");
      }
    })();
  }, [open, autoSubmit, seed, submittedSeed]);

  if (!open) return null;

  const activeSeed = mode === "daily" ? seed : 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "440px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "radial-gradient(circle at 30% 20%, #1e1e2e, #0f0f1a)",
          border: `1px solid ${hexToRgba(ACCENT, 0.4)}`,
          borderRadius: 12,
          padding: "20px 22px",
          boxShadow: `0 0 30px ${hexToRgba(ACCENT, 0.3)}`,
          color: "#e4e4e7",
          fontSize: "0.9rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#ede9fe", letterSpacing: "0.03em" }}>
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#a1a1aa",
              fontSize: "1.3rem",
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {(["daily", "alltime"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: "0.8rem",
                cursor: "pointer",
                border: `1px solid ${mode === m ? hexToRgba(ACCENT, 0.7) : hexToRgba(ACCENT, 0.2)}`,
                background: mode === m ? hexToRgba(ACCENT, 0.2) : "transparent",
                color: mode === m ? "#ede9fe" : "#a1a1aa",
                transition: "all 0.2s",
              }}
            >
              {m === "daily" ? "Today" : "All Time"}
            </button>
          ))}
        </div>

        {submitStatus && (
          <div style={{ fontSize: "0.78rem", color: submitStatus === "Submitted!" ? "#22c55e" : "#fca5a5", marginBottom: 8, textAlign: "center" }}>
            {submitStatus}
          </div>
        )}

        <div style={{ overflowY: "auto", flex: 1, minHeight: "120px" }}>
          {loading && <div style={{ color: "#71717a", textAlign: "center", padding: "20px 0" }}>Loading…</div>}
          {error && <div style={{ color: "#fca5a5", textAlign: "center", padding: "20px 0" }}>{error}</div>}
          {!loading && !error && rows.length === 0 && (
            <div style={{ color: "#71717a", textAlign: "center", padding: "20px 0" }}>No scores yet. Be the first!</div>
          )}
          {!loading && !error && rows.length > 0 && (
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {rows.map((row, i) => (
                <li
                  key={`${row.name}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: BG,
                    border: `1px solid ${hexToRgba(ACCENT, i < 3 ? 0.4 : 0.15)}`,
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: i === 0 ? "#fde68a" : i === 1 ? "#d4d4d8" : i === 2 ? "#fca5a5" : "#71717a",
                        background: hexToRgba(ACCENT, 0.12),
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "#ede9fe", fontWeight: 500 }}>{row.name}</span>
                  </span>
                  <span style={{ color: "#a1a1aa", fontSize: "0.8rem" }}>
                    {row.moves} <span style={{ color: "#52525b" }}>moves</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {mode === "daily" && (
          <div style={{ marginTop: 10, fontSize: "0.7rem", color: "#52525b", textAlign: "center" }}>
            Daily seed {activeSeed} · only daily puzzles count
          </div>
        )}
      </div>
    </div>
  );
}
