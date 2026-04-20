# Alloy Design System — Claude Code Rules

This file defines conventions, patterns, and workflows for developing the Alloy design system library. Follow these rules for all code generation, component implementation, and Figma-to-code tasks.

---

## Project Overview

**Alloy** is a React + TypeScript component library and design system. It provides reusable UI primitives, design tokens, and patterns used across products.

- **Language:** TypeScript
- **Framework:** React
- **Styling:** CSS custom properties (design tokens) + CSS Modules
- **Build:** Vite (library mode)
- **Package:** ESM + CJS dual output

---

## Project Structure

```
Alloy/
├── src/
│   ├── components/         # UI component implementations
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── tokens/             # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radii.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── tokens.css      # CSS custom properties (generated from tokens)
│   │   ├── reset.css       # Minimal CSS reset
│   │   └── global.css      # Global styles
│   ├── utils/              # Utility functions (cn, etc.)
│   └── index.ts            # Main package entry — re-exports all public API
├── docs/                   # Component documentation
├── CLAUDE.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Component Organization

- Every component lives in its own directory under `src/components/ComponentName/`
- Each component directory contains:
  - `ComponentName.tsx` — implementation
  - `ComponentName.module.css` — scoped styles
  - `ComponentName.stories.tsx` — Storybook stories (when applicable)
  - `index.ts` — re-exports the component and its types
- IMPORTANT: Export all public components and types from `src/index.ts`
- Component names use PascalCase (e.g., `Button`, `TextInput`, `CardGroup`)

---

## Design Tokens

Token files live in `src/tokens/` and `src/styles/tokens.css`.

- IMPORTANT: Never hardcode color hex values, sizes, or shadow values in components — always use a `var(--*)` token
- IMPORTANT: Never reference `--palette-*` variables directly in components — use semantic `--color-*` tokens only

### Two-layer architecture

**Layer 1 — Palette** (`src/tokens/colors.ts` + `--Alloy-*` in CSS)
Raw named values for every color in the system. 11 hues × up to 13 stops (50–950):
`blue`, `azure`, `purple`, `pink`, `red`, `orange`, `yellow`, `matcha`, `green`, `slate`, `grey` + `white` / `black`.
CSS variable format: `--Alloy-{color}-{number}` (e.g. `--Alloy-blue-500`, `--Alloy-slate-100`)

**Layer 2 — Usage tokens** (`:root` in `src/styles/tokens.css`)
Role-based aliases organized by usage category, consumed by components. Dark mode values are defined in
`@media (prefers-color-scheme: dark) :root:not(.light)` and `.dark` for manual override.
Add `.light` to force light mode regardless of OS preference.

### Usage token categories

| Category | Tokens | Usage |
|---|---|---|
| Background | `--color-bg-primary/secondary/tertiary/transparent/always-dark/always-light/disabled` | ALL filled surfaces — page, cards, buttons, tags, chips, inputs |
| Content | `--color-content-primary/secondary/tertiary/disabled/inverse/link/link-hover` | Text and icon hierarchy |
| Border | `--color-border-opaque/transparent/selected/disabled/focus` | ALL strokes — dividers, outlines, inputs, cards |
| Success | `--color-success-fill/bg/border/content` | Success states |
| Warning | `--color-warning-fill/bg/border/content` | Warning states |
| Error | `--color-error-fill/bg/border/content` | Error / danger states |
| Info | `--color-info-fill/bg/border/content` | Informational states |

### Other token namespaces

```
--space-{0|1|2|3|4|5|6|8|10|12|16|20|24}    spacing scale (4px base)

--font-sans                                  Geist + system fallbacks
--font-mono                                  Geist Mono + system fallbacks
--text-{xs|sm|base|lg|xl|2xl|3xl|4xl|5xl}   font sizes (rem, 16px base)
--font-weight-{regular|medium|semibold|bold}
--line-height-{tight|snug|normal|relaxed}
--tracking-{tight|normal|wide|wider}         letter spacing

