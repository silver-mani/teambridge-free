# Alloy Design System

A React + TypeScript component library and design system. Provides reusable UI primitives, design tokens, and patterns used across Teambridge products.

- **Language:** TypeScript
- **Framework:** React 18+
- **Styling:** CSS custom properties (design tokens) + CSS Modules
- **Build:** Vite (library mode) — ESM + CJS dual output

---

## Project Structure

```
Alloy/
├── src/
│   ├── components/          # UI component implementations
│   │   ├── ai/              # Teambridge AI components
│   │   │   ├── AILoader/    # Animated AI star mark loader
│   │   │   └── AICoreButton/ # AI action button (copy, read-aloud, feedback)
│   │   ├── Alert/
│   │   ├── Badge/
│   │   ├── Breadcrumb/
│   │   ├── Button/
│   │   ├── Charts/          # BarChart, LineChart, DonutChart, HeatMap, ChartCard
│   │   ├── Checkbox/
│   │   ├── CheckboxGroup/
│   │   ├── DataCard/
│   │   ├── Divider/
│   │   ├── DropdownMenu/
│   │   ├── Eyebrow/
│   │   ├── FileUploader/
│   │   ├── FilterPill/
│   │   ├── Input/           # TextField, TextArea, SelectField, and variants
│   │   ├── ListItem/
│   │   ├── Pagination/
│   │   ├── Radio/
│   │   ├── RadioGroup/
│   │   ├── ScrollArea/
│   │   ├── SegmentedControl/
│   │   ├── StatusTag/
│   │   ├── Switch/
│   │   ├── Table/
│   │   ├── Tabs/
│   │   ├── Tag/
│   │   ├── Toast/
│   │   ├── ToggleButton/
│   │   ├── Tooltip/
│   │   ├── ValueChangeLabel/
│   │   └── icons/           # 78 SVG icon components
│   ├── tokens/              # Design token definitions (TS)
│   │   ├── colors.ts        # Palette color scales
│   │   ├── gradients.ts     # Gradient definitions
│   │   ├── shadows.ts       # Shadow / elevation tokens
│   │   ├── typography.ts    # Font scales and text styles
│   │   └── index.ts         # Token barrel export
│   ├── styles/
│   │   ├── tokens.css       # CSS custom properties (all tokens)
│   │   ├── typography.css   # Geist / Geist Mono font imports
│   │   └── artwork.css      # SVG and artwork styles
│   └── index.ts             # Main entry — re-exports all public API
├── preview/                 # Live component preview app (Vite + React)
│   ├── src/
│   │   ├── ComponentPreview.jsx   # Sidebar shell
│   │   └── *Preview.jsx           # One page per component
│   ├── vite.config.js
│   └── package.json
├── specimens/               # Component specimen documentation
│   └── TagSpecimen.tsx
├── .github/
│   └── workflows/
│       └── deploy-preview.yml   # Auto-deploy preview to GitHub Pages
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CHANGELOG.md
```

---

## Getting Started

### 1. Install preview dependencies

```bash
cd preview
npm install
```

### 2. Run the component preview

```bash
npm run dev
```

Open `http://localhost:5180` — all components are browsable in the sidebar.

### 3. Build the library

From the project root:

```bash
npm run build
```

Outputs ESM + CJS bundles to `dist/`.

### 4. Use in a project

Import tokens and components directly from `src/` (no build step required when consuming as a local package):

```tsx
import { Button, DataCard, ValueChangeLabel } from 'alloy-design-system';
import 'alloy-design-system/styles/tokens.css';
import 'alloy-design-system/styles/typography.css';
```

---

## Components

### Teambridge AI

| Component | Description |
|---|---|
| `AILoader` | Animated Teambridge AI star mark that morphs between star and circle. Six color variants: `gradient`, `gradient-fill`, `inverse`, `inverse-light`, `stroke`, `stroke-light`. Five sizes: xs (16 px) → xl (64 px). Fixed 2.2 s ambient spin. |
| `AICoreButton` | AI action button for copy, read-aloud, and feedback (thumbs up/down) interactions. Integrates ThumbsUp, ThumbsDown, and VolumeMax icons. |

### Actions

