/* ─────────────────────────────────────────────────────────────────────────────
   Pay tab seed data
   Internal-consistent payroll figures for the Pay experience. Everything
   downstream (period totals, dashboard cards, drill-in tables) is derived
   from a single per-person/per-period entry table so the math always lines
   up across views.
   ───────────────────────────────────────────────────────────────────────────── */

/* ─── People (per industry) ─────────────────────────────────────────────── */

const AVATARS = {
  rachel: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&auto=format',
  sandra: 'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=96&h=96&fit=crop&crop=faces&auto=format',
  jordan: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&auto=format',
  ashley: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces&auto=format',
  miguel: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&auto=format',
  priya:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&auto=format',
  marcus: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=96&h=96&fit=crop&crop=faces&auto=format',
  tasha:  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=96&h=96&fit=crop&crop=faces&auto=format',
}

/* Each industry gets its own roster — same eight slots, different roles + venues
   so every dashboard reads as native to that operator's world. */
const ROSTERS = {
  events: [
    { id: 'jordan', name: 'Jordan Kim',      role: 'Crew Chief',   venue: 'Civic Auditorium', rate: 32.00 },
    { id: 'rachel', name: 'Rachel Williams', role: 'Lead Usher',   venue: 'Civic Auditorium', rate: 26.50 },
    { id: 'miguel', name: 'Miguel Rivera',   role: 'Event Lead',   venue: 'Harbor Theater',   rate: 30.00 },
    { id: 'ashley', name: 'Ashley Patel',    role: 'Bartender',    venue: 'Civic Auditorium', rate: 24.00 },
    { id: 'tasha',  name: 'Tasha King',      role: 'Bev Service',  venue: 'Harbor Theater',   rate: 23.50 },
    { id: 'sandra', name: 'Sandra Lee',      role: 'Usher',        venue: 'Civic Auditorium', rate: 22.00 },
    { id: 'marcus', name: 'Marcus James',    role: 'Gate Crew',    venue: 'Harbor Theater',   rate: 22.75 },
    { id: 'priya',  name: 'Priya Sharma',    role: 'Event Staff',  venue: 'Civic Auditorium', rate: 21.50 },
  ],
  healthcare: [
    { id: 'jordan', name: 'Jordan Kim',      role: 'Charge Nurse', venue: 'Memorial North',   rate: 48.00 },
    { id: 'rachel', name: 'Rachel Williams', role: 'RN',           venue: 'Memorial North',   rate: 42.00 },
    { id: 'miguel', name: 'Miguel Rivera',   role: 'RN',           venue: 'Memorial South',   rate: 40.50 },
    { id: 'ashley', name: 'Ashley Patel',    role: 'LPN',          venue: 'Memorial North',   rate: 32.00 },
    { id: 'tasha',  name: 'Tasha King',      role: 'LPN',          venue: 'Memorial South',   rate: 31.00 },
    { id: 'sandra', name: 'Sandra Lee',      role: 'CNA',          venue: 'Memorial North',   rate: 22.50 },
    { id: 'marcus', name: 'Marcus James',    role: 'Med Tech',     venue: 'Memorial South',   rate: 26.00 },
    { id: 'priya',  name: 'Priya Sharma',    role: 'CNA',          venue: 'Memorial North',   rate: 22.00 },
  ],
  staffing: [
    { id: 'jordan', name: 'Jordan Kim',      role: 'Site Lead',     venue: 'Brightline Plant', rate: 34.00 },
    { id: 'rachel', name: 'Rachel Williams', role: 'Recruiter',     venue: 'HQ Office',        rate: 28.00 },
    { id: 'miguel', name: 'Miguel Rivera',   role: 'Forklift Op',   venue: 'Brightline Plant', rate: 26.00 },
    { id: 'ashley', name: 'Ashley Patel',    role: 'Warehouse',     venue: 'Riverside DC',     rate: 22.50 },
    { id: 'tasha',  name: 'Tasha King',      role: 'Picker',        venue: 'Riverside DC',     rate: 21.00 },
    { id: 'sandra', name: 'Sandra Lee',      role: 'Warehouse',     venue: 'Brightline Plant', rate: 21.50 },
    { id: 'marcus', name: 'Marcus James',    role: 'Forklift Op',   venue: 'Riverside DC',     rate: 25.50 },
    { id: 'priya',  name: 'Priya Sharma',    role: 'Picker',        venue: 'Brightline Plant', rate: 21.00 },
  ],
  security: [
    { id: 'jordan', name: 'Jordan Kim',      role: 'Site Captain',  venue: 'Pier 38',          rate: 31.00 },
    { id: 'rachel', name: 'Rachel Williams', role: 'Armed Guard',   venue: 'Crown Tower',      rate: 28.50 },
    { id: 'miguel', name: 'Miguel Rivera',   role: 'Armed Guard',   venue: 'Pier 38',          rate: 28.00 },
    { id: 'ashley', name: 'Ashley Patel',    role: 'Unarmed Guard', venue: 'Crown Tower',      rate: 22.00 },
    { id: 'tasha',  name: 'Tasha King',      role: 'Unarmed Guard', venue: 'Pier 38',          rate: 21.50 },
    { id: 'sandra', name: 'Sandra Lee',      role: 'Unarmed Guard', venue: 'Crown Tower',      rate: 21.00 },
    { id: 'marcus', name: 'Marcus James',    role: 'Patrol Officer',venue: 'Pier 38',          rate: 24.00 },
    { id: 'priya',  name: 'Priya Sharma',    role: 'Console Op',    venue: 'Crown Tower',      rate: 23.50 },
  ],
  'light-industrial': [
    { id: 'jordan', name: 'Jordan Kim',      role: 'Line Lead',      venue: 'Brightline Plant', rate: 33.00 },
    { id: 'rachel', name: 'Rachel Williams', role: 'Forklift Op',    venue: 'Brightline Plant', rate: 26.50 },
    { id: 'miguel', name: 'Miguel Rivera',   role: 'Forklift Op',    venue: 'Riverside DC',     rate: 26.00 },
    { id: 'ashley', name: 'Ashley Patel',    role: 'Picker',         venue: 'Brightline Plant', rate: 21.00 },
    { id: 'tasha',  name: 'Tasha King',      role: 'Packer',         venue: 'Riverside DC',     rate: 20.50 },
    { id: 'sandra', name: 'Sandra Lee',      role: 'Packer',         venue: 'Brightline Plant', rate: 20.50 },
    { id: 'marcus', name: 'Marcus James',    role: 'QA Tech',        venue: 'Brightline Plant', rate: 24.00 },
    { id: 'priya',  name: 'Priya Sharma',    role: 'Picker',         venue: 'Riverside DC',     rate: 21.00 },
  ],
  construction: [
    { id: 'jordan', name: 'Jordan Kim',      role: 'Foreman',          venue: 'Eastside Tower',   rate: 42.00 },
    { id: 'rachel', name: 'Rachel Williams', role: 'Carpenter',        venue: 'Eastside Tower',   rate: 34.00 },
    { id: 'miguel', name: 'Miguel Rivera',   role: 'Framing Lead',     venue: 'Riverwalk Build',  rate: 36.00 },
    { id: 'ashley', name: 'Ashley Patel',    role: 'Carpenter',        venue: 'Eastside Tower',   rate: 31.00 },
    { id: 'tasha',  name: 'Tasha King',      role: 'Apprentice',       venue: 'Riverwalk Build',  rate: 22.00 },
    { id: 'sandra', name: 'Sandra Lee',      role: 'Laborer',          venue: 'Eastside Tower',   rate: 21.00 },
    { id: 'marcus', name: 'Marcus James',    role: 'Equipment Op',     venue: 'Riverwalk Build',  rate: 28.00 },
    { id: 'priya',  name: 'Priya Sharma',    role: 'Apprentice',       venue: 'Eastside Tower',   rate: 22.00 },
  ],
}