--radius-{xs|sm|md|lg|xl|2xl|full}
--shadow-{below|above}-{low|md|high}   two directions × three elevation levels
--z-{base|raised|dropdown|sticky|overlay|modal|toast}
--duration-{fast|base|slow}  --ease-{default|in|out}
```

### Typography rules

- **Only Geist (`--font-sans`) and Geist Mono (`--font-mono`)** are sanctioned Alloy typefaces — never introduce third-party fonts
- Always reference `var(--font-sans)` or `var(--font-mono)` — never hardcode font names in component CSS
- Consumers must install the `geist` npm package (`npm install geist`) and import `src/styles/typography.css` after `tokens.css`
- Use `typographyScale` from `src/tokens/typography.ts` for composite text style references in JS/TS contexts

---

## Styling Rules

- Use CSS Modules (`.module.css` files) for component styles
- Reference CSS custom properties, never raw values: `color: var(--color-brand-500)` not `color: #4F46E5`
- Use `clsx` or a `cn()` utility for conditional class merging
- IMPORTANT: Do not use Tailwind in component files — Alloy is a standalone library; consumers apply their own utility framework
- All components must accept a `className` prop and spread it onto the root element for consumer customization
- Use `data-*` attributes for state styling (e.g., `data-disabled`, `data-variant`) instead of JS-in-CSS

---

## Component Patterns

### Standard component signature

```tsx
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Button.module.css';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(styles.root, styles[variant], styles[size], className)}
        data-loading={loading || undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

- Use `forwardRef` for all interactive/HTML elements
- Export component types alongside the component
- Use `ComponentPropsWithoutRef<'element'>` as the base for HTML-wrapping components
- Prop defaults go in destructuring, not defaultProps
- Set `displayName` for all `forwardRef` components

---

## Icon System

- Icons live in `src/components/icons/` as individual `.tsx` files
- Each icon is an SVG converted to a React component accepting `size`, `color`, and all SVG props
- IMPORTANT: Do not install external icon packages (lucide-react, heroicons, etc.) — if icons come from the Figma MCP server as localhost SVG sources, use those directly
- Icon naming: `<IconName>Icon` (e.g., `ChevronDownIcon`, `CheckIcon`)

---

## TypeScript Rules

- All components and their props must be typed — no `any`
- Export all prop types from `index.ts` so consumers can import them
- Use `satisfies` for token objects to get type safety with inferred types
- Prefer `interface` for extendable prop types, `type` for unions and computed types

---

## Accessibility

- All interactive components must have appropriate ARIA roles/attributes
- Use semantic HTML elements — `<button>` not `<div onClick>`
- Include `aria-label` on icon-only buttons
- Ensure focus styles are always visible (never `outline: none` without a replacement)
- Color contrast must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)

---

## Figma MCP Integration Rules

These rules define how to translate Figma designs into Alloy components and must be followed for every Figma-driven task.

### Required Flow (do not skip)

1. Run `get_design_context` with the target node to get the structured design representation
2. Run `get_screenshot` for visual reference of the exact variant being implemented
3. Review both outputs before writing any code
4. Map all Figma colors/sizes/spacing to the closest Alloy design token in `src/tokens/` or `src/styles/tokens.css`
5. Implement using CSS Modules + CSS custom properties (not Tailwind or inline styles)
6. Re-use existing Alloy components where possible before creating net-new ones
7. Validate the rendered output against the Figma screenshot for 1:1 visual parity

### Mapping Figma → Alloy

| Figma property | Alloy equivalent |
|---|---|
| Fill color | `var(--color-*)` token |
| Text style | `var(--text-*)` size + font-weight |
| Spacing / padding | `var(--space-*)` token |
| Corner radius | `var(--radius-*)` token |
| Shadow / elevation | `var(--shadow-*)` token |
| Icon node | SVG component in `src/components/icons/` |

### Asset Rules

- IMPORTANT: If the Figma MCP server provides a `localhost` URL for an image or SVG asset, use that URL directly as the `src`
- IMPORTANT: Do not use placeholder images or create stub assets — use what the Figma server provides
- Store downloaded static assets in `src/assets/`
- SVG icons should be converted to React components, not used as `<img>` tags

---

## What Never to Do

- IMPORTANT: Never hardcode color hex values, pixel sizes, or shadow values — always use a token
- Never install new icon packages without explicit instruction
- Never use inline `style={{}}` props for design values (reserved for dynamic/computed values only)
- Never write component CSS outside its `.module.css` file
- Never skip `forwardRef` on HTML-wrapping components
- Never export components without their TypeScript types
