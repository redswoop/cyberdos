/* Text the effects speak: the decrypt-scramble alphabets and the boot log.
   Apps brand the boot log through options; the defaults are the skin's own. */

/** glyphs the scramble decodes from */
export const NOISE = '!<>-_\\/[]{}=+*^?#01ｱｲｳｴｵ';
/** glyphs the digital rain is made of */
export const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜ0123456789ABCDEF<>/\\=+*';

export const pick = (s: string) => s[(Math.random() * s.length) | 0];

/** a hostname as the boot log prints it: IPs verbatim, names cut to the
 *  first label plus a tailnet suffix, nothing → localhost */
export function hostLabel(hostname: string | null | undefined): string {
  const h = (hostname ?? '').trim();
  if (!h || h === 'localhost') return 'localhost';
  return /^[\d.:]+$/.test(h) ? h : `${h.split('.')[0]}.tailnet`;
}

export interface BootLinesOptions {
  /** first line, display face: the product banner */
  title?: string;
  /** host shown in the handshake line */
  host?: string;
  /** the `> step ..... OK` lines after the handshake */
  steps?: string[];
  /** last line, big: the welcome */
  last?: string;
}

export const BOOT_DEFAULTS: Required<BootLinesOptions> = {
  title: 'CYBERDOS 20.77 — NETRUNNER EDITION',
  host: 'localhost',
  steps: ['> ICE countermeasures ......... BYPASSED', '> neural link ................. OK'],
  last: 'JACKED IN',
};

/** the long boot: title, handshake, steps, welcome */
export function bootLines(o: BootLinesOptions = {}): string[] {
  const { title, host, steps, last } = { ...BOOT_DEFAULTS, ...o };
  return [title, `> handshake ${host} .... OK`, ...steps, last];
}

/** the short boot played on a user toggle */
export const SHORT_BOOT = ['> neural link .......... OK', '> ICE .................. BYPASSED', 'JACKED IN'];
