import { useEffect, useState } from 'react'
import './sagehcm.css'
import { MenuIcon } from './icons.jsx'
import { SAGE_MODULES, getModule } from './modules.js'
import { PlusIcon }        from '../../../../src/components/icons/PlusIcon.tsx'
import { SettingsGearIcon } from '../../../../src/components/icons/SettingsGearIcon.tsx'
import { Bell01Icon }      from '../../../../src/components/icons/Bell01Icon.tsx'
import { ChevronDownIcon } from '../../../../src/components/icons/ChevronDownIcon.tsx'

/* ──────────────────────────────────────────────────────────────────────
 * SageHcmChrome — the host product's frame.
 *
 * Everything Sage owns lives here: the near-black top bar, the charcoal
 * module rail, and the product switcher that hangs off it. Modules drop
 * their own nav into `railItems` and their page into `children`, so the
 * frame is identical whether you're in Self Service or in Work. That
 * sameness *is* the white-label: the customer can't tell where Sage
 * stops and the embedded product starts.
 * ────────────────────────────────────────────────────────────────────── */
export default function SageHcmChrome({
  moduleId = 'self-service',
  railItems = [],
  activeItem,
  onSelectItem = () => {},
  onNavigate = () => {},
  user,
  bare = false,
  children,
}) {
  const [switcherOpen, setSwitcherOpen] = useState(false)
  // Rail groups that are expanded. Seeded from the module's own config so
  // Self Service opens on "Time" the way Sage's does.
  const [expanded, setExpanded] = useState(() =>
    new Set(railItems.filter(i => i.defaultExpanded).map(i => i.id)))

  // A deep link can land on a view whose group is collapsed — union in any
  // group the module has since marked default-expanded, without closing
  // anything the user opened by hand.
  const defaultOpenKey = railItems.filter(i => i.defaultExpanded).map(i => i.id).join('|')
  useEffect(() => {
    if (!defaultOpenKey) return
    setExpanded(prev => {
      const wanted = defaultOpenKey.split('|')
      if (wanted.every(id => prev.has(id))) return prev
      const next = new Set(prev)
      wanted.forEach(id => next.add(id))
      return next
    })
  }, [defaultOpenKey])

  useEffect(() => {
    if (!switcherOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setSwitcherOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [switcherOpen])

  // Collapse the switcher whenever the module changes — otherwise it
  // stays hanging over the new module's rail after a jump.
  useEffect(() => { setSwitcherOpen(false) }, [moduleId])

  const activeModule = getModule(moduleId)
  const { Icon: ModuleIcon } = activeModule

  const toggleGroup = (id) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const pickModule = (mod) => {
    setSwitcherOpen(false)
    if (mod.route) onNavigate(mod.route)
  }

  return (
    <div className="sagehcm" data-sage-module={moduleId}>
      <header className="shcm-topbar">
        <button
          type="button"
          className="shcm-iconbtn"
          data-open={switcherOpen}
          aria-label="Switch Sage product"
          aria-expanded={switcherOpen}
          onClick={() => setSwitcherOpen(o => !o)}
        >
          <MenuIcon size={20} />
        </button>

        <button
          type="button"
          className="shcm-wordmark"
          onClick={() => onNavigate('/sage-hcm')}
          aria-label="Sage home"
        >
          <span className="shcm-wordmark-text">Sage</span>
        </button>

        <span className="shcm-topbar-rule" aria-hidden="true" />
        <span className="shcm-topbar-product">{activeModule.label}</span>

        <div className="shcm-topbar-spacer" />

        <div className="shcm-topbar-actions">
          <button type="button" className="shcm-add" aria-label="Create">
            <PlusIcon size={16} />
          </button>
          <button type="button" className="shcm-iconbtn" aria-label="Settings">
            <SettingsGearIcon size={18} />
          </button>
          <button type="button" className="shcm-iconbtn shcm-bell" aria-label="Notifications">
            <Bell01Icon size={18} />
            <span className="shcm-bell-badge">2</span>
          </button>
          <button type="button" className="shcm-avatar-btn" aria-label="Account">
            <span className="shcm-avatar">{user?.initials ?? 'DD'}</span>
            <ChevronDownIcon size={14} />
          </button>
        </div>
      </header>

      <div className="shcm-body">
        <aside className="shcm-rail" aria-label="Module navigation">
          <button
            type="button"
            className="shcm-rail-module"
            data-open={switcherOpen}
            aria-expanded={switcherOpen}
            onClick={() => setSwitcherOpen(o => !o)}
          >
            <span className="shcm-rail-module-icon"><ModuleIcon size={18} /></span>
            <span className="shcm-rail-module-label">{activeModule.label}</span>
          </button>

          <nav className="shcm-rail-nav">
            {railItems.map(item => {
              const isGroup   = Array.isArray(item.children) && item.children.length > 0
              const isOpen    = expanded.has(item.id)
              const isActive  = item.id === activeItem
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    className="shcm-rail-item"
                    data-active={isActive}
                    data-expanded={isGroup && isOpen}
                    aria-current={isActive ? 'page' : undefined}
                    aria-expanded={isGroup ? isOpen : undefined}
                    onClick={() => (isGroup ? toggleGroup(item.id) : onSelectItem(item.id))}
                  >
                    {item.Icon && (
                      <span className="shcm-rail-item-icon"><item.Icon size={17} /></span>
                    )}
                    <span className="shcm-rail-item-label">{item.label}</span>
                    {isGroup && (
                      <span className="shcm-rail-item-chevron"><ChevronDownIcon size={13} /></span>
                    )}
                  </button>

                  {isGroup && isOpen && (
                    <div className="shcm-rail-sub">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          className="shcm-rail-subitem"
                          data-active={child.id === activeItem}
                          aria-current={child.id === activeItem ? 'page' : undefined}
                          onClick={() => onSelectItem(child.id)}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {switcherOpen && (
          <>
            <div
              className="shcm-switcher-scrim"
              aria-hidden="true"
              onClick={() => setSwitcherOpen(false)}
            />
            <div className="shcm-switcher" role="menu" aria-label="Sage products">
              {SAGE_MODULES.map(mod => (
                <button
                  key={mod.id}
                  type="button"
                  role="menuitem"
                  className="shcm-switcher-item"
                  data-active={mod.id === moduleId}
                  onClick={() => pickModule(mod)}
                >
                  <span className="shcm-switcher-item-icon"><mod.Icon size={17} /></span>
                  <span>{mod.label}</span>
                  {mod.isNew && <span className="shcm-switcher-new">New</span>}
                </button>
              ))}
            </div>
          </>
        )}

        <div className={`shcm-content ${bare ? 'shcm-content--bare' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
