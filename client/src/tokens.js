/**
 * SplitLab — design tokens for JS consumers.
 *
 * Mirrors the semantic tier of tokens.css. Recharts renders most colors as SVG
 * presentation attributes (fill="…", stroke="…"), which cannot resolve var(),
 * so chart code reads literals from here instead of hardcoding hex.
 *
 * Keep in sync with src/tokens.css. Values are literal on purpose — if these
 * drift from the CSS, the Foundations story in Storybook shows both side by
 * side and the mismatch is visible.
 */

export const color = {
  bg:         '#060C07',
  bgSurface:  '#0A140B',
  bgRaised:   '#0D1A0E',

  border:       '#172419',
  borderStrong: '#1F301F',

  text:      '#DCDBCF',
  textDim:   '#9A9991',
  textMuted: '#42423E',

  accent:       '#C4DE55',
  accentSubtle: '#3B431A',
  onAccent:     '#050905',

  secondary:       '#84A3BC',
  secondarySubtle: '#283138',

  splitFast:       '#6B9E6E',
  splitFastSubtle: '#202F21',
  splitMid:        '#D4B84A',
  splitMidSubtle:  '#403716',
  splitSlow:       '#BC6B5A',
  splitSlowSubtle: '#38201B',

  good: '#6B9E6E',
  warn: '#D4B84A',
  bad:  '#BC6B5A',
};

export const font = {
  ui: 'IBM Plex Sans, sans-serif',
};

export const fontSize = {
  '2xs': 10,
  xs:    11,
  sm:    12,
  md:    13,
  base:  14,
};

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
};

/** Shared Recharts axis tick style — used by every chart. */
export const axisTick = {
  fill: color.textDim,
  fontSize: fontSize.xs,
  fontFamily: font.ui,
};

/** Shared Recharts tooltip container style. */
export const tooltipStyle = {
  background: color.bgSurface,
  border: `1px solid ${color.borderStrong}`,
  borderRadius: radius.sm,
  fontFamily: font.ui,
  fontSize: fontSize.sm,
};
