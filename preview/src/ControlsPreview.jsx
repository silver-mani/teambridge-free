/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Controls Preview
   Switch · Checkbox · Radio · RadioGroup · CheckboxGroup
   All sizes · All states · Dark mode · Integration examples
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'
import { Switch }        from '../../src/components/Switch/Switch'
import { Checkbox }      from '../../src/components/Checkbox/Checkbox'
import { Radio }         from '../../src/components/Radio/Radio'
import { RadioGroup }    from '../../src/components/RadioGroup/RadioGroup'
import { CheckboxGroup } from '../../src/components/CheckboxGroup/CheckboxGroup'
import { MultiSelectField } from '../../src/components/Input/MultiSelectField'
import { ListItem }      from '../../src/components/ListItem/ListItem'
import { Tabs }          from '../../src/components/Tabs/Tabs'

/* ── Layout helpers ──────────────────────────────────────────────────────────── */

function Section({ title, note, children }) {
  const isMobile = useIsMobile()
  return (
    <section style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-xl)',
      padding: isMobile ? 20 : 32,
    }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase',
          color: 'var(--color-content-disabled)', margin: '0 0 4px',
        }}>{title}</p>
        {note && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
            color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5,
          }}>{note}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function Label({ children }) {
  return (
    <p style={{
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
      fontWeight: 'var(--font-weight-medium)', letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase', color: 'var(--color-content-disabled)',
      margin: '0 0 10px',
    }}>{children}</p>
  )
}

function Row({ gap = 24, wrap, children }) {
  return <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', alignItems: 'flex-start', gap }}>{children}</div>
}

