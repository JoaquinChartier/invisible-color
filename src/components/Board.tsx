import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { Circle as CircleType } from "../engine/types";
import { Circle, PALETTE } from "./Circle";
import { neonButton, hexToRgba, neonHandlers } from "./styles";

interface Props {
  circles: CircleType[];
  target: number[];
  revealed: boolean;
  debug: boolean;
  tags: Record<number, string>;
  selectedId: number | null;
  onSelectCircle: (id: number) => void;
  onScroll: (axis: "row" | "col", index: number, dir: 1 | -1) => void;
}

export function Board({ circles, target, revealed, debug, tags, selectedId, onSelectCircle, onScroll }: Props) {
  const { base: btnBase, hover: btnHover, active: btnActive } = neonButton();

  const cellRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const prevPositions = useRef<Map<number, { x: number; y: number }>>(new Map());

  useLayoutEffect(() => {
    const prev = prevPositions.current;
    const next = new Map<number, { x: number; y: number }>();
    cellRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next.set(id, { x: r.left, y: r.top });
      const p = prev.get(id);
      if (p) {
        const dx = p.x - r.left;
        const dy = p.y - r.top;
        if (dx !== 0 || dy !== 0) {
          el.style.transition = "none";
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            el.style.transition = "transform 0.28s ease";
            el.style.transform = "";
          });
        }
      }
    });
    prevPositions.current = next;
  });

  const setCellRef = (id: number) => (el: HTMLDivElement | null) => {
    if (el) cellRefs.current.set(id, el);
    else cellRefs.current.delete(id);
  };

  const slotBtn: CSSProperties = {
    ...btnBase,
    borderRadius: "50%",
    width: "clamp(28px, 7vw, 36px)",
    height: "clamp(28px, 7vw, 36px)",
    justifySelf: "center",
    alignSelf: "center",
  };

  const makeBtn = (
    key: string,
    label: string,
    onClick: () => void,
    aria: string
  ) => (
    <button
      key={key}
      style={slotBtn}
      onClick={onClick}
      aria-label={aria}
      {...neonHandlers(slotBtn, btnHover, btnActive)}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gridTemplateRows: "auto 1fr auto",
        gap: "10px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* top-left corner */}
      <div />
      {/* top column up buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, clamp(48px, 18vw, 90px))",
          gap: "clamp(8px, 3vw, 16px)",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((c) =>
          makeBtn(`up-${c}`, "▲", () => onScroll("col", c, -1), `Scroll column ${c + 1} up`)
        )}
      </div>
      <div />

      {/* left row-left buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(3, clamp(48px, 18vw, 90px))",
          gap: "clamp(8px, 3vw, 16px)",
          alignContent: "center",
        }}
      >
        {[0, 1, 2].map((r) =>
          makeBtn(`left-${r}`, "◀", () => onScroll("row", r, -1), `Scroll row ${r + 1} left`)
        )}
      </div>

      {/* the 3x3 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "clamp(8px, 3vw, 16px)",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        {circles.map((circle, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const slotBg = debug || revealed ? hexToRgba(PALETTE[target[i]], 0.4) : "transparent";
          return (
            <div
              key={circle.id}
              ref={setCellRef(circle.id)}
              style={{
                background: slotBg,
                border: "1px solid rgba(167, 139, 250, 0.3)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Circle
                circle={circle}
                row={row}
                col={col}
                target={target}
                revealed={revealed}
                debug={debug}
                tag={tags[circle.id] || ""}
                selected={selectedId === circle.id}
                onSelect={() => onSelectCircle(circle.id)}
              />
            </div>
          );
        })}
      </div>

      {/* right row-right buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(3, clamp(48px, 18vw, 90px))",
          gap: "clamp(8px, 3vw, 16px)",
          alignContent: "center",
        }}
      >
        {[0, 1, 2].map((r) =>
          makeBtn(`right-${r}`, "▶", () => onScroll("row", r, 1), `Scroll row ${r + 1} right`)
        )}
      </div>

      <div />
      {/* bottom column down buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, clamp(48px, 18vw, 90px))",
          gap: "clamp(8px, 3vw, 16px)",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((c) =>
          makeBtn(`down-${c}`, "▼", () => onScroll("col", c, 1), `Scroll column ${c + 1} down`)
        )}
      </div>
      <div />
    </div>
  );
}
