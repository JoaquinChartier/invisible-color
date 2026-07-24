import type { Circle } from "./types";
import { isSolved } from "./clue";
import { scrollRow, scrollCol } from "./scroll";

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateGame(numColors: number, rng: () => number = Math.random): { circles: Circle[]; target: number[] } {
  const colors: number[] = [];
  for (let i = 0; i < 9; i++) {
    colors.push(i % numColors);
  }
  const target = shuffleArray(colors, rng);

  const circles: Circle[] = target.map((color, i) => ({ id: i, color }));

  let scrambled = circles;
  let attempts = 0;
  do {
    scrambled = circles;
    const scrambleCount = 30 + Math.floor(rng() * 20);
    for (let i = 0; i < scrambleCount; i++) {
      if (rng() < 0.5) {
        scrambled = scrollRow(scrambled, Math.floor(rng() * 3), rng() < 0.5 ? 1 : -1);
      } else {
        scrambled = scrollCol(scrambled, Math.floor(rng() * 3), rng() < 0.5 ? 1 : -1);
      }
    }
    attempts++;
  } while (isSolved(scrambled, target) && attempts < 50);

  return { circles: scrambled, target };
}