function Col({ gap = 12, children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
}

function Divider({ dark }) {
  return <hr style={{ border: 'none', borderTop: `1px solid var(--color-border-opaque)`, margin: '24px 0' }} />
}

/* ── Switch ──────────────────────────────────────────────────────────────────── */
function SwitchSection() {
  const [vals, setVals] = useState({ sm: false, md: true, lg: false })
  const toggle = key => setVals(v => ({ ...v, [key]: !v[key] }))

  return (
    <>
      <Section title="Switch — Sizes" note="sm (small) · md (default) · lg (large)">
        <Row gap={40} wrap>
          <Col>
            <Label>Small</Label>
            <Switch size="sm" checked={vals.sm} onChange={() => toggle('sm')} label="Small switch" description="Helper text here" />
          </Col>
          <Col>
            <Label>Medium (default)</Label>
            <Switch size="md" checked={vals.md} onChange={() => toggle('md')} label="Medium switch" description="Helper text here" />
          </Col>
          <Col>
            <Label>Large</Label>
            <Switch size="lg" checked={vals.lg} onChange={() => toggle('lg')} label="Large switch" description="Helper text here" />
          </Col>
        </Row>
      </Section>

      <Section title="Switch — States" note="All interactive states at md size">
        <Row gap={40} wrap>
          <Col><Label>Default (off)</Label><Switch label="Notifications" /></Col>
          <Col><Label>Checked (on)</Label><Switch defaultChecked label="Notifications" /></Col>
          <Col><Label>Disabled (off)</Label><Switch disabled label="Unavailable" /></Col>
          <Col><Label>Disabled (on)</Label><Switch disabled defaultChecked label="Unavailable" /></Col>
          <Col><Label>No label</Label><Switch defaultChecked /></Col>
        </Row>
      </Section>

    </>
  )
}

/* ── Checkbox ─────────────────────────────────────────────────────────────────── */
function CheckboxSection() {
  return (
    <>
      <Section title="Checkbox — Sizes" note="sm · md (default) · lg">
        <Row gap={40} wrap>
          <Col><Label>Small</Label><Checkbox size="sm" defaultChecked label="Small checkbox" /></Col>
          <Col><Label>Medium (default)</Label><Checkbox size="md" defaultChecked label="Medium checkbox" /></Col>
          <Col><Label>Large</Label><Checkbox size="lg" defaultChecked label="Large checkbox" /></Col>
        </Row>
      </Section>

      <Section title="Checkbox — States">
        <Row gap={40} wrap>
          <Col><Label>Unchecked</Label><Checkbox label="Unchecked" /></Col>
          <Col><Label>Checked</Label><Checkbox defaultChecked label="Checked" /></Col>
          <Col><Label>Indeterminate</Label><Checkbox indeterminate label="Partial selection" /></Col>
          <Col><Label>Disabled</Label><Checkbox disabled label="Disabled" /></Col>
          <Col><Label>Disabled checked</Label><Checkbox disabled defaultChecked label="Disabled checked" /></Col>
          <Col><Label>Error</Label><Checkbox error label="Required field" /></Col>
        </Row>
      </Section>

      <Section title="Checkbox — With Description">
        <Row gap={40} wrap>
          <Col><Checkbox defaultChecked label="Email notifications" description="Receive updates about your account and activity." /></Col>
          <Col><Checkbox label="Marketing emails" description="Occasional news about features and offers." /></Col>
          <Col><Checkbox disabled label="System notifications" description="Cannot be disabled by policy." /></Col>
        </Row>
      </Section>

    </>
  )
}

/* ── Radio ────────────────────────────────────────────────────────────────────── */
function RadioSection() {
  const [size, setSize] = useState('md')

  return (
    <>
      <Section title="Radio — Sizes" note="sm · md (default) · lg">
        <Row gap={40} wrap>
          {['sm', 'md', 'lg'].map(s => (
            <Col key={s}>
              <Label>{s === 'sm' ? 'Small' : s === 'md' ? 'Medium (default)' : 'Large'}</Label>
              <Radio size={s} value={s} checked={size === s} onChange={setSize} name="radio-size-demo" label={`${s.toUpperCase()} radio`} />
            </Col>
          ))}
        </Row>
      </Section>

      <Section title="Radio — States">
        <Row gap={40} wrap>
          <Col><Label>Unselected</Label><Radio value="a" label="Option A" name="state-a" /></Col>
          <Col><Label>Selected</Label><Radio value="b" checked label="Option B" name="state-b" onChange={() => {}} /></Col>
          <Col><Label>Disabled</Label><Radio value="c" disabled label="Disabled" name="state-c" /></Col>
          <Col><Label>Disabled selected</Label><Radio value="d" checked disabled label="Disabled selected" name="state-d" onChange={() => {}} /></Col>
          <Col><Label>Error</Label><Radio value="e" error label="Invalid choice" name="state-e" /></Col>
        </Row>
      </Section>

    </>
  )
}

/* ── RadioGroup ───────────────────────────────────────────────────────────────── */
function RadioGroupSection() {
  const [plan, setPlan] = useState('monthly')
  const [notify, setNotify] = useState('all')

  const planOptions = [
    { value: 'monthly', label: 'Monthly',  description: 'Billed every 30 days.' },
    { value: 'annual',  label: 'Annual',   description: 'Save 20% — billed once a year.' },
    { value: 'team',    label: 'Team',     description: 'Per-seat pricing for 5+ members.' },
  ]

  const notifyOptions = [
    { value: 'all',      label: 'All activity' },
    { value: 'mentions', label: 'Mentions only' },
    { value: 'none',     label: 'None',           disabled: true },
  ]

  const sizeOptions = [
    { value: 'xs', label: 'Extra small' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ]

  return (
    <>
      <Section title="RadioGroup — Vertical (default)">
        <Row gap={48} wrap>
          <Col>
            <Label>With descriptions</Label>
            <RadioGroup label="Billing cycle" options={planOptions} value={plan} onChange={setPlan} required />
          </Col>
          <Col>
            <Label>Simple + disabled option</Label>
            <RadioGroup label="Notifications" hint="You can change this later in settings." options={notifyOptions} value={notify} onChange={setNotify} />
          </Col>
          <Col>
            <Label>Error state</Label>
            <RadioGroup label="Select a size" error="Please select a size to continue." options={sizeOptions} />
          </Col>
        </Row>
      </Section>

      <Section title="RadioGroup — Horizontal">
        <Col>
          <Label>4 options inline</Label>
          <RadioGroup
            label="Theme"
            options={[
              { value: 'system', label: 'System' },
              { value: 'light',  label: 'Light'  },
              { value: 'dark',   label: 'Dark'   },
            ]}
            defaultValue="system"
            orientation="horizontal"
          />
        </Col>
      </Section>

      <Section title="RadioGroup — Sizes">
        <Row gap={48} wrap>
          {['sm', 'md', 'lg'].map(s => (
            <Col key={s}>
              <Label>{s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}</Label>
              <RadioGroup
                size={s}
                options={[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }, { value: '3', label: 'Option 3' }]}
                defaultValue="1"
              />
            </Col>
          ))}
        </Row>
      </Section>

    </>
  )
}

/* ── CheckboxGroup ────────────────────────────────────────────────────────────── */
function CheckboxGroupSection() {
  const [features, setFeatures] = useState(['analytics', 'reports'])

  const featureOptions = [
    { value: 'analytics',    label: 'Analytics',    description: 'Usage stats and retention.' },
    { value: 'reports',      label: 'Reports',      description: 'Scheduled PDF exports.' },
    { value: 'integrations', label: 'Integrations', description: 'Connect third-party tools.' },
    { value: 'beta',         label: 'Beta features', description: 'Early access — may be unstable.', disabled: true },
  ]

  const permissionsOptions = [
    { value: 'read',   label: 'Read' },
    { value: 'write',  label: 'Write' },
    { value: 'delete', label: 'Delete' },
    { value: 'admin',  label: 'Admin', disabled: true },
  ]

  return (
    <>
      <Section title="CheckboxGroup — Vertical with Select All">
        <Row gap={48} wrap>
          <Col>
            <Label>With descriptions + disabled option</Label>
            <CheckboxGroup label="Active features" hint="Disabled options require an upgrade." options={featureOptions} value={features} onChange={setFeatures} selectAll />
          </Col>
          <Col>
            <Label>Simple permissions</Label>
            <CheckboxGroup label="Permissions" options={permissionsOptions} defaultValue={['read', 'write']} selectAll selectAllLabel="All permissions" />
          </Col>
          <Col>
            <Label>Error state</Label>
            <CheckboxGroup
              label="Required selection"
              error="You must select at least one option."
              options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }, { value: 'c', label: 'Option C' }]}
            />
          </Col>
        </Row>
      </Section>

      <Section title="CheckboxGroup — Horizontal">
        <Col>
          <Label>Inline layout</Label>
          <CheckboxGroup
            label="Notify me about"
            options={[
              { value: 'comments',   label: 'Comments'   },
              { value: 'mentions',   label: 'Mentions'   },
              { value: 'updates',    label: 'Updates'    },
              { value: 'promotions', label: 'Promotions' },
            ]}
            defaultValue={['comments', 'mentions']}
            orientation="horizontal"
          />
        </Col>
      </Section>

      <Section title="CheckboxGroup — Sizes">
        <Row gap={48} wrap>
          {['sm', 'md', 'lg'].map(s => (
            <Col key={s}>
              <Label>{s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}</Label>
              <CheckboxGroup
                size={s}
                options={[{ value: '1', label: 'Choice 1' }, { value: '2', label: 'Choice 2' }, { value: '3', label: 'Choice 3' }]}
                defaultValue={['1']}
              />
            </Col>
          ))}
        </Row>
      </Section>

    </>
  )
}

