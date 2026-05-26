import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { TeambridgeAIIcon }     from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronLeftIcon }      from '../../../src/components/icons/ChevronLeftIcon.tsx'
import { ChevronDownIcon }      from '../../../src/components/icons/ChevronDownIcon.tsx'
import { PlusIcon }             from '../../../src/components/icons/PlusIcon.tsx'
import { SearchSmIcon }         from '../../../src/components/icons/SearchSmIcon.tsx'
import { ClockIcon }            from '../../../src/components/icons/ClockIcon.tsx'
import { CheckCircleIcon }      from '../../../src/components/icons/CheckCircleIcon.tsx'
import { CheckCircleDashedIcon } from '../../../src/components/icons/CheckCircleDashedIcon.tsx'
import { AlertTriangleIcon }    from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { GitBranch01Icon }      from '../../../src/components/icons/GitBranch01Icon.tsx'
import { Target04Icon }         from '../../../src/components/icons/Target04Icon.tsx'
import { XIcon }                from '../../../src/components/icons/XIcon.tsx'
import {
  WORKFLOWS,
  WORKFLOW_TEMPLATES_FEATURED,
  templatesByCategory,
  getTemplate,
  getWorkflow,
  flattenNodes,
  firstNodeId,
  nodeAgent,
} from '../data/workflowData.js'
import { AGENTS } from '../data/agents.js'

/* ─── Entry view ──────────────────────────────────────────────────────────
   Controlled list → detail routing (same pattern as PayView). `pendingId`
   from the parent auto-navigates into the detail when the Sandra CTA routes
   the operator here, so they land right on the Last-min Replacement page
   instead of bouncing through the list. */
