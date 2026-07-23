import type { Circle as CircleType, Clue } from "../engine/types";
import { calcClue } from "../engine/clue";

export const PALETTE = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#84cc16",
];

const BORDER_COLORS: Record<Clue, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  none: "#3f3f46",
};

interface Props {
  circle: CircleType;
  row: number;
  col: number;
  target: number[];
  revealed: boolean;
  debug: boolean;
  tag: string;
  selected: boolean;
  onSelect: () => void;
}

export function Circle({ circle, row, col, target, revealed, debug, tag, selected, onSelect }: Props) {
  const clue = calcClue(circle, row, col, target);
  const showColor = revealed || debug;
  const bgColor = showColor ? PALETTE[circle.color] : "#1e1e2e";
  const borderColor = selected ? "#60a5fa" : BORDER_COLORS[clue];
  const glow = selected
    ? "0 0 16px #60a5fa"
    : clue === "green"
      ? `0 0 12px ${BORDER_COLORS[clue]}`
      : "none";

  return (
    <div
      onClick={onSelect}
      style={{
        width: "clamp(48px, 18vw, 90px)",
        height: "clamp(48px, 18vw, 90px)",
        borderRadius: "50%",
        background: bgColor,
        border: `3px solid ${borderColor}`,
        boxShadow: glow,
        transition: "border-color 0.02s, box-shadow 0.02s, background 0.02s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {tag && (
        <span
          style={{
            fontSize: "clamp(10px, 3.5vw, 16px)",
            fontWeight: 700,
            color: showColor ? "#fff" : "#e4e4e7",
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            userSelect: "none",
            pointerEvents: "none",
            maxWidth: "80%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}