/* ── Integration ─────────────────────────────────────────────────────────────── */
function IntegrationSection() {
  const [notifs, setNotifs] = useState({ email: true, push: false, sms: false })
  const toggleNotif = key => setNotifs(v => ({ ...v, [key]: !v[key] }))

  const [privacy, setPrivacy] = useState('friends')
  const [tags, setTags] = useState(['design', 'dev'])

  const tagOptions = [
    { value: 'design',   label: 'Design'   },
    { value: 'dev',      label: 'Dev'      },
    { value: 'product',  label: 'Product'  },
    { value: 'research', label: 'Research' },
    { value: 'qa',       label: 'QA'       },
  ]

  return (
    <>
      <Section title="Integration — Controls in a settings form" note="Switch inside ListItem via trailingAction='switch'">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <ListItem label="Email notifications"  description="Receive order updates and receipts."       size="md" trailingAction="switch" checked={notifs.email} onCheckedChange={() => toggleNotif('email')} />
          <ListItem label="Push notifications"   description="Real-time alerts on mobile and desktop."  size="md" trailingAction="switch" checked={notifs.push}  onCheckedChange={() => toggleNotif('push')}  />
          <ListItem label="SMS notifications"    description="Text messages for critical alerts."        size="md" trailingAction="switch" checked={notifs.sms}   onCheckedChange={() => toggleNotif('sms')}   />
        </div>
      </Section>

      <Section title="Integration — Radio in a form" note="RadioGroup embedded in a settings form alongside a MultiSelectField">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <RadioGroup
            label="Post visibility"
            options={[
              { value: 'public',  label: 'Public',       description: 'Anyone on the internet can see this.' },
              { value: 'friends', label: 'Friends only', description: 'Only your connections can see this.'  },
              { value: 'private', label: 'Only me',      description: 'Hidden from everyone else.'           },
            ]}
            value={privacy}
            onChange={setPrivacy}
            required
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-secondary)', margin: 0 }}>Tags</p>
            <MultiSelectField options={tagOptions} value={tags} onChange={setTags} placeholder="Select tags…" />
          </div>
        </div>
      </Section>

      <Section title="Integration — Checkbox in a ListItem list" note="Checkbox inside ListItem via trailingAction='checkbox'">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {[
            { label: 'Design system tokens', desc: 'Colors, spacing, typography, shadows.',         init: true  },
            { label: 'Component library',    desc: 'Buttons, inputs, overlays and more.',           init: true  },
            { label: 'Icon set',             desc: '200+ SVG icons in 3 sizes.',                    init: false },
            { label: 'Figma kit',            desc: 'Auto-layout components, styles, variables.',    init: false, disabled: true },
          ].map(item => {
            const [checked, setChecked] = useState(item.init)
            return (
              <ListItem
                key={item.label}
                label={item.label}
                description={item.desc}
                size="md"
                trailingAction="checkbox"
                checked={checked}
                onCheckedChange={setChecked}
                disabled={item.disabled}
              />
            )
          })}
        </div>
      </Section>

    </>
  )
}

