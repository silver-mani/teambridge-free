/**
 * Alloy Product Gradient Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Branded gradient tokens for specific Alloy product lines.
 * These are TypeScript mirrors of the CSS custom properties defined in
 * tokens.css. For CSS, always prefer var(--gradient-*).
 *
 * Usage in CSS
 * ────────────
 *   Background:
 *     background: var(--gradient-policy-engine);
 *
 *   Border:
 *     border: 2px solid transparent;
 *     border-image: var(--gradient-policy-engine) 1;
 *     /* Note: border-image disables border-radius — use background-clip trick
 *        for rounded borders:
 *        background:
 *          linear-gradient(var(--color-bg-primary), var(--color-bg-primary)) padding-box,
 *          var(--gradient-policy-engine) border-box;
 *        border: 2px solid transparent;                                       *\/
 *
 *   Text:
 *     background: var(--gradient-ponder);
 *     -webkit-background-clip: text;
 *     -webkit-text-fill-color: transparent;
 *     background-clip: text;
 *
 * Never hardcode gradient color stops in components — always use the token.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Stop definitions ─────────────────────────────────────────────────────────

interface GradientStop {
  color:    string;
  position: string;
}

interface ProductGradient {
  /** Product identifier */
  product:   string;
  /** Human-readable description */
  label:     string;
  direction: string;
  stops:     GradientStop[];
  /** Full CSS gradient value — mirrors var(--gradient-*) */
  value:     string;
}

// ── Policy Engine ─────────────────────────────────────────────────────────────
// Warm coral → orange → rose gradient. Used across Policy Engine product surfaces,
// icons, text highlights, and branded UI elements.

const policyEngineStops: GradientStop[] = [
  { color: '#FFA79B', position:  '5.75%' },   // coral blush — start
  { color: '#FF8825', position: '34.95%' },   // vivid orange — mid-warm
  { color: '#FC6684', position: '65.93%' },   // coral rose — mid-cool
  { color: '#FD4274', position:   '100%' },   // hot rose — end
];

// ── Ponder (AI) ───────────────────────────────────────────────────────────────
// Purple → blue → teal gradient. Used across the Ponder AI product surfaces,
// AI-generated content indicators, and intelligence-themed UI elements.

const ponderStops: GradientStop[] = [
  { color: '#8C4FE2', position:   '0%' },     // deep purple — start
  { color: '#446CFF', position:  '50%' },     // electric blue — mid
  { color: '#1EDFDE', position: '100%' },     // cyan teal — end
];

// ── Gradient map ─────────────────────────────────────────────────────────────

function buildGradient(stops: GradientStop[], direction = 'to right'): string {
  const stopList = stops
    .map(({ color, position }) => `${color} ${position}`)
    .join(', ');
  return `linear-gradient(${direction}, ${stopList})`;
}

export const gradients = {
  policyEngine: {
    product:   'policy-engine',
    label:     'Policy Engine',
    direction: 'to right',
    stops:     policyEngineStops,
    value:     buildGradient(policyEngineStops),
  },
  ponder: {
    product:   'ponder',
    label:     'Ponder AI',
    direction: 'to right',
    stops:     ponderStops,
    value:     buildGradient(ponderStops),
  },
} satisfies Record<string, ProductGradient>;

export type GradientName = keyof typeof gradients;

// ── CSS variable references ───────────────────────────────────────────────────
// Use these when you need a var() string in JS/TS (e.g. inline style objects).

export const gradientVars = {
  policyEngine: 'var(--gradient-policy-engine)',
  ponder:       'var(--gradient-ponder)',
} satisfies Record<GradientName, string>;

// ── Usage helpers ─────────────────────────────────────────────────────────────
// Pre-composed CSS property objects for the three supported usage contexts.
// Spread into a React inline style or pass to a CSS-in-JS utility.

export const gradientUsage = {
  /**
   * Apply a gradient as a filled background.
   * @example <div style={gradientUsage.background('policyEngine')} />
   */
  background: (name: GradientName): React.CSSProperties => ({
    background: gradientVars[name],
  }),

  /**
   * Apply a gradient as clipped text color.
   * @example <span style={gradientUsage.text('ponder')}>AI-powered</span>
   */
  text: (name: GradientName): React.CSSProperties => ({
    background:              gradientVars[name],
    WebkitBackgroundClip:    'text',
    WebkitTextFillColor:     'transparent',
    backgroundClip:          'text',
  }),

  /**
   * Apply a gradient as a transparent border (preserves border-radius).
   * Requires a solid background on the element; defaults to --color-bg-primary.
   * @example <div style={gradientUsage.border('ponder', 'var(--color-bg-primary)')} />
   */
  border: (name: GradientName, bgColor = 'var(--color-bg-primary)', width = '1px'): React.CSSProperties => ({
    border:     `${width} solid transparent`,
    background: `linear-gradient(${bgColor}, ${bgColor}) padding-box, ${gradientVars[name]} border-box`,
  }),
} as const;
