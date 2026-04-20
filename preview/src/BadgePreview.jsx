/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Badge Preview
   Variants · Context usage · Dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Icons ────────────────────────────────────────────────────────────────────── */
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12H16L14 15H10L8 12H2M22 12V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V12M22 12L18.67 4.74C18.4315 4.29117 17.9731 4.00347 17.47 4H6.53C6.02694 4.00347 5.5685 4.29117 5.33 4.74L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12.0001 22C13.0146 22 13.9409 21.6224 14.6461 21M18.0001 8C18.0001 6.4087 17.3680 4.88258 16.2428 3.75736C15.1176 2.63214 13.5914 2 12.0001 2C10.4088 2 8.88265 2.63214 7.75744 3.75736C6.63222 4.88258 6.00008 6.4087 6.00008 8C6.00008 11.0902 5.22056 13.206 4.34976 14.6054C3.61513 15.7859 3.24781 16.3761 3.26157 16.5408C3.27695 16.7231 3.31568 16.7926 3.46253 16.9016C3.59521 17 4.19334 17 5.38961 17H18.6106C19.8069 17 20.405 17 20.5377 16.9016C20.6845 16.7926 20.7233 16.7231 20.7387 16.5408C20.7524 16.3761 20.3851 15.7859 19.6505 14.6054C18.7797 13.206 18.0001 11.0902 18.0001 8Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2.26946V6.4C14 6.96005 14 7.24008 14.109 7.45399C14.2049 7.64215 14.3578 7.79513 14.546 7.89101C14.7599 8 15.0399 8 15.6 8H19.7305M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 18.99C1.55 20.1 2.45 21 3.56 21H20.44C21.55 21 22.45 20.1 22.45 18.99C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.36 3.33 12.73 3 12 3C11.27 3 10.64 3.33 10.29 3.86Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Icon slot ────────────────────────────────────────────────────────────────── */
const Icon = ({ children, size = 16, color }) => (
  <span className="alloy-icon-slot" style={{ width: size, height: size, color: color || 'currentColor' }}>
    {children}
  </span>
)

/* ── Badge (mirrors Alloy Badge component) ────────────────────────────────────── */
const Badge = ({ children, variant = 'neutral' }) => (
  <span className={`alloy-badge alloy-badge-${variant}`}>{children}</span>
)

/* ── Minimal ListItem for context demos ───────────────────────────────────────── */
function ListItem({ label, description, leadingSlot, trailingSlot, divider = true }) {
  return (
    <div className={`li-root li-md${divider ? ' li-divider' : ''}`}>
      {leadingSlot && <div className="li-leading">{leadingSlot}</div>}
      <div className="li-content">
        <span className="li-label">{label}</span>
        {description && <span className="li-desc">{description}</span>}
      </div>
      {trailingSlot && <div className="li-trailing">{trailingSlot}</div>}
    </div>
  )
}

/* ── Tab row for context demos ────────────────────────────────────────────────── */
function TabRow({ tabs, active, onSelect }) {
  return (
    <div className="badge-tab-row">
      {tabs.map(t => (
        <button
          key={t.value}
          className={`badge-tab${active === t.value ? ' badge-tab-active' : ''}`}
          onClick={() => onSelect(t.value)}
        >
          <span>{t.label}</span>
          {t.badge !== undefined && t.badge}
        </button>
      ))}
      <div className="badge-tab-indicator" />
    </div>
  )
}

