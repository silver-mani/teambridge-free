import { useState } from 'react'
import { Button }           from '../../src/components/Button/Button.tsx'
import { Badge }            from '../../src/components/Badge/Badge.tsx'
import { Tag }              from '../../src/components/Tag/Tag.tsx'
import { StatusTag }        from '../../src/components/StatusTag/StatusTag.tsx'
import { Alert }            from '../../src/components/Alert/Alert.tsx'
import { Tabs }             from '../../src/components/Tabs/Tabs.tsx'
import { Divider }          from '../../src/components/Divider/Divider.tsx'
import { Switch }           from '../../src/components/Switch/Switch.tsx'
import { Checkbox }         from '../../src/components/Checkbox/Checkbox.tsx'
import { DataCard }         from '../../src/components/DataCard/DataCard.tsx'
import { ValueChangeLabel } from '../../src/components/ValueChangeLabel/ValueChangeLabel.tsx'
import { TextField }        from '../../src/components/Input/TextField.tsx'
import { SelectField }      from '../../src/components/Input/SelectField.tsx'
import { Breadcrumb }       from '../../src/components/Breadcrumb/Breadcrumb.tsx'
import { Eyebrow }          from '../../src/components/Eyebrow/Eyebrow.tsx'
import '../../src/styles/artwork.css'

const PlusIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
const DownIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
const CheckIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
const UserIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.55996 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <Eyebrow style={{ marginBottom: 16 }}>{title}</Eyebrow>
      {children}
    </section>
  )
}

function Row({ gap = 8, wrap = true, children }) {
  return (
    <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap, alignItems: 'center' }}>
      {children}
    </div>
  )
}

