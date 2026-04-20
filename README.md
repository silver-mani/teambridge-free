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
│   │   ├── Charts/
│   │   ├── Checkbox/
│   │   ├── CheckboxGroup/
│   │   ├── DataCard/
│   │   ├── Divider/
│   │   ├── DropdownMenu/
│   │   ├── Eyebrow/
│   │   ├── FileUploader/
│   │   ├── FilterPill/
│   │   ├── Input/
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
│   │   └── icons/
│   ├── tokens/
│   ├── styles/
│   └── index.ts
├── preview/
├── specimens/
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

Open `http://localhost:5180`

### 3. Build the library

```bash
npm run build
```

### 4. Use in a project

```tsx
import { Button, DataCard, ValueChangeLabel } from 'alloy-design-system';
import 'alloy-design-system/styles/tokens.css';
import 'alloy-design-system/styles/typography.css';
```
