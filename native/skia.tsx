/* The Skia layer: the chrome bloom, a vignette, chamfered plates, and digital
   rain behind every screen. A GPU canvas, so it stays cheap: one draw per
   frame, no React re-renders. Loaded lazily — the module is native, and a dev
   client built without it must still boot (every piece then renders nothing). */
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useDerivedValue, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { useCyber } from './provider';

type SkiaMod = typeof import('@shopify/react-native-skia');
let skia: SkiaMod | null | undefined;
function loadSkia(): SkiaMod | null {
  if (skia !== undefined) return skia;
  try {
    skia = require('@shopify/react-native-skia') as SkiaMod;
  } catch {
    skia = null;
  }
  return skia;
}

function useSkia<P>(on: boolean, make: (mod: SkiaMod) => ComponentType<P>): ComponentType<P> | null {
  const [Comp, setComp] = useState<ComponentType<P> | null>(null);
  useEffect(() => {
    if (!on) return;
    const mod = loadSkia();
    if (mod) setComp(() => make(mod));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);
  return Comp;
}

/** the chrome bloom at the top of a screen (the web body gradient) */
export function Bloom() {
  const t = useCyber();
  const { width } = useWindowDimensions();
  const Comp = useSkia(t.on, makeBloom);
  if (!t.on || !Comp) return null;
  return <Comp width={width} color={t.colors.chrome} />;
}

function makeBloom(mod: SkiaMod): ComponentType<{ width: number; color: string }> {
  const { Canvas, Rect, RadialGradient, vec } = mod;
  return function SkBloom({ width, color }) {
    const h = 360;
    return (
      <Canvas style={{ position: 'absolute', left: 0, top: -120, width, height: h }} pointerEvents="none">
        <Rect x={0} y={0} width={width} height={h}>
          <RadialGradient c={vec(width / 2, 60)} r={width * 0.75} colors={[color + '55', color + '22', color + '00']} />
        </Rect>
      </Canvas>
    );
  };
}

export function Vignette() {
  const t = useCyber();
  const { width, height } = useWindowDimensions();
  const Comp = useSkia(t.on, makeVignette);
  if (!t.on || !Comp) return null;
  return <Comp width={width} height={height} />;
}

function makeVignette(mod: SkiaMod): ComponentType<{ width: number; height: number }> {
  const { Canvas, Rect, RadialGradient, vec } = mod;
  return function SkVignette({ width, height }) {
    return (
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient c={vec(width / 2, height / 2)} r={Math.max(width, height) * 0.72} colors={['#00000000', '#00000000', '#000000a0']} positions={[0, 0.55, 1]} />
        </Rect>
      </Canvas>
    );
  };
}

/** A chamfered plate behind a control: the web `clip-path` grammar as a
 *  Skia path, filled and edge-lit. Absolute-filled, so the caller's padding
 *  sets the size and the caller keeps its own background transparent. */
export function ChamferPlate({ fill, stroke, cut = 10, glow = 0 }: { fill: string; stroke?: string; cut?: number; glow?: number }) {
  const t = useCyber();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const Comp = useSkia(t.on, makePlate);
  if (!t.on) return null;
  // the canvas overhangs the box by the glow radius so the outer light isn't clipped
  const pad = glow > 0 ? glow + 4 : 0;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {Comp && size.w > 0 && (
        <View style={{ position: 'absolute', left: -pad, top: -pad, width: size.w + pad * 2, height: size.h + pad * 2 }}>
          <Comp w={size.w} h={size.h} pad={pad} fill={fill} stroke={stroke} cut={cut} glow={glow} />
        </View>
      )}
    </View>
  );
}

interface PlateProps {
  w: number;
  h: number;
  pad: number;
  fill: string;
  stroke?: string;
  cut: number;
  glow: number;
}

