/* The shell's moving parts (layout is shell.css): rails of labelled entries
   whose groups swap with context, trays that open beside an entry, panels
   that fold to their header, and slots resized by a grip. Plain DOM, so a
   vanilla host calls it and a React host wraps it. The host owns state and
   shortcuts; the shell only shows them (an entry's keys, state, on). */

export type Side = 'left' | 'right';
export type Anchor = 'top' | 'middle' | 'bottom';

export interface EntrySpec {
  id: string;
  label: string;
  /** svg markup, a node, or a short glyph */
  icon?: string | Node;
  /** shortcut chips, e.g. ['⌘', 'F'] */
  keys?: string[];
  /** the subtitle under the label: 'Off', 'Shaded', '12.5 mm' */
  state?: string;
  /** pressed look: a mode or toggle that is on */
  on?: boolean;
  /** corner mark: the entry opens something */
  more?: boolean;
  title?: string;
  /** opens a tray beside the entry holding what this returns */
  tray?: () => Node;
  onSelect?: (entry: Entry, ev: MouseEvent) => void;
}

export interface GroupSpec {
  id: string;
  anchor?: Anchor;
  entries?: EntrySpec[];
  /** labels folded away, bare tiles */
  compact?: boolean;
  /** a fold handle under the group */
  handle?: boolean;
  onCompact?: (compact: boolean) => void;
}

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function iconNode(icon: string | Node | undefined): Node | null {
  if (icon == null || icon === '') return null;
  if (typeof icon !== 'string') return icon.cloneNode(true);
  if (icon.trimStart().startsWith('<svg')) {
    const t = document.createElement('template');
    t.innerHTML = icon.trim();
    return t.content.firstElementChild;
  }
  return el('span', 'cd-glyph', icon);
}

/* ---------------- entries ---------------- */

export class Entry {
  readonly el: HTMLButtonElement;
  private tray: HTMLElement | null = null;

  constructor(public spec: EntrySpec, readonly side: Side = 'left') {
    this.el = el('button', 'cd-entry');
    this.el.type = 'button';
    this.el.dataset.id = spec.id;
    this.el.addEventListener('click', (ev) => this.click(ev));
    this.render();
  }

  get id() {
    return this.spec.id;
  }

  /** change any part of the spec and redraw */
  update(patch: Partial<EntrySpec>) {
    this.spec = { ...this.spec, ...patch };
    this.render();
  }

  set state(v: string | undefined) {
    this.update({ state: v });
  }

  set on(v: boolean) {
    this.update({ on: v });
  }

  private render() {
    const s = this.spec;
    const tile = el('span', 'cd-entry-tile');
    const icon = iconNode(s.icon);
    if (icon) tile.append(icon);
    if (s.more || s.tray) tile.dataset.more = '';
    const head = el('span', 'cd-entry-head');
    head.append(el('span', 'cd-entry-name', s.label));
    if (s.keys?.length) {
      const keys = el('span', 'cd-entry-keys');
      for (const k of s.keys) keys.append(el('kbd', undefined, k));
      head.append(keys);
    }
    const label = el('span', 'cd-entry-label');
    label.append(head);
    if (s.state) label.append(el('span', 'cd-entry-state', s.state));
    this.el.replaceChildren(tile, label);
    this.el.title = s.title ?? '';
    if (s.on != null) this.el.setAttribute('aria-pressed', String(s.on));
    else this.el.removeAttribute('aria-pressed');
    if (s.tray) {
      this.ensureTray();
      this.el.setAttribute('aria-haspopup', 'dialog');
      this.el.setAttribute('aria-expanded', String(this.isOpen()));
    } else {
      this.el.removeAttribute('aria-haspopup');
      this.el.removeAttribute('aria-expanded');
    }
  }

  private click(ev: MouseEvent) {
    // with the popover API the button is the tray's invoker and the browser toggles it
    if (this.spec.tray && !popovers()) this.toggleTray();
    this.spec.onSelect?.(this, ev);
  }

