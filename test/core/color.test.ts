import { describe, expect, it } from 'vitest';
import { alpha, contrast, hue, isHex, luma, mix, rgb } from '../../core/color';

describe('colour math', () => {
  it('parses and mixes', () => {
    expect(rgb('#ff0080')).toEqual([255, 0, 128]);
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mix('#ff6a5c', '#ffffff', 0)).toBe('#ff6a5c');
    expect(mix('#ff6a5c', '#ffffff', 1)).toBe('#ffffff');
  });
  it('writes rgba', () => {
    expect(alpha('#ff6a5c', 0.16)).toBe('rgba(255, 106, 92, 0.16)');
  });
  it('knows light from dark', () => {
    expect(luma('#ffffff')).toBeCloseTo(1);
    expect(luma('#000000')).toBe(0);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });
  it('reads a hue', () => {
    expect(hue('#ff0000')).toBe(0);
    expect(hue('#00ff00')).toBe(120);
    expect(hue('#0000ff')).toBe(240);
    expect(hue('#808080')).toBe(0);
  });
  it('validates hex', () => {
    expect(isHex('#ff6a5c')).toBe(true);
    expect(isHex('#FF6A5C')).toBe(true);
    expect(isHex('#fff')).toBe(false);
    expect(isHex('red')).toBe(false);
    expect(isHex(null)).toBe(false);
  });
});
