import { useEffect, useMemo, useRef, useState } from 'react'
import { TeambridgeAIIcon }     from '../../../src/components/icons/TeambridgeAIIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { ChevronLeftIcon }      from '../../../src/components/icons/ChevronLeftIcon.tsx'
import { ChevronRightIcon }     from '../../../src/components/icons/ChevronRightIcon.tsx'
import { ChevronDownIcon }      from '../../../src/components/icons/ChevronDownIcon.tsx'
import { PlusIcon }             from '../../../src/components/icons/PlusIcon.tsx'
import { SearchSmIcon }         from '../../../src/components/icons/SearchSmIcon.tsx'
import { ClockIcon }            from '../../../src/components/icons/ClockIcon.tsx'
import { CheckCircleIcon }      from '../../../src/components/icons/CheckCircleIcon.tsx'
import { AlertTriangleIcon }    from '../../../src/components/icons/AlertTriangleIcon.tsx'
import { GitBranch01Icon }      from '../../../src/components/icons/GitBranch01Icon.tsx'
import { Target04Icon }         from '../../../src/components/icons/Target04Icon.tsx'
import { XIcon }                from '../../../src/components/icons/XIcon.tsx'
import { ArrowUpRightIcon }     from '../../../src/components/icons/ArrowUpRightIcon.tsx'
import { ListBulletIcon }       from '../../../src/components/icons/ListBulletIcon.tsx'
import { WORKFLOWS, getWorkflow } from '../data/workflowData.js'

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
  return (
    <section className="wf" aria-label="Agent Workflows">
      <header className="wf-head">
        <h1 className="wf-title">Agent Workflows</h1>
        <div className="wf-head-actions">
          <button type="button" className="wf-btn" onClick={buzz}>
            <PlusIcon size={14} /> New workflow
          </button>
          <button type="button" className="wf-icon-btn" onClick={buzz} aria-label="Open menu">
            <ListBulletIcon size={16} />
          </button>
        </div>
      </header>

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
          <div>Workflow</div>
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
            <div className="wf-list-cell">{w.nodes[0]?.title ?? '—'}</div>
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
    </section>
  )
}

/* ─── Detail — canvas + right panel + left assistant ──────────────────── */

function WorkflowDetailScreen({ id, onBack, onDemo }) {
  const workflow = useMemo(() => getWorkflow(id), [id])
  const [selectedId, setSelectedId] = useState(workflow.nodes[0]?.id ?? null)
  const buzz = () => onDemo?.()

  const selected = selectedId
    ? workflow.nodes.find(n => n.id === selectedId) ?? null
    : null

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

/* ─── Canvas ────────────────────────────────────────────────────────── */

function CanvasColumn({ workflow, selectedId, onSelect, onDemo }) {
  const buzz = () => onDemo?.()
  return (
    <div
      className="wf-canvas"
      onClick={(e) => {
        // Click-off closes the right panel unless the click was on a node.
        if (e.target === e.currentTarget) onSelect(null)
      }}
    >
      <div className="wf-canvas-inner">
        {workflow.nodes.map((node, i) => (
          <div key={node.id} className="wf-canvas-row">
            <WorkflowNode
              node={node}
              selected={selectedId === node.id}
              onSelect={() => onSelect(node.id === selectedId ? null : node.id)}
              onMore={buzz}
            />
            {i < workflow.nodes.length - 1 && (
              <WorkflowEdge
                toKind={workflow.nodes[i + 1].kind}
                onAdd={buzz}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkflowNode({ node, selected, onSelect, onMore }) {
  const KindIcon = nodeGlyph(node.kind)
  return (
    <div className="wf-node-wrap">
      <button
        type="button"
        className={`wf-node wf-node-${node.kind}${selected ? ' is-selected' : ''}`}
        onClick={onSelect}
        aria-pressed={selected}
      >
        <span className="wf-node-icon" aria-hidden="true"><KindIcon size={14} /></span>
        <span className="wf-node-text">
          <span className="wf-node-title">{node.title}</span>
          {node.subtitle && <span className="wf-node-sub">{node.subtitle}</span>}
        </span>
      </button>
      <button
        type="button"
        className="wf-node-more"
        onClick={(e) => { e.stopPropagation(); onMore() }}
        aria-label="Node actions"
      >
        ···
      </button>
    </div>
  )
}

/* Vertical 1-col edge: line + down-chevron, with a + handle hovered between
   nodes so the operator can drop a new node into the chain. */
function WorkflowEdge({ onAdd }) {
  return (
    <div className="wf-edge" aria-hidden="true">
      <span className="wf-edge-line" />
      <button
        type="button"
        className="wf-edge-add"
        onClick={(e) => { e.stopPropagation(); onAdd() }}
        aria-label="Add node"
      >
        <PlusIcon size={10} />
      </button>
      <span className="wf-edge-line" />
      <span className="wf-edge-arrow">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  )
}

function nodeGlyph(kind) {
  if (kind === 'trigger')   return ArrowNarrowRightIcon
  if (kind === 'timer')     return ClockIcon
  if (kind === 'condition') return Target04Icon
  if (kind === 'action')    return CheckCircleIcon
  return ArrowNarrowRightIcon
}

/* ─── Node details panel (right) ────────────────────────────────────── */

function NodeDetailsPanel({ node, onClose, onDemo }) {
  const buzz = () => onDemo?.()
  const { heading, description, promptPlaceholder, fields, chips } = node.panel
  const KindIcon = nodeGlyph(node.kind)

  return (
    <aside className={`wf-panel wf-panel-${node.kind}`} aria-label={heading}>
      <header className="wf-panel-head">
        <div className="wf-panel-head-title">
          <span className={`wf-panel-kind wf-panel-kind-${node.kind}`} aria-hidden="true">
            <KindIcon size={14} />
          </span>
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
