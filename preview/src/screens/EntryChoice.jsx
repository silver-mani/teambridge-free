import { useEffect, useState } from 'react'
import { Eyebrow } from '../../../src/components/Eyebrow/Eyebrow.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { Users03Icon } from '../../../src/components/icons/Users03Icon.tsx'
import { Microphone02Icon } from '../../../src/components/icons/Microphone02Icon.tsx'
import { Bell01Icon } from '../../../src/components/icons/Bell01Icon.tsx'
import { Home02Icon } from '../../../src/components/icons/Home02Icon.tsx'
import { Trash03Icon } from '../../../src/components/icons/Trash03Icon.tsx'
import { PackageIcon } from '../../../src/components/icons/PackageIcon.tsx'
import { HomeLineIcon } from '../../../src/components/icons/HomeLineIcon.tsx'
import { ClipboardCheckIcon } from '../../../src/components/icons/ClipboardCheckIcon.tsx'
import { Map01Icon } from '../../../src/components/icons/Map01Icon.tsx'

const BASE = import.meta.env.BASE_URL
const TEAMBRIDGE_LOGO =
  'https://cdn.prod.website-files.com/67adea23aa73a53ff4afb197/67b499f67cace40b0939e859_teambridge%20logo%20main.svg'
const TEAMBRIDGE_NOTIFICATION_ICON = `${BASE}notifications/teambridge-notification-icon.png`
const AGENTS = [
  { name: 'Nova', src: `${BASE}agents/nova.gif` },
  { name: 'Atlas', src: `${BASE}agents/atlas.gif` },
  { name: 'Iris', src: `${BASE}agents/iris.gif` },
  { name: 'Leo', src: `${BASE}agents/leo.gif` },
  { name: 'Sofia', src: `${BASE}agents/sofia.gif` },
]

