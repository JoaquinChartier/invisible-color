# 🎮 Invisible Color — Game Development Plan

## 1. Executive Summary & Objective
**Invisible Color** is an interactive deduction puzzle game played on a 3×3 grid with 9 circles. Each circle has an internal color that is invisible to the user and belongs to a hidden target position on the grid. A position on the grid can have any hidden color, and any circle with that same internal color can be placed on that position. Players swap circles around the grid and receive feedback through each circle's **border color**, which reflects whether a placed circle is in its exact row & column, its correct row OR column, or neither. The number of **unique** colors ranges from 3 to 9 — fewer unique colors means more circles share the same color, creating visual ambiguity and raising the difficulty.

How swapping works:

You can scroll any **row** (left/right) or **column** (up/down), like a Rubik's cube. Each scroll shifts all 3 circles in that line by one position, wrapping around.

If the circles are placed like:

| 1 | 2 | 3 |
|---|---|---|
| 4 | 5 | 6 |
| 7 | 8 | 9 |

one can scroll the first column down (1→4→7→1) and it will look like:

| 7 | 2 | 3 |
|---|---|---|
| 1 | 5 | 6 |
| 4 | 8 | 9 |

like a rubic cube. Similarly, scrolling a row shifts its circles left or right with wrap-around.

---

## 2. Core Game Logic & Rules

### Grid Structure
* Grid size: **3×3** (9 slots total, always filled with 9 circles).
* Up to **9 distinct colors** drawn from a palette (e.g., Ruby, Sapphire, Emerald, Gold, Amethyst, Turquoise, Coral, Amber, Magenta).
* The number of unique colors **N** is configurable: $N \in [3, 9]$.
* When $N < 9$, some colors repeat — multiple circles share the same visual color and can be assigned to any position of the same color.

### Feedback (Circle Border Colors)
Each circle's border color reflects how close **that specific circle** is to its correct target position. The border updates **live on every scroll** — no "Check" button needed.

* 🟩 **Green border:** The circle is in the **correct row AND correct column** (exact match).
* 🨨 **Yellow border:** The circle is in the **correct row OR column**, but not both (partial match).
* ⬜ **No border / default outline:** The circle matches **neither** the correct row nor column.

> **Key design point:** The circles' internal colors are invisible to the player throughout the game. All 9 circles look identical — the player is guided **only** by the border feedback. The hidden solution is revealed only when the player **wins** or **gives up**.

### Win Condition
* All 9 circle borders turn **Green** (9/9 exact matches).

---

## 3. Player Interaction

The **only** interaction is scrolling rows and columns. There is no circle selection, no drag-and-drop of individual circles, no direct swapping. The player's sole tool is shifting rows/columns and observing the resulting border feedback.

---
