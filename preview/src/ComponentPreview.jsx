/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Component Preview
   Responsive shell — left sidebar on desktop, top-nav + drawer on mobile
   ───────────────────────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react'
import ColorTokensPreview      from './ColorTokensPreview.jsx'
import TypographyPreview       from './TypographyPreview.jsx'
import ShadowsPreview          from './ShadowsPreview.jsx'
import SpacingPreview          from './SpacingPreview.jsx'
import ButtonPreview            from './ButtonPreview.jsx'
import ToggleButtonPreview      from './ToggleButtonPreview.jsx'
import TagPreview               from './TagPreview.jsx'
import SegmentedControlPreview  from './SegmentedControlPreview.jsx'
import TabsPreview              from './TabsPreview.jsx'
import ListItemPreview          from './ListItemPreview.jsx'
import BadgePreview             from './BadgePreview.jsx'
import InputPreview             from './InputPreview.jsx'
import PaginationPreview        from './PaginationPreview.jsx'
import AlertPreview             from './AlertPreview.jsx'
import BreadcrumbPreview        from './BreadcrumbPreview.jsx'
import DropdownMenuPreview      from './DropdownMenuPreview.jsx'
import ScrollAreaPreview        from './ScrollAreaPreview.jsx'
import FilterPillPreview        from './FilterPillPreview.jsx'
import ControlsPreview         from './ControlsPreview.jsx'
import TablePreview            from './TablePreview.jsx'
import ChartsPreview           from './ChartsPreview.jsx'
import TooltipPreview          from './TooltipPreview.jsx'
import DataCardPreview            from './DataCardPreview.jsx'
import ValueChangeLabelPreview    from './ValueChangeLabelPreview.jsx'
import DividerPreview             from './DividerPreview.jsx'
import AILoaderPreview         from './AILoaderPreview.jsx'
import AICoreButtonPreview     from './AICoreButtonPreview.jsx'
import DialogPreview           from './DialogPreview.jsx'
import AreaButtonPreview       from './AreaButtonPreview.jsx'
import EyebrowPreview          from './EyebrowPreview.jsx'
import { Eyebrow }             from '../../src/components/Eyebrow/Eyebrow.tsx'

/* ── Component registry (grouped) ───────────────────────────────────────────── */
const GROUPS = [
  {
    label: 'Foundation',
    items: [
      { id: 'colors',     label: 'Colors',          component: ColorTokensPreview },
      { id: 'typography', label: 'Typography',       component: TypographyPreview },
      { id: 'shadows',    label: 'Shadows',          component: ShadowsPreview },
      { id: 'spacing',    label: 'Spacing & Radius', component: SpacingPreview },
    ],
  },
  {
    label: 'Typography',
    items: [
      { id: 'eyebrow', label: 'Eyebrow', component: EyebrowPreview },
    ],
  },
  {
    label: 'Actions',
    items: [
      { id: 'button',        label: 'Button',        component: ButtonPreview },
      { id: 'toggle-button', label: 'Toggle Button', component: ToggleButtonPreview },
      { id: 'area-button',   label: 'Area Button',   component: AreaButtonPreview },
    ],
  },
  {
    label: 'Navigation',
    items: [
      { id: 'tabs',              label: 'Tabs',              component: TabsPreview },
      { id: 'segmented-control', label: 'Segmented Control', component: SegmentedControlPreview },
      { id: 'breadcrumb',        label: 'Breadcrumb',        component: BreadcrumbPreview },
      { id: 'pagination',        label: 'Pagination',        component: PaginationPreview },
      { id: 'filter-pill',       label: 'Filter Pill',       component: FilterPillPreview },
    ],
  },
  {
    label: 'Form',
    items: [
      { id: 'input',    label: 'Input / Field', component: InputPreview },
      { id: 'controls', label: 'Controls',      component: ControlsPreview },
    ],
  },
  {
    label: 'Data Display',
    items: [
      { id: 'data-card',          label: 'Data Card',          component: DataCardPreview },
      { id: 'value-change-label', label: 'Value Change Label', component: ValueChangeLabelPreview },
      { id: 'charts',    label: 'Charts',       component: ChartsPreview },
      { id: 'table',     label: 'Table',        component: TablePreview },
      { id: 'list-item', label: 'List Item',    component: ListItemPreview },
      { id: 'badge',     label: 'Badge',        component: BadgePreview },
      { id: 'tag',       label: 'Tag & Status', component: TagPreview },
    ],
  },
  {
    label: 'Feedback',
    items: [
      { id: 'alert',         label: 'Alert / Toast', component: AlertPreview },
      { id: 'dialog',        label: 'Dialog',        component: DialogPreview },
      { id: 'dropdown-menu', label: 'Dropdown Menu', component: DropdownMenuPreview },
      { id: 'tooltip',       label: 'Tooltip',       component: TooltipPreview },
    ],
  },
  {
    label: 'Layout',
    items: [
      { id: 'divider',     label: 'Divider',     component: DividerPreview },
      { id: 'scroll-area', label: 'Scroll Area', component: ScrollAreaPreview },
    ],
  },
  {
    label: 'Teambridge AI',
    items: [
        { id: 'ai-loader',      label: 'AI Loader',       component: AILoaderPreview },
      { id: 'ai-core-button', label: 'AI Core Button',  component: AICoreButtonPreview },
    ],
  },
]

