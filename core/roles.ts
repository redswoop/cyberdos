/* The vocabulary of the skin: ten colour roles every palette fills and every
   expression (CSS tokens, native tokens) reads. Apps map their own semantics
   onto these — an agent that is "blocked" paints with `alarm`, a chat app's
   unread badge paints with `signal` — so the skin never learns the app. */

export const ROLES = ['chrome', 'live', 'signal', 'alarm', 'active', 'ok', 'muted', 'text', 'sub', 'bg'] as const;
export type Role = (typeof ROLES)[number];
export type RoleColors = Record<Role, string>;

/** what each role is for, in the order a settings panel should list them */
export const ROLE_INFO: { key: Role; label: string; hint: string }[] = [
  { key: 'chrome', label: 'Chrome', hint: 'the dominant neon: titles, rails, brackets, your own voice' },
  { key: 'live', label: 'Live', hint: 'interactive and selected: links, focus, the thing that is on' },
  { key: 'signal', label: 'Signal', hint: 'the one primary action' },
  { key: 'alarm', label: 'Alarm', hint: 'needs a human' },
  { key: 'active', label: 'Active', hint: 'in progress' },
  { key: 'ok', label: 'OK', hint: 'finished, quiet' },
  { key: 'muted', label: 'Muted', hint: 'present but uninteresting' },
  { key: 'text', label: 'Text', hint: 'reading text' },
  { key: 'sub', label: 'Muted text', hint: 'secondary text' },
  { key: 'bg', label: 'Background', hint: 'the void; surfaces derive from it' },
];

/** The three hue roles a palette may use freely; everything else is a
 *  status tint or neutral. "One chrome, one live, one signal — no rainbow." */
export const HUE_ROLES: Role[] = ['chrome', 'live', 'signal'];

/** Keys the roles had before they were named for the design language
 *  (herdr-web's agent statuses). Stored prefs may still carry them. */
export const LEGACY_ROLE_KEYS: Record<string, Role> = {
  red: 'chrome',
  accent: 'live',
  hot: 'signal',
  blocked: 'alarm',
  working: 'active',
  done: 'ok',
  idle: 'muted',
  text: 'text',
  sub: 'sub',
  bg: 'bg',
};

export const isRole = (k: string): k is Role => (ROLES as readonly string[]).includes(k);

/** Rename legacy keys; unknown keys are dropped, current keys pass through.
 *  A legacy key never overrides a current one already present. */
export function migrateRoleKeys(colors: Record<string, string> | undefined | null): Partial<RoleColors> {
  const out: Partial<RoleColors> = {};
  for (const [k, v] of Object.entries(colors ?? {})) {
    const role = isRole(k) ? k : LEGACY_ROLE_KEYS[k];
    if (!role) continue;
    if (isRole(k) || !(role in out)) out[role] = v;
  }
  return out;
}
