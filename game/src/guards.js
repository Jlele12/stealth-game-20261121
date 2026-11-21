// Nightjar Vault — guards: waypoint patrols, vision cones, suspicion, chase and alarm sharing.
import { GUARD, TILE, COLORS } from './config.js';
import { moveBody, segmentBlocked, pointInShadow } from './geometry.js';

export function makeGuards(level) {
  return level.guards.map((g, i) => {
    const start = g.route[0];
    return {
      id: i,
      x: start.x * TILE, y: start.y * TILE, r: GUARD.radius,
      route: g.route,
      speed: g.speed,
      wp: 1,               // index of the waypoint heading for
      facing: 0,           // radians
      pause: 0,
      state: 'patrol',     // patrol | suspicious | chase | search
      suspicion: 0,        // 0..1 personal meter
      lostTimer: 0,
      lastSeen: null,
      searchTimer: 0,
      target: null,
      bob: Math.random() * Math.PI * 2,
    };
  });
}

function angleTo(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }

function turnToward(cur, want, max) {
  let d = want - cur;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return cur + Math.max(-max, Math.min(max, d));
}

// Does this guard see the player this frame?
function seesPlayer(guard, player, rects, shadows, hidden) {
  if (hidden) return false;
  const px = player.x, py = player.y;
  const dx = px - guard.x, dy = py - guard.y;
  const dist = Math.hypot(dx, dy);
  let range = GUARD.viewRange;
  // Shadowed players are much harder to spot; sneaking shrinks the profile further.
  if (player.inShadow) range *= 0.5;
  if (player.sneaking) range *= 0.75;
  if (dist > range) return false;
  const ang = Math.atan2(dy, dx);
  let d = Math.abs(ang - guard.facing);
  while (d > Math.PI) d = Math.PI * 2 - d;
  // Close behind the guard is still spotted (peripheral hearing).
  if (d > (GUARD.fovDeg * Math.PI) / 360 && dist > 55) return false;
  if (segmentBlocked(guard.x, guard.y, px, py, rects)) return false;
  return true;
}

export function updateGuards(guards, player, level, events, frames) {
  const rects = [...level.walls, ...level.cover];
  for (const g of guards) {
    g.bob += 0.1;
    const sees = seesPlayer(g, player, rects, level.shadows, player.hidden);

    if (sees) {
      g.suspicion = Math.min(1, g.suspicion + GUARD.suspicionRate * (player.sneaking ? 0.6 : 1) * (player.inShadow ? 0.6 : 1));
      g.lastSeen = { x: player.x, y: player.y };
      if (g.suspicion >= 1 && g.state !== 'chase') {
        g.state = 'chase';
        events.push({ type: 'spotted', guard: g.id });
      }
    } else {
      g.suspicion = Math.max(0, g.suspicion - GUARD.decayRate);
    }

    // State behaviour
    if (g.state === 'chase') {
      const tgt = g.lastSeen ?? { x: player.x, y: player.y };
      const ang = angleTo(g.x, g.y, tgt.x, tgt.y);
      g.facing = turnToward(g.facing, ang, 0.15);
      const dist = Math.hypot(tgt.x - g.x, tgt.y - g.y);
      if (dist > 8) {
        const sp = GUARD.chaseSpeed * (g.speed / 1.7);
        moveBody(g, rects, Math.cos(g.facing) * sp, Math.sin(g.facing) * sp);
      }
      if (sees) { g.lostTimer = GUARD.chaseFrames; g.lastSeen = { x: player.x, y: player.y }; }
      else if (--g.lostTimer <= 0) { g.state = 'search'; g.searchTimer = 240; }
      // Touch = caught
      if (Math.hypot(g.x - player.x, g.y - player.y) < g.r + player.r + 2) {
        events.push({ type: 'caught', guard: g.id });
      }
      continue;
    }

    if (g.state === 'search') {
      g.searchTimer--;
      if (g.lastSeen) {
        const ang = angleTo(g.x, g.y, g.lastSeen.x, g.lastSeen.y);
        g.facing = turnToward(g.facing, ang + Math.sin(frames * 0.05) * 1.2, 0.08);
      }
      if (g.searchTimer <= 0) { g.state = 'patrol'; g.lastSeen = null; g.suspicion = 0; }
      if (sees && g.suspicion > 0.5) { g.state = 'chase'; g.lostTimer = GUARD.chaseFrames; }
      continue;
    }

    // Patrol: walk the waypoint loop, pause at each corner.
    if (g.pause > 0) {
      g.pause--;
      g.facing = turnToward(g.facing, g.facing + 0.02, 0.03); // slow sweep while waiting
    } else {
      const wp = g.route[g.wp];
      const tx = wp.x * TILE, ty = wp.y * TILE;
      const ang = angleTo(g.x, g.y, tx, ty);
      g.facing = turnToward(g.facing, ang, 0.09);
      const dist = Math.hypot(tx - g.x, ty - g.y);
      const sp = GUARD.speed * (g.speed / 1.7);
      if (dist > 6) moveBody(g, rects, Math.cos(g.facing) * sp, Math.sin(g.facing) * sp);
      else { g.wp = (g.wp + 1) % g.route.length; g.pause = GUARD.pauseFrames; }
    }
    if (sees) g.state = 'suspicious';
    else if (g.state === 'suspicious' && g.suspicion <= 0) g.state = 'patrol';
  }
}

export function guardColor(g) {
  if (g.state === 'chase') return COLORS.guardChase;
  if (g.state === 'suspicious' || g.suspicion > 0.2) return COLORS.guardAlert;
  return COLORS.guard;
}
