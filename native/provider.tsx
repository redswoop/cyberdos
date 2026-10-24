/* The React Native expression's context: whether the skin is on, the
   resolved role colours, and the three style helpers every piece uses.
   A host builds CyberTokens from its own theme state and hands them down. */
import { createContext, createElement, useContext, type ReactNode } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { alpha } from '../core/color';
import { derive, type Derived } from '../core/derive';
import { NATIVE_FACES, type FontKind, type Weight } from '../core/fonts';
import { DEFAULT_PALETTE } from '../core/palettes';
import type { RoleColors } from '../core/roles';

export interface CyberTokens {
  /** the skin is showing (every piece renders nothing or its plain form when off) */
  on: boolean;
  colors: RoleColors & Derived;
  /** family (+ weight folded into the name) for a kind of text */
  font: (kind: FontKind, weight?: Weight) => TextStyle;
  /** neon text: a halo in the given colour */
  glow: (color: string, radius?: number) => TextStyle;
  /** neon box: a soft outer light */
  boxGlow: (color: string, radius?: number, strength?: number) => ViewStyle;
  /** faint halo on reading text */
  phosphor: TextStyle;
}

/** resolve a (partial) palette into tokens; `on=false` gives inert helpers.
 *  `tuned` is a palette's hand-tuned ramp (DEFAULT_PALETTE.derived) — pass it
 *  only when that palette's bg is what is showing. */
export function buildCyberTokens(palette: Partial<RoleColors> = {}, on = true, tuned: Partial<Derived> = {}): CyberTokens {
  const c: RoleColors = { ...DEFAULT_PALETTE.colors, ...palette };
  const colors = { ...c, ...derive(c, tuned) };
  return {
    on,
    colors,
    font: (kind, weight = '400') => (on ? { fontFamily: NATIVE_FACES[kind][weight] } : { fontWeight: weight }),
    glow: (color, radius = 10) =>
      on ? { textShadowColor: color, textShadowRadius: radius, textShadowOffset: { width: 0, height: 0 } } : {},
    boxGlow: (color, radius = 12, strength = 0.55) => (on ? { boxShadow: `0 0 ${radius}px ${alpha(color, strength)}` } : {}),
    phosphor: on
      ? { textShadowColor: alpha(colors.chrome, 0.22), textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } }
      : {},
  };
}

export const OFF_TOKENS = buildCyberTokens({}, false);

const Ctx = createContext<CyberTokens>(OFF_TOKENS);

export function CyberProvider({ tokens, children }: { tokens: CyberTokens; children: ReactNode }) {
  return createElement(Ctx.Provider, { value: tokens }, children);
}

export function useCyber(): CyberTokens {
  return useContext(Ctx);
}

export { alpha };
