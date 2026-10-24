# CyberDOS — working notes for Claude

A design language (core roles + palettes) with a web expression (CSS/DOM) and a
React Native expression. Read README.md first; it is the contract. This file is
the loop.

## The rule that matters most

One change lands in both expressions, with tests for both consumers. The rules
of the skin are tests (`test/core/palettes.test.ts`): one chrome, one live, one
signal, no rainbow; typed text proportional; decoration dies under reduced
motion. Armen makes every visual call. Flag objective defects, never restyle on
taste.

## Consumers

- **herdr-web** (`~/src/herdr-web`, github.com/redswoop/herdr-web) wears it on
  the web (`web/src/theme-cyber.css` is the reference adapter stylesheet,
  `web/src/prefs.ts` + `web/src/theme.ts` drive it) and in Capra, the RN app in
  `mobile/` (`mobile/src/theme-map.ts` maps roles onto herdr tokens,
  `mobile/src/cyber*.tsx` are thin wrappers over `native/`).
- herdr's shared adapter is `shared/src/cyber.ts` (status → role, boot lines).
- The dep is **pinned to a commit** in herdr-web's `web/`, `shared/` and
  `mobile/` package.json. `npm update` does not re-resolve a `#main` ref. To
  ship a change: push here, then bump the sha in all three and `npm install`.

## Iterating against herdr-web

```sh
# point herdr-web at this checkout (a copy, not a symlink: tsc must resolve
# react-native from herdr-web's node_modules)
rsync -a --delete --exclude node_modules --exclude .git ~/src/cyberdos/ ~/src/herdr-web/node_modules/@redswoop/cyberdos/
cd ~/src/herdr-web && npm run check && npm run check -w capra && npm run test:unit
```

Vite excludes the package from its optimizer, so the dev server (`npm run dev:web`,
tailnet URL from the herdr-web notes) hot-reloads edits in that copy.

## Verifying the web expression

`~/src/herdr-web/tools/skin-shots.mjs <outdir>` renders eight reference screens
against herdr-web's mock daemon (ports 7699/5199, reduced motion, prefs
stubbed so nothing touches synced settings). Shoot before and after, then
pixel-diff with PIL. The stylesheet split shipped with seven of eight identical.

## Verifying the native expression

Capra on the iOS Simulator is driven from the Linux box over ssh to the Mac;
the recipe (rsync the herdr-web tree to `~/dev/herdr-web-lab`, `npm install`
there, restart Metro, `simctl launch`, screenshot) lives in herdr-web's Claude
memory under "iOS Simulator loop". No RN component test harness exists yet in
either repo: `native/` is type-checked by Capra's `tsc`, its pure logic by
core tests. That gap is open.

## Layout

```
core/     no DOM, no RN. roles.ts palettes.ts derive.ts color.ts lines.ts fonts.ts
web/      cyber.css (primitives only; tested to own only cy-/cd-/theme-boot) fx.ts skin.ts
native/   provider.tsx chrome.tsx fx.tsx skia.tsx assets/ (tiles + make-tiles.py)
test/     core/ (node) web/ (jsdom)
```

`npm test`, `npm run check`. The package tsconfig excludes `native/` (no RN types here).
