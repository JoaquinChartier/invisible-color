export type Clue = "green" | "yellow" | "none";

export interface Circle {
  id: number;
  color: number;
}

export interface State {
  circles: Circle[];
  target: number[];
  moves: number;
  status: "playing" | "won" | "revealed";
  history: Action[];
  numColors: number;
}

export type Action =
  | { type: "scroll"; axis: "row" | "col"; index: number; dir: 1 | -1 }
  | { type: "newGame"; numColors: number }
  | { type: "giveUp" };