const DEMO_VERTICALS = [
  {
    id: 'events',
    name: 'Events',
    description: 'Venues, concessions, ushers, security, and game-day crew.',
    scenario: 'A late call-out opens two gates before doors. Teambridge finds eligible crew, checks venue rules, and sends replacement offers in order.',
    outcome: 'Coverage gaps that used to take hours move into a managed queue in minutes.',
    agent: 'Iris',
    notifications: [
      { label: 'Coverage', text: 'Gate 12 call-out detected. Eligible crew offers sent.' },
      { label: 'Venue rules', text: 'Union rule checked before replacement assignment.' },
      { label: 'Resolved', text: 'Late crew gap moved into the covered queue.' },
      { label: 'Crew check', text: 'Concessions roster balanced against event start time.' },
      { label: 'Payroll', text: 'Premium shift rule attached before final approval.' },
    ],
    media: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663438319799/c5ZwntDqPXFYWKSLZiNAbR/events-hero-video_b2e6cc04.mp4',
    mediaType: 'video',
    Icon: Microphone02Icon,
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Credentialed clinicians, float pools, facilities, and shift coverage.',
    scenario: 'An overnight gap appears. Teambridge filters by credential, location, overtime risk, and facility rules before contacting the best-fit staff.',
    outcome: 'Schedulers keep coverage moving without risking compliance.',
    agent: 'Nova',
    notifications: [
      { label: 'Credentialing', text: 'RN license verified before overnight shift offer.' },
      { label: 'Coverage', text: 'Float pool filtered by facility, credential, and overtime risk.' },
      { label: 'Compliance', text: 'Shift covered with credential trail attached.' },
      { label: 'Call-out', text: 'Qualified replacement contacted for the open clinical shift.' },
      { label: 'Scheduler', text: 'Facility rules checked before the assignment is confirmed.' },
    ],
    media: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663438319799/c5ZwntDqPXFYWKSLZiNAbR/healthcare-hero_153814e6.mp4',
    mediaType: 'video',
    Icon: ClipboardCheckIcon,
  },
  {
    id: 'staffing',
    name: 'Staffing',
    description: 'Orders, candidate availability, placements, and first-shift readiness.',
    scenario: 'A customer opens urgent orders across multiple sites. Teambridge matches available workers, stages onboarding tasks, and flags missing first-shift steps.',
    outcome: 'Recruiters see the ready placements first instead of chasing disconnected spreadsheets.',
    agent: 'Atlas',
    notifications: [
      { label: 'New order', text: 'Urgent customer order matched to available workers.' },
      { label: 'Placement', text: 'First-shift readiness tasks staged for review.' },
      { label: 'Recruiting', text: 'Qualified fills surfaced ahead of manual follow-up.' },
      { label: 'Availability', text: 'Worker availability checked across active orders.' },
      { label: 'Onboarding', text: 'Missing first-day steps queued before dispatch.' },
    ],
    media: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663438319799/c5ZwntDqPXFYWKSLZiNAbR/staffing-hero_c77bf259.mp4',
    mediaType: 'video',
    Icon: Users03Icon,
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    description: 'Housekeeping, front desk, food service, and room-turn labor.',
    scenario: 'Checkout volume spikes while two housekeepers call out. Teambridge reshuffles room turns, suggests coverage, and keeps managers focused on guest impact.',
    outcome: 'Frontline leaders see where service is at risk before the lobby feels it.',
    agent: 'Leo',
    notifications: [
      { label: 'Housekeeping', text: 'Room-turn schedule rebalanced after call-outs.' },
      { label: 'Front desk', text: 'Service risk flagged before guest impact.' },
      { label: 'Coverage', text: 'Open shift routed to the best-fit team member.' },
      { label: 'Food service', text: 'Late shift gap assigned before dinner rush.' },
    ],
    media: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=900&fit=crop',
    mediaType: 'image',
    Icon: Bell01Icon,
  },
  {
    id: 'long-term-care',
    name: 'Long Term Care',
    description: 'Facility staffing, care ratios, certifications, and compliance.',
    scenario: 'A nurse call-out risks a care-ratio miss. Teambridge checks certifications, availability, and overtime exposure before recommending replacements.',
    outcome: 'Administrators can solve the staffing issue and document the compliance trail together.',
    agent: 'Sofia',
    notifications: [
      { label: 'Care ratio', text: 'Facility ratio risk detected before the shift starts.' },
      { label: 'Certification', text: 'Replacement staff checked for required certifications.' },
      { label: 'Compliance', text: 'Coverage action logged with audit context.' },
      { label: 'Float pool', text: 'Available staff ranked by facility fit and overtime risk.' },
      { label: 'Alert cleared', text: 'Certification warning resolved before assignment.' },
    ],
    media: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663438319799/c5ZwntDqPXFYWKSLZiNAbR/ltc-hero-v2_0b908655.mp4',
    mediaType: 'video',
    Icon: Home02Icon,
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Posts, patrol routes, site coverage, incidents, and compliance logs.',
    scenario: 'A post opens during a patrol window. Teambridge detects the gap, recommends an eligible guard, and keeps the incident and coverage trail together.',
    outcome: 'Operations teams reduce uncovered posts without losing audit context.',
    agent: 'Atlas',
    notifications: [
      { label: 'Post coverage', text: 'Night shift no-show detected. Replacement dispatched.' },
      { label: 'Patrol', text: 'Weekend patrol coverage queued across 3 sites.' },
      { label: 'Compliance', text: 'Guard license verified before site assignment.' },
      { label: 'Incident log', text: 'Open post and incident context linked for review.' },
      { label: 'Overtime', text: 'Guard approaching weekly threshold flagged before dispatch.' },
      { label: 'Site status', text: 'Downtown campus coverage confirmed for all posts.' },
    ],
    media: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663438319799/c5ZwntDqPXFYWKSLZiNAbR/security-hero_577878cd.mp4',
    mediaType: 'video',
    Icon: Map01Icon,
  },
  {
    id: 'janitorial',
    name: 'Facilities',
    description: 'Cleaning routes, building services, supplies, and quality checks.',
    scenario: 'A site adds an evening clean and a route falls behind. Teambridge adjusts the route, queues the right team, and tracks follow-up work.',
    outcome: 'Supervisors can protect service quality across sites without constant manual routing.',
    agent: 'Leo',
    notifications: [
      { label: 'Route change', text: 'Evening clean added and routed to the right team.' },
      { label: 'Quality', text: 'Follow-up task queued after site inspection.' },
      { label: 'Supplies', text: 'Supply check attached to the building service route.' },
      { label: 'Coverage', text: 'Route owner reassigned after a late call-out.' },
    ],
    media: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1600&h=900&fit=crop',
    mediaType: 'image',
    Icon: Trash03Icon,
  },
  {
    id: 'light-industrial',
    name: 'Industrial',
    description: 'Warehouse crews, attendance, overtime risk, and dock coverage.',
    scenario: 'A warehouse shift starts short. Teambridge checks availability, role fit, attendance risk, and overtime before balancing coverage.',
    outcome: 'Managers get a practical staffing plan while the floor is still moving.',
    agent: 'Iris',
    notifications: [
      { label: 'Attendance', text: 'Warehouse shift risk detected before clock-in.' },
      { label: 'Overtime', text: 'Coverage balanced against overtime exposure.' },
      { label: 'Dock coverage', text: 'Role gaps surfaced while the floor keeps moving.' },
      { label: 'Role fit', text: 'Forklift-certified workers prioritized for the next shift.' },
      { label: 'Shift plan', text: 'Crew mix adjusted for expected volume.' },
    ],
    media: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663438319799/c5ZwntDqPXFYWKSLZiNAbR/light-industrial-hero_9952384c.mp4',
    mediaType: 'video',
    Icon: PackageIcon,
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Job sites, trades, certifications, crews, and project coverage.',
    scenario: 'A crew mix changes before a pour. Teambridge checks site needs, trade coverage, safety certs, and availability in one flow.',
    outcome: 'Superintendents see which sites are covered and which crews need action.',
    agent: 'Nova',
    notifications: [
      { label: 'Site readiness', text: 'Crew mix checked before the morning pour.' },
      { label: 'Safety certs', text: 'Certification gap flagged before dispatch.' },
      { label: 'Coverage', text: 'Trade coverage verified across active sites.' },
      { label: 'Crew request', text: 'Weekend overtime request queued for approval.' },
      { label: 'Project coverage', text: 'Five active sites checked for staffing readiness.' },
    ],
    media: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663438319799/c5ZwntDqPXFYWKSLZiNAbR/construction-hero_4df1e170.mp4',
    mediaType: 'video',
    Icon: HomeLineIcon,
  },
]

