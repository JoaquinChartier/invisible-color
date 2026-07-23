import type { CSSProperties } from "react";

export const ACCENT = "#a78bfa";

export const BG = "radial-gradient(circle at 30% 30%, #2a2a3a, #131322)";

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function neonButton(): {
  base: CSSProperties;
  hover: CSSProperties;
  active: CSSProperties;
} {
  return {
    base: {
      background: BG,
      border: `1px solid ${hexToRgba(ACCENT, 0.25)}`,
      color: "#a1a1aa",
      borderRadius: "8px",
      cursor: "pointer",
      padding: "6px 14px",
      fontSize: "0.875rem",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1,
      boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.15)}, inset 0 0 4px ${hexToRgba(ACCENT, 0.08)}`,
      transition:
        "background 0.2s, color 0.2s, border-color 0.2s, transform 0.1s, box-shadow 0.2s",
    },
    hover: {
      background: "radial-gradient(circle at 30% 30%, #3a3a4f, #1a1a2e)",
      color: "#ede9fe",
      border: `1px solid ${hexToRgba(ACCENT, 0.7)}`,
      boxShadow: `0 0 14px ${hexToRgba(ACCENT, 0.55)}, inset 0 0 8px ${hexToRgba(ACCENT, 0.25)}`,
    },
    active: {
      transform: "scale(0.96)",
    },
  };
}

export function neonInput(): CSSProperties {
  return {
    background: BG,
    border: `1px solid ${hexToRgba(ACCENT, 0.25)}`,
    color: "#e4e4e7",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "0.875rem",
    width: "180px",
    outline: "none",
    boxShadow: `0 0 6px ${hexToRgba(ACCENT, 0.15)}, inset 0 0 4px ${hexToRgba(ACCENT, 0.08)}`,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
}

export function applyHover(
  e: React.MouseEvent<HTMLElement>,
  style: CSSProperties
) {
  Object.assign(e.currentTarget.style, style);
}

export function neonHandlers(
  base: CSSProperties,
  hover: CSSProperties,
  active: CSSProperties
) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => applyHover(e, hover),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => applyHover(e, base),
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => applyHover(e, active),
    onMouseUp: (e: React.MouseEvent<HTMLElement>) =>
      applyHover(e, { transform: "scale(1)" }),
  };
}
