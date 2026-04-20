/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · ScrollArea Preview
   Vertical · Horizontal · Both axes · Dark mode
   ───────────────────────────────────────────────────────────────────────────── */

import { useRef, useState, useEffect, useCallback } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Inline ScrollArea — direct DOM mutation for lag-free thumb tracking ──── */

function ScrollArea({ orientation = 'vertical', hideDelay = 1200, style, children }) {
  const viewportRef = useRef(null)
  const vThumbRef   = useRef(null)
  const hThumbRef   = useRef(null)
  const hideTimer   = useRef(undefined)
  const rafId       = useRef(0)

  // Only visible triggers a React render — position is updated via direct DOM
  const [visible, setVisible] = useState(false)
  const [showV, setShowV]     = useState(false)
  const [showH, setShowH]     = useState(false)

  const showV_axis = orientation === 'vertical'   || orientation === 'both'
  const showH_axis = orientation === 'horizontal' || orientation === 'both'

  const showScrollbars = useCallback(() => {
    setVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), hideDelay)
  }, [hideDelay])

  const updateThumbs = useCallback(() => {
    const el = viewportRef.current
    if (!el) return

    if (showV_axis) {
      const ratio     = el.clientHeight / el.scrollHeight
      const size      = Math.max(ratio * 100, 8)
      const maxScroll = el.scrollHeight - el.clientHeight
      const offset    = maxScroll > 0 ? (el.scrollTop / maxScroll) * (100 - size) : 0
      const thumb     = vThumbRef.current
      if (thumb) { thumb.style.height = `${size}%`; thumb.style.top = `${offset}%` }
      setShowV(ratio < 0.99)
    }

    if (showH_axis) {
      const ratio     = el.clientWidth / el.scrollWidth
      const size      = Math.max(ratio * 100, 8)
      const maxScroll = el.scrollWidth - el.clientWidth
      const offset    = maxScroll > 0 ? (el.scrollLeft / maxScroll) * (100 - size) : 0
      const thumb     = hThumbRef.current
      if (thumb) { thumb.style.width = `${size}%`; thumb.style.left = `${offset}%` }
      setShowH(ratio < 0.99)
    }
  }, [showV_axis, showH_axis])

  useEffect(() => {
    updateThumbs()
    const el = viewportRef.current
    if (!el) return

    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        updateThumbs()
        showScrollbars()
      })
    }

    const ro = new ResizeObserver(() => updateThumbs())
    el.addEventListener('scroll', onScroll, { passive: true })
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [updateThumbs, showScrollbars])

  const trackBase = {
    position: 'absolute', padding: 4,
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: 'opacity 150ms ease-out',
    zIndex: 10,
  }

  const thumbBase = {
    position: 'absolute',
    background: 'var(--color-scrollbar-thumb)',
    borderRadius: 'var(--radius-full)',
    // No position/size transitions — updated every rAF, transitions add lag
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div
        ref={viewportRef}
        onMouseEnter={() => { updateThumbs(); showScrollbars() }}
        style={{
          width: '100%', height: '100%',
          overflowY: showV_axis ? 'scroll' : 'hidden',
          overflowX: showH_axis ? 'scroll' : 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        {children}
      </div>

      {/* Vertical track */}
      {showV_axis && showV && (
        <div aria-hidden="true" style={{ ...trackBase, top: 0, right: 0, bottom: 0, width: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div ref={vThumbRef} style={{ ...thumbBase, width: 4, left: '50%', transform: 'translateX(-50%)' }} />
          </div>
        </div>
      )}

      {/* Horizontal track */}
      {showH_axis && showH && (
        <div aria-hidden="true" style={{ ...trackBase, left: 0, right: 0, bottom: 0, height: 12, display: 'flex', flexDirection: 'row' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div ref={hThumbRef} style={{ ...thumbBase, height: 4, top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Dummy content helpers ────────────────────────────────────────────────── */

function LoremRows({ count = 24 }) {
  return (
    <div style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: 'var(--color-bg-tertiary)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, background: 'var(--color-bg-tertiary)', borderRadius: 4, marginBottom: 6, width: `${60 + (i * 13) % 35}%` }} />
            <div style={{ height: 8, background: 'var(--color-bg-tertiary)', borderRadius: 4, width: `${35 + (i * 17) % 30}%`, opacity: 0.6 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function WideContent() {
  const cols = ['Name', 'Role', 'Department', 'Location', 'Start date', 'Status', 'Manager', 'Email', 'Phone']
  return (
    <div style={{ padding: '16px 20px', fontFamily: 'var(--font-sans)' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} style={{ padding: '6px 24px 6px 0', textAlign: 'left', color: 'var(--color-content-secondary)', fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border-opaque)' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {['Alice Chen', 'Ben Park', 'Chris Doe', 'Dana Liu', 'Eva Müller', 'Frank Brown'].map((name, i) => (
            <tr key={name}>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-primary)', fontWeight: 'var(--font-weight-medium)' }}>{name}</td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-secondary)' }}>{['Engineer', 'Designer', 'PM', 'Engineer', 'Designer', 'PM'][i]}</td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-secondary)' }}>{['Product', 'Design', 'Product', 'Platform', 'Design', 'Growth'][i]}</td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-secondary)' }}>{['San Francisco', 'New York', 'Remote', 'London', 'Berlin', 'Singapore'][i]}</td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-secondary)' }}>{['Jan 2022', 'Mar 2021', 'Jul 2023', 'Sep 2020', 'Feb 2022', 'Nov 2023'][i]}</td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap' }}>
                <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)', background: 'var(--color-success-bg)', color: 'var(--color-success-content)' }}>Active</span>
              </td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-secondary)' }}>{['Sarah Kim', 'Tom Lee', 'Sarah Kim', 'James Wu', 'Tom Lee', 'Sarah Kim'][i]}</td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-link)' }}>{name.toLowerCase().replace(' ', '.') + '@company.com'}</td>
              <td style={{ padding: '8px 24px 8px 0', whiteSpace: 'nowrap', color: 'var(--color-content-secondary)' }}>+1 (555) 0{100 + i * 13}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Section wrapper ──────────────────────────────────────────────────────── */

function Section({ label, description, children, isMobile }) {
  return (
    <div style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-content-disabled)', textTransform: 'uppercase', margin: '0 0 4px' }}>
          {label}
        </p>
        {description && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)', margin: '4px 0 0' }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

/* ── Preview ──────────────────────────────────────────────────────────────── */

export default function ScrollAreaPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        .sa-demo-box {
          border: 1px solid var(--color-border-opaque);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-bg-primary);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
        padding: isMobile ? '24px 16px' : '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--color-content-primary)',
            margin: 0,
          }}>
            Scroll Area
          </h1>
        </div>

        {/* Vertical */}
        <Section
          label="Vertical"
          description="Scrolls along the Y-axis. Scrollbar fades in on scroll, out after 1.2 s."
          isMobile={isMobile}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 16 : 24 }}>
            <div style={{ flex: '1 1 240px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', margin: '0 0 8px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>240 × 280</p>
              <div className="sa-demo-box" style={{ maxWidth: 240, width: '100%', height: 280 }}>
                <ScrollArea orientation="vertical" style={{ width: '100%', height: '100%' }}>
                  <LoremRows count={20} />
                </ScrollArea>
              </div>
            </div>
            <div style={{ flex: '1 1 320px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', margin: '0 0 8px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>320 × 400</p>
              <div className="sa-demo-box" style={{ maxWidth: 320, width: '100%', height: 400 }}>
                <ScrollArea orientation="vertical" style={{ width: '100%', height: '100%' }}>
                  <LoremRows count={32} />
                </ScrollArea>
              </div>
            </div>
          </div>
        </Section>

        {/* Horizontal */}
        <Section
          label="Horizontal"
          description="Scrolls along the X-axis — useful for wide tables and kanban boards."
          isMobile={isMobile}
        >
          <div style={{ overflowX: 'auto' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', margin: '0 0 8px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Full width × 180</p>
            <div className="sa-demo-box" style={{ width: '100%', height: 180 }}>
              <ScrollArea orientation="horizontal" style={{ width: '100%', height: '100%' }}>
                <WideContent />
              </ScrollArea>
            </div>
          </div>
        </Section>

        {/* Both axes */}
        <Section
          label="Both axes"
          description="Horizontal + vertical simultaneously — for large content grids or maps."
          isMobile={isMobile}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', margin: '0 0 8px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>480 × 320</p>
            <div className="sa-demo-box" style={{ maxWidth: 480, width: '100%', height: 320 }}>
              <ScrollArea orientation="both" style={{ width: '100%', height: '100%' }}>
                {/* Taller + wider than container */}
                <div style={{ width: 900, padding: '0 0 16px' }}>
                  <WideContent />
                  <LoremRows count={18} />
                </div>
              </ScrollArea>
            </div>
          </div>
        </Section>

        {/* Dark mode */}
        <Section
          label="Dark mode"
          description="Same tokens — dark surface overrides for reference."
          isMobile={isMobile}
        >
          <div className="dark" style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? 16 : 24,
          }}>
            <div style={{ flex: '1 1 240px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', margin: '0 0 8px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Vertical</p>
              <div style={{ maxWidth: 240, width: '100%', height: 280, border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                <ScrollArea orientation="vertical" style={{ width: '100%', height: '100%' }}>
                  <LoremRows count={20} />
                </ScrollArea>
              </div>
            </div>
            <div style={{ flex: '1 1 320px', overflowX: 'auto' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', margin: '0 0 8px', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Horizontal</p>
              <div style={{ maxWidth: 400, width: '100%', height: 200, border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                <ScrollArea orientation="horizontal" style={{ width: '100%', height: '100%' }}>
                  <WideContent />
                </ScrollArea>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: '1px solid var(--color-border-opaque)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-content-disabled)',
            letterSpacing: 'var(--tracking-wide)',
          }}>
            Alloy — Scroll Area v1
          </span>
        </div>
      </div>
    </>
  )
}