/* ─── Periods ────────────────────────────────────────────────────────────── */

const PERIODS = [
  { id: 'feb-16-29',  label: 'Feb 16 – Feb 29, 2026', short: 'Feb 16–29, 2026', start: 'Feb 16, 2026', end: 'Feb 29, 2026', status: 'in-approval' },
  { id: 'feb-1-15',   label: 'Feb 1 – Feb 15, 2026',  short: 'Feb 1–15, 2026',  start: 'Feb 1, 2026',  end: 'Feb 15, 2026', status: 'open'        },
  { id: 'jan-16-31',  label: 'Jan 16 – Jan 31, 2026', short: 'Jan 16–31, 2026', start: 'Jan 16, 2026', end: 'Jan 31, 2026', status: 'open'        },
  { id: 'jan-1-15',   label: 'Jan 1 – Jan 15, 2026',  short: 'Jan 1–15, 2026',  start: 'Jan 1, 2026',  end: 'Jan 15, 2026', status: 'approved'    },
  { id: 'dec-16-31',  label: 'Dec 16 – Dec 31, 2025', short: 'Dec 16–31, 2025', start: 'Dec 16, 2025', end: 'Dec 31, 2025', status: 'approved'    },
  { id: 'dec-1-15',   label: 'Dec 1 – Dec 15, 2025',  short: 'Dec 1–15, 2025',  start: 'Dec 1, 2025',  end: 'Dec 15, 2025', status: 'approved'    },
]

