/**
 * Alloy Shadow Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * TypeScript mirror of the --shadow-* CSS custom properties in tokens.css.
 *
 * Two directional types × three elevation levels:
 *
 *   below  — shadow projects downward. Use on cards, panels, modals, popovers
 *            and any element resting on a surface.
 *   above  — shadow projects upward (Y offsets inverted). Use on tooltips,
 *            bottom sheets, FABs, and elements floating above the viewport edge.
 *
 * Elevation levels:
 *   low    — subtle lift; single diffuse layer.   Inline callouts, hover states.
 *   md     — near crisp layer + diffuse spread.   Cards, dropdowns, date pickers.
 *   high   — near crisp layer + strong spread.    Modals, side-sheets, toasts.
 *
 * Usage
 *   CSS:  box-shadow: var(--shadow-below-high);
 *   JS:   import { shadows } from '@alloy/tokens';
 *         style={{ boxShadow: shadows.below.high }}
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Light mode values ────────────────────────────────────────────────────────

export const shadows = {
  below: {
    /** Single diffuse layer — subtle lift */
    low:  '0 12px 32px 0 rgba(0, 0, 0, 0.03)',
    /** Near crisp layer + diffuse spread — mid elevation */
    md:   '0 2px 4px 0 rgba(0, 0, 0, 0.03), 0 12px 32px 0 rgba(0, 0, 0, 0.06)',
    /** Near crisp layer + strong spread — highest elevation */
    high: '0 2px 4px 0 rgba(0, 0, 0, 0.03), 0 12px 32px 0 rgba(0, 0, 0, 0.09)',
  },
  above: {
    /** Single diffuse layer (upward) — subtle lift */
    low:  '0 -12px 32px 0 rgba(0, 0, 0, 0.03)',
    /** Near crisp layer + diffuse spread (upward) */
    md:   '0 -2px 4px 0 rgba(0, 0, 0, 0.03), 0 -12px 32px 0 rgba(0, 0, 0, 0.06)',
    /** Near crisp layer + strong spread (upward) */
    high: '0 -2px 4px 0 rgba(0, 0, 0, 0.03), 0 -12px 32px 0 rgba(0, 0, 0, 0.09)',
  },
} as const;

// ── Dark mode values (higher opacity — shadows lose contrast on dark bg) ─────

export const shadowsDark = {
  below: {
    low:  '0 12px 32px 0 rgba(0, 0, 0, 0.20)',
    md:   '0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 12px 32px 0 rgba(0, 0, 0, 0.30)',
    high: '0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 12px 32px 0 rgba(0, 0, 0, 0.45)',
  },
  above: {
    low:  '0 -12px 32px 0 rgba(0, 0, 0, 0.20)',
    md:   '0 -2px 4px 0 rgba(0, 0, 0, 0.15), 0 -12px 32px 0 rgba(0, 0, 0, 0.30)',
    high: '0 -2px 4px 0 rgba(0, 0, 0, 0.15), 0 -12px 32px 0 rgba(0, 0, 0, 0.45)',
  },
} as const;

// ── CSS variable references ───────────────────────────────────────────────────
// Use when you need var() strings in JS/TS inline styles.

export const shadowVars = {
  below: {
    low:  'var(--shadow-below-low)',
    md:   'var(--shadow-below-md)',
    high: 'var(--shadow-below-high)',
  },
  above: {
    low:  'var(--shadow-above-low)',
    md:   'var(--shadow-above-md)',
    high: 'var(--shadow-above-high)',
  },
} as const;

// ── Types ────────────────────────────────────────────────────────────────────

export type ShadowDirection = keyof typeof shadows;
export type ShadowLevel     = keyof typeof shadows.below;
