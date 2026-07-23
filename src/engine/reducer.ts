import type { State, Action } from "./types";
import { generateGame } from "./generate";
import { scrollRow, scrollCol } from "./scroll";
import { isSolved } from "./clue";

export function initialState(numColors = 9): State {
  const { circles, target } = generateGame(numColors);
  return {
    circles,
    target,
    moves: 0,
    status: "playing",
    history: [],
    numColors,
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
        history: [...state.history, action],
      };
    }

    case "newGame": {
      return initialState(action.numColors);
    }

    case "giveUp": {
      return { ...state, status: "revealed" };
    }

    default:
      return state;
  }
}