| Component | Description |
|---|---|
| `Button` | Primary, secondary, tertiary, ghost, destructive, and destructive-secondary variants. Five sizes (xs – xl). Loading state with integrated AI spinner. Leading/trailing artwork and icon-only modes. |
| `ToggleButton` | Pressed/unpressed toggle built on `Button`. Fill or border selection styles. |
| `AreaButton` | Ghost "add zone" placeholder button. Dashed border, transparent fill. Vertical (stacked) or horizontal (row) layout. Configurable `height`, `borderRadius`, and `align` (`center` \| `start`). Three sizes: sm (80 px) / md (120 px) / lg (160 px) for vertical; defaults to 36 px for horizontal. |

### Navigation

| Component | Description |
|---|---|
| `Tabs` | Underline and background variants with animated sliding indicator. Horizontal layout, any number of tabs. |
| `SegmentedControl` | Mutually-exclusive radio-style selection with sliding pill indicator. sm / md / lg sizes. |
| `Breadcrumb` | Navigation trail with slash or chevron separators. Truncates long paths. |
| `Pagination` | Page navigation controls with optional rows-per-page selector and go-to-page input. sm / md sizes. |
| `FilterPill` | Removable filter chip with label and dismiss button. sm / md / lg sizes. |

### Form

| Component | Description |
|---|---|
| `TextField` | Single-line text input with label, hint, error state, leading/trailing slots. |
| `TextArea` | Multi-line text input. Auto-grow option. |
| `SelectField` | Native `<select>` styled to the Alloy input pattern. |
| `PasswordField` | Text input with show/hide password toggle. |
| `SearchField` | Text input with leading search icon and optional clear button. |
| `EmailField` | Email-type text input. |
| `NumberField` | Number-type text input with increment/decrement controls. |
| `MultiSelectField` | Tag-input for selecting multiple values. |
| `Checkbox` | Binary selection with indeterminate state. sm / md / lg sizes. Label + description. |
| `CheckboxGroup` | Grouped checkbox list with shared error and disabled state. |
| `Radio` | Single-select option. sm / md / lg sizes. Label + description. |
| `RadioGroup` | Managed radio button group from an options array. |
| `Switch` | Pill toggle for binary on/off settings. sm / md / lg sizes. |

### Data Display

| Component | Description |
|---|---|
| `DataCard` | Compact metric tile. 10 badge color variants. Label + heading value + optional `change` slot. Pass `<ValueChangeLabel>` as `change` for directional or severity indicators. |
| `ValueChangeLabel` | Inline change indicator. `trend` mode: value + arrow icon, colored by direction (up = green, down = red) with optional `severity` override. `text` mode: text-only colored by `severity` (positive / warning / negative). |
| `ChartCard` | Wrapper tile with title, description, and footer slot. Used to frame chart components. |
| `BarChart` | Grouped, stacked, and horizontal bar charts. Multi-series with legend. |
| `LineChart` | Multi-line chart with smooth curves and series legend. |
| `DonutChart` | Donut / pie chart with horizontal or vertical legend. |
| `HeatMap` | 2D cell matrix for grid-based data visualization. |
| `Table` | Semantic HTML table. sm (40 px) and md (48 px) row sizes. `TableHead`, `TableBody`, `TableRow`, `TableCell` sub-components. |
| `ListItem` | Flexible row for menus, settings panels, and lists. Rich trailing action slot. |
| `Badge` | Compact pill for counts, labels, and semantic state indicators. |
| `Tag` | Multi-color, multi-variant labeling chip with optional dismiss. |
| `StatusTag` | Semantic status indicator with colored dot and label. |
| `Eyebrow` | Small uppercase label used for section headings and category markers. |

### Feedback

| Component | Description |
|---|---|
| `Alert` | Notification banner for error, warning, success, info, and feature states. Dismissible. |
| `Dialog` | Modal overlay with `DialogHeader`, `DialogContent`, and `DialogFooter` sub-components. Three sizes: sm / md / lg. |
| `DropdownMenu` | Floating panel with grouped options, toggle actions, and custom trailing slots. |
| `Toast` | Ephemeral notification with auto-dismiss. |
| `Tooltip` | Hover/focus hint overlay. top / bottom / left / right placement. Configurable delay and content slot. |

### Layout

| Component | Description |
|---|---|
| `Divider` | Horizontal or vertical separator. `thickness`: 1 or 2 px. `variant`: solid or dashed (2 px dash / 2 px gap). Uses `--color-border-opaque`. |
| `ScrollArea` | Scrollable container with custom-styled scrollbars. horizontal / vertical / both orientations. |
| `FileUploader` | Drag-and-drop area and inline input-row upload control. |

