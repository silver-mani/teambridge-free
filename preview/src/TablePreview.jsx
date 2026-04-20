/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Table Preview
   Table · TableHeader · TableBody · TableRow · TableHead · TableCell
   + CellText · CellStack · CellTag · CellStatusTag · CellActions · CellControl
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'
import { Table }        from '../../src/components/Table/Table'
import { TableHeader }  from '../../src/components/Table/TableHeader'
import { TableBody }    from '../../src/components/Table/TableBody'
import { TableRow }     from '../../src/components/Table/TableRow'
import { TableHead }    from '../../src/components/Table/TableHead'
import { TableCell }    from '../../src/components/Table/TableCell'
import {
  CellText,
  CellStack,
  CellTag,
  CellStatusTag,
  CellActions,
  CellControl,
} from '../../src/components/Table/CellContent'
import { Button }       from '../../src/components/Button/Button'
import { Switch }       from '../../src/components/Switch/Switch'
import { Checkbox }     from '../../src/components/Checkbox/Checkbox'
import { DropdownMenu } from '../../src/components/DropdownMenu/DropdownMenu'

/* ── Data ─────────────────────────────────────────────────────────────────────── */

const PAY_PERIODS = [
  { id: 'p1', period: 'Feb 16–29, 2026', workers: 124, pending: 3,  status: 'warning' },
  { id: 'p2', period: 'Feb 1–15, 2026',  workers: 118, pending: 5,  status: 'warning' },
  { id: 'p3', period: 'Jan 16–31, 2026', workers: 131, pending: 0,  status: 'success' },
  { id: 'p4', period: 'Jan 1–15, 2026',  workers: 129, pending: 0,  status: 'success' },
  { id: 'p5', period: 'Dec 16–31, 2025', workers: 122, pending: 0,  status: 'success' },
]

const EMPLOYEES = [
  { id: 'e1', name: 'Jane Smith',     email: 'jane@company.com',    dept: 'Design',       role: 'Lead',      status: 'success', id_code: 'EMP-0041', active: true  },
  { id: 'e2', name: 'Marcus Lee',     email: 'marcus@company.com',  dept: 'Engineering',  role: 'Senior',    status: 'success', id_code: 'EMP-0082', active: true  },
  { id: 'e3', name: 'Sofia Reyes',    email: 'sofia@company.com',   dept: 'Product',      role: 'Manager',   status: 'warning', id_code: 'EMP-0119', active: false },
  { id: 'e4', name: 'David Chen',     email: 'david@company.com',   dept: 'Engineering',  role: 'Junior',    status: 'success', id_code: 'EMP-0137', active: true  },
  { id: 'e5', name: 'Amara Okafor',   email: 'amara@company.com',   dept: 'Operations',   role: 'Lead',      status: 'error',   id_code: 'EMP-0058', active: false },
  { id: 'e6', name: 'Tom Eriksson',   email: 'tom@company.com',     dept: 'Marketing',    role: 'Manager',   status: 'success', id_code: 'EMP-0203', active: true  },
]

const DEPT_COLORS = {
  Design: 'purple', Engineering: 'blue', Product: 'azure',
  Operations: 'orange', Marketing: 'matcha',
}

const ACTION_GROUPS = [
  {
    id: 'primary',
    options: [
      { id: 'edit',      label: 'Edit',      onClick: () => {} },
      { id: 'duplicate', label: 'Duplicate', onClick: () => {} },
    ],
  },
  {
    id: 'danger',
    options: [
      { id: 'delete', label: 'Delete', destructive: true, onClick: () => {} },
    ],
  },
]

/* ── Dark mode token overrides ───────────────────────────────────────────────── */

const DARK_VARS = {
  '--color-bg-primary':              'rgba(255,255,255,0.04)',
  '--color-bg-secondary':            'rgba(255,255,255,0.07)',
  '--color-bg-tertiary':             'rgba(255,255,255,0.11)',
  '--color-bg-disabled':             'rgba(255,255,255,0.05)',
  '--color-border-opaque':           'rgba(255,255,255,0.10)',
  '--color-border-selected':         'var(--Alloy-slate-200)',
  '--color-border-disabled':         'rgba(255,255,255,0.06)',
  '--color-content-primary':         'rgba(255,255,255,0.88)',
  '--color-content-secondary':       'rgba(255,255,255,0.55)',
  '--color-content-tertiary':        'rgba(255,255,255,0.35)',
  '--color-content-disabled':        'rgba(255,255,255,0.22)',
  '--color-content-inverse-primary': 'rgba(0,0,0,0.88)',
  '--color-bg-inverse-primary':      '#FFFFFF',
}

