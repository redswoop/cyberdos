import { beforeEach, describe, expect, it } from 'vitest';
import { applyPalette, clearPalette, setSkin, skinOn, themeColor } from '../../web/skin';
import { PALETTES } from '../../core/palettes';
import { ROLES } from '../../core/roles';

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  delete document.documentElement.dataset.theme;
});

describe('skin switch', () => {
  it('is the data-theme attribute', () => {
    expect(skinOn()).toBe(false);
    setSkin(true);
    expect(document.documentElement.dataset.theme).toBe('cyber');
    expect(skinOn()).toBe(true);
    setSkin(false);
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
  it('leaves another theme alone when switching off', () => {
    document.documentElement.dataset.theme = 'other';
    setSkin(false);
    expect(document.documentElement.dataset.theme).toBe('other');
  });
});

describe('applyPalette', () => {
  it('writes every role inline and derives the surface ramp from bg', () => {
    const p = PALETTES.find((x) => x.id === 'kabuki')!;
    applyPalette(p.colors);
    const st = document.documentElement.style;
    for (const r of ROLES) expect(st.getPropertyValue(`--${r}`)).toBe(p.colors[r]);
    expect(st.getPropertyValue('--surface')).toContain(p.colors.bg);
    expect(st.getPropertyValue('--surface-3')).toContain('11%');
  });
  it('is a partial override: unnamed roles fall back to the stylesheet', () => {
    applyPalette({ chrome: '#123456' });
    const st = document.documentElement.style;
    expect(st.getPropertyValue('--chrome')).toBe('#123456');
    expect(st.getPropertyValue('--live')).toBe('');
    expect(st.getPropertyValue('--surface')).toBe('');
  });
  it('clears what it set, and nothing else', () => {
    document.documentElement.style.setProperty('--fs', '1.2');
    applyPalette(PALETTES[1].colors);
    clearPalette();
    const st = document.documentElement.style;
    for (const r of ROLES) expect(st.getPropertyValue(`--${r}`)).toBe('');
    expect(st.getPropertyValue('--surface')).toBe('');
    expect(st.getPropertyValue('--fs')).toBe('1.2');
  });
  it('names a theme-color for the browser chrome', () => {
    expect(themeColor({ bg: '#010203' })).toBe('#010203');
    expect(themeColor()).toBe(PALETTES[0].colors.bg);
  });
});