/* ── Section / helpers ────────────────────────────────────────────────────────── */
function Section({ title, note, children, isMobile }) {
  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', width: 120, flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

/* ── Preview ──────────────────────────────────────────────────────────────────── */
export default function BadgePreview() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('inbox')

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Icon slot ─ */
        .alloy-icon-slot { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .alloy-icon-slot > svg,
        .alloy-icon-slot > svg * { stroke-width: 1.75; }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }

        /* ─ Alloy Badge ─ */
        .alloy-badge {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 20px; height: 20px; padding: 0 calc(var(--space-1) + 2px);
          border-radius: var(--radius-full);
          font-family: var(--font-sans); font-size: var(--text-xs);
          font-weight: var(--font-weight-medium); line-height: 1;
          white-space: nowrap; box-sizing: border-box; flex-shrink: 0; user-select: none;
        }
        .alloy-badge-neutral { background: var(--color-bg-tertiary);        color: var(--color-content-secondary);        }
        .alloy-badge-primary { background: var(--color-bg-inverse-primary);  color: var(--color-content-inverse-primary);  }
        .alloy-badge-success { background: var(--color-success-bg);          color: var(--color-success-content);          }
        .alloy-badge-warning { background: var(--color-warning-bg);          color: var(--color-warning-content);          }
        .alloy-badge-error   { background: var(--color-error-bg);            color: var(--color-error-content);            }
        .alloy-badge-info    { background: var(--color-info-bg);             color: var(--color-info-content);             }

        /* ─ Minimal ListItem ─ */
        .li-root { position: relative; display: flex; align-items: center; gap: var(--space-3); min-height: 48px; padding: 10px var(--space-4); background: transparent; border-bottom: 1px solid transparent; }
        .li-md   { --li-label-size: var(--text-sm); --li-desc-size: var(--text-xs); }
        .li-divider { border-bottom-color: var(--color-border-opaque); }
        .li-leading  { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .li-trailing { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .li-content  { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
        .li-label { font-family: var(--font-sans); font-size: var(--li-label-size, var(--text-sm)); font-weight: var(--font-weight-medium); color: var(--color-content-primary); line-height: var(--line-height-snug); }
        .li-desc  { font-family: var(--font-sans); font-size: var(--li-desc-size, var(--text-xs)); font-weight: var(--font-weight-regular); color: var(--color-content-tertiary); line-height: var(--line-height-snug); }

        /* ─ Tab row context demo ─ */
        .badge-tab-row {
          display: flex; align-items: stretch; gap: 20px;
          height: 48px; position: relative;
          border-bottom: 1px solid var(--color-border-opaque);
        }
        .badge-tab {
          display: inline-flex; align-items: center; gap: var(--space-2); padding: 0;
          border: none; background: transparent; cursor: pointer;
          font-family: var(--font-sans); font-size: var(--text-sm);
          font-weight: var(--font-weight-regular); color: var(--color-content-secondary);
          white-space: nowrap; position: relative;
          transition: color 120ms ease;
        }
        .badge-tab:hover { color: var(--color-content-primary); }
        .badge-tab-active {
          color: var(--color-content-primary);
          font-weight: var(--font-weight-medium);
        }
        .badge-tab-active::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 2px; background: var(--color-border-selected); border-radius: 1px;
        }

      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Data Display</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Badge</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>6 variants · count · label · inline context · dark mode</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 — Variants */}
          <Section title="Variants" note="6 semantic variants — all driven by color tokens, consistent pill shape" isMobile={isMobile}>
            <Row label="neutral">
              <Badge variant="neutral">12</Badge>
              <Badge variant="neutral">3</Badge>
              <Badge variant="neutral">Beta</Badge>
              <Badge variant="neutral">New</Badge>
              <Badge variant="neutral">Pro</Badge>
            </Row>
            <Row label="primary">
              <Badge variant="primary">12</Badge>
              <Badge variant="primary">3</Badge>
              <Badge variant="primary">99+</Badge>
            </Row>
            <Row label="success">
              <Badge variant="success">Active</Badge>
              <Badge variant="success">Deployed</Badge>
              <Badge variant="success">Verified</Badge>
            </Row>
            <Row label="warning">
              <Badge variant="warning">Review</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="warning">Expiring</Badge>
            </Row>
            <Row label="error">
              <Badge variant="error">Failed</Badge>
              <Badge variant="error">Overdue</Badge>
              <Badge variant="error">3 errors</Badge>
            </Row>
            <Row label="info">
              <Badge variant="info">Beta</Badge>
              <Badge variant="info">Preview</Badge>
              <Badge variant="info">Syncing</Badge>
            </Row>
          </Section>

          {/* 2 — Count vs Label */}
          <Section title="Count vs Label" note="Same component — numeric counts and text labels both fit the 20px pill" isMobile={isMobile}>
            <Row label="counts">
              <Badge>1</Badge>
              <Badge>9</Badge>
              <Badge>12</Badge>
              <Badge>99</Badge>
              <Badge>99+</Badge>
              <Badge variant="primary">256</Badge>
            </Row>
            <Row label="short labels">
              <Badge>New</Badge>
              <Badge>Pro</Badge>
              <Badge variant="info">Beta</Badge>
              <Badge variant="warning">Soon</Badge>
              <Badge variant="success">Live</Badge>
              <Badge variant="error">Off</Badge>
            </Row>
            <Row label="longer labels">
              <Badge>Read only</Badge>
              <Badge variant="info">Early access</Badge>
              <Badge variant="warning">Needs review</Badge>
              <Badge variant="error">Sync failed</Badge>
              <Badge variant="success">All systems go</Badge>
            </Row>
          </Section>

          {/* 3 — In Tab context */}
          <Section title="In Tab Bar" note="Pass <Badge> to the Tabs trailingBadge prop — the tabBadge wrapper is a flex positioner only" isMobile={isMobile}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>underline · neutral</p>
              <TabRow
                active={activeTab}
                onSelect={setActiveTab}
                tabs={[
                  { value: 'inbox',    label: 'Inbox',    badge: <Badge>12</Badge> },
                  { value: 'drafts',   label: 'Drafts',   badge: <Badge>3</Badge>  },
                  { value: 'sent',     label: 'Sent'                               },
                  { value: 'archived', label: 'Archived'                           },
                ]}
              />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>underline · semantic variants</p>
              <TabRow
                active="files"
                onSelect={() => {}}
                tabs={[
                  { value: 'files',   label: 'Files'                        },
                  { value: 'issues',  label: 'Issues',  badge: <Badge variant="error">4</Badge>  },
                  { value: 'builds',  label: 'Builds',  badge: <Badge variant="success">Passing</Badge> },
                  { value: 'preview', label: 'Preview', badge: <Badge variant="info">Beta</Badge>      },
                ]}
              />
            </div>
          </Section>

          {/* 4 — In List Item context */}
          <Section title="In List Item" note="Pass <Badge> as the trailingSlot or use trailingAction='badge' on ListItem" isMobile={isMobile}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>count badges</p>
                <div style={{ border: '1px solid var(--color-border-opaque)', borderRadius: 10, overflow: 'hidden' }}>
                  <ListItem label="Inbox" description="Unread messages" leadingSlot={<Icon size={16}><InboxIcon /></Icon>} trailingSlot={<Badge variant="primary">12</Badge>} />
                  <ListItem label="Mentions" description="You were tagged" leadingSlot={<Icon size={16}><BellIcon /></Icon>} trailingSlot={<Badge>3</Badge>} />
                  <ListItem label="Shared with me" description="Collaborative files" leadingSlot={<Icon size={16}><FileIcon /></Icon>} trailingSlot={<Badge>47</Badge>} />
                  <ListItem label="All messages" description="Complete history" leadingSlot={<Icon size={16}><UserIcon /></Icon>} trailingSlot={<Icon size={16} color="var(--color-content-tertiary)"><ChevronRightIcon /></Icon>} divider={false} />
                </div>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 8 }}>label badges</p>
                <div style={{ border: '1px solid var(--color-border-opaque)', borderRadius: 10, overflow: 'hidden' }}>
                  <ListItem label="AI Compose" description="Write with AI assistance" leadingSlot={<Icon size={16}><FileIcon /></Icon>} trailingSlot={<Badge variant="info">Beta</Badge>} />
                  <ListItem label="Early access features" description="Preview unreleased tools" leadingSlot={<Icon size={16}><CheckIcon /></Icon>} trailingSlot={<Badge variant="warning">Soon</Badge>} />
                  <ListItem label="Priority support" description="Faster response times" leadingSlot={<Icon size={16}><BellIcon /></Icon>} trailingSlot={<Badge variant="success">Active</Badge>} />
                  <ListItem label="Legacy API" description="v1 endpoints" leadingSlot={<Icon size={16}><AlertIcon /></Icon>} trailingSlot={<Badge variant="error">Deprecated</Badge>} divider={false} />
                </div>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Badge v1</span>
        </div>

      </div>
    </>
  )
}