const ALL_TABS = GROUPS.flatMap(g => g.items)

/* ── Icon atoms — no fixed w/h or strokeWidth; slot CSS applies --icon-stroke-width ── */
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', width: '100%', height: '100%' }}>
    <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" />
  </svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', width: '100%', height: '100%' }}>
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
)
const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" style={{ display: 'block', width: '100%', height: '100%' }}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
)
/* Exact paths from the provided icon files */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', width: '100%', height: '100%' }}>
    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"/>
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', width: '100%', height: '100%' }}>
    <path d="M22 15.8442C20.6866 16.4382 19.2286 16.7688 17.6935 16.7688C11.9153 16.7688 7.23116 12.0847 7.23116 6.30654C7.23116 4.77135 7.5618 3.3134 8.15577 2C4.52576 3.64163 2 7.2947 2 11.5377C2 17.3159 6.68414 22 12.4623 22C16.7053 22 20.3584 19.4742 22 15.8442Z"/>
  </svg>
)

/* Icon slot wrapper — 20px × 20px, matches Alloy LG artwork size */
const IconSlot = ({ children }) => (
  <span style={{ display: 'inline-flex', width: 20, height: 20, flexShrink: 0 }}>
    {children}
  </span>
)

/* ── Shell ───────────────────────────────────────────────────────────────────── */
export default function ComponentPreview() {
  const [activeTab, setActiveTab]   = useState('button')
  const [isDark, setIsDark]         = useState(false)
  const [search, setSearch]         = useState('')
  const [menuOpen, setMenuOpen]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef              = useRef(null)
  const mobileSearchRef             = useRef(null)

  const ActiveComponent = ALL_TABS.find(t => t.id === activeTab)?.component

  const filteredGroups = search.trim()
    ? GROUPS
        .map(g => ({
          ...g,
          items: g.items.filter(t => t.label.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter(g => g.items.length > 0)
    : GROUPS

  /* Focus search input when opened */
  useEffect(() => {
    if (searchOpen && mobileSearchRef.current) mobileSearchRef.current.focus()
    if (!searchOpen) setSearch('')
  }, [searchOpen])

  function selectFromSearch(id) {
    setActiveTab(id)
    setSearchOpen(false)
    setSearch('')
  }

  /* Close drawer on Escape */
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Close drawer when a nav item is selected on mobile */
  function selectTab(id) {
    setActiveTab(id)
    setMenuOpen(false)
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        button:focus, button:focus-visible,
        [role="tab"]:focus, [role="tab"]:focus-visible,
        [role="button"]:focus, [role="button"]:focus-visible {
          outline: none !important; box-shadow: none !important;
        }

        /* ─────────────── Layout ─────────────── */
        .preview-shell {
          display: flex;
          min-height: 100vh;
        }

        /* ─────────────── Desktop sidebar ─────────────── */
        .preview-sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 220px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-primary);
          border-right: 1px solid var(--color-border-opaque);
          padding: 20px 10px;
          overflow-y: auto;
        }

        .preview-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 0 6px;
          flex-shrink: 0;
        }

        .preview-wordmark {
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-content-primary);
          letter-spacing: var(--tracking-tight);
        }

        /* ─────────────── Alloy Button · tertiary · icon-only · LG (48px) ─────────────── */
        .alloy-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-opaque);
          background: var(--color-bg-primary);
          color: var(--color-content-primary);
          cursor: pointer;
          flex-shrink: 0;
          padding: 0;
          transition:
            background-color var(--duration-fast) var(--ease-default),
            border-color     var(--duration-fast) var(--ease-default),
            color            var(--duration-fast) var(--ease-default);
        }
        .alloy-icon-btn:hover {
          background: var(--color-bg-secondary);
          border-color: var(--color-border-hover);
        }
        .alloy-icon-btn:active {
          background: var(--color-bg-tertiary);
        }
        .alloy-icon-btn:focus-visible {
          outline: 2px solid var(--color-border-focus);
          outline-offset: 2px;
        }
        /* Apply the Alloy icon stroke-width token — overrides any SVG attribute */
        .alloy-icon-btn svg,
        .alloy-icon-btn svg * {
          stroke-width: var(--icon-stroke-width, 1.75);
        }

        /* ─────────────── Sidebar search ─────────────── */
        .preview-search-wrap {
          position: relative;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .preview-search-icon-pos {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-content-disabled);
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .preview-search-input {
          width: 100%;
          height: 30px;
          padding: 0 8px 0 28px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-opaque);
          background: var(--color-bg-secondary);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          color: var(--color-content-primary);
          outline: none;
          transition: border-color var(--duration-fast) var(--ease-default);
        }
        .preview-search-input::placeholder { color: var(--color-content-disabled); }
        .preview-search-input:focus { border-color: var(--color-border-selected); }

        /* ─────────────── Nav groups / items ─────────────── */
        .preview-nav-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 18px;
        }
        .preview-nav-group:last-child { margin-bottom: 0; }

        .preview-sidebar-label {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: var(--font-weight-semibold);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--color-content-disabled);
          padding: 0 8px;
          margin-bottom: 2px;
          display: block;
        }

        .preview-nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 6px 10px;
          border-radius: var(--radius-md);
          border: none;
          outline: none;
          background: none;
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-content-tertiary);
          text-align: left;
          cursor: pointer;
          transition:
            background-color var(--duration-fast) var(--ease-default),
            color var(--duration-fast) var(--ease-default);
          white-space: nowrap;
        }
        .preview-nav-item:hover {
          background: var(--color-bg-secondary);
          color: var(--color-content-secondary);
        }
        .preview-nav-item[aria-selected="true"] {
          background: var(--color-bg-tertiary);
          color: var(--color-content-primary);
          font-weight: var(--font-weight-semibold);
        }

        .preview-no-results {
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          color: var(--color-content-disabled);
          padding: 8px;
        }

        /* ─────────────── Content pane ─────────────── */
        .preview-content {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
        }

        /* ─────────────── Mobile top-nav ─────────────── */
        .preview-topnav {
          display: none;
        }

        /* ─────────────── Drawer overlay ─────────────── */
        .preview-drawer-overlay {
          display: none;
        }
        .preview-drawer {
          display: none;
        }

        /* ─────────────── Mobile search bar ─────────────── */
        .preview-mobile-search-bar {
          display: none;
        }

        /* ─────────────── Responsive ─────────────── */
        @media (max-width: 768px) {

          .preview-shell {
            flex-direction: column;
          }

          /* Hide sidebar on mobile */
          .preview-sidebar {
            display: none;
          }

          /* Show top-nav */
          .preview-topnav {
            display: flex;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 8px 16px;
            background: var(--color-bg-primary);
            border-bottom: 1px solid var(--color-border-opaque);
            gap: 8px;
            flex-shrink: 0;
          }

          .preview-topnav-wordmark {
            font-family: var(--font-sans);
            font-size: var(--text-lg);
            font-weight: var(--font-weight-semibold);
            line-height: var(--line-height-snug);
            color: var(--color-content-primary);
            letter-spacing: var(--tracking-tight);
            flex: 1;
          }

          .preview-topnav-actions {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          /* Mobile top-nav icon buttons — same 48px LG size as desktop */

          /* Mobile search bar (full-width, below top-nav) */
          .preview-mobile-search-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: var(--color-bg-primary);
            border-bottom: 1px solid var(--color-border-opaque);
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            z-index: 99;
            opacity: 1;
            transform: translateY(0);
            transition:
              opacity var(--duration-base) var(--ease-default),
              transform var(--duration-base) var(--ease-default);
          }
          .preview-mobile-search-bar.hidden {
            opacity: 0;
            transform: translateY(-6px);
            pointer-events: none;
          }
          .preview-mobile-search-wrap {
            position: relative;
            flex: 1;
          }
          .preview-mobile-search-input {
            width: 100%;
            /* Alloy MD size: 36px height */
            height: 36px;
            padding: 0 var(--space-3) 0 36px;
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border-selected);
            background: var(--color-bg-secondary);
            font-family: var(--font-sans);
            /* 16px prevents iOS auto-zoom on focus */
            font-size: 16px;
            color: var(--color-content-primary);
            outline: none;
            box-sizing: border-box;
          }
          .preview-mobile-search-input::placeholder { color: var(--color-content-disabled); }
          .preview-mobile-search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-content-disabled);
            pointer-events: none;
            display: flex;
            align-items: center;
            width: 16px;
            height: 16px;
          }

          /* Search results dropdown */
          .preview-search-dropdown {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            background: var(--color-bg-primary);
            border: 1px solid var(--color-border-opaque);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-below-md);
            z-index: 110;
            overflow: hidden;
            max-height: 60vh;
            overflow-y: auto;
          }
          .preview-search-dropdown-group-label {
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: var(--font-weight-semibold);
            letter-spacing: var(--tracking-wider);
            text-transform: uppercase;
            color: var(--color-content-disabled);
            padding: 10px 14px 4px;
            display: block;
          }
          .preview-search-dropdown-item {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 9px 14px;
            border: none;
            background: none;
            font-family: var(--font-sans);
            font-size: var(--text-sm);
            font-weight: var(--font-weight-medium);
            color: var(--color-content-primary);
            text-align: left;
            cursor: pointer;
            transition: background var(--duration-fast) var(--ease-default);
          }
          .preview-search-dropdown-item:hover {
            background: var(--color-bg-secondary);
          }
          .preview-search-dropdown-empty {
            font-family: var(--font-sans);
            font-size: var(--text-sm);
            color: var(--color-content-disabled);
            padding: 16px 14px;
            text-align: center;
          }

          /* Drawer overlay (backdrop) */
          .preview-drawer-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.35);
            z-index: 200;
            opacity: 0;
            pointer-events: none;
            transition: opacity var(--duration-base) var(--ease-default);
          }
          .preview-drawer-overlay.open {
            opacity: 1;
            pointer-events: all;
          }

          /* Drawer panel */
          .preview-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            background: var(--color-bg-primary);
            z-index: 201;
            padding: 0;
            opacity: 0;
            transform: translateY(-48px);
            visibility: hidden;
            transition: opacity 300ms var(--ease-in), transform 300ms var(--ease-in), visibility 0ms linear 300ms;
          }
          .preview-drawer.open {
            opacity: 1;
            transform: translateY(0);
            visibility: visible;
            transition: opacity 420ms var(--ease-default), transform 420ms var(--ease-default), visibility 0ms linear 0ms;
          }

          .preview-drawer-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-bottom: 1px solid var(--color-border-opaque);
            flex-shrink: 0;
          }
          .preview-drawer-search-wrap {
            position: relative;
            flex: 1;
          }
          .preview-drawer-search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-content-disabled);
            pointer-events: none;
            display: flex;
            align-items: center;
            width: 16px;
            height: 16px;
          }
          .preview-drawer-search-input {
            width: 100%;
            height: 36px;
            padding: 0 var(--space-3) 0 36px;
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border-opaque);
            background: var(--color-bg-secondary);
            font-family: var(--font-sans);
            font-size: 16px;
            color: var(--color-content-primary);
            outline: none;
            box-sizing: border-box;
            transition: border-color var(--duration-fast) var(--ease-default);
          }
          .preview-drawer-search-input::placeholder { color: var(--color-content-disabled); }
          .preview-drawer-search-input:focus { border-color: var(--color-border-selected); }

          .preview-drawer-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Drawer-specific nav overrides */
          .preview-drawer-body .preview-nav-group {
            width: 100%;
            max-width: 320px;
            align-items: center;
          }
          .preview-drawer-label {
            text-align: center;
          }
          .preview-drawer-body .preview-nav-item {
            justify-content: center;
            text-align: center;
            font-size: var(--text-base);
            padding: 10px 16px;
          }

          .preview-content {
            flex: 1;
            min-width: 0;
            overflow-y: auto;
          }
        }
      `}</style>

      <div className={isDark ? 'preview-shell dark' : 'preview-shell'}>

        {/* ── Desktop sidebar ────────────────────────────────────────────── */}
        <nav className="preview-sidebar" role="tablist" aria-label="Component previews">
          <div className="preview-sidebar-header">
            <span className="preview-wordmark">Alloy</span>
            <button
              className="alloy-icon-btn"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setIsDark(d => !d)}
            >
              <IconSlot>{isDark ? <SunIcon /> : <MoonIcon />}</IconSlot>
            </button>
          </div>

          {/* Search */}
          <div className="preview-search-wrap">
            <span className="preview-search-icon-pos" style={{ width: 14, height: 14 }}><SearchIcon /></span>
            <input
              ref={searchInputRef}
              className="preview-search-input"
              type="search"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filteredGroups.length === 0 && <p className="preview-no-results">No results</p>}

          {filteredGroups.map(group => (
            <div key={group.label} className="preview-nav-group">
              <span className="preview-sidebar-label">{group.label}</span>
              {group.items.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  className="preview-nav-item"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Mobile top-nav ─────────────────────────────────────────────── */}
        <header className="preview-topnav" aria-label="Component previews navigation">
          <span className="preview-topnav-wordmark">Alloy Design System</span>
          <div className="preview-topnav-actions">
            {/* Dark/light toggle */}
            <button
              className="alloy-icon-btn"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setIsDark(d => !d)}
            >
              <IconSlot>{isDark ? <SunIcon /> : <MoonIcon />}</IconSlot>
            </button>
            {/* Hamburger */}
            <button
              className="alloy-icon-btn"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <IconSlot><HamburgerIcon /></IconSlot>
            </button>
          </div>
        </header>

        {/* Mobile search bar (slides in below top-nav) */}
        <div className={`preview-mobile-search-bar${searchOpen ? '' : ' hidden'}`}>
          <div className="preview-mobile-search-wrap">
            <span className="preview-mobile-search-icon"><SearchIcon /></span>
            <input
              ref={mobileSearchRef}
              className="preview-mobile-search-input"
              type="search"
              placeholder="Search components…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Dropdown — shown when search has text */}
            {search.trim() && (
              <div className="preview-search-dropdown" role="listbox">
                {filteredGroups.length === 0 ? (
                  <p className="preview-search-dropdown-empty">No results for "{search}"</p>
                ) : (
                  filteredGroups.map(group => (
                    <div key={group.label}>
                      <span className="preview-search-dropdown-group-label">{group.label}</span>
                      {group.items.map(tab => (
                        <button
                          key={tab.id}
                          role="option"
                          className="preview-search-dropdown-item"
                          aria-selected={activeTab === tab.id}
                          onMouseDown={e => { e.preventDefault(); selectFromSearch(tab.id) }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Drawer overlay ─────────────────────────────────────────────── */}
        <div
          className={`preview-drawer-overlay${menuOpen ? ' open' : ''}`}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />

        {/* ── Drawer panel ───────────────────────────────────────────────── */}
        <div
          className={`preview-drawer${menuOpen ? ' open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Component navigation"
        >
          <div className="preview-drawer-header">
            <div className="preview-drawer-search-wrap">
              <span className="preview-drawer-search-icon"><SearchIcon /></span>
              <input
                className="preview-drawer-search-input"
                type="search"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
            <button
              className="alloy-icon-btn"
              aria-label="Close navigation"
              onClick={() => { setMenuOpen(false); setSearch('') }}
            >
              <IconSlot><CloseIcon /></IconSlot>
            </button>
          </div>

          <div className="preview-drawer-body">
            {filteredGroups.length === 0 && (
              <p className="preview-no-results">No results</p>
            )}
            {filteredGroups.map(group => (
              <div key={group.label} className="preview-nav-group">
                <Eyebrow className="preview-drawer-label">{group.label}</Eyebrow>
                {group.items.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    className="preview-nav-item"
                    aria-selected={activeTab === tab.id}
                    onClick={() => { selectTab(tab.id); setSearch('') }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Active preview ─────────────────────────────────────────────── */}
        <div className="preview-content">
          {ActiveComponent && <ActiveComponent />}
        </div>

      </div>
    </>
  )
}
