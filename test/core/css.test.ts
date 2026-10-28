import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ROLES } from '../../core/roles';
import { DEFAULT_PALETTE } from '../../core/palettes';

/* The stylesheet is the stock palette's source of truth on the web; keep it
   honest against core, and keep it free of any host's selectors. */
const css = readFileSync(new URL('../../web/cyber.css', import.meta.url), 'utf8');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('cyber.css', () => {
  it('declares every role token with the stock palette value', () => {
    for (const r of ROLES) {
      const m = css.match(new RegExp(`--${r}: (#[0-9a-f]{6});`));
      expect(m?.[1] as string, r).toBe(DEFAULT_PALETTE.colors[r]);
    }
  });
  it('declares the derived and shape tokens', () => {
    for (const t of ['--surface', '--surface-2', '--surface-3', '--hairline', '--live-ink', '--radius', '--chamfer', '--slant', '--glow', '--phosphor', '--display', '--body', '--mono', '--input'])
      expect(css, t).toContain(`${t}:`);
  });
  it('never speaks the old vocabulary', () => {
    expect(code).not.toMatch(/var\(--(red|accent|hot|blocked|working|done|idle)\b/);
  });
  it('styles only its own classes', () => {
    // state modifiers on its own classes (.cy-boot.out, .cd-diamond.spin, …)
    const states = /^\.(out|hot|last|spin|flicker|cyber|default)$/;
    const classes = new Set(code.match(/\.[a-zA-Z][\w-]*/g));
    for (const c of classes) if (!states.test(c)) expect(c, c).toMatch(/^\.(cy-|cd-|theme-boot)/);
    expect(code).not.toMatch(/&\s*#/); // no ids either
  });
  it('ships the overlays and keyframes the effects rely on', () => {
    for (const s of ['.cy-rain', '.cy-boot', '.cy-ticker', '.theme-boot.cyber', '.theme-boot.default'])
      expect(css).toContain(s);
    for (const k of ['cy-glitch', 'cy-flicker', 'cy-flow', 'cy-wipe', 'cy-packet', 'cy-spin', 'cy-beacon', 'cy-marquee', 'cy-neon-on', 'cy-boot', 'cy-sweep', 'cy-crt-off', 'cy-edge'])
      expect(css).toContain(`@keyframes ${k}`);
  });
  it('needs no host text-size token', () => {
    expect(code).not.toMatch(/var\(--fs\)/);
    expect(code).toMatch(/var\(--fs, 1\)/);
  });
  it('dies under reduced motion on its own', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});

const shell = readFileSync(new URL('../../web/shell.css', import.meta.url), 'utf8');
const shellCode = shell.replace(/\/\*[\s\S]*?\*\//g, '');

describe('shell.css', () => {
  it('styles only its own classes', () => {
    const states = /^\.(cd-in|cd-out|cd-swapping)$/;
    for (const c of new Set(shellCode.match(/\.[a-zA-Z][\w-]*/g))) if (!states.test(c)) expect(c, c).toMatch(/^\.cd-/);
    expect(shellCode).not.toMatch(/#[a-z][\w-]*\s*[{,]/i);
  });
  it('keeps the stage free of decoration', () => {
    expect(shellCode).not.toMatch(/\.cd-stage[^{]*\{[^}]*(--crt|--glow|text-shadow|animation)/);
    // the page-wide CRT overlay stands down when a shell is on the page
    expect(code).toMatch(/body:has\(\.cd-shell\)::after\s*\{\s*display:\s*none/);
  });
  it('puts no text under 12px', () => {
    for (const m of shellCode.matchAll(/calc\((\d+(?:\.\d+)?)px \* var\(--fs, 1\)\)/g)) {
      const px = +m[1];
      const ctx = shellCode.slice(Math.max(0, m.index! - 40), m.index!);
      if (/font/.test(ctx)) expect(px, ctx).toBeGreaterThanOrEqual(12);
    }
  });
  it('needs no host text-size token and dies under reduced motion', () => {
    expect(shellCode).not.toMatch(/var\(--fs\)/);
    expect(shell).toContain('prefers-reduced-motion: reduce');
  });
});
