// Nightjar Vault — collision helpers and sight-line tests. Everything is axis-aligned
// rectangles on a fixed playfield; a guard's cone is checked with a raycast per step.
import { TILE, VIEW_COLS, VIEW_ROWS } from './config.js';

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Collect every opaque rect (walls + cover) as pixel-space rects.
export function opaqueRects(level) {
  return [...level.walls, ...level.cover];
}

export function levelBounds() {
  return { x: 0, y: 0, w: VIEW_COLS * TILE, h: VIEW_ROWS * TILE };
}

// Move a circle body against the opaque rects, axis by axis, and return the new position.
export function moveBody(body, rects, dx, dy) {
  let { x, y } = body;
  body.x = x + dx;
  for (const r of rects) {
    if (circleHitsRect(body, r)) {
      body.x = dx > 0 ? r.x - body.r : r.x + r.w + body.r;
    }
  }
  body.y = y + dy;
  for (const r of rects) {
    if (circleHitsRect(body, r)) {
      body.y = dy > 0 ? r.y - body.r : r.y + r.h + body.r;
    }
  }
  body.x = Math.max(body.r, Math.min(VIEW_COLS * TILE - body.r, body.x));
  body.y = Math.max(body.r, Math.min(VIEW_ROWS * TILE - body.r, body.y));
}

function circleHitsRect(body, r) {
  const cx = Math.max(r.x, Math.min(body.x, r.x + r.w));
  const cy = Math.max(r.y, Math.min(body.y, r.y + r.h));
  const ddx = body.x - cx, ddy = body.y - cy;
  return ddx * ddx + ddy * ddy < body.r * body.r;
}

// Segment vs axis-aligned rect intersection (slab method). Returns true if blocked.
function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  let tmin = 0, tmax = 1;
  for (const [p, d, lo, hi] of [[x1, dx, r.x, r.x + r.w], [y1, dy, r.y, r.y + r.h]]) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return false;
    } else {
      let t1 = (lo - p) / d, t2 = (hi - p) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return tmax >= tmin && tmin <= 1 && tmax >= 0;
}

export function segmentBlocked(x1, y1, x2, y2, rects) {
  for (const r of rects) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return true;
  }
  return false;
}

export function pointInShadow(px, py, shadows) {
  const r = { x: px, y: py, w: 0.001, h: 0.001 };
  return shadows.some(s => pointInRect(px, py, s));
}

// Is the exit fully overlapping the body?
export function bodyInExit(body, exit) {
  return body.x > exit.x && body.x < exit.x + exit.w && body.y > exit.y && body.y < exit.y + exit.h;
}
