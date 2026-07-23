# 🛠️ Invisible Color — Tech Stack

> Companion to `gameLogic.md`. This doc covers **what** we build with and **why**, not how the game plays.

---

## 1. Architecture Overview

A single-page web app — no backend, no server. The entire game runs client-side: puzzle generation, state, animation, audio, and persistence all live in the browser.

```
┌───────────────────────────────────────────┐
│                  Browser                   │
│  ┌──────────┐  ┌───────────┐  ┌────────┐  │
│  │  Engine   │  │    UI     │  │ Audio  │  │
│  │ (logic)   │◄─┤ (render)  │◄─┤ (sfx)  │  │
│  └─────┬────┘  └─────┬─────┘  └────────┘  │
│        │              │                    │
│        ▼              ▼                    │
│   ┌─────────┐  ┌───────────┐              │
│   │ Storage │  │ Animation  │              │
│   │(localDB)│  │  (motion)  │              │
│   └─────────┘  └───────────┘              │
└───────────────────────────────────────────┘
```

---

## 2. Core Decisions

### Framework: React + Vite + TypeScript
| Choice | Reason |
|---|---|
| **React** | Component model fits a 3×3 grid of identical circles + surrounding UI naturally. Hooks are clean for live border updates on every scroll. |
| **Vite** | Fast HMR, zero-config TS, tiny prod bundle. No need for CRA/Next. |
| **TypeScript** | Game logic (puzzle gen, target mapping, clue calc) benefits from strict typing — a `Circle` is `{ id, color, targetRow, targetCol }`, not a loose object. |

### Styling: Tailwind CSS + CSS variables
- Tailwind for layout, spacing, responsive grid.
- CSS custom properties for the **border feedback colors** (green/yellow/neutral) so themes (dark/light, colorblind palettes) can swap in one place.
- No heavy UI component library — the game is 9 circles and a few buttons; hand-rolled is cleaner.
- **Minimalist aesthetic:** dark background, clean lines, no chrome. The board is the centerpiece. UI elements (stats, controls) are subtle and unobtrusive.
- **Fully responsive:** the board scales fluidly from large desktop down to small phone screens. Circle size, button hit targets, and spacing all adapt via Tailwind breakpoints + `clamp()`/`vw` units. The game must be equally playable at 320px and 1440px+.

### Animations: Framer Motion
- The signature interaction is **scrolling a row/column** — 3 circles sliding and wrapping. Framer Motion's `layout` animations handle position swaps smoothly with minimal code.
- Border color transitions (`green`/`yellow`/`none`) animate via `animate` props.
- Win celebration: coordinated bounce/scale on all 9 circles + confetti (`canvas-confetti`, ~3KB).

### State Management: React + useReducer
- The game state is small and discrete:
  ```ts
  type State = {
    circles: Circle[];        // 9, current placement
    targets: Target[];        // 9, hidden solution
    moves: number;
    status: 'playing' | 'won' | 'revealed';
    history: Move[];          // for undo
    numColors: 3..9;
  };
  ```
- No Redux/Zustand needed — `useReducer` with a few actions (`scroll`, `undo`, `reset`, `newGame`, `giveUp`) covers it cleanly.
- The reducer is **pure and testable** — it doesn't touch React, so the entire engine can be unit-tested in isolation.

### Audio: Web Audio API (procedural)
- No audio files — synthesize clicks, scroll whoosh, and a short win arpeggio with the Web Audio API.
- ~200 lines, zero bundle cost, and mute toggle persisted to `localStorage`.
- Why not `<audio>` tags? Procedural audio keeps the bundle tiny and avoids loading/copyright issues.

### Persistence: localStorage
- Best scores (moves + time) per difficulty (numColors).
- Settings: mute, theme, last-played difficulty.
- No cloud sync — single-device game. Cloud leaderboards can be a later phase if desired.

### Routing: None (single view)
- One screen: the board + controls + modals (help, win, give-up reveal).
- No need for react-router. Keeps the bundle minimal.

---

## 3. Project Structure (proposed)

```
invisible-color/
├── gameLogic.md
├── techStack.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── index.html
└── src/
    ├── main.tsx                # React entry
    ├── App.tsx                 # top-level layout + modals
    ├── engine/
    │   ├── types.ts            # Circle, Target, State, Action
    │   ├── generate.ts         # puzzle generation + shuffle
    │   ├── reducer.ts          # state transitions (pure)
    │   ├── clue.ts             # border-color calc per circle
    │   └── scroll.ts           # row/column scroll + wrap-around
    ├── components/
    │   ├── Board.tsx           # the 3×3 grid
    │   ├── Circle.tsx          # one slot (render + border + anim)
    │   ├── Controls.tsx        # scroll buttons / gestures
    │   ├── Stats.tsx           # moves, time, best
    │   └── modals/
    │       ├── HelpModal.tsx
    │       ├── WinModal.tsx
    │       └── RevealModal.tsx # show solution on give-up
    ├── audio/
    │   └── synth.ts            # Web Audio sfx
    ├── storage/
    │   └── store.ts            # localStorage helpers
    └── styles/
        └── theme.css           # CSS vars for colors/themes
```

---

## 4. Input / Interaction

| Input | Action |
|---|---|
| Click a row's left/right button | Scroll that row left/right |
| Click a column's up/down button | Scroll that column up/down |
| Drag a row/column (touch + mouse) | Flick to scroll in that direction |
| `U` key | Undo last move |
| `R` key | Reset to initial shuffled state |
| `N` key | New game (same difficulty) |

- The primary control is **buttons adjacent to each row/column** (clear affordance, works on desktop and mobile).
- Optional: drag/flick gestures on the grid for a more tactile feel (Phase 2 polish).

---

## 5. Development & Build

- **Dev server:** `npm run dev` → Vite HMR on `localhost`.
- **Build:** `npm run build` → static `dist/` (Vite). Not deploying for now — local testing only.
- **Bundle goal:** < 200KB gzipped (React + Framer Motion + app code, no assets since audio is procedural and circles are CSS/SVG).

---

## 6. Out of Scope (for now)

- Multiplayer / cloud leaderboards
- Accounts / auth
- Backend / API
- Deployment (local-only for now)
- Native mobile app (it's a responsive web app)
- Internationalization (English-only for v1)

These can be revisited after the core game is shippable.

---

## Open Questions

1. **Colorblind palette** — should we include a colorblind-friendly border scheme (e.g., green/yellow + shapes: solid/dashed/none)?
2. **Drag gestures** — do we want flick-to-scroll on the grid in v1, or ship button-only first?
