import { useState } from 'react'
import './sagehcm.css'
import SageHcmChrome from './SageHcmChrome.jsx'
import {
  HCM_USER, SELF_SERVICE_NAV, MY_TASKS, TIME_OFF, EXTERNAL_LINKS,
  FEED, SURVEYS, NOTIFICATIONS, WHOS_WORKING,
} from './hcmData.js'
import {
  LinkIcon, ThumbIcon, ReplyIcon, GiftIcon, SparkIcon, WorkIcon,
  ClipboardIcon, ChatBubbleIcon, TimeIcon, CalendarIcon, ResourcesIcon,
} from './icons.jsx'
import { ChevronDownIcon }  from '../../../../src/components/icons/ChevronDownIcon.tsx'
import { ChevronRightIcon } from '../../../../src/components/icons/ChevronRightIcon.tsx'
import { SearchSmIcon }     from '../../../../src/components/icons/SearchSmIcon.tsx'
import { Edit03Icon }       from '../../../../src/components/icons/Edit03Icon.tsx'
import { BookmarkIcon }     from '../../../../src/components/icons/BookmarkIcon.tsx'
import { ArrowNarrowRightIcon } from '../../../../src/components/icons/ArrowNarrowRightIcon.tsx'
import { trackDemoEvent } from '../../lib/demoTracking.js'

/* ──────────────────────────────────────────────────────────────────────
 * Sage HCM → Self Service home.
 *
 * Act 0 of the vision. Before we show anything Teambridge, we show the
 * product the customer already owns, rebuilt closely enough that the
 * jump into Work reads as *the same application* rather than a demo of
 * a different one. Three surfaces here are already fed by Work — a feed
 * post, two notifications, and the Who's Working widget — so the module
 * feels present before you ever open it.
 * ────────────────────────────────────────────────────────────────────── */

function Card({ title, icon, action, flush = false, children }) {
  return (
    <section className="shcm-card">
      {title && (
        <header className="shcm-card-head">
          {icon && <span className="shcm-card-head-icon">{icon}</span>}
          <span className="shcm-card-title">{title}</span>
          <span className="shcm-card-head-spacer" />
          {action ?? <ChevronDownIcon size={15} color="#939ba2" />}
        </header>
      )}
      <div className={`shcm-card-body ${flush ? 'shcm-card-body--flush' : ''}`}>
        {children}
      </div>
    </section>
  )
}

function FeedPost({ post, onOpenWork }) {
  const isWork = post.kind === 'work'
  return (
    <article className={`shcm-post ${isWork ? 'shcm-post--work' : ''}`}>
      <div className="shcm-post-head">
        {isWork
          ? <span className="shcm-post-workmark" aria-hidden="true"><WorkIcon size={19} /></span>
          : <span className="shcm-post-avatar" aria-hidden="true">{post.initials}</span>}
        <div className="shcm-post-meta">
          <div className="shcm-post-time">{post.time}</div>
          <div className="shcm-post-author">{post.author}</div>
        </div>
        <span className="shcm-post-tag">
          {isWork ? <SparkIcon size={12} /> : <BookmarkIcon size={12} />}
          {post.tag}
        </span>
      </div>

      <div className="shcm-post-body">
        {post.headline}
        {post.link && <> <a href="#/sage-hcm" onClick={e => e.preventDefault()}>{post.link}</a></>}
        {post.sub && <div className="shcm-post-sub">{post.sub}</div>}
      </div>

      {isWork && (
        <button type="button" className="shcm-post-cta" onClick={onOpenWork}>
          {post.cta}
          <ArrowNarrowRightIcon size={15} />
        </button>
      )}

      <div className="shcm-post-foot">
        <span><ThumbIcon size={13} /> {post.likes} Likes</span>
        <span><ReplyIcon size={13} /> {post.replies ? `${post.replies} Replies` : 'No Replies'}</span>
      </div>
    </article>
  )
}