  /* ---- the tray: a popover beside the entry, its content built as it opens ---- */

  isOpen() {
    return !!this.tray && (this.tray.dataset.open != null || safeMatches(this.tray, ':popover-open'));
  }

  toggleTray(open = !this.isOpen()) {
    if (!this.spec.tray || open === this.isOpen()) return;
    const t = this.ensureTray();
    if (popovers()) return open ? t.showPopover() : t.hidePopover();
    if (open) {
      this.fill(t);
      t.dataset.open = '';
      placeTray(t, this.el, this.side);
    } else delete t.dataset.open;
    this.el.setAttribute('aria-expanded', String(open));
  }

  closeTray() {
    this.toggleTray(false);
  }

  private ensureTray() {
    if (this.tray) return this.tray;
    const t = (this.tray = el('div', 'cd-tray'));
    t.setAttribute('popover', 'auto');
    t.setAttribute('role', 'dialog');
    t.setAttribute('aria-label', this.spec.label);
    t.addEventListener('beforetoggle', (e) => {
      if ((e as ToggleEvent).newState === 'open') this.fill(t);
    });
    t.addEventListener('toggle', (e) => {
      const open = (e as ToggleEvent).newState === 'open';
      if (open) placeTray(t, this.el, this.side);
      this.el.setAttribute('aria-expanded', String(open));
    });
    document.body.append(t);
    if (popovers()) this.el.popoverTargetElement = t;
    return t;
  }

  private fill(t: HTMLElement) {
    if (this.spec.tray) t.replaceChildren(this.spec.tray());
  }

  destroy() {
    this.closeTray();
    this.tray?.remove();
    this.el.remove();
  }
}

const popovers = () => typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

function safeMatches(e: Element, sel: string) {
  try {
    return e.matches(sel);
  } catch {
    return false; // no :popover-open in this engine
  }
}

/** put a tray beside its entry, on the stage side, kept on screen */
export function placeTray(tray: HTMLElement, by: HTMLElement, side: Side, gap = 8) {
  const r = by.getBoundingClientRect();
  const w = tray.offsetWidth;
  const h = tray.offsetHeight;
  const x = side === 'left' ? r.right + gap : r.left - gap - w;
  const y = Math.max(gap, Math.min(r.top, innerHeight - h - gap));
  tray.style.left = `${Math.max(gap, Math.min(x, innerWidth - w - gap))}px`;
  tray.style.top = `${y}px`;
}

/* ---------------- groups and rails ---------------- */

export class Group {
  readonly el: HTMLElement;
  readonly handle: HTMLButtonElement | null = null;
  entries: Entry[] = [];

  constructor(public spec: GroupSpec, readonly side: Side = 'left') {
    this.el = el('div', 'cd-group');
    this.el.dataset.id = spec.id;
    this.el.setAttribute('role', 'group');
    if (spec.handle) {
      this.handle = el('button', 'cd-handle');
      this.handle.type = 'button';
      this.handle.addEventListener('click', () => {
        this.compact = !this.compact;
        this.spec.onCompact?.(this.compact);
      });
    }
    this.compact = !!spec.compact;
    this.set(spec.entries ?? [], { animate: false });
  }

  get compact() {
    return this.el.dataset.compact != null;
  }

  set compact(v: boolean) {
    if (v) this.el.dataset.compact = '';
    else delete this.el.dataset.compact;
    if (this.handle) {
      this.handle.title = v ? 'show labels' : 'fold labels';
      this.handle.setAttribute('aria-expanded', String(!v));
    }
  }

