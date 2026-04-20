/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Eyebrow Preview
   Label-sm typography, uppercase, content-inverse-tertiary color
   ───────────────────────────────────────────────────────────────────────────── */

/* ── Local Eyebrow — mirrors Alloy Eyebrow exactly ───────────────────────────── */
function Eyebrow({ as: Tag = 'span', style, children, ...props }) {
  return (
    <Tag
      style={{
        fontFamily:    'var(--font-sans)',
        fontSize:      'var(--text-xs)',
        fontWeight:    'var(--font-weight-medium)',
        lineHeight:    'var(--line-height-normal)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase',
        color:         'var(--color-content-inverse-tertiary)',
        display:       'block',
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  )
}

/* ── Section shell — matches ButtonPreview pattern ───────────────────────────── */
function Section({ title, subtitle, isMobile, children }) {
  return (
    <div style={{
      background:   'var(--color-bg-primary)',
      borderRadius: 'var(--radius-xl)',
      padding:      isMobile ? '20px' : '32px',
      display:      'flex',
      flexDirection:'column',
      gap:          '24px',
    }}>
      <div>
        <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', fontWeight:'var(--font-weight-medium)', color:'var(--color-content-tertiary)', marginBottom:'4px' }}>{title}</p>
        {subtitle && <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-sm)', color:'var(--color-content-secondary)' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

/* ── Mock card shell ──────────────────────────────────────────────────────────── */
function MockCard({ children, style }) {
  return (
    <div style={{
      background:   'var(--color-bg-primary)',
      border:       '1px solid var(--color-border-opaque)',
      borderRadius: 'var(--radius-lg)',
      padding:      '20px',
      display:      'flex',
      flexDirection:'column',
      gap:          '12px',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── Placeholder content blocks ───────────────────────────────────────────────── */
function TextLine({ width = '100%', height = 12, opacity = 1 }) {
  return (
    <div style={{
      width, height:`${height}px`,
      background: `var(--color-bg-tertiary)`,
      borderRadius: 'var(--radius-sm)',
      opacity,
    }} />
  )
}

import { useIsMobile } from './useIsMobile.js'

/* ── Main preview ─────────────────────────────────────────────────────────────── */
export default function EyebrowPreview() {
  const isMobile = useIsMobile()
  return (
    <div style={{
      minHeight:       '100vh',
      background:      'var(--color-bg-secondary)',
      fontFamily:      'var(--font-sans)',
    }}>

      {/* Header */}
      <div style={{
        padding:      isMobile ? '24px 16px 0' : '48px 48px 0',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize:'var(--text-xs)', fontWeight:'var(--font-weight-medium)', color:'var(--color-content-tertiary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'var(--tracking-wider)' }}>
          Typography
        </p>
        <h1 style={{ fontSize:'var(--text-3xl)', fontWeight:'var(--font-weight-semibold)', color:'var(--color-content-primary)', marginBottom:'8px' }}>
          Eyebrow
        </h1>
        <p style={{ fontSize:'var(--text-base)', color:'var(--color-content-secondary)' }}>
          Section label using Label-sm typography — uppercase, muted, used inside cards to label and group content.
        </p>
      </div>

      <div style={{ padding: isMobile ? '0 16px 64px' : '0 48px 64px', display:'flex', flexDirection:'column', gap:'24px' }}>

        {/* ── 1. The Component ─────────────────────────────────────────────────── */}
        <Section title="The Component" subtitle="Eyebrow renders as a <span> by default. Use the as prop to render any semantic element." isMobile={isMobile}>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            {/* Plain usage */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', color:'var(--color-content-tertiary)' }}>Default (span)</p>
              <Eyebrow>Section Label</Eyebrow>
            </div>

            {/* Different content */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', color:'var(--color-content-tertiary)' }}>Example values</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <Eyebrow>Overview</Eyebrow>
                <Eyebrow>Performance</Eyebrow>
                <Eyebrow>This Week</Eyebrow>
                <Eyebrow>Team Members</Eyebrow>
                <Eyebrow>Recent Activity</Eyebrow>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. Semantic as prop ───────────────────────────────────────────────── */}
        <Section title="Semantic Element (as prop)" subtitle="Pass as='h2'–'h6' or 'p' when the eyebrow should carry heading semantics for accessibility." isMobile={isMobile}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'16px' }}>
            {[
              { as: 'span',  label: 'as="span" (default)' },
              { as: 'p',     label: 'as="p"' },
              { as: 'h2',    label: 'as="h2"' },
            ].map(({ as, label }) => (
              <div key={as} style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', color:'var(--color-content-disabled)' }}>{label}</p>
                <Eyebrow as={as}>Section Label</Eyebrow>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 3. In Context — Metric Card ───────────────────────────────────────── */}
        <Section title="In Context — Metric Cards" subtitle="Eyebrow labels each section inside a data card, creating clear visual hierarchy." isMobile={isMobile}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap:'16px' }}>

            {/* Revenue card */}
            <MockCard>
              <Eyebrow>Revenue</Eyebrow>
              <div>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-2xl)', fontWeight:'var(--font-weight-semibold)', color:'var(--color-content-primary)', lineHeight:1.1 }}>$48,290</p>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', color:'var(--color-content-tertiary)', marginTop:'4px' }}>+12% from last month</p>
              </div>
            </MockCard>

            {/* Users card */}
            <MockCard>
              <Eyebrow>Active Users</Eyebrow>
              <div>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-2xl)', fontWeight:'var(--font-weight-semibold)', color:'var(--color-content-primary)', lineHeight:1.1 }}>3,841</p>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', color:'var(--color-content-tertiary)', marginTop:'4px' }}>+4% from last month</p>
              </div>
            </MockCard>

            {/* Conversion card */}
            <MockCard>
              <Eyebrow>Conversion Rate</Eyebrow>
              <div>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-2xl)', fontWeight:'var(--font-weight-semibold)', color:'var(--color-content-primary)', lineHeight:1.1 }}>6.4%</p>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', color:'var(--color-content-tertiary)', marginTop:'4px' }}>−0.3% from last month</p>
              </div>
            </MockCard>
          </div>
        </Section>

        {/* ── 4. In Context — Content Sections ─────────────────────────────────── */}
        <Section title="In Context — Content Sections" subtitle="Eyebrow divides content zones inside a larger card panel." isMobile={isMobile}>
          <MockCard>
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

              {/* Section 1 */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <Eyebrow>Overview</Eyebrow>
                <TextLine width="100%" />
                <TextLine width="85%" opacity={0.6} />
                <TextLine width="70%" opacity={0.4} />
              </div>

              {/* Divider */}
              <div style={{ height:'1px', background:'var(--color-border-opaque)' }} />

              {/* Section 2 */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <Eyebrow>Performance</Eyebrow>
                <TextLine width="100%" />
                <TextLine width="90%" opacity={0.6} />
                <TextLine width="60%" opacity={0.4} />
              </div>

              {/* Divider */}
              <div style={{ height:'1px', background:'var(--color-border-opaque)' }} />

              {/* Section 3 */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <Eyebrow>Team Members</Eyebrow>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--color-bg-tertiary)', flexShrink:0 }} />
                      <TextLine width="120px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MockCard>
        </Section>

        {/* ── 5. In Context — Form Card ─────────────────────────────────────────── */}
        <Section title="In Context — Form Card" subtitle="Eyebrow groups form fields into logical sections." isMobile={isMobile}>
          <MockCard style={{ maxWidth:'480px' }}>

            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <Eyebrow>Personal Information</Eyebrow>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {['Full Name', 'Email Address'].map(label => (
                  <div key={label} style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-sm)', fontWeight:'var(--font-weight-medium)', color:'var(--color-content-secondary)' }}>{label}</p>
                    <div style={{ height:'36px', border:'1px solid var(--color-border-opaque)', borderRadius:'var(--radius-button)', background:'var(--color-bg-secondary)' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height:'1px', background:'var(--color-border-opaque)' }} />

            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <Eyebrow>Notification Preferences</Eyebrow>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {['Email Notifications', 'Push Notifications', 'Weekly Digest'].map(label => (
                  <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-sm)', color:'var(--color-content-primary)' }}>{label}</p>
                    <div style={{ width:'36px', height:'20px', borderRadius:'var(--radius-full)', background:'var(--color-bg-tertiary)', border:'1px solid var(--color-border-opaque)' }} />
                  </div>
                ))}
              </div>
            </div>

          </MockCard>
        </Section>

        {/* ── 6. Typography Specimen ────────────────────────────────────────────── */}
        <Section title="Typography Specimen" subtitle="Full type specimen showing all Label-sm properties." isMobile={isMobile}>
          <div style={{
            background:   'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding:      '24px',
            display:      'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap:          isMobile ? 12 : 20,
          }}>
            {[
              { label: 'Font family', value: 'var(--font-sans) — Geist' },
              { label: 'Font size',   value: 'var(--text-xs) — 12px / 0.75rem' },
              { label: 'Font weight', value: 'var(--font-weight-medium) — 500' },
              { label: 'Line height', value: 'var(--line-height-normal) — 1.3' },
              { label: 'Letter spacing', value: 'var(--tracking-wider) — 0.05em' },
              { label: 'Transform',   value: 'uppercase' },
              { label: 'Color',       value: 'var(--color-content-inverse-tertiary)' },
              { label: 'Display',     value: 'block' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-xs)', color:'var(--color-content-disabled)', marginBottom:'2px' }}>{label}</p>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'var(--text-xs)', color:'var(--color-content-secondary)' }}>{value}</p>
              </div>
            ))}
          </div>
          {/* Live specimen */}
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <Eyebrow>Live specimen — eyebrow text</Eyebrow>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div style={{
        padding:      isMobile ? '24px 16px' : '24px 48px',
        borderTop:    '1px solid var(--color-border-opaque)',
        fontFamily:   'var(--font-sans)',
        fontSize:     'var(--text-xs)',
        color:        'var(--color-content-disabled)',
      }}>
        Alloy — Eyebrow v1
      </div>
    </div>
  )
}
