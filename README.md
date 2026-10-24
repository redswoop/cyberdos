# CyberDOS

A restrained neon-on-void cyberpunk skin, lifted out of [herdr-web](https://github.com/redswoop/herdr-web)
so it can be reused: a design language with (eventually) an HTML/CSS expression and a React Native one.

Three pieces, zero runtime dependencies, no build step (ship as TypeScript + CSS and let
your bundler eat it):

| file          | what                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| `cyber.css`   | the skin: tokens, shape (chamfers, square dots), type (Orbitron / Chakra Petch / Share Tech Mono), light (glow, scanlines, glitch), motion |
| `fx.ts`       | what CSS can't do alone: digital rain canvas, decrypt-scramble on titles, boot log      |
| `palettes.ts` | nine shipped palettes (Night City, Arasaka, Militech, Netrunner, Kabuki, Afterlife, Trauma Team, Silverhand, Blackwall) |

## The rules

These are the design rules the skin was tuned to. Break them and it stops reading as
cyberpunk and starts reading as a rave.

- **One chrome, one live, one signal.** Red is chrome (titles, rails, brackets, errors).
  Cyan/teal is live and interactive (links, selection, working). Yellow is the objective
  marker: *needs you*, and the single primary action. Nothing else gets a hue.
- **No rainbow. No hue cycling.** Gradients stay inside the palette.
- **Typed text is proportional.** Composer / inputs use Chakra Petch 400. A wide mono for
  typing prose on a phone reads horribly. Mono (Share Tech Mono) is for code and HUD chrome.
- **Everything decorative dies under `prefers-reduced-motion`** and is `pointer-events: none`.
- **Warmth over flat color.** Glows are two-layer blooms; the background is a lit
  maroon-black room, not `#000`.
- **Fonts are a progressive layer.** Offline, system faces take over and it still reads fine.

## Consuming it

```sh
npm i github:redswoop/cyberdos
```

```ts
import '@redswoop/cyberdos/cyber.css';
import { startCyberFx, stopCyberFx, bootLog, setRainColors } from '@redswoop/cyberdos/fx';
import { palettesFor, findPalette } from '@redswoop/cyberdos/palettes';

document.documentElement.dataset.theme = 'cyber';   // the skin is keyed on <html data-theme="cyber">
startCyberFx();                                      // rain + scramble observer
bootLog();                                           // one-shot boot overlay
```

`cyber.css` layers over a stock stylesheet's tokens: it redefines `--bg --surface --surface-2
--surface-3 --hairline --text --sub --accent --accent-ink --blocked --working --done --idle
--r-sm --r-md --r-lg --mono` and adds its own (`--red --hot --display --body --input --cut
--chamfer --slant --grid --glow --phosphor`). It also expects `--fs` (a text-size multiplier,
default `1`) from the host.

A palette is applied by setting the role tokens inline on `<html>`; the surface ramp derives
from `--bg` via `color-mix`, so a palette only names roles (see `palettes.ts`). Load the
fonts yourself (Google Fonts: Chakra Petch 400–700, Orbitron 700/900, Share Tech Mono).

## Status: phase 1, lift-and-shift

This is the skin exactly as it left herdr-web. It still knows about that app:

- `cyber.css` styles ~140 herdr-web selectors (`.sidebar`, `.composer`, `.agent-name`,
  `.ov-card`, `.blocked-card`, …) under the `[data-theme="cyber"]` block. Only the
  `.cy-*` and `.theme-boot` classes are the skin's own.
- `fx.ts`: the scramble observer targets a hard-coded herdr selector list (`SCRAMBLE_SEL`),
  and `bootLog` prints `HERDR//OS 20.77`.
- `palettes.ts`: the `Theme` type is `'default' | 'cyber'` and role keys (`blocked`,
  `working`, `done`, `idle`) are agent-status semantics.

Phase 2 is to decouple: split `cyber.css` into *primitives* (tokens, utility classes for
chamfer / glow / rail / glitch, the overlays) and a per-app *adapter* layer; make
`SCRAMBLE_SEL` and the boot lines options to `startCyberFx` / `bootLog`; generalize the
palette roles. herdr-web's React Native port (Capra: `mobile/src/cyber-fx.tsx`,
`cyber-skia.tsx`, `theme.ts`) is a candidate `native/` entry once the roles are generic.

## License

MIT.
