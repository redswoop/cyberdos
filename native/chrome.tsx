/* The light and chrome the CSS gives the web for free: grid + haze behind a
   screen, scanlines + vignette over it, HUD corner brackets, hazard tape and
   neon rails. The tiles are white masks (assets/make-tiles.py), tinted with
   the live palette. Decoration only: nothing here takes a touch. */
import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { Bloom, DigitalRain, Vignette } from './skia';
import { alpha, useCyber } from './provider';

const TILE = {
  scan: require('./assets/scanlines.png'),
  grid: require('./assets/grid.png'),
  stripes: require('./assets/stripes.png'),
};

/** behind a screen: the void, a faint grid, digital rain, the chrome bloom */
export function CyberBackdrop({ rain = true }: { rain?: boolean }) {
  const t = useCyber();
  if (!t.on) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg }]}>
      <Image source={TILE.grid} resizeMode="repeat" style={[StyleSheet.absoluteFill, { tintColor: t.colors.chrome, opacity: 0.045 }]} />
      {rain && <DigitalRain />}
      <Bloom />
    </View>
  );
}

/** A screen's root: opaque in the void with the backdrop inside. The host
 *  says whether the screen is focused so a stack of screens costs one rain. */
export function CyberScreen({ children, focused = true, style }: { children: ReactNode; focused?: boolean; style?: ViewStyle }) {
  const t = useCyber();
  return (
    <View style={[{ flex: 1, backgroundColor: t.colors.bg }, style]}>
      {t.on && <CyberBackdrop rain={focused} />}
      {children}
    </View>
  );
}

/** over everything: CRT scanlines and a vignette; never eats a tap */
export function CyberOverlay() {
  const t = useCyber();
  if (!t.on) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={TILE.scan} resizeMode="repeat" style={[StyleSheet.absoluteFill, { opacity: 0.13 }]} />
      <Vignette />
    </View>
  );
}

const L = 16;
const W = 2;
/** HUD corner brackets on a framed surface (the parent is the frame) */
export function Brackets({ color, inset = 0 }: { color?: string; inset?: number }) {
  const t = useCyber();
  if (!t.on) return null;
  const c = color ?? t.colors.chrome;
  const glow = t.boxGlow(c, 6, 0.8);
  const base: ViewStyle = { position: 'absolute', backgroundColor: c, ...glow };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[base, { top: inset, left: inset, width: L, height: W }]} />
      <View style={[base, { top: inset, left: inset, width: W, height: L }]} />
      <View style={[base, { bottom: inset, right: inset, width: L, height: W }]} />
      <View style={[base, { bottom: inset, right: inset, width: W, height: L }]} />
    </View>
  );
}

/** diagonal hazard stripes; `height` sets the band, colour defaults to alarm */
export function HazardTape({ height = 7, color, opacity = 1, style }: { height?: number; color?: string; opacity?: number; style?: ViewStyle }) {
  const t = useCyber();
  if (!t.on) return null;
  return (
    <View pointerEvents="none" style={[{ height, overflow: 'hidden', backgroundColor: '#000' }, style]}>
      <Image source={TILE.stripes} resizeMode="repeat" style={[StyleSheet.absoluteFill, { tintColor: color ?? t.colors.alarm, opacity }]} />
    </View>
  );
}

/** the glowing hairline under a header / above a composer */
export function NeonRail({ color, style }: { color?: string; style?: ViewStyle }) {
  const t = useCyber();
  if (!t.on) return null;
  const c = color ?? t.colors.chrome;
  return <View pointerEvents="none" style={[{ height: 2, backgroundColor: alpha(c, 0.7), ...t.boxGlow(c, 12, 0.6) }, style]} />;
}

/** a translucent stripe overlay for hazard-tinted banners */
export function StripeFill({ color, opacity = 0.14 }: { color?: string; opacity?: number }) {
  const t = useCyber();
  if (!t.on) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={TILE.stripes} resizeMode="repeat" style={[StyleSheet.absoluteFill, { tintColor: color ?? t.colors.alarm, opacity }]} />
    </View>
  );
}