export default function SageHcmHome({ onNavigate = () => {} }) {
  const [navItem, setNavItem] = useState('home')

  const openWork = (from) => {
    trackDemoEvent('sage_work_opened', { from })
    onNavigate('/sage-hcm/work')
  }

  return (
    <SageHcmChrome
      moduleId="self-service"
      railItems={SELF_SERVICE_NAV}
      activeItem={navItem}
      onSelectItem={setNavItem}
      onNavigate={onNavigate}
      user={HCM_USER}
    >
      <div className="shcm-page">
        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="shcm-col">
          <section className="shcm-card">
            <div className="shcm-profile">
              <div className="shcm-profile-photo" aria-hidden="true">{HCM_USER.initials}</div>
              <div className="shcm-profile-name">{HCM_USER.name}</div>
              <div className="shcm-profile-title">{HCM_USER.title}</div>
              <div className="shcm-profile-org">{HCM_USER.org}</div>
              <div className="shcm-profile-status">
                Status not set
                <button type="button" className="shcm-profile-status-edit" aria-label="Edit status">
                  <Edit03Icon size={13} />
                </button>
              </div>
            </div>
          </section>

          <Card title="My Tasks" icon={<ClipboardIcon size={15} />} flush>
            {MY_TASKS.map(t => (
              <button key={t.id} type="button" className="shcm-row">
                <span className="shcm-row-chevron"><ChevronRightIcon size={13} /></span>
                {t.label}
                <span className="shcm-row-count">{t.count}</span>
              </button>
            ))}
          </Card>

          <Card title="Company Policies" icon={<ResourcesIcon size={15} />}>
            <div className="shcm-policy-note">You have 2 unsigned policies.</div>
            <button type="button" className="shcm-pill-btn">
              View &amp; Sign <ChevronRightIcon size={13} />
            </button>
          </Card>

          <Card title="My Time Offs" icon={<TimeIcon size={15} />}>
            {TIME_OFF.map(t => (
              <div className="shcm-meter" key={t.label}>
                <div className="shcm-meter-head">
                  <span className="shcm-meter-label">{t.label}</span>
                  <span className="shcm-meter-value">
                    {t.used.toFixed(2)} / {t.total.toFixed(2)}
                  </span>
                </div>
                <div className="shcm-meter-track">
                  <div className="shcm-meter-fill" style={{ width: `${(t.used / t.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </Card>

          <Card title="External Links" icon={<LinkIcon size={15} />}>
            <div className="shcm-linklist">
              {EXTERNAL_LINKS.map(l => (
                <a key={l} href="#/sage-hcm" onClick={e => e.preventDefault()}>
                  <span className="shcm-linklist-icon"><LinkIcon size={13} /></span>
                  {l}
                </a>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Center column — engagement feed ──────────────────────── */}
        <div className="shcm-col">
          <Card title="Engagement" icon={<ChatBubbleIcon size={15} />} action={<span />}>
            <input
              className="shcm-post-input"
              placeholder="Post a Message"
              aria-label="Post a message"
            />
          </Card>

          <section className="shcm-card">
            {FEED.map(post => (
              <FeedPost key={post.id} post={post} onOpenWork={() => openWork('feed_post')} />
            ))}
          </section>
        </div>

        {/* ── Right column ────────────────────────────────────────── */}
        <div className="shcm-col shcm-col--right">
          <Card title="Surveys" icon={<BookmarkIcon size={15} />}>
            {SURVEYS.map(s => (
              <div className="shcm-survey-row" key={s.id}>
                <span>{s.label}</span>
                <span style={{ marginLeft: 'auto' }}>
                  <button type="button" className="shcm-pill-btn shcm-pill-btn--solid">Start</button>
                </span>
              </div>
            ))}
          </Card>

          <Card title="Feedback" icon={<ChatBubbleIcon size={15} />}>
            <div className="shcm-btn-row">
              <button type="button" className="shcm-pill-btn shcm-pill-btn--solid">Give</button>
              <button type="button" className="shcm-pill-btn shcm-pill-btn--solid">Request</button>
            </div>
          </Card>

          <Card title="Notifications" icon={<GiftIcon size={15} />} flush>
            {NOTIFICATIONS.map(n => (
              <div key={n.id} className={`shcm-notif ${n.source === 'work' ? 'shcm-notif--work' : ''}`}>
                <span className="shcm-notif-icon">
                  {n.source === 'work' ? <SparkIcon size={14} /> : <CalendarIcon size={14} />}
                </span>
                <div>
                  <div className="shcm-notif-date">{n.date}</div>
                  <div className="shcm-notif-text">{n.text}</div>
                </div>
              </div>
            ))}
            <div className="shcm-pager">Displaying 1 - 5 of 481</div>
          </Card>

          <Card title="Who's working" icon={<TimeIcon size={15} />} flush>
            <div style={{ padding: '12px 14px 0' }}>
              <div className="shcm-search">
                <input placeholder="Employee" aria-label="Search employees" />
                <button type="button" className="shcm-search-go" aria-label="Search">
                  <SearchSmIcon size={14} />
                </button>
              </div>
              {WHOS_WORKING.map(group => (
                <div key={group.role}>
                  <div className="shcm-working-group">
                    <ChevronDownIcon size={13} /> {group.role}
                  </div>
                  {group.people.map(p => (
                    <div className="shcm-working-row" key={p.name}>
                      <div>
                        <div className="shcm-working-name">{p.name}</div>
                        <div className="shcm-working-loc">{p.loc}</div>
                      </div>
                      <div className="shcm-working-hrs">{p.hrs}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="shcm-worksource"
              style={{ width: '100%', border: 0, borderTop: '1px solid #eef0f3', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => openWork('whos_working_widget')}
            >
              <SparkIcon size={12} /> Live from Sage Work
            </button>
          </Card>
        </div>
      </div>
    </SageHcmChrome>
  )
}
