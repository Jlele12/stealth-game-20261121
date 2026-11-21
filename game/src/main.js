// Nightjar Vault — the game loop and state machine. Loads a floor, updates guards/player,
// watches for gems, the exit, catches, and the global alert meter. Also exposes a small
// ?shot=... scene-staging hook so real screenshots can be taken of live play.
import { STATE, W, H, DETECTION, TILE } from './config.js';
import { LEVELS, GEM_VALUE, LEVEL_CLEAR_BONUS, STEALTH_BONUS, PAR_TIME } from './level.js';
import { makePlayer, updatePlayer, playerFootstep } from './player.js';
import { makeGuards, updateGuards } from './guards.js';
import { render } from './render.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { opaqueRects, pointInShadow, bodyInExit } from './geometry.js';

const canvas = document.getElementById('game');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');
const input = new Input(canvas);
const audio = new Audio();

const state = {
  phase: STATE.title,
  levelIndex: 0,
  level: null,
  player: null,
  guards: [],
  gems: [],
  gemsTotal: 0,
  gemsTaken: 0,
  score: 0,
  alert: 0,
  hidden: false,
  everSpotted: false,
  frames: 0,
  elapsed: 0,
  events: [],
};

export function loadLevel(i) {
  const level = LEVELS[i];
  state.levelIndex = i;
  state.level = level;
  state.level.rows = 20;
  state.level.cols = 32;
  state.player = makePlayer(level);
  state.guards = makeGuards(level);
  state.gems = level.gems.map(g => ({ ...g, phase: Math.random() * 6, taken: false }));
  state.gemsTotal = state.gems.length;
  state.gemsTaken = 0;
  state.alert = 0;
  state.hidden = false;
  state.everSpotted = false;
  state.elapsed = 0;
  state.phase = STATE.playing;
}

function handleEvents() {
  for (const ev of state.events) {
    if (ev.type === 'spotted') { audio.spotted(); state.everSpotted = true; state.alert = Math.min(1, state.alert + 0.4); }
    if (ev.type === 'caught') { audio.caught(); state.phase = STATE.caught; }
  }
  state.events.length = 0;
}

function nextLevel() {
  if (state.levelIndex + 1 >= LEVELS.length) state.phase = STATE.won;
  else loadLevel(state.levelIndex + 1);
}

function update() {
  state.frames++;
  if (state.phase === STATE.title) {
    if (input.consumeClick || input.held('enter', ' ')) { audio.ensure(); loadLevel(0); }
    input.consumeClick = false;
    return;
  }
  if (state.phase === STATE.caught) {
    if (input.held('r')) loadLevel(state.levelIndex);
    if (input.held('enter')) state.phase = STATE.title;
    return;
  }
  if (state.phase === STATE.levelClear || state.phase === STATE.won) {
    if (input.held('enter')) { if (state.phase === STATE.won) { state.score = 0; state.phase = STATE.title; } else nextLevel(); }
    return;
  }

  state.elapsed += 1 / 60;
  updatePlayer(state.player, input, state.level);
  updateGuards(state.guards, state.player, state.level, state.events, state.frames);
  handleEvents();

  // Shadow / hide state: standing in a shadow patch while sneaking hides the player fully.
  const shadows = state.level.shadows;
  const inShadow = pointInShadow(state.player.x, state.player.y, shadows);
  state.player.inShadow = inShadow;
  state.hidden = inShadow && state.player.sneaking;
  state.player.hidden = state.hidden;

  // Footsteps (audible cue that you are moving fast)
  if (!state.player.sneaking && playerFootstep(state.player.stepPhase)) audio.step();

  // Gems
  for (const gem of state.gems) {
    gem.phase += 0.05;
    if (!gem.taken && Math.hypot(gem.x * TILE - state.player.x, gem.y * TILE - state.player.y) < 20) {
      gem.taken = true;
      state.gemsTaken++;
      state.score += GEM_VALUE;
      audio.gem();
    }
  }

  // Alert meter: highest suspicion of any guard, decaying slowly
  const peak = Math.max(0, ...state.guards.map(g => Math.max(g.suspicion, g.state === 'chase' ? 1 : 0)));
  state.alert = Math.max(peak, state.alert - DETECTION.alarmDecay);

  // Exit: need every gem? No — gems are score; the exit ends the floor.
  if (bodyInExit(state.player, { x: state.level.exit.x * TILE, y: state.level.exit.y * TILE, w: state.level.exit.w * TILE, h: state.level.exit.h * TILE })) {
    let bonus = LEVEL_CLEAR_BONUS;
    if (!state.everSpotted) bonus += STEALTH_BONUS;
    if (state.elapsed < PAR_TIME) bonus += Math.round((PAR_TIME - state.elapsed) * 10);
    state.score += bonus;
    state.phase = state.levelIndex + 1 >= LEVELS.length ? STATE.won : STATE.levelClear;
    audio.clear();
  }
  input.consumeClick = false;
}

// ---- screenshot staging (?shot=name) ------------------------------------
// Stages believable mid-play scenes so real screenshots show the game at its best.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) loadLevel(parseInt(params.get('level') ?? '0', 10) || 0);
if (shot === 'play') { state.player.x = 9.5 * 40; state.player.y = 12.5 * 40; state.player.sneaking = true; state.hidden = true; }
if (shot === 'danger') {
  state.player.x = 13.4 * 40; state.player.y = 10.5 * 40; state.player.sneaking = false;
  const g = state.guards[0];
  g.state = 'chase'; g.suspicion = 1; g.lastSeen = { x: state.player.x, y: state.player.y };
  g.x = 15.2 * 40; g.y = 10.5 * 40; g.facing = Math.PI; g.lostTimer = 240;
  state.alert = 0.85; state.everSpotted = true;
  state.gems[0].taken = true; state.gemsTaken = 1;
}
if (shot === 'vault') { loadLevel(2); state.player.x = 12.2 * 40; state.player.y = 5.5 * 40; state.player.sneaking = true; state.guards[1].pause = 40; state.score = 1650; }

let last = performance.now();
function frame(now) {
  const dt = Math.min(50, now - last);
  last = now;
  if (!shot) update();
  render(ctx, state, state.frames);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Let a screenshot driver freeze a pose: ?shot=X&freeze=1 renders one static frame.
if (shot && params.get('freeze')) {
  update(); // one deterministic step so meters show
  render(ctx, state, state.frames);
}