export default function Showcase() {
  const [tab, setTab] = useState('overview')
  const [dark, setDark] = useState(false)
  const [sw1, setSw1] = useState(true)
  const [sw2, setSw2] = useState(false)
  const [chk, setChk] = useState(true)

  return (
    <div className={dark ? 'dark' : ''} style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--color-bg-inverse-primary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="var(--color-content-inverse-primary)" stroke="var(--color-content-inverse-primary)"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-content-primary)' }}>
                Alloy
              </span>
              <Badge variant="neutral">v1.1.0</Badge>
            </div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-3xl)', fontWeight: 400, color: 'var(--color-content-primary)', lineHeight: 1.2 }}>
              Component Showcase
            </h1>
            <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)' }}>
              Teambridge design system — React + TypeScript + CSS tokens
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>Dark</span>
            <Switch size="sm" checked={dark} onChange={e => setDark(e.target.checked)} />
          </div>
        </div>

        <Divider style={{ marginBottom: 40 }} />

        {/* Breadcrumb */}
        <div style={{ marginBottom: 32 }}>
          <Breadcrumb items={[
            { label: 'Teambridge', href: '#' },
            { label: 'Design System', href: '#' },
            { label: 'Showcase' },
          ]} />
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 40 }}>
          <Tabs value={tab} onChange={setTab}>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="forms">Forms</Tabs.Tab>
            <Tabs.Tab value="feedback">Feedback</Tabs.Tab>
            <Tabs.Tab value="data">Data</Tabs.Tab>
          </Tabs>
        </div>

        {tab === 'overview' && (
          <>
            {/* Buttons */}
            <Section title="Buttons">
              <Row gap={8}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="tertiary">Tertiary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="destructive-secondary">Delete</Button>
              </Row>
              <div style={{ height: 12 }} />
              <Row gap={8}>
                <Button variant="primary" size="xs">Extra small</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="xl">X-Large</Button>
              </Row>
              <div style={{ height: 12 }} />
              <Row gap={8}>
                <Button variant="primary" leadingArtwork={<PlusIcon />}>New item</Button>
                <Button variant="secondary" trailingArtwork={<DownIcon />}>Actions</Button>
                <Button variant="tertiary" loading>Saving…</Button>
                <Button variant="primary" iconOnly aria-label="Add"><PlusIcon /></Button>
              </Row>
            </Section>

            {/* Tags & Badges */}
            <Section title="Tags & Badges">
              <Row gap={6}>
                {['blue','azure','purple','pink','red','orange','yellow','matcha','green','neutral'].map(c => (
                  <Tag key={c} color={c === 'neutral' ? 'neutral' : c} variant="subtle">{c}</Tag>
                ))}
              </Row>
              <div style={{ height: 10 }} />
              <Row gap={6}>
                {['blue','red','green','orange'].map(c => (
                  <Tag key={c} color={c} variant="solid">{c}</Tag>
                ))}
                {['blue','red','green'].map(c => (
                  <Tag key={c + 'o'} color={c} variant="outline">{c}</Tag>
                ))}
                <Tag color="blue" dot>With dot</Tag>
                <Tag color="red" dismissible>Dismissible</Tag>
              </Row>
              <div style={{ height: 10 }} />
              <Row gap={6}>
                <Badge variant="neutral">12</Badge>
                <Badge variant="primary">99+</Badge>
                <Badge variant="success">Done</Badge>
                <Badge variant="warning">Review</Badge>
                <Badge variant="error">Failed</Badge>
                <Badge variant="info">New</Badge>
              </Row>
              <div style={{ height: 10 }} />
              <Row gap={6}>
                <StatusTag status="success">Active</StatusTag>
                <StatusTag status="warning">Pending</StatusTag>
                <StatusTag status="error">Failed</StatusTag>
                <StatusTag status="info">Processing</StatusTag>
                <StatusTag status="neutral">Inactive</StatusTag>
                <StatusTag status="pending">Queued</StatusTag>
              </Row>
            </Section>

            {/* Controls */}
            <Section title="Controls">
              <Row gap={24}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Switch size="sm" checked={sw1} onChange={e => setSw1(e.target.checked)} label="Email notifications" />
                  <Switch size="sm" checked={sw2} onChange={e => setSw2(e.target.checked)} label="SMS alerts" />
                  <Switch size="sm" checked={false} disabled label="Disabled option" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Checkbox size="md" checked={chk} onChange={e => setChk(e.target.checked)} label="Accept terms" description="I agree to the terms of service" />
                  <Checkbox size="md" checked={false} label="Subscribe to updates" />
                  <Checkbox size="md" checked={false} disabled label="Disabled" />
                </div>
              </Row>
            </Section>
          </>
        )}

        {tab === 'forms' && (
          <>
            <Section title="Text Fields">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 600 }}>
                <TextField label="Full name" placeholder="John Smith" hint="As it appears on your ID" />
                <TextField label="Email" placeholder="john@example.com" type="email" />
                <TextField label="Error state" placeholder="Invalid value" error="This field is required" defaultValue="bad@" />
                <SelectField label="Role" hint="Select your team role">
                  <option value="">Select…</option>
                  <option>Engineer</option>
                  <option>Designer</option>
                  <option>Product</option>
                </SelectField>
              </div>
            </Section>
          </>
        )}

        {tab === 'feedback' && (
          <>
            <Section title="Alerts">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 600 }}>
                <Alert status="success" title="Payment processed successfully" size="sm" />
                <Alert status="warning" title="Your trial ends in 3 days" size="sm" action="Upgrade now" />
                <Alert status="error" title="Failed to save changes" size="sm" onDismiss={() => {}} />
                <Alert status="info" title="New features available" size="sm" action="See what's new" />
                <Alert
                  status="success"
                  variant="stroke"
                  size="lg"
                  title="Profile updated"
                  description="Your changes have been saved and are now visible to your team."
                  action="View profile"
                  onDismiss={() => {}}
                />
              </div>
            </Section>
          </>
        )}

        {tab === 'data' && (
          <>
            <Section title="Data Cards">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                <DataCard label="Total Revenue" heading="$84,290" color="green"
                  change={<ValueChangeLabel mode="trend" value="+12.4%" trend="up" />} />
                <DataCard label="Active Users" heading="3,842" color="blue"
                  change={<ValueChangeLabel mode="trend" value="+8.1%" trend="up" />} />
                <DataCard label="Churn Rate" heading="2.3%" color="red"
                  change={<ValueChangeLabel mode="trend" value="-0.4%" trend="down" />} />
                <DataCard label="Avg. Session" heading="4m 32s" color="purple"
                  change={<ValueChangeLabel mode="text" value="No change" severity="warning" />} />
                <DataCard label="Open Issues" heading="17" color="orange"
                  change={<ValueChangeLabel mode="trend" value="+3" trend="up" severity="negative" />} />
                <DataCard label="Deployments" heading="124" color="matcha"
                  change={<ValueChangeLabel mode="trend" value="+6" trend="up" />} />
              </div>
            </Section>
          </>
        )}

      </div>
    </div>
  )
}
