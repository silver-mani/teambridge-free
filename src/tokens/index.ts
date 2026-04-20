export { palette } from './colors';
export type { PaletteColor } from './colors';

export { gradients, gradientVars, gradientUsage } from './gradients';
export type { GradientName } from './gradients';

export { shadows, shadowsDark, shadowVars } from './shadows';
export type { ShadowDirection, ShadowLevel } from './shadows';

export {
  // Primitive scales
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  tracking,
  // Semantic category exports
  display,
  heading,
  paragraph,
  label,
  code,
  // Legacy flat map
  typographyScale,
} from './typography';
export type {
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  Tracking,
  DisplayVariant,
  HeadingVariant,
  ParagraphVariant,
  LabelVariant,
  CodeVariant,
  TypographyScale,
} from './typography';
