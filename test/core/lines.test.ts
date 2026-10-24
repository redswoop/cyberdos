import { describe, expect, it } from 'vitest';
import { BOOT_DEFAULTS, SHORT_BOOT, bootLines, hostLabel } from '../../core/lines';

describe('boot log lines', () => {
  it('labels hosts the HUD way', () => {
    expect(hostLabel('stormer.tail93d23c.ts.net')).toBe('stormer.tailnet');
    expect(hostLabel('100.64.0.1')).toBe('100.64.0.1');
    expect(hostLabel('')).toBe('localhost');
    expect(hostLabel(undefined)).toBe('localhost');
  });
  it('brands through options', () => {
    const l = bootLines({ title: 'HERDR//OS', host: 'stormer.tailnet', steps: ['> waking the herd ... 🐑'], last: 'WELCOME BACK' });
    expect(l).toEqual(['HERDR//OS', '> handshake stormer.tailnet .... OK', '> waking the herd ... 🐑', 'WELCOME BACK']);
  });
  it('has sane defaults and a short form', () => {
    expect(bootLines()[0]).toBe(BOOT_DEFAULTS.title);
    expect(bootLines().at(-1)).toBe(BOOT_DEFAULTS.last);
    expect(SHORT_BOOT).toHaveLength(3);
  });
});