/* ──────────────────────────────────────────────────────────────────────
 * EntryChoice — first screen of the demo. Two paths:
 *   1. "Build your account"     → guided onboarding chat at #/build
 *   2. Ready-made workspace cards → gated workspace route
 * Keeps the brand lockup quiet, like the real product.
 * ────────────────────────────────────────────────────────────────────── */

function ProductPreview({ kind }) {
  if (kind === 'build') {
    return (
      <div className="entry-product-preview entry-product-preview--build" aria-hidden="true">
        <div className="entry-agent-stack">
          {AGENTS.slice(0, 3).map(agent => (
            <img key={agent.name} src={agent.src} alt="" />
          ))}
        </div>
        <div>
          <span>Company found</span>
          <strong>Workspace being built</strong>
        </div>
      </div>
    )
  }

  return null
}

function AgentTeam() {
  return (
    <div className="entry-agent-team" aria-label="Teambridge demo agents">
      {AGENTS.map(agent => (
        <div key={agent.name} className="entry-agent-team-member">
          <img src={agent.src} alt="" />
          <span>{agent.name}</span>
        </div>
      ))}
    </div>
  )
}

function ChoiceCard({ kind, title, lede, action, onClick }) {
  const [hover, setHover]     = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={`entry-choice-card entry-choice-card--${kind}`}
      style={{
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        padding: 'var(--space-8)',
        background: 'color-mix(in srgb, var(--color-bg-primary) 96%, var(--color-content-primary))',
        border: `1px solid ${hover ? 'var(--color-border-selected)' : 'var(--color-border-opaque)'}`,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        boxShadow: hover ? 'var(--shadow-below-md)' : 'none',
        transform: pressed ? 'translateY(0)' : hover ? 'translateY(-2px)' : 'translateY(0)',
        fontFamily: 'var(--font-sans)',
        minHeight: 280,
      }}
    >
      <ProductPreview kind={kind} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
        <span
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--line-height-snug)',
            letterSpacing: '-0.01em',
            color: 'var(--color-content-primary)',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-regular)',
            lineHeight: 'var(--line-height-loose)',
            color: 'var(--color-content-secondary)',
          }}
        >
          {lede}
        </span>
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          color: hover ? 'var(--color-content-primary)' : 'var(--color-content-secondary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          transition: 'color 160ms ease, transform 160ms ease',
          transform: hover ? 'translateX(2px)' : 'translateX(0)',
        }}
      >
        {action}
        <ArrowNarrowRightIcon size={16} />
      </span>
    </button>
  )
}

function WorkspaceCard({ workspace, active, onHover, onSelect }) {
  const { Icon } = workspace

  return (
    <button
      type="button"
      className="entry-workspace-card"
      onClick={() => onSelect(workspace.id)}
      onMouseEnter={() => onHover(workspace)}
      onFocus={() => onHover(workspace)}
      data-active={active ? 'true' : 'false'}
    >
      <span className="entry-workspace-icon" aria-hidden="true"><Icon size={19} /></span>
      <span className="entry-workspace-name">{workspace.name}</span>
      <span className="entry-workspace-usecase">{workspace.description}</span>
      <span className="entry-workspace-arrow" aria-hidden="true">
        <ArrowNarrowRightIcon size={16} />
      </span>
    </button>
  )
}

