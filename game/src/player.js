// Nightjar Vault — the player: WASD/arrows to move, SHIFT to sneak, mouse to aim.
import { PLAYER, TILE } from './config.js';
import { moveBody } from './geometry.js';

export function makePlayer(level) {
  return {
    x: level.spawn.x * TILE,
    y: level.spawn.y * TILE,
    r: PLAYER.radius,
    facing: -Math.PI / 2,
    sneaking: false,
    inShadow: false,
    hidden: false,
    stepPhase: 0,
    moveDx: 0,
    moveDy: 0,
  };
}

export function updatePlayer(player, input, level) {
  let dx = 0, dy = 0;
  if (input.held('w', 'arrowup')) dy -= 1;
  if (input.held('s', 'arrowdown')) dy += 1;
  if (input.held('a', 'arrowleft')) dx -= 1;
  if (input.held('d', 'arrowright')) dx += 1;
  const len = Math.hypot(dx, dy) || 1;
  player.sneaking = input.held('shift');
  const sp = player.sneaking ? PLAYER.sneak : PLAYER.speed;
  const rects = [...level.walls, ...level.cover];
  player.moveDx = (dx / len) * sp;
  player.moveDy = (dy / len) * sp;
  moveBody(player, rects, player.moveDx, player.moveDy);
  player.facing = input.aimAngle(player.x, player.y);
  if (dx || dy) player.stepPhase += player.sneaking ? 0.06 : 0.14;
}

export function playerFootstep(phase) {
  return Math.sin(phase) > 0.94; // one beat per stride
}