function makePlate(mod: SkiaMod): ComponentType<PlateProps> {
  const { Canvas, Path, Shadow } = mod;
  return function SkPlate({ w, h, pad, fill, stroke, cut, glow }: PlateProps) {
    const c = Math.min(cut, w / 3, h / 3);
    const o = pad + 0.5; // inset half a point so the stroke isn't clipped
    const path = useMemo(
      () => `M${o} ${o} L${o + w - c - 1} ${o} L${o + w - 1} ${o + c} L${o + w - 1} ${o + h - 1} L${o + c} ${o + h - 1} L${o} ${o + h - c - 1} Z`,
      [w, h, c, o],
    );
    return (
      <Canvas style={{ width: w + pad * 2, height: h + pad * 2 }} pointerEvents="none">
        <Path path={path} color={fill}>
          {glow > 0 && <Shadow dx={0} dy={0} blur={glow} color={fill + '99'} />}
        </Path>
        {!!stroke && <Path path={path} color={stroke} style="stroke" strokeWidth={1} />}
      </Canvas>
    );
  };
}

const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEF<>/\\|=+*#%&';
const CELL = 14;
/** rain steps per second: a JS timer ticks a shared value so the canvas
 *  redraws 8×/s instead of every frame — rain is stepwise anyway */
const RAIN_FPS = 8;
const COLS_MAX = 22;

interface Column {
  x: number;
  head: number;
  speed: number;
  len: number;
  phase: number;
}

/** Matrix-style rain in the chrome colour, dim enough to read over. */
export function DigitalRain({ opacity = 0.16 }: { opacity?: number }) {
  const t = useCyber();
  const { width, height } = useWindowDimensions();
  const Rain = useSkia(t.on, makeRain);
  if (!t.on || !Rain) return null;
  return <Rain width={width} height={height} color={t.colors.chrome} dim={t.colors.live} opacity={opacity} />;
}

interface RainProps {
  width: number;
  height: number;
  color: string;
  dim: string;
  opacity: number;
}

function makeRain(mod: SkiaMod): ComponentType<RainProps> {
  const { Canvas, Group, Text: SkText, matchFont } = mod;
  return function Rain({ width, height, color, dim, opacity }: RainProps) {
    const font = useMemo(() => matchFont({ fontFamily: 'Menlo', fontSize: 11 }), []);
    const rows = Math.ceil(height / CELL) + 2;
    const columns = useMemo<Column[]>(() => {
      const n = Math.min(COLS_MAX, Math.floor(width / (CELL * 1.6)));
      const gap = width / n;
      return Array.from({ length: n }, (_, i) => ({
        x: i * gap + gap / 2 - 4,
        head: Math.random() * rows,
        speed: 3 + Math.random() * 6,
        len: 5 + Math.floor(Math.random() * 8),
        phase: Math.floor(Math.random() * 1000),
      }));
    }, [width, rows]);
    const tick = useSharedValue(0);
    useEffect(() => {
      const id = setInterval(() => {
        tick.value = tick.value + 1;
      }, 1000 / RAIN_FPS);
      return () => clearInterval(id);
    }, [tick]);
    const heads = useDerivedValue(() => {
      const s = tick.value / RAIN_FPS;
      return columns.map((c) => Math.floor(c.head + s * c.speed) % (rows + c.len));
    });
    return (
      <Canvas style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
        <Group>
          {columns.map((c, ci) =>
            Array.from({ length: c.len }, (_, k) => (
              <RainGlyph key={`${ci}:${k}`} col={c} ci={ci} k={k} heads={heads} font={font} color={k === 0 ? '#ffffff' : k < 3 ? color : dim} rows={rows} />
            )),
          )}
        </Group>
      </Canvas>
    );
  };

  function RainGlyph({ col, ci, k, heads, font, color, rows }: { col: Column; ci: number; k: number; heads: SharedValue<number[]>; font: ReturnType<typeof matchFont>; color: string; rows: number }) {
    const y = useDerivedValue(() => {
      const row = heads.value[ci] - k;
      return row < 0 || row > rows ? -100 : row * CELL;
    });
    const text = useDerivedValue(() => {
      const row = Math.floor(heads.value[ci] - k);
      return GLYPHS[Math.abs(row * 31 + col.phase + k * 7) % GLYPHS.length];
    });
    const a = Math.max(0.08, 1 - k / col.len);
    return <SkText x={col.x} y={y} text={text} font={font} color={color} opacity={a} />;
  }
}