function PhoneNotifications({ workspace }) {
  const notifications = workspace.notifications || []
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    if (notifications.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setIndex(current => (current + 1) % notifications.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [workspace.id, notifications.length])

  if (!notifications.length) return null

  const item = notifications[index] || notifications[0]
  const count = index + 1

  return (
    <div key={`${workspace.id}-${index}`} className="entry-phone-notification" aria-hidden="true">
      <div className="entry-phone-notification-icon">
        <img src={TEAMBRIDGE_NOTIFICATION_ICON} alt="" />
        <span>{count}</span>
      </div>
      <div className="entry-phone-notification-body">
        <div className="entry-phone-notification-head">
          <strong>Teambridge</strong>
          <span>now</span>
        </div>
        <p>
          <b>{item.label}</b>
          {item.text}
        </p>
      </div>
    </div>
  )
}

function WorkspaceCollection({ onSelect }) {
  const [active, setActive] = useState(DEMO_VERTICALS[0])

  return (
    <section className="entry-workspace-section" aria-labelledby="ready-workspaces-title">
      <div className="entry-workspace-section-head">
        <div>
          <Eyebrow style={{ color: 'var(--color-content-tertiary)', marginBottom: 'var(--space-2)' }}>
            Ready-made workspaces
          </Eyebrow>
          <h2 id="ready-workspaces-title">Open a preloaded workspace by vertical.</h2>
        </div>
        <p>Realistic staff, schedules, payroll, workflows, and agent activity are already loaded.</p>
      </div>
      <div className="entry-workspace-shell">
        <div className="entry-workspace-row">
          {DEMO_VERTICALS.map(workspace => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              active={active.id === workspace.id}
              onHover={setActive}
              onSelect={onSelect}
            />
          ))}
        </div>
        <aside className="entry-workspace-detail" aria-live="polite">
          {active.mediaType === 'video' ? (
            <video
              key={active.media}
              className="entry-workspace-detail-media"
              src={active.media}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          ) : (
            <div
              className="entry-workspace-detail-bg"
              style={{ backgroundImage: `url(${active.media})` }}
              aria-hidden="true"
            />
          )}
          <div className="entry-workspace-detail-top">
            <PhoneNotifications workspace={active} />
          </div>
          <div className="entry-workspace-detail-copy">
            <h3>{active.name} workspace</h3>
            <p>{active.scenario}</p>
            <p>{active.outcome}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default function EntryChoice({ onBuild, onExplore, onSelectDemo }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--color-bg-primary) 0%, color-mix(in srgb, var(--color-bg-secondary) 86%, var(--color-content-primary)) 100%)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-6) var(--space-8)',
        }}
      >
        <img
          src={TEAMBRIDGE_LOGO}
          alt="Teambridge"
          style={{
            width: 166,
            height: 'auto',
            display: 'block',
          }}
        />
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8) var(--space-6) var(--space-16)',
        }}
      >
        <div
          className="entry-hero-layout"
          style={{
            width: '100%',
            maxWidth: 1120,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center',
          }}
        >
          <section style={{ minWidth: 0 }}>
            <Eyebrow style={{ color: 'var(--color-content-tertiary)', marginBottom: 'var(--space-4)' }}>
              Teambridge demo
            </Eyebrow>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(42px, 6vw, 72px)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 1.02,
                letterSpacing: 0,
                color: 'var(--color-content-primary)',
              }}
            >
              Start with a workspace that feels like yours.
            </h1>
            <p
              style={{
                margin: 'var(--space-5) 0 0',
                maxWidth: 520,
                fontSize: 'var(--text-lg)',
                lineHeight: 'var(--line-height-loose)',
                color: 'var(--color-content-secondary)',
              }}
            >
              Let Nova build a workspace from your company context, or open a realistic
              industry account with scheduling, payroll, onboarding, compliance, and agents already running.
            </p>
            <div
              style={{
                marginTop: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              <AgentTeam />
            </div>
          </section>

          <div
            className="entry-build-panel"
            style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border-opaque)',
              borderRadius: 'var(--radius-xl)',
              background: 'color-mix(in srgb, var(--color-bg-primary) 96%, var(--color-content-primary))',
              boxShadow: 'var(--shadow-below-lg)',
            }}
          >
            <ChoiceCard
              kind="build"
              title="Build my workspace"
              lede="Give Nova your website or a short description. It fills in locations, roles, goals, policies, and the first set of Teambridge agents."
              action="Start with my company"
              onClick={onBuild}
            />
          </div>
        </div>
        <WorkspaceCollection onSelect={onSelectDemo || (() => onExplore())} />
      </main>
    </div>
  )
}
