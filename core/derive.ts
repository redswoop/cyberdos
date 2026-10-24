/* Everything a palette does not have to name. One rule, both expressions:
   the surface ramp is the background lifted toward the text in three steps,
   the hairline is the chrome at 16%, ink on a live-filled control is near
   black (the live colours are all bright). */
import { alpha, mix } from './color';
import type { RoleColors } from './roles';

export interface Derived {
  surface: string;
  surface2: string;
  surface3: string;
  hairline: string;
  liveInk: string;
}

export const SURFACE_STEPS = [0.04, 0.07, 0.11] as const;
export const HAIRLINE_ALPHA = 0.16;
export const LIVE_INK = '#050405';

/** `tuned` wins over the rule (a palette's hand-tuned ramp) */
export function derive(c: Pick<RoleColors, 'bg' | 'text' | 'chrome'>, tuned: Partial<Derived> = {}): Derived {
  return {
    surface: mix(c.bg, c.text, SURFACE_STEPS[0]),
    surface2: mix(c.bg, c.text, SURFACE_STEPS[1]),
    surface3: mix(c.bg, c.text, SURFACE_STEPS[2]),
    hairline: alpha(c.chrome, HAIRLINE_ALPHA),
    liveInk: LIVE_INK,
    ...tuned,
  };
}

/** The rain's four colours from a palette: streams in chrome, rare hot
 *  streams leaning toward the signal colour, heads washed toward white. */
export function rainColors(c: Pick<RoleColors, 'chrome' | 'signal'>) {
  const hot = mix(c.chrome, c.signal, 0.5);
  return { stream: c.chrome, head: mix(c.chrome, '#ffffff', 0.75), hot, hotHead: mix(hot, '#ffffff', 0.7) };
}
