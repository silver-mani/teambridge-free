/**
 * Alloy Typography Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * TypeScript mirror of the typography custom properties defined in tokens.css.
 * Only Geist and Geist Mono are sanctioned Alloy typefaces.
 *
 * Use these values when you need token references in JS/TS (e.g. inline styles,
 * canvas rendering, motion values). For CSS, always prefer var(--token-name).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Primitive tokens ─────────────────────────────────────────────────────────

export const fontFamilies = {
  sans: [
    'Geist',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    "'Segoe UI'",
    'sans-serif',
  ].join(', '),
  mono: [
    'Geist Mono',
    'ui-monospace',
    "'Cascadia Code'",
    "'Source Code Pro'",
    'Menlo',
    'Consolas',
    'monospace',
  ].join(', '),
} satisfies Record<string, string>;

export type FontFamily = keyof typeof fontFamilies;

export const fontSizes = {
  xs:      '0.75rem',    // 12px
  sm:      '0.875rem',   // 14px
  base:    '1rem',       // 16px
  lg:      '1.125rem',   // 18px
  xl:      '1.25rem',    // 20px
  '2xl':   '1.5rem',     // 24px
  '3xl':   '1.875rem',   // 30px
  '3-5xl': '2rem',       // 32px
  '4xl':   '2.25rem',    // 36px
  '4-5xl': '2.5rem',     // 40px
  '5xl':   '3rem',       // 48px
  '5-5xl': '3.5rem',     // 56px
  '6xl':   '4rem',       // 64px
  '6-5xl': '4.5rem',     // 72px
  '7xl':   '6rem',       // 96px
} satisfies Record<string, string>;

export type FontSize = keyof typeof fontSizes;

export const fontWeights = {
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
} satisfies Record<string, number>;

export type FontWeight = keyof typeof fontWeights;

export const lineHeights = {
  none:    1,      // display-xl (96px)   — optically flush
  tighter: 1.05,   // display-lg (72px)   — barely open
  tight:   1.1,    // display-md (64px)   — subtle breathing room
  snug:    1.2,    // display-sm/xs, heading-xl — transition zone
  normal:  1.3,    // heading-lg/md       — comfortable UI headings
  relaxed: 1.5,    // heading-sm/xs, labels, paragraph-sm
  loose:   1.6,    // paragraph-lg/md     — body copy sweet spot
} satisfies Record<string, number>;

export type LineHeight = keyof typeof lineHeights;

export const tracking = {
  tight:  '-0.03em',
  normal:  '0em',
  wide:    '0.02em',
  wider:   '0.05em',
} satisfies Record<string, string>;

export type Tracking = keyof typeof tracking;

// ── Type helper ──────────────────────────────────────────────────────────────

interface TypeStyle {
  fontFamily:    string;
  fontSize:      string;
  fontWeight:    number;
  lineHeight:    number;
  letterSpacing: string;
}

// ── Display ──────────────────────────────────────────────────────────────────
// Hero and marketing text. Always Geist regular (400), tight leading.
// Use for: page heroes, splash screens, section openers, feature headlines.
//
//  xl  96px  regular  none     tight
//  lg  72px  regular  tighter  tight
//  md  64px  regular  tight    tight
//  sm  56px  regular  snug     tight
//  xs  48px  regular  snug     normal

export const display = {
  xl: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['7xl'],       // 96px  → lh 96px   (×1.0)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.none,
    letterSpacing: tracking.tight,
  },
  lg: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['6-5xl'],     // 72px  → lh 75.6px (×1.05)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.tighter,
    letterSpacing: tracking.tight,
  },
  md: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['6xl'],       // 64px  → lh 70.4px (×1.1)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.tight,
    letterSpacing: tracking.tight,
  },
  sm: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['5-5xl'],     // 56px  → lh 67.2px (×1.2)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.snug,
    letterSpacing: tracking.tight,
  },
  xs: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['5xl'],       // 48px  → lh 57.6px (×1.2)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.snug,
    letterSpacing: tracking.normal,
  },
} satisfies Record<string, TypeStyle>;

export type DisplayVariant = keyof typeof display;

// ── Heading ──────────────────────────────────────────────────────────────────
// UI product headings. Always Geist regular (400), calibrated leading per size.
// Use for: page titles, panel/card headers, dialog titles, sidebar sections.
//
//  xl  40px  regular  snug     normal
//  lg  32px  regular  normal   normal
//  md  24px  regular  normal   normal
//  sm  20px  regular  relaxed  normal
//  xs  18px  regular  relaxed  wide

export const heading = {
  xl: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['4-5xl'],     // 40px  → lh 48px   (×1.2)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.snug,
    letterSpacing: tracking.normal,
  },
  lg: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['3-5xl'],     // 32px  → lh 41.6px (×1.3)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.normal,
    letterSpacing: tracking.normal,
  },
  md: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes['2xl'],       // 24px  → lh 31.2px (×1.3)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.normal,
    letterSpacing: tracking.normal,
  },
  sm: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.xl,           // 20px  → lh 30px   (×1.5)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.relaxed,
    letterSpacing: tracking.normal,
  },
  xs: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.lg,           // 18px  → lh 27px   (×1.5)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.relaxed,
    letterSpacing: tracking.wide,
  },
} satisfies Record<string, TypeStyle>;

export type HeadingVariant = keyof typeof heading;

// ── Paragraph ────────────────────────────────────────────────────────────────
// Body copy and longform content. Always regular (400), loose leading for comfort.
// Use for: descriptions, help text, content areas, prose.
//
//  lg  16px  regular  loose    normal
//  md  14px  regular  loose    normal
//  sm  12px  regular  relaxed  normal

export const paragraph = {
  lg: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.base,         // 16px  → lh 25.6px (×1.6)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.loose,
    letterSpacing: tracking.normal,
  },
  md: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.sm,           // 14px  → lh 22.4px (×1.6)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.loose,
    letterSpacing: tracking.normal,
  },
  sm: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.xs,           // 12px  → lh 18px   (×1.5)
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.relaxed,
    letterSpacing: tracking.normal,
  },
} satisfies Record<string, TypeStyle>;

export type ParagraphVariant = keyof typeof paragraph;

// ── Label ────────────────────────────────────────────────────────────────────
// Short UI text. Always medium (500), wider tracking at smaller sizes.
// Use for: form labels, badge text, table headers, nav items, tags, captions.
//
//  lg  16px  medium  normal  normal
//  md  14px  medium  normal  wide
//  sm  12px  medium  normal  wider

export const label = {
  lg: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.base,         // 16px  → lh 24px   (×1.5)
    fontWeight:    fontWeights.medium,
    lineHeight:    lineHeights.relaxed,
    letterSpacing: tracking.normal,
  },
  md: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.sm,           // 14px  → lh 21px   (×1.5)
    fontWeight:    fontWeights.medium,
    lineHeight:    lineHeights.relaxed,
    letterSpacing: tracking.wide,
  },
  sm: {
    fontFamily:    fontFamilies.sans,
    fontSize:      fontSizes.xs,           // 12px  → lh 15.6px (×1.3)
    fontWeight:    fontWeights.medium,
    lineHeight:    lineHeights.normal,
    letterSpacing: tracking.wider,
  },
} satisfies Record<string, TypeStyle>;

export type LabelVariant = keyof typeof label;

// ── Code ─────────────────────────────────────────────────────────────────────
// Monospace styles for code blocks, inline code, and technical strings.

export const code = {
  /** 14px · regular · relaxed leading — code blocks, terminal output */
  block: {
    fontFamily:    fontFamilies.mono,
    fontSize:      fontSizes.sm,           // 14px
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.relaxed,
    letterSpacing: tracking.normal,
  },
  /** 13px · regular · normal leading — inline code snippets */
  inline: {
    fontFamily:    fontFamilies.mono,
    fontSize:      '0.8125rem',            // 13px
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.normal,
    letterSpacing: tracking.normal,
  },
} satisfies Record<string, TypeStyle>;

export type CodeVariant = keyof typeof code;

// ── Legacy flat export (backwards compat) ────────────────────────────────────

/** @deprecated Use the category exports instead: `display`, `heading`, `paragraph`, `label`, `code` */
export const typographyScale = {
  displayXl:   display.xl,
  displayLg:   display.lg,
  displayMd:   display.md,
  displaySm:   display.sm,
  displayXs:   display.xs,
  headingXl:   heading.xl,
  headingLg:   heading.lg,
  headingMd:   heading.md,
  headingSm:   heading.sm,
  headingXs:   heading.xs,
  paragraphLg: paragraph.lg,
  paragraphMd: paragraph.md,
  paragraphSm: paragraph.sm,
  labelLg:     label.lg,
  labelMd:     label.md,
  labelSm:     label.sm,
  codeBlock:   code.block,
  codeInline:  code.inline,
} satisfies Record<string, TypeStyle>;

export type TypographyScale = keyof typeof typographyScale;
