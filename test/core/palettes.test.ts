import { describe, expect, it } from 'vitest';
import { contrast, hue, isHex, saturation } from '../../core/color';
import { derive, rainColors } from '../../core/derive';
import { DEFAULT_PALETTE, PALETTES, findPalette } from '../../core/palettes';
import { HUE_ROLES, ROLES } from '../../core/roles';

/* The rules of the skin, as tests. A palette that fails here will not read
   as cyberpunk; it will read as a rave. */

const angle = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

describe('shipped palettes', () => {
  it('have unique ids and the stock one first', () => {
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length);
    expect(DEFAULT_PALETTE.stock).toBe(true);
    expect(PALETTES.filter((p) => p.stock)).toHaveLength(1);
  });
  it('fill every role with a 6-digit hex', () => {
    for (const p of PALETTES) for (const r of ROLES) expect(isHex(p.colors[r]), `${p.id}.${r}`).toBe(true);
  });
  it('keep reading text legible on the void (WCAG AA)', () => {
    for (const p of PALETTES) {
      expect(contrast(p.colors.text, p.colors.bg), `${p.id} text`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.colors.sub, p.colors.bg), `${p.id} sub`).toBeGreaterThanOrEqual(3);
    }
  });
  it('keep the background a void', () => {
    for (const p of PALETTES) expect(contrast('#000000', p.colors.bg), p.id).toBeLessThan(1.4);
  });
  it('use at most three hues: chrome, live, signal (no rainbow)', () => {
    // Every other tinted role sits near one of the three (Kabuki's violet
    // void is the widest shipped at 64° off its magenta). A fourth hue at
    // 90°+ — the start of a rainbow — fails.
    for (const p of PALETTES) {
      const hues = HUE_ROLES.filter((r) => saturation(p.colors[r]) > 0.3).map((r) => hue(p.colors[r]));
      for (const r of ROLES) {
        if (HUE_ROLES.includes(r) || saturation(p.colors[r]) < 0.3) continue;
        const h = hue(p.colors[r]);
        expect(hues.some((x) => angle(x, h) <= 70), `${p.id}.${r} hue ${h.toFixed(0)}`).toBe(true);
      }
    }
  });
  it('are found by id, defaulting to the stock one', () => {
    expect(findPalette('kabuki')?.name).toBe('Kabuki');
    expect(findPalette('nope')).toBe(DEFAULT_PALETTE);
    expect(findPalette(undefined)).toBe(DEFAULT_PALETTE);
  });
});

describe('derivation', () => {
  it('lifts surfaces off the background toward the text', () => {
    const d = derive({ bg: '#000000', text: '#ffffff', chrome: '#ff6a5c' });
    expect(d.surface).toBe('#0a0a0a');
    expect(d.surface2).toBe('#121212');
    expect(d.surface3).toBe('#1c1c1c');
    expect(d.hairline).toBe('rgba(255, 106, 92, 0.16)');
    expect(d.liveInk).toBe('#050405');
  });
  it('lets the stock palette keep its hand-tuned ramp', () => {
    const d = derive(DEFAULT_PALETTE.colors, DEFAULT_PALETTE.derived);
    expect(d.surface).toBe('#140b0c');
    expect(d.surface3).toBe('#2b1719');
    expect(derive(DEFAULT_PALETTE.colors).surface).not.toBe('#140b0c');
  });
  it('rains in chrome with hot streams toward the signal', () => {
    const r = rainColors(DEFAULT_PALETTE.colors);
    expect(r.stream).toBe('#ff6a5c');
    expect(r.head).not.toBe(r.stream);
    expect(r.hot).not.toBe(r.stream);
  });
});
