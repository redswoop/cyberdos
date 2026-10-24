# CyberDOS

A restrained neon-on-void cyberpunk **design language**, with two expressions: one in
CSS + DOM for the web, one in React Native. Lifted out of
[herdr-web](https://github.com/redswoop/herdr-web), where both are in use.

Source-only, no build step: ship TypeScript + CSS and let Vite or Metro eat it. Zero
runtime dependencies; the native layer has optional peers (`react-native`,
`react-native-reanimated`, `@shopify/react-native-skia`).

```
core/     roles, palettes, derivation, colour math, the words the effects speak
web/      cyber.css (tokens, overlays, keyframes, cd- utilities) + fx.ts + skin.ts
native/   CyberProvider + chrome, motion and Skia components, tile assets
test/     vitest: the rules of the skin as tests (core), jsdom tests (web)
```

## The rules

These are what the skin was tuned to. Break them and it stops reading as cyberpunk
and starts reading as a rave. `test/core/palettes.test.ts` enforces the ones a
machine can check.

- **One chrome, one live, one signal.** Every other colour is a status tint or a
  neutral and sits near one of those three hues. No rainbow, no hue cycling.
- **Typed text is proportional.** Composers and inputs use Chakra Petch. A wide mono
  for typing prose on a phone reads horribly; mono is for code and HUD labels.
- **Everything decorative dies under reduced motion** and is `pointer-events: none`.
- **Warmth over flat colour.** Glows are two-layer blooms; the background is a lit
  maroon-black room, not `#000`.
- **Fonts are a progressive layer.** Offline, system faces take over and it still reads.
- **Motion rests.** On native, any running animation keeps the frame loop alive, so
  every effect is a short burst on a JS timer with nothing animating in between.

## Roles

Ten colour roles. A palette names all ten; an app maps its own semantics onto them
(an agent that is "blocked" paints with `alarm`, an unread badge with `signal`).

| role     | for                                                   |
| -------- | ----------------------------------------------------- |
| `chrome` | the dominant neon: titles, rails, brackets, your voice |
| `live`   | interactive and selected: links, focus, what is on     |
| `signal` | the one primary action                                 |
| `alarm`  | needs a human                                          |
| `active` | in progress                                            |
| `ok`     | finished, quiet                                        |
| `muted`  | present but uninteresting                              |
| `text` `sub` `bg` | reading text, secondary text, the void        |

Surfaces (`surface`, `surface2`, `surface3`), the `hairline` and `liveInk` derive
from those (`core/derive.ts`), so a palette only names roles and one knob keeps
every surface coherent.

Nine palettes ship: Night City (stock), Arasaka, Militech, Netrunner, Kabuki,
Afterlife, Trauma Team, Silverhand, Blackwall.

## Web

```ts
import '@redswoop/cyberdos/web/cyber.css';
import { setSkin, applyPalette, startCyberFx, stopCyberFx, bootLog, setRainColors,
         findPalette, rainColors, GOOGLE_FONTS_URL } from '@redswoop/cyberdos/web';

setSkin(true);                                   // <html data-theme="cyber">
applyPalette(findPalette('kabuki')!.colors);     // inline role tokens; {} = stylesheet's own
startCyberFx({ scramble: '.bar h1, .card-title' }); // rain + decrypt on those as they mount
bootLog({ title: 'MYAPP//OS', host: 'stormer.tailnet', steps: ['> waking ... OK'], last: 'WELCOME' });
setRainColors(rainColors(findPalette('kabuki')!.colors));
```

`cyber.css` is keyed on `[data-theme="cyber"]` and contains **no application
selectors**. It defines the role tokens (`--chrome --live --live-ink --signal --alarm
--active --ok --muted`), re-points the common base tokens a stock stylesheet is
expected to use (`--bg --surface --surface-2 --surface-3 --hairline --text --sub
--mono`), adds shape and light (`--radius --cut --chamfer --slant --grid --glow
--phosphor --display --body --input`), the document treatment (body, selection,
textarea), the overlays (`.cy-rain .cy-boot .cy-ticker .theme-boot`), keyframes
(`cy-*`), and a few `cd-` utilities (`cd-display cd-hud cd-chamfer cd-slant cd-glow
cd-glass cd-brackets cd-rail cd-tape cd-diamond cd-wipe cd-packet cd-sweep cd-primary
cd-input`). It reads `--fs` (a text-size multiplier) from the host if present.

An app then writes its own adapter stylesheet: its classes, in the skin's tokens and
keyframes. herdr-web's is `web/src/theme-cyber.css` there, and is the reference for
what such an adapter looks like.

Load the fonts yourself (`GOOGLE_FONTS_URL`, or self-host Chakra Petch 400–700,
Orbitron 700/900, Share Tech Mono).

## Native

```tsx
import { CyberProvider, buildCyberTokens, CyberScreen, CyberOverlay, Brackets, NeonRail,
         HazardTape, StatusDot, Scramble, Glitch, FlickerIn, RailPacket, AlarmSweep,
         Beacon, BootLog, ChamferPlate, NATIVE_FONT_FILES } from '@redswoop/cyberdos/native';

const tokens = buildCyberTokens(findPalette('kabuki')!.colors, skinOn);
<CyberProvider tokens={tokens}>…</CyberProvider>
```

Every piece renders nothing (or its plain form) when `tokens.on` is false, so a host
with a stock theme leaves them in place. `StatusDot` takes a `tone` (a role name):
`active` ticks round, `alarm` flickers. `BootLog` takes the same branding options as
the web `bootLog`. Load the faces named in `NATIVE_FONT_FILES` with `expo-font`
before mounting. Skia is loaded lazily; a binary without it just gets no rain, bloom
or plates.

The native layer is type-checked by its consumers (it needs their React Native types);
`npm run check` here covers core and web.

## Developing

```sh
npm install
npm test        # vitest: core rules + jsdom web tests
npm run check   # tsc
```

Iterate against a consumer with `npm link` (or point `node_modules/@redswoop/cyberdos`
at your checkout); consumers that exclude the package from Vite's optimizer get HMR.

## License

MIT.
