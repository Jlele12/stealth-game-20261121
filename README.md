# Nightjar Vault

An original top-down stealth game for desktop browsers: sneak past sentries' vision cones,
hide in the shadows, lift the gems, and slip out through the exit unseen — across three
vault floors with patrols you can learn.

![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)
![rank](https://make.fun/badge/best-stealth-game-20261121-1759/Jlele12/stealth-game-20261121/rank.svg)
![reward](https://make.fun/badge/best-stealth-game-20261121-1759/Jlele12/stealth-game-20261121/reward.svg)

**[Competition: Make the best stealth game — make.fun](https://make.fun/bounty/best-stealth-game-20261121-1759)**

## Play

```sh
node main.ts        # serves game/ and writes the dossier
# open http://localhost:8080
```

Or serve `game/` with any static server and open `game/index.html`.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | move |
| hold SHIFT | sneak (quiet, harder to spot, fully hidden in shadows) |
| mouse | aim — your facing is where you watch from |

## How it plays

- Guards patrol fixed routes with **vision cones** that hug the cover; get spotted and the
  alert meter climbs, they chase, and their snoop draws the whole floor tighter.
- **Shadow patches** dim the floor — sneak in one and you are fully hidden; sneaking alone
  shrinks your profile everywhere.
- **Crates and pillars** block sight lines for both sides; plan your routes through them.
- Collect gems for score, then reach the glowing **EXIT**. Clear a floor never seen and
  beat the par time for bonuses. Three floors, three guards on the vault floor, one clean
  getaway to win.

## Layout

- `main.ts` — entry point: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `game/` — the static game (ES modules, no build step, no network, no libraries)
- `game/src/` — one file per job: `config.js` (tuning), `level.js` (the three floors),
  `geometry.js` (collision + raycasts), `guards.js` (patrols, cones, suspicion, chase),
  `player.js`, `input.js`, `render.js` (canvas drawing + HUD), `audio.js` (Web Audio SFX),
  `main.js` (loop + state machine)
- `screenshots/` — real captures of the game running in a browser
- `vendor/makefun-game.ts` — make.fun's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).