export default function WorkflowsView({ industryId, pendingWorkflowId, onConsumePending, onDemo }) {
  const [route, setRoute] = useState({ screen: 'list' })
  const buzz = () => onDemo?.()

  useEffect(() => {
    if (pendingWorkflowId) {
      setRoute({ screen: 'detail', id: pendingWorkflowId })
      onConsumePending?.()
    }
  }, [pendingWorkflowId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (route.screen === 'detail') {
    return (
      <WorkflowDetailScreen
        id={route.id}
        onBack={() => setRoute({ screen: 'list' })}
        onDemo={buzz}
      />
    )
  }
  return (
    <WorkflowListScreen
      onOpen={(id) => setRoute({ screen: 'detail', id })}
      onDemo={buzz}
    />
  )
}

/* ─── List ────────────────────────────────────────────────────────────── */

function WorkflowListScreen({ onOpen, onDemo }) {
  const buzz = () => onDemo?.()
  const [tab, setTab] = useState('browse')
  return (
    <section className="wf" aria-label="Agent Workflows">
      <header className="wf-head">
        <div className="wf-head-titlewrap">
          <h1 className="wf-title">Agent Workflows</h1>
          <nav className="wf-tabs" role="tablist" aria-label="Workflow views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'browse'}
              className={`wf-tab ${tab === 'browse' ? 'is-active' : ''}`}
              onClick={() => setTab('browse')}
            >
              Browse
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'mine'}
              className={`wf-tab ${tab === 'mine' ? 'is-active' : ''}`}
              onClick={() => setTab('mine')}
            >
              My Workflows
            </button>
          </nav>
        </div>
        <div className="wf-head-actions">
          <button type="button" className="wf-btn wf-btn-dark" onClick={buzz}>
            <PlusIcon size={14} /> Create Workflow
          </button>
        </div>
      </header>

      {tab === 'browse' ? (
        <BrowseTemplates onOpen={onOpen} onDemo={buzz} />
      ) : (
        <MyWorkflowsList onOpen={onOpen} onDemo={buzz} />
      )}
    </section>
  )
}

function BrowseTemplates({ onOpen, onDemo }) {
  const buzz = () => onDemo?.()
  const grouped = templatesByCategory()
  const [activeTemplateId, setActiveTemplateId] = useState(null)
  const activeTemplate = activeTemplateId ? getTemplate(activeTemplateId) : null
  return (
    <>
      <h2 className="wf-section-title">Featured</h2>
      <div className="wf-featured">
        {WORKFLOW_TEMPLATES_FEATURED.map(tpl => (
          <FeaturedTemplateCard key={tpl.id} template={tpl} onOpen={() => setActiveTemplateId(tpl.id)} />
        ))}
      </div>

      <div className="wf-browse-toolbar">
        <h2 className="wf-section-title wf-section-title-flush">All Workflows</h2>
        <div className="wf-browse-toolbar-right">
          <div className="wf-list-search" role="search">
            <SearchSmIcon size={14} />
            <input type="text" placeholder="Find templates…" onClick={buzz} onChange={() => {}} />
          </div>
          <button type="button" className="wf-filter" onClick={buzz}>All categories <ChevronDownIcon size={12} /></button>
          <button type="button" className="wf-filter" onClick={buzz}>All agents <ChevronDownIcon size={12} /></button>
        </div>
      </div>

      <div className="wf-tpl-groups">
        {grouped.map(group => (
          <div key={group.id} className="wf-tpl-group">
            <h3 className="wf-tpl-group-title">{group.label}</h3>
            <div className="wf-tpl-grid">
              {group.items.map(tpl => (
                <TemplateTile key={tpl.id} template={tpl} onOpen={() => setActiveTemplateId(tpl.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeTemplate && (
        <TemplateModal
          template={activeTemplate}
          onClose={() => setActiveTemplateId(null)}
          onViewDetails={() => {
            const wfId = activeTemplate.workflowId
            if (wfId && WORKFLOWS.some(w => w.id === wfId)) {
              setActiveTemplateId(null)
              onOpen(wfId)
            } else {
              buzz()
            }
          }}
          onTurnOn={buzz}
        />
      )}
    </>
  )
}

/* Interstitial details modal — overview, what it does, key metrics,
 * "Turn On" (primary) + "View workflow details" (secondary). Turn On
 * flips to a confirmed state in-line; details navigation only fires
 * when the template is backed by a real workflow definition. */
function TemplateModal({ template, onClose, onViewDetails, onTurnOn }) {
  const agent = AGENTS[template.agentId]
  const [turnedOn, setTurnedOn] = useState(false)
  const hasWorkflow = !!template.workflowId && WORKFLOWS.some(w => w.id === template.workflowId)

  // Esc closes; click on backdrop closes.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleTurnOn = () => {
    if (turnedOn) return
    setTurnedOn(true)
    onTurnOn?.()
  }

  return (
    <div
      className="wf-modal-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={`${template.title} template details`}
      onClick={onClose}
    >
      <div className="wf-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="wf-modal-close"
          onClick={onClose}
          aria-label="Close template details"
        >
          <XIcon size={14} />
        </button>

        <header className="wf-modal-head">
          {agent && (
            <span
              className={`wf-modal-agent agent-avatar agent-avatar-${agent.color}`}
              style={{ backgroundImage: `url(${agent.avatar})` }}
              aria-label={agent.name}
              role="img"
            />
          )}
          <div className="wf-modal-head-text">
            <span className="wf-modal-agent-line">
              <span className="wf-modal-agent-name">{agent?.name}</span>
              <span className="wf-modal-agent-sep" aria-hidden="true">·</span>
              <span className="wf-modal-agent-role">{agent?.role}</span>
            </span>
            <h2 className="wf-modal-title">{template.title}</h2>
          </div>
        </header>

        <p className="wf-modal-desc">{template.description}</p>

        {template.triggerLabel && (
          <div className="wf-modal-trigger">
            <span className="wf-modal-trigger-label">Trigger</span>
            <span className="wf-modal-trigger-value">{template.triggerLabel}</span>
          </div>
        )}

        {template.highlights?.length > 0 && (
          <div className="wf-modal-section">
            <h3 className="wf-modal-section-title">What it does</h3>
            <ul className="wf-modal-list">
              {template.highlights.map((h, i) => (
                <li key={i} className="wf-modal-list-item">
                  <span className="wf-modal-list-bullet" aria-hidden="true">
                    <CheckCircleIcon size={12} />
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {template.metrics?.length > 0 && (
          <div className="wf-modal-section">
            <h3 className="wf-modal-section-title">Key metrics it improves</h3>
            <div className="wf-modal-metrics">
              {template.metrics.map((m, i) => (
                <div key={i} className="wf-modal-metric">
                  <span className="wf-modal-metric-value">{m.value}</span>
                  <span className="wf-modal-metric-label">{m.label}</span>
                  {m.sub && <span className="wf-modal-metric-sub">{m.sub}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="wf-modal-foot">
          <button
            type="button"
            className="wf-btn wf-modal-secondary"
            onClick={onViewDetails}
            disabled={!hasWorkflow}
            title={hasWorkflow ? undefined : 'Workflow details available after you turn this on.'}
          >
            View workflow details
          </button>
          <button
            type="button"
            className={`wf-btn wf-btn-dark wf-modal-primary ${turnedOn ? 'is-on' : ''}`}
            onClick={handleTurnOn}
          >
            {turnedOn ? (
              <>
                <CheckCircleIcon size={14} /> Turned On
              </>
            ) : (
              'Turn On'
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}

function FeaturedTemplateCard({ template, onOpen }) {
  const agent = AGENTS[template.agentId]
  return (
    <button
      type="button"
      className={`wf-featured-card wf-featured-card-${template.gradient}`}
      onClick={onOpen}
    >
      <div className="wf-featured-head">
        {agent && (
          <span
            className={`wf-featured-agent agent-avatar agent-avatar-${agent.color}`}
            style={{ backgroundImage: `url(${agent.avatar})` }}
            aria-label={agent.name}
            role="img"
          />
        )}
        <span className="wf-featured-meta">
          <span className="wf-featured-agent-name">{agent?.name}</span>
          <span className="wf-featured-agent-role">{agent?.role}</span>
        </span>
      </div>
      <div className="wf-featured-body">
        <div className="wf-featured-title">{template.title}</div>
        <div className="wf-featured-desc">{template.description}</div>
      </div>
      <div className="wf-featured-foot">
        <span className="wf-featured-pill">{template.triggerLabel}</span>
        <span className="wf-featured-nodes">{template.nodeCount} steps</span>
      </div>
    </button>
  )
}

function TemplateTile({ template, onOpen }) {
  const agent = AGENTS[template.agentId]
  return (
    <button type="button" className="wf-tpl-tile" onClick={onOpen}>
      {agent && (
        <span
          className={`wf-tpl-tile-avatar agent-avatar agent-avatar-${agent.color}`}
          style={{ backgroundImage: `url(${agent.avatar})` }}
          aria-label={agent.name}
          role="img"
        />
      )}
      <div className="wf-tpl-tile-text">
        <div className="wf-tpl-tile-title">{template.title}</div>
        <div className="wf-tpl-tile-desc">{template.description}</div>
      </div>
    </button>
  )
}

function MyWorkflowsList({ onOpen, onDemo }) {
  const buzz = () => onDemo?.()
  return (
    <>
      <div className="wf-list-toolbar">
        <div className="wf-list-search" role="search">
          <SearchSmIcon size={14} />
          <input type="text" placeholder="Search workflows…" onClick={buzz} onChange={() => {}} />
        </div>
        <button type="button" className="wf-filter" onClick={buzz}>All statuses <ChevronDownIcon size={12} /></button>
        <button type="button" className="wf-filter" onClick={buzz}>All owners <ChevronDownIcon size={12} /></button>
      </div>

      <div className="wf-list" role="table">
        <div className="wf-list-head" role="row">
          <div className="wf-list-cell-name-head">Workflow</div>
          <div>Owner</div>
          <div>Trigger</div>
          <div>Last edited</div>
          <div>Status</div>
        </div>
        {WORKFLOWS.map(w => (
          <button
            key={w.id}
            type="button"
            className="wf-list-row"
            role="row"
            onClick={() => onOpen(w.id)}
          >
            <div className="wf-list-cell wf-list-cell-name">
              <span className="wf-list-cell-icon" aria-hidden="true"><GitBranch01Icon size={14} /></span>
              <div>
                <div className="wf-list-cell-title">{w.title}</div>
                <div className="wf-list-cell-sub">{w.eyebrow}</div>
              </div>
            </div>
            <div className="wf-list-cell">{w.owner}</div>
            <div className="wf-list-cell">{w.stream?.[0]?.title ?? '—'}</div>
            <div className="wf-list-cell">{w.lastEdited}</div>
            <div className="wf-list-cell">
              <span className={`wf-status wf-status-${w.status}`}>
                <span className="wf-status-dot" aria-hidden="true" />
                {w.status === 'draft' ? 'Draft' : w.status === 'active' ? 'Active' : 'Archived'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/* ─── Detail — canvas + right panel + left assistant ──────────────────── */

/* Zoom steps and clamp helpers for the canvas. 1 = 100% (the intended
   design size); ±25% per click reads comfortably without snapping too hard. */
const ZOOM_STEPS = [0.5, 0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2]
const DEFAULT_ZOOM = 1

function clampZoom(next) {
  const min = ZOOM_STEPS[0]
  const max = ZOOM_STEPS[ZOOM_STEPS.length - 1]
  return Math.min(max, Math.max(min, next))
}

function stepZoom(current, direction) {
  if (direction === 0) return DEFAULT_ZOOM
  // Snap to the nearest step above or below the current value.
  const sorted = [...ZOOM_STEPS]
  if (direction > 0) {
    return clampZoom(sorted.find(s => s > current + 0.001) ?? sorted[sorted.length - 1])
  }
  const reversed = [...sorted].reverse()
  return clampZoom(reversed.find(s => s < current - 0.001) ?? sorted[0])
}

function WorkflowDetailScreen({ id, onBack, onDemo }) {
  const workflow = useMemo(() => getWorkflow(id), [id])
  const nodeIndex = useMemo(() => flattenNodes(workflow.stream), [workflow])
  const [selectedId, setSelectedId] = useState(firstNodeId(workflow))
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const buzz = () => onDemo?.()

  const selected = selectedId ? nodeIndex[selectedId] ?? null : null

  return (
    <section className="wf-detail" aria-label={workflow.title}>
      <header className="wf-detail-head">
        <div className="wf-detail-head-left">
          <button type="button" className="wf-icon-btn" onClick={onBack} aria-label="Back to workflows">
            <ChevronLeftIcon size={16} />
          </button>
          <h1 className="wf-detail-title">{workflow.title}</h1>
          <span className="wf-status wf-status-draft">
            <span className="wf-status-dot" aria-hidden="true" />
            Draft
          </span>
        </div>
        <div className="wf-detail-head-right">
          <span className="wf-detail-saved">All changes are saved!</span>
          <button type="button" className="wf-btn" onClick={buzz}>Run test</button>
          <button type="button" className="wf-btn wf-btn-dark" onClick={buzz}>Publish</button>
        </div>
      </header>

      <div className="wf-detail-body">
        <AssistantColumn onDemo={buzz} />
        <CanvasColumn
          workflow={workflow}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDemo={buzz}
          zoom={zoom}
          setZoom={setZoom}
          onZoomIn={() => setZoom(z => stepZoom(z, +1))}
          onZoomOut={() => setZoom(z => stepZoom(z, -1))}
          onZoomReset={() => setZoom(DEFAULT_ZOOM)}
        />
        {selected && (
          <NodeDetailsPanel
            node={selected}
            onClose={() => setSelectedId(null)}
            onDemo={buzz}
          />
        )}
      </div>

      <CanvasToolbar onDemo={buzz} />
    </section>
  )
}

/* ─── Left AI-assistant column (static placeholder) ─────────────────── */

function AssistantColumn({ onDemo }) {
  const buzz = () => onDemo?.()
  return (
    <aside className="wf-assistant" aria-label="Workflow assistant">
      <div className="wf-assistant-body">
        <p className="wf-assistant-intro">
          Hi! I'm your workflow assistant. I'll help you build and track
          changes to this workflow. Start by adding a trigger to kick things
          off — or ask me anything.
        </p>
        <button type="button" className="wf-assistant-seed" onClick={buzz}>
          Build a workflow for new user onboarding
        </button>
      </div>
      <div className="wf-assistant-composer">
        <textarea
          className="wf-assistant-input"
          placeholder="Ask AI anything…"
          rows={2}
          onClick={buzz}
          onChange={() => {}}
        />
        <div className="wf-assistant-composer-foot">
          <button type="button" className="wf-assistant-add" onClick={buzz} aria-label="Add context">
            <PlusIcon size={14} />
          </button>
          <button type="button" className="wf-assistant-send" onClick={buzz} aria-label="Send">
            <ArrowNarrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

/* ─── Canvas ──────────────────────────────────────────────────────────
   Renders a vertical stream of nodes. If a node has `branches`, a split
   fans out below it into N parallel sub-streams, each with its own label
   on the connecting line. Streams render recursively so splits can nest. */

function CanvasColumn({
  workflow,
  selectedId,
  onSelect,
  onDemo,
  zoom,
  setZoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) {
  const scrollRef = useRef(null)
  const panStateRef = useRef(null)
  const [isPanning, setIsPanning] = useState(false)

  // Wheel → zoom. React's onWheel listener runs passive in modern React, so
  // preventDefault() wouldn't take; we attach a native listener manually.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const factor = 1 - e.deltaY * 0.0018
      setZoom(z => clampZoom(z * factor))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [setZoom])

  // Click-drag → pan. Ignore when the mousedown lands on an actual control
  // so node selection / zoom buttons keep working.
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    if (e.target.closest('button, a, input, textarea, select, label')) return
    const el = scrollRef.current
    if (!el) return
    panStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      moved: false,
    }
    setIsPanning(true)
    e.preventDefault()
  }

  useEffect(() => {
    if (!isPanning) return
    const onMove = (e) => {
      const s = panStateRef.current
      const el = scrollRef.current
      if (!s || !el) return
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      if (Math.abs(dx) + Math.abs(dy) > 3) s.moved = true
      el.scrollLeft = s.scrollLeft - dx
      el.scrollTop = s.scrollTop - dy
    }
    const onUp = () => {
      setIsPanning(false)
      panStateRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isPanning])

  // Swallow the click that fires at the end of a pan drag so we don't
  // deselect the current node just because the operator let go of the mouse.
  const handleClickCapture = (e) => {
    const s = panStateRef.current
    if (s?.moved) {
      e.stopPropagation()
      s.moved = false
    }
  }

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onSelect(null)
  }

  return (
    <div className="wf-canvas" onClick={handleBackgroundClick}>
      <div
        ref={scrollRef}
        className={`wf-canvas-scroll${isPanning ? ' is-panning' : ''}`}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
        onClick={handleBackgroundClick}
      >
        <div
          className="wf-canvas-stage"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
          onClick={handleBackgroundClick}
        >
          <div
            className="wf-canvas-inner"
            onClick={handleBackgroundClick}
          >
            <Stream
              nodes={workflow.stream}
              selectedId={selectedId}
              onSelect={onSelect}
              onDemo={onDemo}
            />
          </div>
        </div>
      </div>
      <ZoomControls
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
      />
    </div>
  )
}

/* Floating zoom pill in the bottom-right of the canvas. Inline SVGs avoid
   pulling in new icon files for glyphs we only need in this one spot. */
function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }) {
  const pct = Math.round(zoom * 100)
  const atMin = zoom <= ZOOM_STEPS[0] + 0.001
  const atMax = zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] - 0.001
  return (
    <div className="wf-zoom" role="group" aria-label="Zoom controls">
      <button
        type="button"
        className="wf-zoom-btn"
        onClick={onZoomOut}
        aria-label="Zoom out"
        disabled={atMin}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className="wf-zoom-level"
        onClick={onZoomReset}
        aria-label={`Reset zoom (currently ${pct}%)`}
        title="Reset to 100%"
      >
        {pct}%
      </button>
      <button
        type="button"
        className="wf-zoom-btn"
        onClick={onZoomIn}
        aria-label="Zoom in"
        disabled={atMax}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6h7M6 2.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function Stream({ nodes, selectedId, onSelect, onDemo }) {
  return (
    <div className="wf-stream">
      {nodes.map((node, i) => {
        const hasBranches = Array.isArray(node.branches) && node.branches.length > 0
        const isLast = i === nodes.length - 1
        return (
          <Fragment key={node.id}>
            <WorkflowNode
              node={node}
              selected={selectedId === node.id}
              onSelect={() => onSelect(selectedId === node.id ? null : node.id)}
              onMore={onDemo}
            />
            {hasBranches && (
              <BranchSplit
                branches={node.branches}
                selectedId={selectedId}
                onSelect={onSelect}
                onDemo={onDemo}
              />
            )}
            {!hasBranches && !isLast && <WorkflowEdge onAdd={onDemo} />}
          </Fragment>
        )
      })}
    </div>
  )
}

/* Horizontal split directly underneath a branching node.

   The split paints a single, continuous connector:
   - one vertical stem dropping out of the parent node
   - one horizontal bar at the mid-point that fans the stem across the columns
   - one vertical drop per column straight into the top of that column's first node

   The SVG is percentage-width with `preserveAspectRatio="none"` and
   `vector-effect="non-scaling-stroke"` so the x coords stretch to match the
   flex columns underneath while the stroke weight stays 1.5px.

   Labels are absolute-positioned chips sitting ON the branch verticals, which
   keeps the connector line unbroken — previously the chip was laid out with
   flow margin, which created the floating-line gap. */
function BranchSplit({ branches, selectedId, onSelect, onDemo }) {
  const count = branches.length
  const stemHeight = 20    // parent → horizontal bar
  const branchHeight = 44  // horizontal bar → top of child stream
  const totalHeight = stemHeight + branchHeight
  const colCenter = (i) => ((i + 0.5) * 100) / count
  const leftX = colCenter(0)
  const rightX = colCenter(count - 1)
  return (
    <div className={`wf-split wf-split-${count}`}>
      <div className="wf-split-fork" style={{ height: totalHeight }}>
        <svg
          className="wf-fork-svg"
          width="100%"
          height={totalHeight}
          viewBox={`0 0 100 ${totalHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          >
            <line x1="50" y1="0" x2="50" y2={stemHeight} />
            {count > 1 && (
              <line x1={leftX} y1={stemHeight} x2={rightX} y2={stemHeight} />
            )}
            {Array.from({ length: count }).map((_, i) => {
              const x = colCenter(i)
              return (
                <line
                  key={i}
                  x1={x}
                  y1={count > 1 ? stemHeight : 0}
                  x2={x}
                  y2={totalHeight}
                />
              )
            })}
          </g>
        </svg>
        {branches.map((b, i) => (
          <span
            key={i}
            className={`wf-split-label wf-split-label-${b.tone ?? 'mute'}`}
            style={{
              left: `${colCenter(i)}%`,
              top: stemHeight + branchHeight / 2,
            }}
          >
            {b.label}
          </span>
        ))}
      </div>
      <div className="wf-split-streams">
        {branches.map((b, i) => (
          <div key={i} className={`wf-split-col wf-split-col-${b.tone ?? 'mute'}`}>
            <Stream
              nodes={b.stream}
              selectedId={selectedId}
              onSelect={onSelect}
              onDemo={onDemo}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkflowNode({ node, selected, onSelect, onMore }) {
  const agent = nodeAgent(node)
  const KindIcon = nodeGlyph(node.kind)
  return (
    <div className="wf-node-wrap">
      <button
        type="button"
        className={`wf-node wf-node-${node.kind}${selected ? ' is-selected' : ''}${
          agent ? ` wf-node-agent-${agent.color}` : ''
        }`}
        onClick={onSelect}
        aria-pressed={selected}
      >
        {agent ? (
          <span
            className={`wf-node-avatar agent-avatar agent-avatar-${agent.color}`}
            style={{ backgroundImage: `url(${agent.avatar})` }}
            aria-label={agent.name}
            role="img"
          />
        ) : (
          <span className="wf-node-icon" aria-hidden="true">
            <KindIcon size={14} />
          </span>
        )}
        <span className="wf-node-text">
          {agent && (
            <span className="wf-node-eyebrow">
              <span className="wf-node-eyebrow-name">{agent.name}</span>
              <span className="wf-node-eyebrow-sep" aria-hidden="true">·</span>
              <span className="wf-node-eyebrow-role">{agent.role}</span>
            </span>
          )}
          <span className="wf-node-title">{node.title}</span>
          {node.subtitle && <span className="wf-node-sub">{node.subtitle}</span>}
        </span>
      </button>
      <button
        type="button"
        className="wf-node-more"
        onClick={(e) => { e.stopPropagation(); onMore?.() }}
        aria-label="Node actions"
      >
        ···
      </button>
    </div>
  )
}

/* Vertical edge between two nodes on the same stream. One continuous line
   with a `+` handle centered on it (hover-revealed) so the connector stays
   unbroken and the nodes read as actually connected. */
function WorkflowEdge({ onAdd }) {
  return (
    <div className="wf-edge" aria-hidden="true">
      <span className="wf-edge-line" />
      <button
        type="button"
        className="wf-edge-add"
        onClick={(e) => { e.stopPropagation(); onAdd?.() }}
        aria-label="Add node"
      >
        <PlusIcon size={10} />
      </button>
    </div>
  )
}

function nodeGlyph(kind) {
  if (kind === 'trigger')   return ArrowNarrowRightIcon
  if (kind === 'timer')     return ClockIcon
  if (kind === 'condition') return Target04Icon
  if (kind === 'action')    return CheckCircleIcon
  if (kind === 'agent')     return TeambridgeAIIcon
  if (kind === 'end')       return CheckCircleDashedIcon
  return ArrowNarrowRightIcon
}

/* ─── Node details panel (right) ────────────────────────────────────── */

function NodeDetailsPanel({ node, onClose, onDemo }) {
  const buzz = () => onDemo?.()
  const { heading, description, promptPlaceholder, fields, chips } = node.panel
  const agent = nodeAgent(node)
  const KindIcon = nodeGlyph(node.kind)

  return (
    <aside className={`wf-panel wf-panel-${node.kind}`} aria-label={heading}>
      <header className="wf-panel-head">
        <div className="wf-panel-head-title">
          {agent ? (
            <span
              className={`wf-panel-agent agent-avatar agent-avatar-${agent.color}`}
              style={{ backgroundImage: `url(${agent.avatar})` }}
              aria-label={agent.name}
              role="img"
            />
          ) : (
            <span className={`wf-panel-kind wf-panel-kind-${node.kind}`} aria-hidden="true">
              <KindIcon size={14} />
            </span>
          )}
          <span>{heading}</span>
        </div>
        <button type="button" className="wf-icon-btn" onClick={onClose} aria-label="Close details">
          <XIcon size={14} />
        </button>
      </header>

      {description && <p className="wf-panel-desc">{description}</p>}

      <div className="wf-panel-composer">
        <textarea
          className="wf-panel-composer-input"
          placeholder={promptPlaceholder ?? 'Ask the assistant to tweak this node…'}
          rows={2}
          onClick={buzz}
          onChange={() => {}}
        />
        <div className="wf-panel-composer-foot">
          <span className="wf-panel-composer-hint">
            <TeambridgeAIIcon size={12} /> Shape this node with a prompt
          </span>
          <button type="button" className="wf-panel-composer-send" onClick={buzz} aria-label="Send">
            <ArrowNarrowRightIcon size={14} />
          </button>
        </div>
      </div>

      <div className="wf-panel-fields">
        {fields.map((f, i) => <FieldRow key={i} field={f} onDemo={buzz} />)}
      </div>

      {chips?.length > 0 && (
        <div className="wf-panel-chips" role="list">
          {chips.map((c, i) => (
            <button key={i} type="button" className="wf-panel-chip" onClick={buzz}>
              <PlusIcon size={10} /> {c}
            </button>
          ))}
        </div>
      )}

      <div className="wf-panel-foot">
        <button type="button" className="wf-btn wf-btn-dark" onClick={buzz}>Save</button>
      </div>
    </aside>
  )
}

function FieldRow({ field, onDemo }) {
  const buzz = () => onDemo?.()
  if (field.type === 'pill-list' && Array.isArray(field.value)) {
    return (
      <div className="wf-field">
        <div className="wf-field-label">{field.label}</div>
        <div className="wf-field-pills">
          {field.value.map((v, i) => (
            <button key={i} type="button" className="wf-field-pill" onClick={buzz}>
              {v} <XIcon size={10} />
            </button>
          ))}
          <button type="button" className="wf-field-pill wf-field-pill-add" onClick={buzz}>
            <PlusIcon size={10} /> Add
          </button>
        </div>
      </div>
    )
  }
  if (field.type === 'select') {
    return (
      <div className="wf-field">
        <div className="wf-field-label">{field.label}</div>
        <button type="button" className="wf-field-input wf-field-select" onClick={buzz}>
          <span>{field.value}</span>
          <ChevronDownIcon size={12} />
        </button>
      </div>
    )
  }
  if (field.type === 'template') {
    return (
      <div className="wf-field">
        <div className="wf-field-label">{field.label}</div>
        <div className="wf-field-template" onClick={buzz}>
          {renderTemplate(field.value)}
        </div>
      </div>
    )
  }
  // text (default)
  return (
    <div className="wf-field">
      <div className="wf-field-label">{field.label}</div>
      <button type="button" className="wf-field-input" onClick={buzz}>
        <span>{field.value}</span>
      </button>
    </div>
  )
}

/* Render a mustache-style template with highlighted {{placeholders}}. */
function renderTemplate(tpl) {
  const parts = []
  const regex = /\{\{([^}]+)\}\}/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(tpl)) !== null) {
    if (match.index > lastIndex) parts.push({ kind: 'text', value: tpl.slice(lastIndex, match.index) })
    parts.push({ kind: 'var', value: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < tpl.length) parts.push({ kind: 'text', value: tpl.slice(lastIndex) })
  return parts.map((p, i) => p.kind === 'var'
    ? <span key={i} className="wf-field-template-var">{`{{${p.value}}}`}</span>
    : <span key={i}>{p.value}</span>
  )
}

/* ─── Bottom toolbar ────────────────────────────────────────────────── */

function CanvasToolbar({ onDemo }) {
  const buzz = () => onDemo?.()
  const items = [
    { Icon: SearchSmIcon,         label: 'Search' },
    { Icon: ArrowNarrowRightIcon, label: 'Trigger' },
    { Icon: Target04Icon,         label: 'Condition' },
    { Icon: CheckCircleIcon,      label: 'Action' },
    { Icon: TeambridgeAIIcon,     label: 'AI action' },
    { Icon: ClockIcon,            label: 'Wait' },
    { Icon: GitBranch01Icon,      label: 'Branch' },
    { Icon: AlertTriangleIcon,    label: 'Alert' },
  ]
  return (
    <div className="wf-toolbar" role="toolbar" aria-label="Canvas actions">
      {items.map(({ Icon, label }, i) => (
        <button key={i} type="button" className="wf-toolbar-btn" onClick={buzz} aria-label={label}>
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
