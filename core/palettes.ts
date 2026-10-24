/* Shipped palettes. Each names every role; the surface ramp, glows and rain
   derive from those (derive.ts). Same rule throughout: one dominant neon,
   one counter-accent, one signal — no rainbows. */
import type { Derived } from './derive';
import type { RoleColors } from './roles';

export type Palette = {
  id: string;
  name: string;
  tag: string;
  /** equals the stylesheet's own defaults; a web host may skip applying it inline */
  stock?: boolean;
  colors: RoleColors;
  /** hand-tuned values that beat the derivation rule (the stock ramp is a
   *  touch redder than 4/7/11% of eggshell into maroon) */
  derived?: Partial<Derived>;
};

export const PALETTES: Palette[] = [
  {
    id: 'night-city',
    name: 'Night City',
    tag: 'red chrome, teal live, yellow signal',
    stock: true,
    colors: {
      chrome: '#ff6a5c', live: '#5fe3d4', signal: '#fcee0a', alarm: '#fcee0a',
      active: '#5ef6ff', ok: '#4b9e96', muted: '#54413f',
      text: '#f1e3d2', sub: '#9b867b', bg: '#0b0607',
    },
    derived: { surface: '#140b0c', surface2: '#1f1112', surface3: '#2b1719' },
  },
  {
    id: 'arasaka',
    name: 'Arasaka',
    tag: 'crimson + steel, corporate cold',
    colors: {
      chrome: '#e8243a', live: '#c3d2e2', signal: '#ffc93a', alarm: '#ffc93a',
      active: '#e4eefa', ok: '#6b7a8b', muted: '#463739',
      text: '#f2ecea', sub: '#8e8688', bg: '#090506',
    },
  },
  {
    id: 'militech',
    name: 'Militech',
    tag: 'amber HUD, olive live, orange alert',
    colors: {
      chrome: '#e5a62c', live: '#a3d05e', signal: '#ff5f2e', alarm: '#ff5f2e',
      active: '#c2f070', ok: '#6e8c46', muted: '#41422e',
      text: '#ebe6cf', sub: '#8e8a6f', bg: '#090a05',
    },
  },
  {
    id: 'netrunner',
    name: 'Netrunner',
    tag: 'phosphor green, ice blue, pink spike',
    colors: {
      chrome: '#3cff9e', live: '#5ec8ff', signal: '#ff3fa4', alarm: '#ff3fa4',
      active: '#82ffc8', ok: '#2f9b73', muted: '#2a3c35',
      text: '#d8f5e6', sub: '#7a998a', bg: '#030a07',
    },
  },
  {
    id: 'kabuki',
    name: 'Kabuki',
    tag: 'magenta neon on violet, cyan live',
    colors: {
      chrome: '#ff2fa0', live: '#3ef0ff', signal: '#ffe14d', alarm: '#ffe14d',
      active: '#72f6ff', ok: '#8a70b4', muted: '#4a3452',
      text: '#f4e4f2', sub: '#9c86a2', bg: '#0b0410',
    },
  },
  {
    id: 'afterlife',
    name: 'Afterlife',
    tag: 'bar gold over deep teal',
    colors: {
      chrome: '#e2b450', live: '#4fd1c5', signal: '#ff4f5e', alarm: '#ff4f5e',
      active: '#82e9de', ok: '#3f8d85', muted: '#36403e',
      text: '#efe6d4', sub: '#8e897b', bg: '#040a0a',
    },
  },
  {
    id: 'trauma-team',
    name: 'Trauma Team',
    tag: 'clinical blue + white, red alarm',
    colors: {
      chrome: '#3fb6ff', live: '#e6f3f8', signal: '#ff3b4e', alarm: '#ff3b4e',
      active: '#72e2ff', ok: '#4a89a5', muted: '#33424a',
      text: '#e7f0f4', sub: '#7f929b', bg: '#04080a',
    },
  },
  {
    id: 'silverhand',
    name: 'Silverhand',
    tag: 'chrome arm, red live, yellow signal',
    colors: {
      chrome: '#c9ccd0', live: '#ff3346', signal: '#fcee0a', alarm: '#fcee0a',
      active: '#ff6070', ok: '#8d5a5f', muted: '#3e3a3a',
      text: '#ece8e6', sub: '#8b8583', bg: '#090808',
    },
  },
  {
    id: 'blackwall',
    name: 'Blackwall',
    tag: 'all red, all the way down',
    colors: {
      chrome: '#ff2a3c', live: '#ff9478', signal: '#ffe6b0', alarm: '#ffe6b0',
      active: '#ffb39c', ok: '#9c4a4a', muted: '#43282a',
      text: '#f6dcd6', sub: '#9a7470', bg: '#080203',
    },
  },
];

/** the stylesheet's own colours */
export const DEFAULT_PALETTE: Palette = PALETTES[0];

export function findPalette(id: string | undefined | null): Palette | undefined {
  return PALETTES.find((p) => p.id === id) ?? DEFAULT_PALETTE;
}