/* ── Tab definitions ─────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'switch',         label: 'Switch',         Section: SwitchSection        },
  { id: 'checkbox',       label: 'Checkbox',        Section: CheckboxSection      },
  { id: 'radio',          label: 'Radio',           Section: RadioSection         },
  { id: 'radio-group',    label: 'Radio Group',     Section: RadioGroupSection    },
  { id: 'checkbox-group', label: 'Checkbox Group',  Section: CheckboxGroupSection },
  { id: 'integration',    label: 'Integration',     Section: IntegrationSection   },
]

/* ── Main export ─────────────────────────────────────────────────────────────── */
export default function ControlsPreview() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState('switch')
  const active = TABS.find(t => t.id === activeTab)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>
          Form
        </p>
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>
          Controls
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 'var(--line-height-relaxed)' }}>
          Switch · Checkbox · Radio · RadioGroup · CheckboxGroup · 3 sizes · all states · dark mode · integration examples
        </p>
      </div>

      {/* ── Alloy Tabs bar ── */}
      <div style={{ marginBottom: 32 }}>
        <Tabs value={activeTab} onChange={setActiveTab} variant="underline">
          {TABS.map(t => (
            <Tabs.Tab key={t.id} value={t.id}>{t.label}</Tabs.Tab>
          ))}
        </Tabs>
      </div>

      {/* ── Active tab panel ── */}
      <div
        role="tabpanel"
        aria-label={active?.label}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {active && <active.Section />}
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>
          Alloy — Controls v1
        </span>
      </div>

    </div>
  )
}
