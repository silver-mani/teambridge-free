/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Pagination Preview
   Self-contained mirror of the Alloy Pagination component.
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'

/* ── Icons ─────────────────────────────────────────────────────────────────── */

const ChevronLeftIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 6L9 12L15 18" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronRightIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6L15 12L9 18" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ── Page range helper ──────────────────────────────────────────────────────── */

function getPageRange(page, totalPages, siblingCount) {
  if (totalPages <= 1) return [1]
  const rangeStart = Math.max(2, page - siblingCount)
  const rangeEnd   = Math.min(totalPages - 1, page + siblingCount)
  const items = [1]
  if (rangeStart > 2)            items.push('ellipsis')
  for (let i = rangeStart; i <= rangeEnd; i++) items.push(i)
  if (rangeEnd < totalPages - 1) items.push('ellipsis')
  if (totalPages > 1)            items.push(totalPages)
  return items
}

/* ── Pagination mirror ──────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  onPageChange,
  showRowsPerPage    = false,
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50, 100],
  onRowsPerPageChange,
  showGoToPage       = false,
  totalCount,
  siblingCount       = 1,
  size               = 'sm',
  disabled           = false,
}) {
  const [goToValue, setGoToValue] = useState('')

  const h         = size === 'sm' ? 32 : 36
  const fs        = size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)'
  const iconSize  = size === 'sm' ? 14 : 16
  const px        = size === 'sm' ? 8 : 12

  const pageRange = getPageRange(page, totalPages, siblingCount)

  const navigate = (target) => {
    const clamped = Math.min(Math.max(1, target), totalPages)
    if (clamped !== page) onPageChange(clamped)
  }

  const handleGoToKey = (e) => {
    if (e.key === 'Enter') {
      const n = parseInt(goToValue, 10)
      if (!isNaN(n)) navigate(n)
      setGoToValue('')
    }
  }

  const countText =
    totalCount != null && rowsPerPage != null
      ? `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
      : null

  /* ── Shared styles ─────────────────────────────────────────────────────── */

  const labelStyle = {
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-weight-regular)', color: 'var(--color-content-secondary)',
    whiteSpace: 'nowrap', flexShrink: 0,
  }

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: h, border: '1px solid transparent', borderRadius: 'var(--radius-button)',
    background: 'transparent',
    fontFamily: 'var(--font-sans)', fontSize: fs, fontWeight: 'var(--font-weight-medium)',
    cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none',
    transition: 'background var(--duration-fast) var(--ease-default), color var(--duration-fast) var(--ease-default)',
    letterSpacing: 'var(--tracking-wide)', flexShrink: 0,
  }

  const ghostBtn      = { ...btnBase, color: 'var(--color-content-primary)', padding: `0 ${px}px` }
  const secondaryBtn  = { ...btnBase, background: 'var(--color-bg-secondary)', color: 'var(--color-content-primary)', padding: `0 ${px}px` }
  const iconBtn       = { ...btnBase, width: h, padding: 0 }

  return (
    <nav
      aria-label="Pagination"
      style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
    >
      {/* Rows per page */}
      {showRowsPerPage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={labelStyle}>Rows per page</span>
          <div style={{ width: 80 }}>
            <select
              value={rowsPerPage}
              disabled={disabled}
              aria-label="Rows per page"
              onChange={e => onRowsPerPageChange?.(Number(e.target.value))}
              style={{
                width: '100%', height: h, padding: `0 28px 0 ${px}px`,
                appearance: 'none', WebkitAppearance: 'none',
                fontFamily: 'var(--font-sans)', fontSize: fs,
                color: 'var(--color-content-primary)',
                background: `var(--color-bg-primary) url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%238c8c8c' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.75'/%3E%3C/svg%3E") no-repeat right 6px center`,
                border: '1px solid var(--color-border-opaque)',
                borderRadius: 'var(--radius-button)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                outline: 'none', boxSizing: 'border-box',
              }}
            >
              {rowsPerPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Count text */}
      {countText && (
        <span aria-live="polite" style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
          color: 'var(--color-content-tertiary)', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {countText}
        </span>
      )}

      {/* Page controls */}
      <div role="group" aria-label="Page navigation" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Previous */}
        <button
          aria-label="Previous page"
          disabled={disabled || page <= 1}
          onClick={() => navigate(page - 1)}
          className="alloy-icon-slot"
          style={{ ...iconBtn, color: 'var(--color-content-primary)', opacity: (disabled || page <= 1) ? 0.4 : 1 }}
        >
          <ChevronLeftIcon size={iconSize} />
        </button>

        {/* Page numbers */}
        {pageRange.map((item, i) =>
          item === 'ellipsis' ? (
            <span
              key={`e-${i}`}
              aria-hidden="true"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: h, height: h,
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
                color: 'var(--color-content-tertiary)', userSelect: 'none',
              }}
            >…</span>
          ) : (
            <button
              key={item}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              disabled={disabled}
              onClick={() => navigate(item)}
              style={{
                ...(item === page ? secondaryBtn : ghostBtn),
                minWidth: h, paddingLeft: 4, paddingRight: 4,
                opacity: disabled ? 0.4 : 1,
              }}
            >
              {item}
            </button>
          )
        )}

        {/* Next */}
        <button
          aria-label="Next page"
          disabled={disabled || page >= totalPages}
          onClick={() => navigate(page + 1)}
          className="alloy-icon-slot"
          style={{ ...iconBtn, color: 'var(--color-content-primary)', opacity: (disabled || page >= totalPages) ? 0.4 : 1 }}
        >
          <ChevronRightIcon size={iconSize} />
        </button>
      </div>

      {/* Go to page */}
      {showGoToPage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={labelStyle}>Go to</span>
          <input
            type="number"
            value={goToValue}
            placeholder={String(page)}
            min={1}
            max={totalPages}
            disabled={disabled}
            aria-label="Go to page number"
            onChange={e => setGoToValue(e.target.value)}
            onKeyDown={handleGoToKey}
            style={{
              width: 64, height: h, padding: `0 ${px}px`,
              fontFamily: 'var(--font-sans)', fontSize: fs,
              color: 'var(--color-content-primary)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-opaque)',
              borderRadius: 'var(--radius-button)',
              outline: 'none', boxSizing: 'border-box',
              MozAppearance: 'textfield',
            }}
          />
        </div>
      )}
    </nav>
  )
}

