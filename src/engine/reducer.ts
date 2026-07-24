import type { State, Action } from "./types";
import { generateGame } from "./generate";
import { scrollRow, scrollCol } from "./scroll";
import { isSolved } from "./clue";
import { mulberry32, dailySeed } from "./rng";

export function initialState(numColors = 4, seed = dailySeed(), isDaily = true): State {
  const rng = mulberry32(seed);
  const { circles, target } = generateGame(numColors, rng);
  return {
    circles,
    target,
    moves: 0,
    status: "playing",
    numColors,
    seed,
    isDaily,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "scroll": {
      if (state.status !== "playing") return state;

      let circles: typeof state.circles;
      if (action.axis === "row") {
        circles = scrollRow(state.circles, action.index, action.dir);
      } else {
        circles = scrollCol(state.circles, action.index, action.dir);
      }

      const solved = isSolved(circles, state.target);

      return {
        ...state,
        circles,
        moves: state.moves + 1,
        status: solved ? "won" : "playing",
      };
    }

    case "newGame": {
      const seed = action.seed ?? Math.floor(Math.random() * 0xffffffff);
      const isDaily = action.isDaily ?? false;
      const numColors = action.numColors;
      const rng = mulberry32(seed);
      const { circles, target } = generateGame(numColors, rng);
      return {
        circles,
        target,
        moves: 0,
        status: "playing",
        numColors,
        seed,
        isDaily,
      };
    }

    case "giveUp": {
      return { ...state, status: "revealed" };
    }

    default:
      return state;
  }
}
