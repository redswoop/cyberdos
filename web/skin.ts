/* Putting a palette on the page. The stylesheet carries the stock palette;
   any other is applied inline as role tokens on <html>, plus the derived
   surface ramp, so one knob (bg) keeps every surface coherent. */
import { derive } from '../core/derive';
import { ROLES, type Role, type RoleColors } from '../core/roles';
import { DEFAULT_PALETTE } from '../core/palettes';

export const THEME_ATTR = 'cyber';

/** flip the skin on/off: `<html data-theme="cyber">` is the whole hook */
export function setSkin(on: boolean, root: HTMLElement = document.documentElement) {
  if (on) root.dataset.theme = THEME_ATTR;
  else if (root.dataset.theme === THEME_ATTR) delete root.dataset.theme;
}

export function skinOn(root: HTMLElement = document.documentElement): boolean {
  return root.dataset.theme === THEME_ATTR;
}

const DERIVED_PROPS = ['--surface', '--surface-2', '--surface-3'] as const;

/** Apply role colours inline. Pass a partial set: unnamed roles keep the
 *  stylesheet's values. Pass {} (or nothing) to return to the stylesheet. */
export function applyPalette(colors: Partial<RoleColors> = {}, root: HTMLElement = document.documentElement) {
  clearPalette(root);
  for (const r of ROLES) if (colors[r]) root.style.setProperty(`--${r}`, colors[r]!);
  if (colors.bg) {
    // the ramp is derived in CSS terms so it tracks --text live
    root.style.setProperty('--surface', `color-mix(in srgb, ${colors.bg}, var(--text) 4%)`);
    root.style.setProperty('--surface-2', `color-mix(in srgb, ${colors.bg}, var(--text) 7%)`);
    root.style.setProperty('--surface-3', `color-mix(in srgb, ${colors.bg}, var(--text) 11%)`);
  }
}

export function clearPalette(root: HTMLElement = document.documentElement) {
  for (const r of ROLES) root.style.removeProperty(`--${r}`);
  for (const p of DERIVED_PROPS) root.style.removeProperty(p);
}

/** the value a role currently paints with (inline override or stylesheet) */
export function readRole(role: Role, root: HTMLElement = document.documentElement): string {
  const v = getComputedStyle(root).getPropertyValue(`--${role}`).trim();
  return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : DEFAULT_PALETTE.colors[role];
}

/** the stylesheet's value for a role, ignoring any inline override */
export function stylesheetRole(role: Role, root: HTMLElement = document.documentElement): string {
  const prop = `--${role}`;
  const mine = root.style.getPropertyValue(prop);
  root.style.removeProperty(prop);
  const v = readRole(role, root);
  if (mine) root.style.setProperty(prop, mine);
  return v;
}

/** a `<meta name="theme-color">` value for the palette (the void) */
export function themeColor(colors: Partial<RoleColors> = {}): string {
  return colors.bg ?? DEFAULT_PALETTE.colors.bg;
}

export { derive };