/* ── Specimen sub-components ─────────────────────────────────────────────────── */

function SpecimenGroup({ label }) {
  return (
    <div style={{
      padding:      '9px 20px 8px',
      borderTop:    '1px solid var(--color-border-opaque)',
      borderBottom: '1px solid var(--color-border-opaque)',
      background:   'var(--color-bg-secondary)',
    }}>
      <span style={{
        fontFamily:    'var(--font-sans)',
        fontSize:      '10px',
        fontWeight:    700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         'var(--color-content-disabled)',
      }}>{label}</span>
    </div>
  )
}

function SpecimenRow({ label, tags = [], note, isMobile, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
      alignItems:          'center',
      borderBottom:        '1px solid var(--color-border-opaque)',
      minHeight:           '52px',
    }}>
      <div style={{
        padding:     '12px 20px',
        borderRight: '1px solid var(--color-border-opaque)',
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        flexWrap:    'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize:   'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color:      'var(--color-content-primary)',
          lineHeight: 1,
        }}>{label}</span>
        {tags.map(t => (
          <span key={t} style={{
            fontFamily:   'var(--font-mono)',
            fontSize:     '10.5px',
            fontWeight:   500,
            color:        'var(--color-content-tertiary)',
            background:   'var(--color-bg-secondary)',
            border:       '1px solid var(--color-border-opaque)',
            borderRadius: 'var(--radius-sm)',
            padding:      '1px 6px',
            lineHeight:   1.6,
          }}>{t}</span>
        ))}
        {note && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize:   'var(--text-xs)',
            color:      'var(--color-content-disabled)',
            width:      '100%',
            marginTop:  '2px',
          }}>{note}</span>
        )}
      </div>
      <div style={{ padding: '12px 20px', overflowX: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function ImportRow() {
  return (
    <div style={{
      padding:      '14px 20px',
      borderBottom: '1px solid var(--color-border-opaque)',
      fontFamily:   'var(--font-mono)',
      fontSize:     '12.5px',
      color:        'var(--color-content-secondary)',
    }}>
      <span className="specimen-import-kw">import </span>
      <span className="specimen-import-exp">{'{ Pagination }'}</span>
      <span className="specimen-import-kw"> from </span>
      <span className="specimen-import-src">'alloy-design-system'</span>
    </div>
  )
}

/* ── Preview shell helpers ────────────────────────────────────────────────── */

function Section({ title, note, children }) {
  const isMobile = useIsMobile()
  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {label && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', margin: 0 }}>{label}</p>}
      {children}
    </div>
  )
}

/* ── Stateful demo wrapper ────────────────────────────────────────────────── */

function PaginationDemo(props) {
  const [page, setPage] = useState(props.initialPage ?? 1)
  const [rpp, setRpp]   = useState(props.rowsPerPage ?? 10)
  return (
    <Pagination
      {...props}
      page={page}
      rowsPerPage={rpp}
      onPageChange={setPage}
      onRowsPerPageChange={setRpp}
    />
  )
}

/* ── Main export ──────────────────────────────────────────────────────────── */

export default function PaginationPreview() {
  const isMobile = useIsMobile()
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Shared icon slot ─ */
        .alloy-icon-slot { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .alloy-icon-slot > svg, .alloy-icon-slot > svg * { stroke-width: 1.75; }
        .alloy-icon-slot > svg { display: block; }

        /* ─ Specimen ─ */
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }

        /* Hide number input spinners */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }

      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Navigation</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Pagination</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>page controls · rows per page · go to page · sm / md sizes · disabled</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Basic */}
          <Section title="Basic" note="Previous / next + page numbers with ellipsis truncation">
            <Row label="5 of 10 pages · siblingCount=1">
              <PaginationDemo totalPages={10} initialPage={5} siblingCount={1} />
            </Row>
            <Row label="1 of 10 pages">
              <PaginationDemo totalPages={10} initialPage={1} />
            </Row>
            <Row label="10 of 10 pages">
              <PaginationDemo totalPages={10} initialPage={10} />
            </Row>
            <Row label="3 pages — no ellipsis">
              <PaginationDemo totalPages={3} initialPage={2} />
            </Row>
            <Row label="1 page — prev/next both disabled">
              <PaginationDemo totalPages={1} initialPage={1} />
            </Row>
          </Section>

          {/* Rows per page + count */}
          <Section title="Rows per page + count" note="showRowsPerPage + totalCount render the selector and range text">
            <Row label="10 rows/page · 247 total records">
              <PaginationDemo
                totalPages={25} initialPage={3}
                showRowsPerPage totalCount={247} rowsPerPage={10}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Row>
            <Row label="25 rows/page">
              <PaginationDemo
                totalPages={10} initialPage={2}
                showRowsPerPage totalCount={247} rowsPerPage={25}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Row>
          </Section>

          {/* Go to page */}
          <Section title="Go to page" note="showGoToPage — press Enter to jump to a page">
            <Row label="With go-to input">
              <PaginationDemo totalPages={20} initialPage={7} showGoToPage />
            </Row>
            <Row label="Full controls">
              <PaginationDemo
                totalPages={25} initialPage={4}
                showRowsPerPage totalCount={247} rowsPerPage={10}
                rowsPerPageOptions={[10, 25, 50, 100]}
                showGoToPage
              />
            </Row>
          </Section>

          {/* Size md */}
          <Section title="Size: md" note="size='md' scales all controls to 36px height">
            <Row label="basic · md">
              <PaginationDemo totalPages={10} initialPage={5} size="md" />
            </Row>
            <Row label="full · md">
              <PaginationDemo
                totalPages={25} initialPage={4}
                showRowsPerPage totalCount={247} rowsPerPage={10}
                rowsPerPageOptions={[10, 25, 50, 100]}
                showGoToPage size="md"
              />
            </Row>
          </Section>

          {/* Disabled */}
          <Section title="Disabled">
            <Row>
              <PaginationDemo totalPages={10} initialPage={5} disabled />
            </Row>
          </Section>

          {/* 6 — Specimen */}
          <Section
            title="Specimen"
            note="Quick-reference table — scan to identify the exact size, controls, and state to name when prompting."
          >
            <div style={{
              background:   'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border:       '1px solid var(--color-border-opaque)',
              overflow:     'hidden',
            }}>

              {/* ── Package ── */}
              <SpecimenGroup label="Package" />
              <ImportRow />

              {/* ── Size ── */}
              <SpecimenGroup label="Size" />
              <SpecimenRow label="SM" tags={['size="sm"', '32px height', 'default']} isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={5} size="sm" />
              </SpecimenRow>
              <SpecimenRow label="MD" tags={['size="md"', '36px height']} isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={5} size="md" />
              </SpecimenRow>

              {/* ── Controls ── */}
              <SpecimenGroup label="Controls" />
              <SpecimenRow label="Basic" tags={['page', 'totalPages', 'onPageChange']} isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={5} siblingCount={1} />
              </SpecimenRow>
              <SpecimenRow label="Rows per page" tags={['showRowsPerPage', 'totalCount', 'rowsPerPage']} isMobile={isMobile}>
                <PaginationDemo
                  totalPages={25} initialPage={3}
                  showRowsPerPage totalCount={247} rowsPerPage={10}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                />
              </SpecimenRow>
              <SpecimenRow label="Go to page" tags={['showGoToPage']} note="Press Enter to jump" isMobile={isMobile}>
                <PaginationDemo totalPages={20} initialPage={7} showGoToPage />
              </SpecimenRow>
              <SpecimenRow label="Full controls" tags={['showRowsPerPage', 'showGoToPage', 'totalCount']} isMobile={isMobile}>
                <PaginationDemo
                  totalPages={25} initialPage={4}
                  showRowsPerPage totalCount={247} rowsPerPage={10}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  showGoToPage
                />
              </SpecimenRow>

              {/* ── Sibling count ── */}
              <SpecimenGroup label="siblingCount" />
              <SpecimenRow label="0" tags={['siblingCount={0}']} note="No adjacent pages shown" isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={5} siblingCount={0} />
              </SpecimenRow>
              <SpecimenRow label="1" tags={['siblingCount={1}', 'default']} isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={5} siblingCount={1} />
              </SpecimenRow>
              <SpecimenRow label="2" tags={['siblingCount={2}']} isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={5} siblingCount={2} />
              </SpecimenRow>

              {/* ── State ── */}
              <SpecimenGroup label="State" />
              <SpecimenRow label="First page" tags={['page={1}']} note="Previous button is dimmed" isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={1} />
              </SpecimenRow>
              <SpecimenRow label="Last page" tags={['page={totalPages}']} note="Next button is dimmed" isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={10} />
              </SpecimenRow>
              <SpecimenRow label="Disabled" tags={['disabled']} note="All controls non-interactive" isMobile={isMobile}>
                <PaginationDemo totalPages={10} initialPage={5} disabled />
              </SpecimenRow>

            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Pagination v1</span>
        </div>

      </div>
    </>
  )
}
