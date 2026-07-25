import { useEffect, useReducer, useRef, useState } from "react";
import type { State } from "./engine/types";
import { reducer, initialState } from "./engine/reducer";
import { dailySeed } from "./engine/rng";
import { Board } from "./components/Board";
import { neonButton, neonInput, neonHandlers, hexToRgba, applyHover, ACCENT, BG } from "./components/styles";

function buildShareText(state: State): string {
  let mode: string;
  if (state.isDaily) {
    const dateStr = new Date(state.seed * 86_400_000).toISOString().slice(0, 10);
    mode = `Daily ${dateStr}`;
  } else {
    mode = "Practice";
  }
  const result = state.status === "won" ? `${state.moves} moves ✅` : "gave up ❌";
  const url = state.isDaily
    ? `${window.location.origin}${window.location.pathname}`
    : `${window.location.origin}${window.location.pathname}?seed=${state.seed}&colors=${state.numColors}`;
  return `Invisible Color — ${mode}\n${state.numColors} colors · ${result}\n\n${url}`;
}

function ShareButton({ onShare }: { onShare: () => string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    const text = onShare();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      style={{
        fontSize: "0.8rem",
        padding: "4px 14px",
        borderRadius: 8,
        border: `1px solid ${hexToRgba(ACCENT, 0.4)}`,
        background: BG,
        color: "#c4b5fd",
        cursor: "pointer",
        boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.2)}`,
        transition: "box-shadow 0.2s, border-color 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) =>
        applyHover(e, {
          boxShadow: `0 0 12px ${hexToRgba(ACCENT, 0.5)}`,
          borderColor: hexToRgba(ACCENT, 0.7),
          color: "#ede9fe",
        })
      }
      onMouseLeave={(e) =>
        applyHover(e, {
          boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.2)}`,
          borderColor: hexToRgba(ACCENT, 0.4),
          color: copied ? "#22c55e" : "#c4b5fd",
        })
      }
    >
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get("seed");
    const colorsParam = params.get("colors");
    if (seedParam !== null) {
      const seed = Number(seedParam) || 0;
      const numColors = Math.min(9, Math.max(3, Number(colorsParam) || 4));
      return initialState(numColors, seed, false);
    }
    return initialState();
  });
  const [debug, setDebug] = useState(false);
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [tags, setTags] = useState<Record<number, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newGameOpen, setNewGameOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(() => {
    try {
      if (localStorage.getItem("ic-seen-help")) return false;
    } catch {}
    return true;
  });
  const closeHelp = () => {
    setHelpOpen(false);
    try {
      localStorage.setItem("ic-seen-help", "1");
    } catch {}
  };
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  useEffect(() => {
    const url = state.isDaily
      ? `${window.location.origin}${window.location.pathname}`
      : `${window.location.origin}${window.location.pathname}?seed=${state.seed}&colors=${state.numColors}`;
    window.history.replaceState(null, "", url);
  }, [state.seed, state.isDaily, state.numColors]);

  const revealed = state.status === "revealed" || state.status === "won";

  const handleNewGame = (numColors: number) => {
    setTags({});
    setSelectedId(null);
    dispatch({ type: "newGame", numColors });
  };

  const handleDaily = () => {
    setTags({});
    setSelectedId(null);
    dispatch({ type: "newGame", numColors: 4, seed: dailySeed(), isDaily: true });
  };

  const { base: btnBase, hover: btnHover, active: btnActive } = neonButton();

  const startPress = () => {
    if (pressTimer.current) return;
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null;
      setDebugUnlocked(true);
    }, 5000);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background: "#121213",
        color: "#e4e4e7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(1.2rem, 4vw, 2rem)",
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: "0.05em",
            userSelect: "none",
            cursor: "pointer",
            position: "relative",
            touchAction: "none",
          }}
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
        >
          Invisible Color
        </h1>
        <button
          onClick={() => setHelpOpen(true)}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: `1px solid ${hexToRgba(ACCENT, 0.4)}`,
            background: BG,
            color: "#c4b5fd",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            padding: 0,
            transform: "translateY(2px)",
            boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.3)}, inset 0 0 4px ${hexToRgba(ACCENT, 0.1)}`,
            transition: "box-shadow 0.2s, border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) =>
            applyHover(e, {
              boxShadow: `0 0 12px ${hexToRgba(ACCENT, 0.6)}, inset 0 0 6px ${hexToRgba(ACCENT, 0.2)}`,
              borderColor: hexToRgba(ACCENT, 0.8),
              color: "#ede9fe",
            })
          }
          onMouseLeave={(e) =>
            applyHover(e, {
              boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.3)}, inset 0 0 4px ${hexToRgba(ACCENT, 0.1)}`,
              borderColor: hexToRgba(ACCENT, 0.4),
              color: "#c4b5fd",
            })
          }
        >
          ?
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {[
          { label: "Moves", value: state.moves },
          { label: "Colors", value: state.numColors },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: BG,
              border: `1px solid ${hexToRgba(ACCENT, 0.25)}`,
              boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.15)}, inset 0 0 4px ${hexToRgba(ACCENT, 0.08)}`,
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "#71717a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {stat.label}
            </span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ede9fe" }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {state.isDaily && (
        <div style={{ fontSize: "0.75rem", color: "#a1a1aa", letterSpacing: "0.05em" }}>
          Daily · {new Date(state.seed * 86_400_000).toISOString().slice(0, 10)}
        </div>
      )}

      <Board
        circles={state.circles}
        target={state.target}
        revealed={revealed}
        debug={debug}
        tags={tags}
        selectedId={selectedId}
        onSelectCircle={(id) => setSelectedId((prev) => (prev === id ? null : id))}
        onScroll={(axis, index, dir) => dispatch({ type: "scroll", axis, index, dir })}
      />

      {state.status === "won" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ color: "#22c55e", fontWeight: 600, fontSize: "1.1rem", textAlign: "center" }}>
            You solved it in {state.moves} moves!
          </div>
          <ShareButton onShare={() => buildShareText(state)} />
        </div>
      )}

      {state.status === "revealed" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "1.1rem", textAlign: "center" }}>
            Solution revealed — better luck next time!
          </div>
          <ShareButton onShare={() => buildShareText(state)} />
        </div>
      )}

      {selectedId !== null && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            autoFocus
            value={tags[selectedId] || ""}
            onChange={(e) => setTags((t) => ({ ...t, [selectedId]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setSelectedId(null);
            }}
            placeholder="Tag this circle…"
            style={neonInput()}
          />
          {tags[selectedId] && (
            <button
              onClick={() => setTags((t) => {
                const next = { ...t };
                delete next[selectedId];
                return next;
              })}
              style={btnBase}
              {...neonHandlers(btnBase, btnHover, btnActive)}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        {!state.isDaily && (
          <button
            style={btnBase}
            onClick={handleDaily}
            {...neonHandlers(btnBase, btnHover, btnActive)}
          >
            Daily
          </button>
        )}

        <div style={{ position: "relative", display: "inline-flex" }}>
          <button
            style={btnBase}
            onClick={() => setNewGameOpen((o) => !o)}
            {...neonHandlers(btnBase, btnHover, btnActive)}
          >
            New Game ▾
          </button>
          {newGameOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 4,
                background: "#1a1a2e",
                border: `1px solid ${hexToRgba(ACCENT, 0.3)}`,
                borderRadius: 8,
                padding: 4,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                zIndex: 10,
                boxShadow: `0 0 14px ${hexToRgba(ACCENT, 0.3)}`,
              }}
            >
              <div style={{ textAlign: "center", fontSize: "0.7rem", color: "#71717a", padding: "2px 0" }}>
                Colors
              </div>
              {[3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  style={{
                    ...btnBase,
                    border: "none",
                    boxShadow: "none",
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    justifyContent: "center",
                    background: n === state.numColors ? hexToRgba(ACCENT, 0.2) : "transparent",
                    color: n === state.numColors ? "#ede9fe" : "#a1a1aa",
                  }}
                  onMouseEnter={(e) => applyHover(e, { color: "#ede9fe", background: hexToRgba(ACCENT, 0.15) })}
                  onMouseLeave={(e) =>
                    applyHover(e, {
                      color: n === state.numColors ? "#ede9fe" : "#a1a1aa",
                      background: n === state.numColors ? hexToRgba(ACCENT, 0.2) : "transparent",
                    })
                  }
                  onClick={() => {
                    handleNewGame(n);
                    setNewGameOpen(false);
                  }}
                >
                  {n} colors
                </button>
              ))}
            </div>
          )}
        </div>

        {state.status === "playing" && (
          <button
            onClick={() => dispatch({ type: "giveUp" })}
            style={{
              ...btnBase,
              border: `1px solid ${hexToRgba("#ef4444", 0.3)}`,
              color: "#fca5a5",
              boxShadow: `0 0 6px ${hexToRgba("#ef4444", 0.15)}, inset 0 0 4px ${hexToRgba("#ef4444", 0.08)}`,
            }}
            {...neonHandlers(
              {
                ...btnBase,
                border: `1px solid ${hexToRgba("#ef4444", 0.3)}`,
                color: "#fca5a5",
                boxShadow: `0 0 6px ${hexToRgba("#ef4444", 0.15)}, inset 0 0 4px ${hexToRgba("#ef4444", 0.08)}`,
              },
              {
                ...btnHover,
                border: `1px solid ${hexToRgba("#ef4444", 0.7)}`,
                boxShadow: `0 0 14px ${hexToRgba("#ef4444", 0.55)}, inset 0 0 8px ${hexToRgba("#ef4444", 0.25)}`,
              },
              btnActive
            )}
          >
            Give Up
          </button>
        )}

        {debugUnlocked && (
          <button
            onClick={() => setDebug((d) => !d)}
            style={{
              ...btnBase,
              ...(debug
                ? {
                    border: `1px solid ${hexToRgba(ACCENT, 0.7)}`,
                    color: "#ede9fe",
                    boxShadow: `0 0 14px ${hexToRgba(ACCENT, 0.55)}, inset 0 0 8px ${hexToRgba(ACCENT, 0.25)}`,
                  }
                : {}),
            }}
            {...neonHandlers(
              debug
                ? {
                    ...btnBase,
                    border: `1px solid ${hexToRgba(ACCENT, 0.7)}`,
                    color: "#ede9fe",
                    boxShadow: `0 0 14px ${hexToRgba(ACCENT, 0.55)}, inset 0 0 8px ${hexToRgba(ACCENT, 0.25)}`,
                  }
                : btnBase,
              btnHover,
              btnActive
            )}
          >
            Debug: {debug ? "ON" : "OFF"}
          </button>
        )}
      </div>

      {helpOpen && (
        <div
          onClick={() => closeHelp()}
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
              maxWidth: "440px",
              background: "radial-gradient(circle at 30% 20%, #1e1e2e, #0f0f1a)",
              border: `1px solid ${hexToRgba(ACCENT, 0.4)}`,
              borderRadius: 12,
              padding: "24px 28px",
              boxShadow: `0 0 30px ${hexToRgba(ACCENT, 0.3)}`,
              color: "#e4e4e7",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#ede9fe", letterSpacing: "0.03em" }}>
                How to Play
              </h2>
              <button
                onClick={() => closeHelp()}
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
            <p style={{ margin: "0 0 10px" }}>
              Nine identical circles have hidden colors. Arrange them to match the color pattern in the 3x3 grid below (each of its 9 squares has a color, and some may repeat).
            </p>
            <p style={{ margin: "0 0 10px" }}>
              <b style={{ color: "#22c55e" }}>Green border</b>: the circle's color is in the correct position.
              <br />
              <b style={{ color: "#eab308" }}>Yellow border</b>: the color belongs somewhere in this row or column.
              <br />
              <b style={{ color: "#52525b" }}>No glow</b>: the color isn't in this row or column.
            </p>
            <p style={{ margin: "0 0 10px" }}>
              Scroll rows left/right and columns up/down to rearrange the circles. The board wraps around.
            </p>
            <p style={{ margin: "0 0 16px" }}>
              Tap a circle to add a text tag. Fewer colors = harder puzzle!
            </p>
            <button
              onClick={() => closeHelp()}
              style={{
                ...btnBase,
                width: "100%",
                padding: "8px",
              }}
              {...neonHandlers(btnBase, btnHover, btnActive)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