/* ── Layout helpers ──────────────────────────────────────────────────────────── */

function Section({ title, note, dark, children, isMobile }) {
  return (
    <section style={{
      background: dark ? 'rgba(14,17,21,1)' : 'var(--color-bg-primary)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'var(--color-border-opaque)'}`,
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
      overflow: 'hidden',
      ...(dark ? DARK_VARS : {}),
    }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
          color: 'var(--color-content-disabled)',
          margin: '0 0 4px',
        }}>
          {title}
        </p>
        {note && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
            color: 'var(--color-content-tertiary)',
            margin: 0, lineHeight: 1.5,
          }}>
            {note}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

/* ── Initials avatar (for employee table) ────────────────────────────────────── */
function Avatar({ name, size = 24 }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-opaque)',
      fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
      color: 'var(--color-content-secondary)', userSelect: 'none',
    }}>
      {initials}
    </span>
  )
}

/* ── Preview ─────────────────────────────────────────────────────────────────── */
export default function TablePreview() {
  const isMobile = useIsMobile()

  /* Sorting for pay periods table */
  const [sortDir, setSortDir] = useState('none')
  const cycleSort = () =>
    setSortDir(prev => prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none')

  const sortedPeriods = [...PAY_PERIODS].sort((a, b) =>
    sortDir === 'asc'  ? a.period.localeCompare(b.period) :
    sortDir === 'desc' ? b.period.localeCompare(a.period) : 0
  )

  /* Row selection for employee table */
  const [selected, setSelected] = useState(new Set())
  const toggleRow  = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll  = () => setSelected(prev => prev.size === EMPLOYEES.length ? new Set() : new Set(EMPLOYEES.map(e => e.id)))
  const allChecked = selected.size === EMPLOYEES.length
  const someChecked = selected.size > 0 && selected.size < EMPLOYEES.length

  /* Active toggles for the mixed-controls table */
  const [activeRows, setActiveRows] = useState({ e1: true, e2: true, e3: false, e4: true, e5: false, e6: true })
  const toggleActive = id => setActiveRows(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', padding: isMobile ? '24px 16px' : '48px 40px' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>
          Data Display
        </p>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>
          Table
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-relaxed)' }}>
          Table · TableHeader · TableBody · TableRow · TableHead · TableCell · 2 sizes · sortable columns · row selection · 6 cell content types
        </p>
      </div>

      {/* ── 1. Figma reference — Pay Period ──────────────────────────────── */}
      <Section title="Figma Reference — Pay Period" note="Matches the Alloy–Payroll Figma node exactly · sortable Pay Period column" isMobile={isMobile}>
        <div style={{ overflowX: 'auto' }}>
        <Table style={{ maxWidth: 480, width: '100%' }}>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead sort={sortDir} onSort={cycleSort}>Pay Period</TableHead>
              <TableHead sort="none" onSort={() => {}}>Workers</TableHead>
              <TableHead sort="none" onSort={() => {}}>Pending Approval</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPeriods.map(row => (
              <TableRow key={row.id}>
                <TableCell><CellText>{row.period}</CellText></TableCell>
                <TableCell><CellText>{row.workers}</CellText></TableCell>
                <TableCell><CellText>{row.pending}</CellText></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Section>

      {/* ── 2. Row selection + StatusTag + CellStack ──────────────────────── */}
      <Section title="Row Selection + Rich Cells" note="Checkbox column · CellStack · CellStatusTag · CellTag · CellActions with DropdownMenu" isMobile={isMobile}>
        <div style={{ overflowX: 'auto' }}>
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead style={{ width: 44 }}>
                <CellControl>
                  <Checkbox
                    size="sm"
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </CellControl>
              </TableHead>
              <TableHead sort="none" onSort={() => {}}>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead style={{ width: 80 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {EMPLOYEES.map(emp => (
              <TableRow
                key={emp.id}
                selected={selected.has(emp.id)}
                onClick={() => toggleRow(emp.id)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell compact align="center">
                  <CellControl>
                    <Checkbox
                      size="sm"
                      checked={selected.has(emp.id)}
                      onChange={() => toggleRow(emp.id)}
                      aria-label={`Select ${emp.name}`}
                      onClick={e => e.stopPropagation()}
                    />
                  </CellControl>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Avatar name={emp.name} />
                    <CellStack primary={emp.name} secondary={emp.email} />
                  </div>
                </TableCell>
                <TableCell>
                  <CellTag color={DEPT_COLORS[emp.dept]} variant="subtle">{emp.dept}</CellTag>
                </TableCell>
                <TableCell>
                  <CellText variant="mono">{emp.id_code}</CellText>
                </TableCell>
                <TableCell>
                  <CellStatusTag status={emp.status}>
                    {emp.status === 'success' ? 'Active' : emp.status === 'warning' ? 'Pending' : 'Suspended'}
                  </CellStatusTag>
                </TableCell>
                <TableCell compact>
                  <CellActions>
                    <DropdownMenu
                      trigger={
                        <Button size="sm" variant="ghost" onClick={e => e.stopPropagation()}>
                          Actions
                        </Button>
                      }
                      groups={ACTION_GROUPS}
                      placement="bottom-end"
                      width={160}
                    />
                  </CellActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        {selected.size > 0 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-secondary)' }}>
              {selected.size} row{selected.size > 1 ? 's' : ''} selected
            </span>
            <Button size="sm" variant="tertiary" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}
      </Section>

      {/* ── 3. Switch controls in cells ───────────────────────────────────── */}
      <Section title="CellControl — Switch" note="Switch toggle embedded in table cells · sm size · compact column" isMobile={isMobile}>
        <div style={{ overflowX: 'auto' }}>
        <Table style={{ maxWidth: 640, width: '100%' }}>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead sort="none" onSort={() => {}}>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EMPLOYEES.map(emp => (
              <TableRow key={emp.id}>
                <TableCell>
                  <CellStack primary={emp.name} secondary={emp.role} />
                </TableCell>
                <TableCell>
                  <CellTag color={DEPT_COLORS[emp.dept]} variant="subtle">{emp.dept}</CellTag>
                </TableCell>
                <TableCell compact>
                  <CellControl>
                    <Switch
                      size="sm"
                      checked={activeRows[emp.id]}
                      onChange={() => toggleActive(emp.id)}
                    />
                  </CellControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Section>

      {/* ── 4. Size comparison — md vs sm ──────────────────────────────────── */}
      <Section title="Size Comparison" note="size='md' (default, 48px rows) vs size='sm' (40px rows)" isMobile={isMobile}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 20 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', marginBottom: 10 }}>
              MD (default)
            </p>
            <Table size="md">
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead sort="none" onSort={() => {}}>Pay Period</TableHead>
                  <TableHead>Workers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PAY_PERIODS.slice(0, 3).map(row => (
                  <TableRow key={row.id}>
                    <TableCell><CellText>{row.period}</CellText></TableCell>
                    <TableCell><CellText>{row.workers}</CellText></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-disabled)', marginBottom: 10 }}>
              SM (compact)
            </p>
            <Table size="sm">
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead sort="none" onSort={() => {}}>Pay Period</TableHead>
                  <TableHead>Workers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PAY_PERIODS.slice(0, 3).map(row => (
                  <TableRow key={row.id}>
                    <TableCell><CellText>{row.period}</CellText></TableCell>
                    <TableCell><CellText>{row.workers}</CellText></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Section>

      {/* ── 5. Cell content type catalog ──────────────────────────────────── */}
      <Section title="Cell Content Types" note="All built-in helpers — each renders inside a plain TableCell" isMobile={isMobile}>
        <div style={{ overflowX: 'auto' }}>
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead style={{ width: 200 }}>Helper</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Props / usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><CellText variant="mono">CellText · primary</CellText></TableCell>
              <TableCell><CellText>Jane Smith</CellText></TableCell>
              <TableCell><CellText variant="secondary">Default body text</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellText · secondary</CellText></TableCell>
              <TableCell><CellText variant="secondary">jane@company.com</CellText></TableCell>
              <TableCell><CellText variant="secondary">variant="secondary"</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellText · muted</CellText></TableCell>
              <TableCell><CellText variant="muted">Updated 3 days ago</CellText></TableCell>
              <TableCell><CellText variant="secondary">variant="muted" — tertiary + xs size</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellText · mono</CellText></TableCell>
              <TableCell><CellText variant="mono">TXN-00042819</CellText></TableCell>
              <TableCell><CellText variant="secondary">variant="mono" — Geist Mono, tracking-wide</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellStack</CellText></TableCell>
              <TableCell>
                <CellStack primary="Jane Smith" secondary="jane@company.com" />
              </TableCell>
              <TableCell><CellText variant="secondary">primary + secondary props</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellTag</CellText></TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: 6 }}>
                  <CellTag color="blue">Engineering</CellTag>
                  <CellTag color="purple">Design</CellTag>
                  <CellTag color="matcha">Marketing</CellTag>
                </div>
              </TableCell>
              <TableCell><CellText variant="secondary">Alloy Tag, size="sm" default</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellStatusTag</CellText></TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: 6 }}>
                  <CellStatusTag status="success">Paid</CellStatusTag>
                  <CellStatusTag status="warning">Pending</CellStatusTag>
                  <CellStatusTag status="error">Failed</CellStatusTag>
                  <CellStatusTag status="info">Processing</CellStatusTag>
                </div>
              </TableCell>
              <TableCell><CellText variant="secondary">Alloy StatusTag, size="sm" default</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellActions</CellText></TableCell>
              <TableCell>
                <CellActions>
                  <Button size="sm" variant="secondary">Edit</Button>
                  <Button size="sm" variant="ghost">View</Button>
                </CellActions>
              </TableCell>
              <TableCell><CellText variant="secondary">Flex row, gap=--space-2</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellControl · Checkbox</CellText></TableCell>
              <TableCell compact align="center">
                <CellControl>
                  <Checkbox size="sm" defaultChecked aria-label="Example checkbox" />
                </CellControl>
              </TableCell>
              <TableCell><CellText variant="secondary">Centered; pair with compact + align="center"</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">CellControl · Switch</CellText></TableCell>
              <TableCell compact>
                <CellControl>
                  <Switch size="sm" defaultChecked />
                </CellControl>
              </TableCell>
              <TableCell><CellText variant="secondary">Alloy Switch in a compact cell</CellText></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><CellText variant="mono">Custom render</CellText></TableCell>
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Avatar name="Jane Smith" size={28} />
                  <CellStack primary="Jane Smith" secondary="Design Lead" />
                </div>
              </TableCell>
              <TableCell><CellText variant="secondary">Any ReactNode — full flexibility</CellText></TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </div>
      </Section>

      {/* ── 6. Dark panel ─────────────────────────────────────────────────── */}
      <Section title="Dark Surface" note="Table on a dark background — tokens adapt automatically via CSS custom properties" dark isMobile={isMobile}>
        <div style={{ overflowX: 'auto' }}>
        <Table style={{ maxWidth: 560, width: '100%' }}>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead sort="none" onSort={() => {}}>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EMPLOYEES.slice(0, 4).map(emp => (
              <TableRow key={emp.id}>
                <TableCell>
                  <CellStack primary={emp.name} secondary={emp.email} />
                </TableCell>
                <TableCell>
                  <CellTag color={DEPT_COLORS[emp.dept]} variant="subtle">{emp.dept}</CellTag>
                </TableCell>
                <TableCell>
                  <CellStatusTag status={emp.status}>
                    {emp.status === 'success' ? 'Active' : emp.status === 'warning' ? 'Pending' : 'Suspended'}
                  </CellStatusTag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>
          Alloy — Table v1
        </span>
      </div>

    </div>
    </div>
  )
}