/* Periods that include a federal holiday — workers get a holiday-rate bump.
   Encoded statically so the totals line up cleanly across views. */
const HOLIDAY_PERIODS = new Set(['dec-16-31', 'jan-1-15'])

/* ─── Per-person × per-period entries ────────────────────────────────────── */

/* Tiny string hash used to spread synthetic variance across people/periods
   without storing a giant table by hand. Same input → same output, so all
   downstream totals are stable across renders. */
function hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function entryFor(person, period) {
  const seed = hash(`${person.id}-${period.id}`)

  // Regular hours: 64–80 over a 14-day period (roughly 5–6 shifts of 7–9 hrs).
  const regularHours = 64 + (seed % 17)
  // ~40% of people work some OT in a given period.
  const otHours = (seed % 5 === 0) ? 6 : (seed % 5 === 1 ? 4 : 0)
  // Crew chiefs and a few unlucky pickups occasionally hit double-OT.
  const dotHours = (seed % 11 === 0 && otHours > 0) ? 2 : 0
  // Holiday hours appear only in periods that include a federal holiday.
  const holidayHours = HOLIDAY_PERIODS.has(period.id) ? 8 : 0

  // Adjustments: at most one per (person × period). Seeded so the same person
  // gets the same correction across loads.
  const adjustments = []
  if (seed % 6 === 0) adjustments.push({ id: 'ms', label: 'Mileage reimbursement', amount: 45 })
  if (seed % 7 === 0) adjustments.push({ id: 'bonus', label: 'Coverage bonus',     amount: 120 })
  if (seed % 13 === 0) adjustments.push({ id: 'corr', label: 'Manual time correction', amount: -65 })

  // Instant pay: ~25% of people pulled an early payout against this period.
  const instantPay = (seed % 4 === 0) ? (50 * (1 + (seed % 8))) : 0

  return { regularHours, otHours, dotHours, holidayHours, adjustments, instantPay }
}

/* ─── Compute helpers ────────────────────────────────────────────────────── */

function payBreakdown(person, period) {
  const e = entryFor(person, period)
  const regular  = round2(e.regularHours * person.rate)
  const overtime = round2(e.otHours      * person.rate * 1.5)
  const doubleOt = round2(e.dotHours     * person.rate * 2)
  const holiday  = round2(e.holidayHours * person.rate * 1.5)
  const gross    = round2(regular + overtime + doubleOt + holiday)
  const adjustmentsTotal = e.adjustments.reduce((s, a) => s + a.amount, 0)
  const net = round2(gross + adjustmentsTotal - e.instantPay)
  return {
    ...e,
    regular, overtime, doubleOt, holiday, gross,
    adjustmentsTotal, net,
  }
}

function round2(n) { return Math.round(n * 100) / 100 }

/* ─── Public API ─────────────────────────────────────────────────────────── */

export function getPayPeople(industryId) {
  return (ROSTERS[industryId] ?? ROSTERS.events).map(p => ({ ...p, avatar: AVATARS[p.id] }))
}

export function getPayPeriods() {
  return PERIODS
}

