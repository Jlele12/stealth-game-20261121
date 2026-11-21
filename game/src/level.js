// Nightjar Vault — the three vault floors. Each level: walls (rects, block vision + movement),
// cover (crates and pillars, block vision + movement), shadows (floor patches that hide the player),
// gems to collect, guard patrols (waypoint loops with facing), spawn and exit.
//
// Legend used by the code: anything in `walls` or `cover` blocks both sight lines and walking;
// `shadows` only darken the floor and hide whoever stands in them.

export const LEVELS = [
  {
    name: 'Level 1 — Lower Archive',
    hint: 'Sneak (hold SHIFT) through the shadows, grab the gems, slip to the exit.',
    spawn: { x: 3, y: 17.5 },
    exit: { x: 29, y: 2.5, w: 2, h: 2 },
    walls: [
      { x: 0, y: 0, w: 32, h: 1 },
      { x: 0, y: 19, w: 32, h: 1 },
      { x: 0, y: 0, w: 1, h: 20 },
      { x: 31, y: 0, w: 1, h: 20 },
      { x: 8, y: 5, w: 1, h: 9 },
      { x: 15, y: 9, w: 1, h: 7 },
      { x: 16, y: 9, w: 7, h: 1 },
      { x: 23, y: 4, w: 1, h: 6 },
    ],
    cover: [
      { x: 4, y: 7, w: 2, h: 2, kind: 'crate' },
      { x: 5, y: 13, w: 2, h: 1, kind: 'crate' },
      { x: 11, y: 4, w: 1, h: 1, kind: 'pillar' },
      { x: 12, y: 15, w: 2, h: 2, kind: 'crate' },
      { x: 19, y: 3, w: 1, h: 1, kind: 'pillar' },
      { x: 20, y: 14, w: 2, h: 1, kind: 'crate' },
      { x: 27, y: 8, w: 2, h: 2, kind: 'crate' },
    ],
    shadows: [
      { x: 2, y: 5, w: 4, h: 3 },
      { x: 9, y: 11, w: 5, h: 4 },
      { x: 17, y: 12, w: 4, h: 5 },
      { x: 25, y: 2, w: 5, h: 4 },
      { x: 26, y: 15, w: 4, h: 3 },
    ],
    gems: [
      { x: 12.5, y: 5.5 }, { x: 20.5, y: 9.5 }, { x: 28.5, y: 16.5 }, { x: 6.5, y: 10.5 },
    ],
    guards: [
      {
        route: [{ x: 12, y: 3 }, { x: 20, y: 3 }, { x: 20, y: 8 }, { x: 12, y: 8 }],
        speed: 1.6,
      },
      {
        route: [{ x: 26, y: 12 }, { x: 26, y: 17 }, { x: 18, y: 17 }, { x: 18, y: 12 }],
        speed: 1.5,
      },
    ],
  },
  {
    name: 'Level 2 — Sealed Corridors',
    hint: 'Guards talk to each other here: one alarm and they all hunt. Use the crates.',
    spawn: { x: 2.5, y: 2.5 },
    exit: { x: 29, y: 17, w: 2, h: 2 },
    walls: [
      { x: 0, y: 0, w: 32, h: 1 },
      { x: 0, y: 19, w: 32, h: 1 },
      { x: 0, y: 0, w: 1, h: 20 },
      { x: 31, y: 0, w: 1, h: 20 },
      { x: 7, y: 1, w: 1, h: 8 },
      { x: 7, y: 9, w: 6, h: 1 },
      { x: 13, y: 9, w: 1, h: 10 },
      { x: 14, y: 14, w: 5, h: 1 },
      { x: 19, y: 4, w: 1, h: 6 },
      { x: 19, y: 4, w: 6, h: 1 },
      { x: 24, y: 4, w: 1, h: 11 },
    ],
    cover: [
      { x: 3, y: 9, w: 2, h: 2, kind: 'crate' },
      { x: 10, y: 3, w: 1, h: 1, kind: 'pillar' },
      { x: 10, y: 12, w: 2, h: 1, kind: 'crate' },
      { x: 16, y: 6, w: 1, h: 1, kind: 'pillar' },
      { x: 16, y: 11, w: 2, h: 2, kind: 'crate' },
      { x: 22, y: 12, w: 1, h: 1, kind: 'pillar' },
      { x: 26, y: 3, w: 2, h: 1, kind: 'crate' },
      { x: 28, y: 10, w: 2, h: 2, kind: 'crate' },
    ],
    shadows: [
      { x: 2, y: 6, w: 4, h: 4 },
      { x: 9, y: 16, w: 4, h: 3 },
      { x: 15, y: 2, w: 4, h: 3 },
      { x: 21, y: 8, w: 3, h: 4 },
      { x: 25, y: 15, w: 5, h: 3 },
    ],
    gems: [
      { x: 11.5, y: 8.5 }, { x: 17.5, y: 16.5 }, { x: 27.5, y: 7.5 }, { x: 22.5, y: 16.5 }, { x: 4.5, y: 16.5 },
    ],
    guards: [
      { route: [{ x: 4, y: 5 }, { x: 4, y: 14 }, { x: 10, y: 14 }, { x: 10, y: 5 }], speed: 1.7 },
      { route: [{ x: 16, y: 3 }, { x: 22, y: 3 }, { x: 22, y: 8 }, { x: 16, y: 8 }], speed: 1.8 },
      { route: [{ x: 28, y: 15 }, { x: 21, y: 15 }, { x: 21, y: 18 }, { x: 28, y: 18 }], speed: 1.5 },
    ],
  },
  {
    name: 'Level 3 — The Nightjar Vault',
    hint: 'The vault floor. Three sentries, one vault door. Stay out of the light.',
    spawn: { x: 29.5, y: 17.5 },
    exit: { x: 2, y: 2, w: 2, h: 2 },
    walls: [
      { x: 0, y: 0, w: 32, h: 1 },
      { x: 0, y: 19, w: 32, h: 1 },
      { x: 0, y: 0, w: 1, h: 20 },
      { x: 31, y: 0, w: 1, h: 20 },
      { x: 10, y: 3, w: 12, h: 1 },
      { x: 10, y: 3, w: 1, h: 6 },
      { x: 21, y: 3, w: 1, h: 6 },
      { x: 5, y: 9, w: 1, h: 7 },
      { x: 25, y: 9, w: 1, h: 7 },
      { x: 12, y: 12, w: 8, h: 1 },
    ],
    cover: [
      { x: 6, y: 4, w: 2, h: 1, kind: 'crate' },
      { x: 8, y: 14, w: 1, h: 1, kind: 'pillar' },
      { x: 14, y: 6, w: 2, h: 2, kind: 'crate' },
      { x: 17, y: 16, w: 2, h: 1, kind: 'crate' },
      { x: 23, y: 6, w: 1, h: 1, kind: 'pillar' },
      { x: 24, y: 13, w: 2, h: 2, kind: 'crate' },
      { x: 28, y: 5, w: 1, h: 1, kind: 'pillar' },
    ],
    shadows: [
      { x: 3, y: 12, w: 4, h: 4 },
      { x: 11, y: 4, w: 3, h: 6 },
      { x: 14, y: 16, w: 4, h: 3 },
      { x: 22, y: 4, w: 3, h: 6 },
      { x: 26, y: 16, w: 4, h: 2 },
    ],
    gems: [
      { x: 12.5, y: 10.5 }, { x: 18.5, y: 14.5 }, { x: 26.5, y: 10.5 }, { x: 7.5, y: 6.5 }, { x: 29.5, y: 13.5 }, { x: 15.5, y: 2.5 },
    ],
    guards: [
      { route: [{ x: 13, y: 11 }, { x: 18, y: 11 }, { x: 18, y: 16 }, { x: 13, y: 16 }], speed: 1.8 },
      { route: [{ x: 7, y: 5 }, { x: 7, y: 12 }, { x: 2, y: 12 }, { x: 2, y: 5 }], speed: 1.7 },
      { route: [{ x: 24, y: 5 }, { x: 29, y: 5 }, { x: 29, y: 12 }, { x: 24, y: 12 }], speed: 1.9 },
    ],
  },
];

export const GEM_VALUE = 150;
export const LEVEL_CLEAR_BONUS = 500;
export const STEALTH_BONUS = 800; // finish a level never seen
export const PAR_TIME = 40;       // seconds; faster clears score more