  /** replace the entries. With animate (the default) the old ones fall back
   *  and the new ones slide out of the tray one after another. */
  set(specs: EntrySpec[], { animate = true } = {}): Promise<void> {
    const old = this.entries;
    this.entries = specs.map((s) => new Entry(s, this.side));
    const mount = () => {
      for (const e of old) e.destroy();
      this.entries.forEach((e, i) => {
        if (animate) {
          e.el.style.setProperty('--i', String(i));
          e.el.classList.add('cd-in');
          e.el.addEventListener('animationend', () => e.el.classList.remove('cd-in'), { once: true });
        }
        this.el.append(e.el);
      });
    };
    if (!animate || reduced() || !old.length) {
      mount();
      return Promise.resolve();
    }
    this.el.classList.add('cd-swapping');
    for (const e of old) e.el.classList.add('cd-out');
    return new Promise((done) =>
      setTimeout(() => {
        mount();
        setTimeout(() => this.el.classList.remove('cd-swapping'), 500);
        done();
      }, 110),
    );
  }

  entry(id: string) {
    return this.entries.find((e) => e.id === id);
  }
}

export class Rail {
  readonly el: HTMLElement;
  private zones: Record<Anchor, HTMLElement>;
  private groups = new Map<string, Group>();

  constructor(readonly side: Side, groups: GroupSpec[] = []) {
    this.el = el('nav', 'cd-toolrail');
    this.el.dataset.side = side;
    this.zones = { top: el('div', 'cd-zone'), middle: el('div', 'cd-zone'), bottom: el('div', 'cd-zone') };
    for (const [a, z] of Object.entries(this.zones)) {
      z.dataset.anchor = a;
      this.el.append(z);
    }
    for (const g of groups) this.add(g);
  }

  add(spec: GroupSpec): Group {
    const g = new Group(spec, this.side);
    const zone = this.zones[spec.anchor ?? 'top'];
    // a group and its handle stay together
    const wrap = el('div');
    wrap.style.display = 'contents';
    wrap.append(g.el);
    if (g.handle) wrap.append(g.handle);
    zone.append(wrap);
    this.groups.set(spec.id, g);
    return g;
  }

  group(id: string) {
    return this.groups.get(id);
  }

  /** an entry anywhere on the rail */
  entry(id: string) {
    for (const g of this.groups.values()) {
      const e = g.entry(id);
      if (e) return e;
    }
    return undefined;
  }
}

/* ---------------- panels and slots ---------------- */

/** fold a .cd-panel to its header on a click on the header's bare space */
export function foldable(panel: HTMLElement, onChange?: (collapsed: boolean) => void) {
  const head = panel.querySelector<HTMLElement>(':scope > .cd-panel-head');
  if (!head) return;
  head.addEventListener('click', (ev) => {
    if ((ev.target as Element).closest('button, input, select, textarea, a, label')) return;
    const c = panel.toggleAttribute('data-collapsed');
    head.setAttribute('aria-expanded', String(!c));
    onChange?.(c);
  });
  head.setAttribute('aria-expanded', String(!panel.hasAttribute('data-collapsed')));
}

/** a grip on a .cd-slot's inner edge that sets its width (--cd-slot-w) */
export function resizable(slot: HTMLElement, { min = 200, max = 560, onChange }: { min?: number; max?: number; onChange?: (w: number) => void } = {}) {
  const grip = el('div', 'cd-grip');
  grip.setAttribute('role', 'separator');
  grip.setAttribute('aria-orientation', 'vertical');
  slot.append(grip);
  const right = slot.dataset.side === 'right';
  grip.addEventListener('pointerdown', (down) => {
    down.preventDefault();
    grip.setPointerCapture(down.pointerId);
    const x0 = down.clientX;
    const w0 = slot.getBoundingClientRect().width;
    const move = (ev: PointerEvent) => {
      const w = Math.round(Math.max(min, Math.min(max, w0 + (right ? x0 - ev.clientX : ev.clientX - x0))));
      slot.style.setProperty('--cd-slot-w', `${w}px`);
      onChange?.(w);
    };
    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
  });
  return grip;
}