/* Totals for a single period across the entire roster. */
export function getPeriodSummary(industryId, periodId) {
  const period = PERIODS.find(p => p.id === periodId)
  const people = getPayPeople(industryId)
  let totalGross = 0, totalAdjustments = 0, totalInstantPay = 0, totalHours = 0, pendingApproval = 0
  const rows = people.map(person => {
    const b = payBreakdown(person, period)
    totalGross       += b.gross
    totalAdjustments += b.adjustmentsTotal
    totalInstantPay  += b.instantPay
    totalHours       += b.regularHours + b.otHours + b.dotHours + b.holidayHours
    // Same status logic for everyone in an open/in-approval period: half
    // pending, half proceeded (deterministic per-person).
    const isProceeded = (period.status === 'approved') || (hash(person.id) % 2 === 0 && period.status !== 'in-approval')
    if (!isProceeded) pendingApproval++
    return {
      person,
      ...b,
      status: period.status === 'approved' ? 'approved'
            : isProceeded                  ? 'proceeded'
            :                                'pending',
    }
  })
  // Employer-side estimated taxes (FICA + unemployment ~16% of gross).
  const estTaxes = round2(totalGross * 0.16)
  const total    = round2(totalGross + totalAdjustments + estTaxes)
  return {
    period,
    rows,
    totals: {
      totalGross:       round2(totalGross),
      totalAdjustments: round2(totalAdjustments),
      totalInstantPay:  round2(totalInstantPay),
      totalHours,
      estTaxes,
      total,
      adjustmentsCount: rows.reduce((s, r) => s + r.adjustments.length, 0),
      pendingApproval,
      workers: rows.length,
    },
  }
}

/* Dashboard cards — the headline numbers across the whole org. */
export function getPayDashboard(industryId) {
  const periods = PERIODS.map(p => getPeriodSummary(industryId, p.id))
  const open       = periods.filter(p => p.period.status === 'open' || p.period.status === 'in-approval')
  const inApproval = periods.find(p => p.period.status === 'in-approval')
  const pendingApprovals = open.reduce((s, p) => s + p.totals.pendingApproval, 0)
  const currentGross    = inApproval?.totals.totalGross ?? open[0]?.totals.totalGross ?? 0
  const currentInstantPay = inApproval?.totals.totalInstantPay ?? open[0]?.totals.totalInstantPay ?? 0
  const instantPayPct = currentGross ? Math.round((currentInstantPay / currentGross) * 100) : 0
  return {
    cards: {
      openPeriods:     open.length,
      pendingApprovals,
      currentGross,
      currentInstantPay,
      instantPayPct,
    },
    openPeriods: open,
  }
}

/* Per-person breakdown for the deep-link "user" view, including a synthetic
   shift list and time-off list. */
export function getUserPeriod(industryId, periodId, personId) {
  const period = PERIODS.find(p => p.id === periodId) ?? PERIODS[0]
  const people = getPayPeople(industryId)
  const person = people.find(p => p.id === personId) ?? people[0]
  const b = payBreakdown(person, period)
  const shifts = buildShifts(person, period, b)
  const timeOff = buildTimeOff(person, period, b)
  return { period, person, breakdown: b, shifts, timeOff }
}

/* Build a deterministic dated shift list whose row sums equal the person's
   gross for the period. Premium hours (holiday / OT / double-OT) get their
   own typed rows so the rate column reads correctly; the remainder fills out
   ~6 regular shifts at the base rate. */
