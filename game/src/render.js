// Nightjar Vault — rendering. Draws the floor grid, shadow patches, walls and crates with
// simple top faces, guard vision cones (fan of rays cast against opaque rects), the player,
// gems, the exit, and the HUD.
import { TILE, W, H, COLORS } from './config.js';
import { segmentBlocked, opaqueRects } from './geometry.js';
import { guardColor } from './guards.js';

function drawShadowPatches(ctx, level) {
  for (const s of level.shadows) {
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(s.x * TILE, s.y * TILE, s.w * TILE, s.h * TILE);
  }
}

function drawFloor(ctx, level) {
  for (let cy = 1; cy < level.rows; cy++) {
    for (let cx = 1; cx < level.cols; cx++) {
      ctx.fillStyle = (cx + cy) % 2 ? COLORS.floorLight : COLORS.floorShadow;
      ctx.fillRect(cx * TILE, cy * TILE, TILE, TILE);
    }
  }
}

function drawRect3d(ctx, r, side, top) {
  const x = r.x * TILE, y = r.y * TILE, w = r.w * TILE, h = r.h * TILE;
  ctx.fillStyle = side;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = top;
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
}

function drawCones(ctx, guards, level, rects) {
  for (const g of guards) {
    const color = g.state === 'chase' ? COLORS.coneChase : g.state === 'suspicious' || g.suspicion > 0.2 ? COLORS.coneSuspicious : COLORS.cone;
    const half = (60 * Math.PI) / 360; // GUARD fov / 2, kept local to avoid a cycle
    const range = 260;
    const steps = 26;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    for (let i = 0; i <= steps; i++) {
      const a = g.facing - half + (2 * half * i) / steps;
      let d = range;
      // March out to the first blocker so the cone hugs the cover.
      for (let t = 14; t <= range; t += 7) {
        const px = g.x + Math.cos(a) * t, py = g.y + Math.sin(a) * t;
        if (segmentBlocked(g.x, g.y, px, py, rects)) { d = t - 7; break; }
      }
      ctx.lineTo(g.x + Math.cos(a) * d, g.y + Math.sin(a) * d);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawGuard(ctx, g) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.facing);
  ctx.fillStyle = guardColor(g);
  ctx.beginPath();
  ctx.arc(0, 0, g.r, 0, Math.PI * 2);
  ctx.fill();
  // visor showing facing
  ctx.fillStyle = '#1c202b';
  ctx.fillRect(2, -3, 9, 6);
  ctx.restore();
  // suspicion pips
  if (g.suspicion > 0.05) {
    ctx.fillStyle = guardColor(g);
    ctx.fillRect(g.x - 12, g.y - g.r - 9, 24 * g.suspicion, 4);
    ctx.strokeStyle = '#0b0d14';
    ctx.strokeRect(g.x - 12, g.y - g.r - 9, 24, 4);
  }
}

function drawPlayer(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = p.sneaking ? COLORS.playerSneak : COLORS.player;
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b0d14';
  ctx.beginPath();
  ctx.arc(Math.cos(p.facing) * 4, Math.sin(p.facing) * 4, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // sneaking halo — a soft ring that reads "quiet"
  if (p.sneaking) {
    ctx.strokeStyle = 'rgba(95,217,168,0.5)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 5 + Math.sin(p.stepPhase) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGems(ctx, gems) {
  for (const gem of gems) {
    if (gem.taken) continue;
    const x = gem.x * TILE, y = gem.y * TILE;
    const wobble = Math.sin(gem.phase) * 3;
    ctx.fillStyle = COLORS.gem;
    ctx.beginPath();
    ctx.moveTo(x, y - 9 + wobble);
    ctx.lineTo(x + 7, y + wobble);
    ctx.lineTo(x, y + 9 + wobble);
    ctx.lineTo(x - 7, y + wobble);
    ctx.closePath();
    ctx.fill();
  }
}

function drawExit(ctx, level) {
  const e = level.exit;
  const x = e.x * TILE, y = e.y * TILE, w = e.w * TILE, h = e.h * TILE;
  ctx.fillStyle = COLORS.exit;
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
  ctx.strokeStyle = '#c9baff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  ctx.fillStyle = '#0b0d14';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', x + w / 2, y + h / 2 + 4);
  ctx.lineWidth = 1;
}

function drawHud(ctx, state) {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(state.level.name, 14, 26);
  ctx.font = '14px sans-serif';
  ctx.fillText(`Score ${state.score}`, 14, 48);
  ctx.fillText(`Gems ${state.gemsTaken}/${state.gemsTotal}`, 150, 48);
  // global alert meter
  const mx = W - 260, mw = 240;
  ctx.fillStyle = '#1a1d28';
  ctx.fillRect(mx, 34, mw, 12);
  const alert = Math.min(1, state.alert);
  ctx.fillStyle = alert > 0.6 ? COLORS.guardChase : alert > 0.2 ? COLORS.guardAlert : COLORS.player;
  ctx.fillRect(mx, 34, mw * alert, 12);
  ctx.strokeStyle = '#4a5166';
  ctx.strokeRect(mx, 34, mw, 12);
  ctx.fillStyle = '#e8e4d8';
  ctx.fillText('ALERT', mx - 52, 46);
  if (state.hidden) {
    ctx.fillStyle = COLORS.player;
    ctx.fillText('HIDDEN', 14, 70);
  }
}

function drawCenterText(ctx, lines, sub) {
  ctx.fillStyle = 'rgba(11,13,20,0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(lines[0], W / 2, H / 2 - 30);
  ctx.font = '18px sans-serif';
  let y = H / 2 + 10;
  for (const line of lines.slice(1)) { ctx.fillText(line, W / 2, y); y += 26; }
  if (sub) { ctx.font = '15px sans-serif'; ctx.fillStyle = '#9aa3b8'; ctx.fillText(sub, W / 2, y + 16); }
}

export function render(ctx, state, frames) {
  const level = state.level;
  const rects = opaqueRects(level);
  ctx.clearRect(0, 0, W, H);
  drawFloor(ctx, level);
  drawShadowPatches(ctx, level);
  drawExit(ctx, level);
  drawGems(ctx, state.gems);
  drawCones(ctx, state.guards, level, rects);
  for (const w of level.walls) drawRect3d(ctx, w, COLORS.wall, COLORS.wallTop);
  for (const c of level.cover) drawRect3d(ctx, c, c.kind === 'pillar' ? COLORS.pillar : COLORS.crate, c.kind === 'pillar' ? '#454d6e' : COLORS.crateTop);
  for (const g of state.guards) drawGuard(ctx, g);
  if (state.phase === 'playing' || state.phase === 'levelClear') drawPlayer(ctx, state.player);
  drawHud(ctx, state);

  if (state.phase === 'title') {
    drawCenterText(ctx, ['NIGHTJAR VAULT', 'Sneak past the sentries. Lift the gems. Slip out unseen.',
      'WASD / arrows move — SHIFT sneaks — mouse aims', 'Shadows hide you. Crates block their sight.'],
      state.level?.hint ?? '');
  } else if (state.phase === 'caught') {
    drawCenterText(ctx, ['CAUGHT!', `A sentry grabbed you on ${state.level.name}.`, `Score: ${state.score}`, 'Press R to try the floor again, ENTER for the title.']);
  } else if (state.phase === 'won') {
    drawCenterText(ctx, ['CLEAN GETAWAY!', 'You emptied the vault and were never caught.', `Final score: ${state.score}`, 'Press ENTER to play again.']);
  } else if (state.phase === 'levelClear') {
    drawCenterText(ctx, ['FLOOR CLEARED', state.level.name, `Score: ${state.score}`, 'Press ENTER for the next floor.']);
  }
}
