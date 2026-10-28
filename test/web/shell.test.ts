import { beforeEach, describe, expect, it } from 'vitest';
import { Rail, foldable } from '../../web/shell';

beforeEach(() => {
  document.body.replaceChildren();
});

const names = (r: Rail, g: string) => r.group(g)!.entries.map((e) => e.el.querySelector('.cd-entry-name')!.textContent);

describe('rail', () => {
  it('puts groups in their anchored zone', () => {
    const r = new Rail('left', [
      { id: 'spaces', entries: [{ id: 'view', label: 'View' }] },
      { id: 'modes', anchor: 'bottom', entries: [{ id: 'sec', label: 'Section' }] },
    ]);
    expect(r.el.dataset.side).toBe('left');
    expect(r.el.querySelector('[data-anchor="top"] [data-id="view"]')).not.toBeNull();
    expect(r.el.querySelector('[data-anchor="bottom"] [data-id="sec"]')).not.toBeNull();
    expect(r.entry('sec')?.spec.label).toBe('Section');
  });

  it('draws an entry as tile + label, with keys, state and pressed', () => {
    const r = new Rail('left', [{ id: 'g', entries: [{ id: 's', label: 'Section', keys: ['S'], state: 'Off', on: false, icon: '<svg viewBox="0 0 1 1"></svg>' }] }]);
    const b = r.entry('s')!.el;
    expect(b.querySelector('.cd-entry-tile svg')).not.toBeNull();
    expect(b.querySelector('.cd-entry-keys kbd')?.textContent).toBe('S');
    expect(b.querySelector('.cd-entry-state')?.textContent).toBe('Off');
    expect(b.getAttribute('aria-pressed')).toBe('false');
    r.entry('s')!.update({ on: true, state: 'Edit' });
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.querySelector('.cd-entry-state')?.textContent).toBe('Edit');
  });

  it('takes a short glyph for an icon', () => {
    const r = new Rail('right', [{ id: 'g', entries: [{ id: 'x', label: 'X', icon: 'T' }] }]);
    expect(r.entry('x')!.el.querySelector('.cd-glyph')?.textContent).toBe('T');
  });

  it('swaps a group\'s entries', async () => {
    const r = new Rail('left', [{ id: 'ctx', entries: [{ id: 'a', label: 'A' }] }]);
    document.body.append(r.el);
    await r.group('ctx')!.set([{ id: 'b', label: 'B' }, { id: 'c', label: 'C' }]);
    expect(names(r, 'ctx')).toEqual(['B', 'C']);
    expect(r.el.querySelector('[data-id="a"]')).toBeNull();
    expect(r.el.querySelectorAll('.cd-entry')).toHaveLength(2);
  });

  it('folds a group to tiles from its handle', () => {
    let told: boolean | null = null;
    const r = new Rail('left', [{ id: 'g', handle: true, onCompact: (c) => (told = c), entries: [{ id: 'a', label: 'A' }] }]);
    const h = r.el.querySelector<HTMLButtonElement>('.cd-handle')!;
    h.click();
    expect(r.group('g')!.compact).toBe(true);
    expect(told).toBe(true);
    h.click();
    expect(r.group('g')!.el.hasAttribute('data-compact')).toBe(false);
  });

  it('runs the host on select', () => {
    let hit = '';
    const r = new Rail('left', [{ id: 'g', entries: [{ id: 'a', label: 'A', onSelect: (e) => (hit = e.id) }] }]);
    r.entry('a')!.el.click();
    expect(hit).toBe('a');
  });

  it('opens a tray with fresh content and closes it', () => {
    let n = 0;
    const r = new Rail('left', [{ id: 'g', entries: [{ id: 'd', label: 'Display', tray: () => document.createTextNode(`tray ${++n}`) }] }]);
    document.body.append(r.el);
    const e = r.entry('d')!;
    expect(e.el.getAttribute('aria-haspopup')).toBe('dialog');
    e.el.click();
    expect(e.isOpen()).toBe(true);
    expect(e.el.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.cd-tray')?.textContent).toBe('tray 1');
    e.el.click();
    expect(e.isOpen()).toBe(false);
    e.el.click();
    expect(document.querySelector('.cd-tray')?.textContent).toBe('tray 2');
  });

  it('takes its tray with it when swapped out', async () => {
    const r = new Rail('left', [{ id: 'g', entries: [{ id: 'd', label: 'D', tray: () => document.createTextNode('x') }] }]);
    document.body.append(r.el);
    await r.group('g')!.set([], { animate: false });
    expect(document.querySelector('.cd-tray')).toBeNull();
  });
});

describe('panels', () => {
  it('fold on a click on the header, not on its controls', () => {
    const p = document.createElement('section');
    p.className = 'cd-panel';
    p.innerHTML = '<header class="cd-panel-head"><span class="cd-panel-title">Items</span><button>+</button></header><div class="cd-panel-body"></div>';
    document.body.append(p);
    let told: boolean | null = null;
    foldable(p, (c) => (told = c));
    p.querySelector('button')!.click();
    expect(p.hasAttribute('data-collapsed')).toBe(false);
    p.querySelector<HTMLElement>('.cd-panel-title')!.click();
    expect(p.hasAttribute('data-collapsed')).toBe(true);
    expect(told).toBe(true);
  });
});
