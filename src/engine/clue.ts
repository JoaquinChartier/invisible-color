import type { Circle, Clue } from "./types";

export function calcClue(circle: Circle, row: number, col: number, target: number[]): Clue {
  const pos = row * 3 + col;
  const color = circle.color;

  if (target[pos] === color) return "green";

  const inRow = target[row * 3] === color || target[row * 3 + 1] === color || target[row * 3 + 2] === color;
  const inCol = target[col] === color || target[col + 3] === color || target[col + 6] === color;

  if (inRow || inCol) return "yellow";
  return "none";
}

export function isSolved(circles: Circle[], target: number[]): boolean {
  for (let i = 0; i < 9; i++) {
    if (circles[i].color !== target[i]) return false;
  }
  return true;
}