function buildShifts(person, period, b) {
  const monthMap = { feb: 'Feb', jan: 'Jan', dec: 'Dec' }
  const [m1, d1, d2] = period.id.split('-')
  const monthLabel = monthMap[m1] ?? 'Feb'
  const year = period.id.includes('2025') ? '2025' : '2026'
  const start = parseInt(d1, 10)
  const end   = parseInt(d2, 10)
  const span  = end - start + 1

  const isApproved = period.status === 'approved'

  /* Premium rows first — each holds exactly its premium hours so the rates
     line up with the breakdown summary. */
  const premium = []
  if (b.holidayHours > 0) {
    premium.push({
      kind: 'Holiday',
      hours: b.holidayHours,
      rate:  round2(person.rate * 1.5),
      day:   start, // anchor to the start of the period
    })
  }
  if (b.dotHours > 0) {
    premium.push({
      kind: 'Double OT',
      hours: b.dotHours,
      rate:  round2(person.rate * 2),
      day:   Math.min(end, start + Math.floor(span * 0.7)),
    })
  }
  if (b.otHours > 0) {
    premium.push({
      kind: 'Overtime',
      hours: b.otHours,
      rate:  round2(person.rate * 1.5),
      day:   Math.min(end, start + Math.floor(span * 0.5)),
    })
  }

  /* Regular rows — keep about 5–7 of them so the table doesn't feel sparse,
     and absorb any rounding into the last row so sums always reconcile. */
  const regCount = b.regularHours >= 70 ? 6 : b.regularHours >= 50 ? 5 : 4
  const regBase  = Math.floor((b.regularHours / regCount) * 10) / 10
  const regRemainder = round2(b.regularHours - regBase * regCount)

  const regularRows = []
  for (let i = 0; i < regCount; i++) {
    const isLast = i === regCount - 1
    const hours = round2(isLast ? regBase + regRemainder : regBase)
    const dayOffset = Math.floor((i / Math.max(1, regCount - 1)) * (span - 1))
    regularRows.push({
      kind: 'Regular',
      hours,
      rate: person.rate,
      day:  start + dayOffset,
    })
  }

  /* Combine, sort by day, then assemble final rows. The last regular row
     absorbs any per-row rounding so the shift gross sums match the period
     breakdown exactly. */
  const all = [...premium, ...regularRows].sort((a, b) => a.day - b.day)
  const total = all.length
  const targetGross = round2(b.regular + b.overtime + b.doubleOt + b.holiday)

  let runningGross = 0
  const lastRegularIndex = (() => {
    for (let i = all.length - 1; i >= 0; i--) if (all[i].kind === 'Regular') return i
    return all.length - 1
  })()

  return all.map((row, i) => {
    let gross = round2(row.hours * row.rate)
    let hours = row.hours
    if (i === lastRegularIndex) {
      // Absorb the cumulative rounding remainder into this row.
      const remaining = round2(targetGross - runningGross)
      gross = remaining
      hours = round2(remaining / row.rate)
    }
    runningGross = round2(runningGross + gross)
    return {
      id: `${person.id}-${period.id}-${i}`,
      date: `${monthLabel} ${row.day}, ${year}`,
      hours,
      rate: row.rate,
      gross,
      label: row.kind,
      paid:  isApproved || i < total - 2,
      billed: isApproved || i < total - 2,
    }
  })
}

function buildTimeOff(person, period, b) {
  const seed = hash(`${person.id}-${period.id}-pto`)
  // ~30% of people take some time off in a given period.
  if (seed % 10 < 7) return []
  const monthMap = { feb: 'Feb', jan: 'Jan', dec: 'Dec' }
  const [m1, d1] = period.id.split('-')
  const monthLabel = monthMap[m1] ?? 'Feb'
  const day = parseInt(d1, 10) + (seed % 8)
  const hours = (seed % 3 === 0) ? 8 : 4
  const type  = (seed % 4 === 0) ? 'Sick' : (seed % 4 === 1 ? 'PTO' : 'Personal')
  const paid  = type !== 'Personal'
  const gross = paid ? round2(hours * person.rate) : 0
  return [{
    id: `${person.id}-${period.id}-pto`,
    requestedBy: person.name,
    type,
    hours,
    endTime: `${monthLabel} ${day}, ${period.id.includes('2025') ? '2025' : '2026'}`,
    paid,
    billed: paid,
    gross,
  }]
}

/* Status pill metadata reused by the table cells. */
export const PERIOD_STATUS_META = {
  'open':         { label: 'Open',        tone: 'info'    },
  'in-approval':  { label: 'In Approval', tone: 'warning' },
  'approved':     { label: 'Approved',    tone: 'success' },
  'pending':      { label: 'Pending',     tone: 'warning' },
  'proceeded':    { label: 'Proceeded',   tone: 'success' },
}

/* Currency formatter used everywhere a $ value appears. */
export function fmt(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })
}

export function fmtCompact(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  })
}
