// Nightjar Vault — tuning constants, shared by every module.
export const TILE = 40;              // pixels per tile
export const VIEW_COLS = 32;         // playfield width in tiles
export const VIEW_ROWS = 20;         // playfield height in tiles
export const W = VIEW_COLS * TILE;   // 1280
export const H = VIEW_ROWS * TILE;   // 800

export const PLAYER = {
  speed: 2.6,          // px per frame walking
  sneak: 1.3,          // px per frame sneaking (hold shift)
  radius: 9,
  startAlertImmunity: 90,
};

export const GUARD = {
  speed: 1.7,
  chaseSpeed: 3.0,
  radius: 10,
  fovDeg: 60,           // full angle of the vision cone
  nearRange: 190,       // cone reach standing in light
  crouchPenalty: 0.55,  // cone reach shrinks when guard stands in shadow... player side instead
  viewRange: 260,
  suspicionRate: 0.016, // suspicion gain per frame when player in cone
  decayRate: 0.004,     // suspicion decay per frame when clear
  chaseFrames: 300,     // how long a guard chases after losing sight
  pauseFrames: 90,      // pause at each waypoint
};

export const DETECTION = {
  max: 1,               // global alert meter
  alarmDecay: 0.0018,
};

export const STATE = {
  title: 'title',
  playing: 'playing',
  caught: 'caught',
  won: 'won',
  levelClear: 'levelClear',
};

export const COLORS = {
  floorLight: '#232633',
  floorShadow: '#1a1d28',
  wall: '#4a5166',
  wallTop: '#5c6479',
  crate: '#7a5a34',
  crateTop: '#946f42',
  pillar: '#39405a',
  player: '#5fd9a8',
  playerSneak: '#3aa87c',
  guard: '#d95f5f',
  guardAlert: '#e8b23a',
  guardChase: '#e04b3a',
  cone: 'rgba(230,220,140,0.14)',
  coneSuspicious: 'rgba(232,178,58,0.20)',
  coneChase: 'rgba(224,75,58,0.24)',
  gem: '#63c7f2',
  exit: '#8f6ff2',
  shadow: 'rgba(5,7,12,0.35)',
  visionSafe: 'rgba(95,217,168,0.10)',
};
