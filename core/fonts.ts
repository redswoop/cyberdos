/* The skin's type. Display for signs and titles, body for everything you
   read or type (typed text stays proportional — a wide mono on a phone
   reads badly), mono for code and HUD labels. */

export const FACES = {
  display: 'Orbitron',
  body: 'Chakra Petch',
  mono: 'Share Tech Mono',
} as const;

/** CSS font stacks (the tokens --display --body --mono --input) */
export const STACKS = {
  display: `"Orbitron", "Chakra Petch", system-ui, sans-serif`,
  body: `"Chakra Petch", -apple-system, system-ui, sans-serif`,
  mono: `"Share Tech Mono", ui-monospace, "SF Mono", Menlo, monospace`,
  input: `"Chakra Petch", -apple-system, system-ui, sans-serif`,
} as const;

/** one stylesheet link that loads every face the skin uses */
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap';

export type Weight = '400' | '500' | '600' | '700' | '900';
export type FontKind = 'display' | 'ui' | 'input' | 'mono';

/** Font-family names per kind and weight as React Native sees them once the
 *  @expo-google-fonts files are loaded (a custom face carries its weight in
 *  its name; a fontWeight on top makes Android synthesize). */
export const NATIVE_FACES: Record<FontKind, Record<Weight, string>> = {
  display: { '400': 'Orbitron_700Bold', '500': 'Orbitron_700Bold', '600': 'Orbitron_700Bold', '700': 'Orbitron_700Bold', '900': 'Orbitron_900Black' },
  ui: { '400': 'ChakraPetch_400Regular', '500': 'ChakraPetch_500Medium', '600': 'ChakraPetch_600SemiBold', '700': 'ChakraPetch_700Bold', '900': 'ChakraPetch_700Bold' },
  input: { '400': 'ChakraPetch_400Regular', '500': 'ChakraPetch_500Medium', '600': 'ChakraPetch_600SemiBold', '700': 'ChakraPetch_700Bold', '900': 'ChakraPetch_700Bold' },
  mono: { '400': 'ShareTechMono_400Regular', '500': 'ShareTechMono_400Regular', '600': 'ShareTechMono_400Regular', '700': 'ShareTechMono_400Regular', '900': 'ShareTechMono_400Regular' },
};

/** the @expo-google-fonts modules + file paths a native host bundles */
export const NATIVE_FONT_FILES: Record<string, string> = {
  Orbitron_700Bold: '@expo-google-fonts/orbitron/700Bold/Orbitron_700Bold.ttf',
  Orbitron_900Black: '@expo-google-fonts/orbitron/900Black/Orbitron_900Black.ttf',
  ChakraPetch_400Regular: '@expo-google-fonts/chakra-petch/400Regular/ChakraPetch_400Regular.ttf',
  ChakraPetch_500Medium: '@expo-google-fonts/chakra-petch/500Medium/ChakraPetch_500Medium.ttf',
  ChakraPetch_600SemiBold: '@expo-google-fonts/chakra-petch/600SemiBold/ChakraPetch_600SemiBold.ttf',
  ChakraPetch_700Bold: '@expo-google-fonts/chakra-petch/700Bold/ChakraPetch_700Bold.ttf',
  ShareTechMono_400Regular: '@expo-google-fonts/share-tech-mono/400Regular/ShareTechMono_400Regular.ttf',
};
