import type { Circle } from "./types";

export function scrollRow(circles: Circle[], row: number, dir: 1 | -1): Circle[] {
  const next = [...circles];
  const base = row * 3;
  const a = next[base];
  const b = next[base + 1];
  const c = next[base + 2];

  if (dir === 1) {
    next[base] = c;
    next[base + 1] = a;
    next[base + 2] = b;
  } else {
    next[base] = b;
    next[base + 1] = c;
    next[base + 2] = a;
  }

  return next;
}

export function scrollCol(circles: Circle[], col: number, dir: 1 | -1): Circle[] {
  const next = [...circles];
  const a = next[col];
  const b = next[col + 3];
  const c = next[col + 6];

  if (dir === 1) {
    next[col] = c;
    next[col + 3] = a;
    next[col + 6] = b;
  } else {
    next[col] = b;
    next[col + 3] = c;
    next[col + 6] = a;
  }

  return next;
}