---

## Token System

Alloy uses a **two-layer token architecture**. Components only consume Layer 2 tokens — never palette values directly.

### Layer 1 — Palette

Raw color values. Format: `--Alloy-{color}-{stop}`

| Hue | Available stops |
|---|---|
| `blue`, `azure`, `purple`, `pink`, `red`, `orange` | 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950 |
| `yellow`, `matcha`, `green`, `slate`, `grey` | 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950 |
| `white`, `black` | — |

Examples: `--Alloy-blue-500`, `--Alloy-slate-100`, `--Alloy-green-400`

### Layer 2 — Semantic Usage Tokens

Role-based aliases defined in `src/styles/tokens.css` and consumed by all components.

**Background** — all filled surfaces (page, cards, inputs, buttons)

| Token | Usage |
|---|---|
| `--color-bg-primary` | Default page / card background |
| `--color-bg-secondary` | Slightly elevated surface |
| `--color-bg-tertiary` | Selected or highlighted surface |
| `--color-bg-disabled` | Disabled control fill |
| `--color-bg-always-dark` | Always dark regardless of mode |
| `--color-bg-always-light` | Always light regardless of mode |

**Content** — text and icons

| Token | Usage |
|---|---|
| `--color-content-primary` | Primary text and icons |
| `--color-content-secondary` | Secondary / supporting text |
| `--color-content-tertiary` | Placeholder and de-emphasized text |
| `--color-content-disabled` | Disabled labels |
| `--color-content-inverse` | Text on dark / inverted surfaces |
| `--color-content-link` | Interactive link color |
| `--color-content-link-hover` | Hovered link color |

**Border** — all strokes, dividers, and outlines

| Token | Usage |
|---|---|
| `--color-border-opaque` | Default visible border |
| `--color-border-transparent` | Subtle / low-contrast border |
| `--color-border-selected` | Selected state outline |
| `--color-border-disabled` | Disabled control border |
| `--color-border-focus` | Keyboard focus ring |

**Color-specific tokens** — each semantic color has a full set of bg / content variants for use in colored components (DataCard badges, Tag, Badge, Alert, etc.)

| Format | Example | Usage |
|---|---|---|
| `--color-{hue}-bg-tertiary` | `--color-green-bg-tertiary` | Very light tinted background |
| `--color-{hue}-bg-secondary` | `--color-blue-bg-secondary` | Medium tinted background |
| `--color-{hue}-content-secondary` | `--color-purple-content-secondary` | Icon / text tint on colored surface |
| `--color-{hue}-content-primary` | `--color-red-content-primary` | Strong icon / text on colored surface |

Available hues: `green`, `yellow`, `matcha`, `purple`, `blue`, `azure`, `red`, `orange`, `pink`, `slate`

**Status** — each has `-fill`, `-bg`, `-border`, and `-content` variants

| Family | Usage |
|---|---|
| `--color-success-*` | Positive / completed states |
| `--color-warning-*` | Caution / needs attention |
| `--color-error-*` | Error / destructive states |
| `--color-info-*` | Informational states |

### Dark Mode

Dark mode values are defined in `src/styles/tokens.css` and activate automatically via OS preference. Manual overrides:

```html
<!-- Force dark -->
<html class="dark">

<!-- Force light -->
<html class="light">
```

---

## Spacing

All spacing uses a **4 px base scale** via `--space-{n}` tokens.

| Token | Value |
|---|---|
| `--space-0` | 0 px |
| `--space-1` | 4 px |
| `--space-2` | 8 px |
| `--space-3` | 12 px |
| `--space-4` | 16 px |
| `--space-5` | 20 px |
| `--space-6` | 24 px |
| `--space-8` | 32 px |
| `--space-10` | 40 px |
| `--space-12` | 48 px |
| `--space-16` | 64 px |
| `--space-20` | 80 px |
| `--space-24` | 96 px |

### Border Radius

| Token | Value | Notes |
|---|---|---|
| `--radius-xs` | 2 px | |
| `--radius-sm` | 4 px | |
| `--radius-button` | 6 px | Standard interactive elements — buttons, inputs, selects |
| `--radius-md` | 8 px | |
| `--radius-lg` | 12 px | |
| `--radius-xl` | 16 px | |
| `--radius-2xl` | 24 px | |
| `--radius-full` | 9999 px | Pill / circle shapes |

### Elevation / Shadow

Two directions × three levels:

| Token | Usage |
|---|---|
| `--shadow-below-low` | Subtle card lift |
| `--shadow-below-md` | Dropdown / popover |
| `--shadow-below-high` | Modal / overlay |
| `--shadow-above-low` | Toast / bottom sheet (low) |
| `--shadow-above-md` | Toast / bottom sheet (mid) |
| `--shadow-above-high` | Toast / bottom sheet (high) |

### Motion

| Token | Value |
|---|---|
| `--duration-fast` | 100 ms |
| `--duration-base` | 150 ms |
| `--duration-slow` | 250 ms |
| `--ease-default` | cubic-bezier(0.16, 1, 0.3, 1) |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) |

---

## Typefaces

Alloy uses **Geist** and **Geist Mono** exclusively. No other fonts should be introduced.

| Token | Typeface |
|---|---|
| `--font-sans` | Geist + system fallbacks |
| `--font-mono` | Geist Mono + system fallbacks |

### Installation

```bash
npm install geist
```

### Import

Add both stylesheets after any CSS reset in your app entry point:

```css
@import 'path/to/alloy/src/styles/tokens.css';
@import 'path/to/alloy/src/styles/typography.css';
```

Or in JS/TS:

```ts
import 'alloy-design-system/styles/tokens.css';
import 'alloy-design-system/styles/typography.css';
```

`typography.css` loads Geist and Geist Mono from the installed `geist` npm package and sets `--font-sans` and `--font-mono` on `:root`.

---

## Icons

78 SVG icons exported as React components from `alloy-design-system`. Each accepts `size` (default 16), `color` (default `currentColor`), and all standard SVG props. Stroke width is auto-scaled by size.

```tsx
import { ChevronDownIcon, AlertTriangleIcon, TeambridgeAIIcon } from 'alloy-design-system';

<ChevronDownIcon size={20} />
<AlertTriangleIcon size={16} color="var(--color-error-content)" />
```

<details>
<summary>Full icon list</summary>

`AlertCircleIcon` `AlertIcon` `AlertTriangleIcon` `Announcement02Icon` `ArrowCircleBrokenRightIcon` `ArrowNarrowDownIcon` `ArrowNarrowRightIcon` `ArrowNarrowUpIcon` `ArrowUpRightIcon` `BankIcon` `BankNote01Icon` `BankNote02Icon` `BarChart02Icon` `Bell01Icon` `BookOpen01Icon` `BookmarkIcon` `Camera01Icon` `CheckCircleDashedIcon` `CheckCircleIcon` `CheckIcon` `ChevronDownIcon` `ChevronLeftIcon` `ChevronRightIcon` `ClipboardCheckIcon` `ClockIcon` `CloudUploadIcon` `Code02Icon` `Coins04Icon` `CoinsHandIcon` `CoinsStacked03Icon` `Columns01Icon` `CreditCard01Icon` `CreditCard02Icon` `CreditCardCheckIcon` `CurrencyDollarIcon` `Edit03Icon` `EyeIcon` `EyeOffIcon` `FeatherIcon` `File04Icon` `File05Icon` `GitBranch01Icon` `Globe01Icon` `Grid01Icon` `Home02Icon` `HomeLineIcon` `Image01Icon` `InfoCircleIcon` `InfoIcon` `LineChartUp01Icon` `LineChartUp02Icon` `ListBulletIcon` `Mail01Icon` `Map01Icon` `MessageDotsSquareIcon` `MessageNotificationCircleIcon` `MessageNotificationSquareIcon` `Microphone02Icon` `MoneyIcon` `PackageIcon` `PieChart01Icon` `PlusIcon` `PlusSquareIcon` `PuzzlePiece01Icon` `PuzzlePiece02Icon` `QrCode01Icon` `SearchSmIcon` `SettingsGearIcon` `SunIcon` `Target04Icon` `TeambridgeAIIcon` `ThumbsDownIcon` `ThumbsUpIcon` `Trash03Icon` `Users03Icon` `VolumeMaxIcon` `XIcon`

</details>

---

## Deployment

The preview app is automatically deployed to **GitHub Pages** when changes are pushed to the `specimens` branch.

- **Live preview:** [yizzy-gif.github.io/alloy-design-system](https://yizzy-gif.github.io/alloy-design-system/)
- **Workflow:** `.github/workflows/deploy-preview.yml`
- **Stack:** Ubuntu, Node 20, Vite build
