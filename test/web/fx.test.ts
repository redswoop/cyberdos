import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bootLog, scramble, setRainColors, startCyberFx, stopCyberFx } from '../../web/fx';

let reduce = false;
beforeEach(() => {
  document.body.innerHTML = '';
  reduce = false;
  vi.stubGlobal('matchMedia', () => ({ matches: reduce }));
  // jsdom has no rAF/canvas: drive frames by hand
  let t = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb((t += 16)), 0) as unknown as number);
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  vi.useFakeTimers();
});
afterEach(() => {
  stopCyberFx();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('scramble', () => {
  it('decodes to the original text', async () => {
    const el = document.createElement('h1');
    el.textContent = 'NIGHT CITY';
    document.body.appendChild(el);
    scramble(el, 100);
    await vi.advanceTimersByTimeAsync(10);
    // mid-flight it may be noise, but never a different length
    expect(el.textContent!.length).toBe('NIGHT CITY'.length);
    await vi.advanceTimersByTimeAsync(400);
    expect(el.textContent).toBe('NIGHT CITY');
  });
  it('stands down when the framework rewrites the node', async () => {
    const el = document.createElement('h1');
    el.textContent = 'ONE';
    document.body.appendChild(el);
    scramble(el, 200);
    await vi.advanceTimersByTimeAsync(20);
    el.firstChild!.textContent = 'TWO';
    await vi.advanceTimersByTimeAsync(500);
    expect(el.textContent).toBe('TWO');
  });
  it('leaves long and empty text alone', () => {
    const el = document.createElement('p');
    el.textContent = 'x'.repeat(200);
    scramble(el, 100);
    expect(el.textContent).toBe('x'.repeat(200));
  });
});

describe('startCyberFx', () => {
  it('scrambles the selectors a host names, as they mount', async () => {
    startCyberFx({ scramble: '.title', rain: false });
    const el = document.createElement('div');
    el.className = 'title';
    el.textContent = 'HELLO';
    document.body.appendChild(el);
    await vi.advanceTimersByTimeAsync(50); // the MutationObserver microtask, then a frame or two
    expect(el.textContent).not.toBe('HELLO');
    await vi.advanceTimersByTimeAsync(2000);
    expect(el.textContent).toBe('HELLO');
  });
  it('does nothing under reduced motion', async () => {
    reduce = true;
    startCyberFx({ scramble: '.title' });
    const el = document.createElement('div');
    el.className = 'title';
    el.textContent = 'STILL';
    document.body.appendChild(el);
    await vi.advanceTimersByTimeAsync(50);
    expect(el.textContent).toBe('STILL');
    expect(document.querySelector('.cy-rain')).toBeNull();
  });
  it('is harmless without a 2d canvas and tears down clean', () => {
    startCyberFx({ scramble: '', rain: true }); // jsdom: getContext returns null → no rain
    expect(document.querySelector('.cy-rain')).toBeNull();
    stopCyberFx();
    expect(() => stopCyberFx()).not.toThrow();
    expect(() => setRainColors({ stream: '#000000', head: '#ffffff', hot: '#ff0000', hotHead: '#ffffff' })).not.toThrow();
  });
});

describe('bootLog', () => {
  it('types the branded lines on, then removes itself', async () => {
    const el = bootLog({ title: 'HERDR//OS', host: 'stormer.tailnet', steps: ['> waking the herd'], last: 'WELCOME' })!;
    expect(el.className).toBe('cy-boot');
    await vi.advanceTimersByTimeAsync(170 * 4 + 50);
    const lines = [...el.querySelectorAll('pre div')];
    expect(lines).toHaveLength(4);
    expect(lines.at(-1)!.className).toBe('last');
    await vi.advanceTimersByTimeAsync(2000);
    expect(lines[0].textContent).toBe('HERDR//OS');
    expect(lines.at(-1)!.textContent).toBe('WELCOME');
    expect(document.querySelector('.cy-boot')).toBeNull();
  });
  it('plays the short form on a toggle, and skips on tap', async () => {
    const el = bootLog({ short: true })!;
    await vi.advanceTimersByTimeAsync(130 * 3 + 10);
    expect(el.querySelectorAll('pre div')).toHaveLength(3);
    el.dispatchEvent(new Event('pointerdown'));
    expect(el.classList.contains('out')).toBe(true);
  });
  it('is silent under reduced motion', () => {
    reduce = true;
    expect(bootLog()).toBeUndefined();
    expect(document.querySelector('.cy-boot')).toBeNull();
  });
});
