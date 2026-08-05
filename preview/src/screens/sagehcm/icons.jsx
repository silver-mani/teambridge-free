/*
 * Small inline icons for the Sage HCM chrome. Everything Alloy already
 * ships (chevrons, bell, gear, plus, search) is imported from
 * src/components/icons; these are the handful of glyphs Sage's own nav
 * uses that Alloy doesn't have an equivalent for.
 */

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export function MenuIcon({ size = 20 }) {
  return (
    <svg {...base(size)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function SelfServiceIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M6.6 18.4a5.8 5.8 0 0 1 10.8 0" />
    </svg>
  )
}

export function PeopleIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.6a3.2 3.2 0 0 1 0 6.2M17.2 14.4A5.5 5.5 0 0 1 20.5 19" />
    </svg>
  )
}

export function PayrollIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M6 9v6M18 9v6" />
    </svg>
  )
}

export function RecruitingIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="11" cy="11" r="7" />
      <circle cx="11" cy="11" r="2.6" />
      <path d="M16.2 16.2 21 21" />
    </svg>
  )
}

/* The Work module mark — a roster grid with a live pulse in the corner.
   Reads as scheduling without being another plain calendar glyph. */
export function WorkIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="4.5" width="18" height="15.5" rx="2.5" />
      <path d="M3 9.5h18M9 9.5V20M8 2.8v3.4M16 2.8v3.4" />
      <circle cx="16.4" cy="14.6" r="1.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TimeIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.2V12l3.2 2" />
    </svg>
  )
}

export function PayIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M6 3.5h12l-2 17H8z" />
      <path d="M9 8.5h6M9 12.5h6" />
    </svg>
  )
}

export function BenefitsIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 20.5s-7.5-4.4-7.5-9.6A4.1 4.1 0 0 1 12 8.4a4.1 4.1 0 0 1 7.5 2.5c0 5.2-7.5 9.6-7.5 9.6Z" />
    </svg>
  )
}

export function LearningIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M2.5 8.2 12 4l9.5 4.2L12 12.4z" />
      <path d="M6.5 10.3V15c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.7" />
    </svg>
  )
}

export function PerformanceIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M3.5 19.5h17" />
      <path d="M6.5 16V11M11 16V6.5M15.5 16v-6M20 16V8" />
    </svg>
  )
}

export function CareerIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M4 18.5 9.5 12l3.6 3.4L20 7" />
      <path d="M15.6 7H20v4.4" />
    </svg>
  )
}

export function EmploymentIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="7" width="18" height="13" rx="2.4" />
      <path d="M9 7V5.4A1.4 1.4 0 0 1 10.4 4h3.2A1.4 1.4 0 0 1 15 5.4V7" />
      <path d="M3 12h18" />
    </svg>
  )
}

export function PersonalInfoIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="2.6" y="5" width="18.8" height="14" rx="2.4" />
      <circle cx="8.6" cy="11" r="2.2" />
      <path d="M5.2 16.2a3.6 3.6 0 0 1 6.8 0M14.6 10h4.2M14.6 13.6h4.2" />
    </svg>
  )
}

export function CalendarIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="5" width="18" height="16" rx="2.4" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function ResourcesIcon({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M4 5.4A1.4 1.4 0 0 1 5.4 4h4.2A2.4 2.4 0 0 1 12 6.4v13a2 2 0 0 0-2-2H4z" />
      <path d="M20 5.4A1.4 1.4 0 0 0 18.6 4h-4.2A2.4 2.4 0 0 0 12 6.4v13a2 2 0 0 1 2-2h6z" />
    </svg>
  )
}

export function LinkIcon({ size = 14 }) {
  return (
    <svg {...base(size)}>
      <path d="M10.2 13.8a4 4 0 0 0 5.7 0l2.9-2.9a4 4 0 0 0-5.7-5.7l-1.3 1.3" />
      <path d="M13.8 10.2a4 4 0 0 0-5.7 0l-2.9 2.9a4 4 0 1 0 5.7 5.7l1.3-1.3" />
    </svg>
  )
}

export function ThumbIcon({ size = 13 }) {
  return (
    <svg {...base(size)}>
      <path d="M7 21V10.5l4.2-8a2.2 2.2 0 0 1 3 2.7L13 9h5.5a2 2 0 0 1 2 2.4l-1.5 7A2.4 2.4 0 0 1 16.7 21z" />
      <rect x="2.8" y="10.5" width="4.2" height="10.5" rx="1" />
    </svg>
  )
}

export function ReplyIcon({ size = 13 }) {
  return (
    <svg {...base(size)}>
      <path d="M10 5 4 10.5 10 16" />
      <path d="M4 10.5h9.5a6 6 0 0 1 6 6V19" />
    </svg>
  )
}

export function GiftIcon({ size = 14 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="9" width="18" height="11.5" rx="1.8" />
      <path d="M2 9h20v3.5H2zM12 9v11.5" />
      <path d="M12 9S10.6 4 8.2 4a2.2 2.2 0 0 0 0 5M12 9s1.4-5 3.8-5a2.2 2.2 0 0 1 0 5" />
    </svg>
  )
}

export function SparkIcon({ size = 14 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 2.6c1.6 4.4 5 7.8 9.4 9.4-4.4 1.6-7.8 5-9.4 9.4-1.6-4.4-5-7.8-9.4-9.4C7 10.4 10.4 7 12 2.6Z" />
    </svg>
  )
}

export function ClipboardIcon({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <rect x="4.5" y="4.5" width="15" height="16" rx="2.2" />
      <path d="M9 4.5V3.4A1.4 1.4 0 0 1 10.4 2h3.2A1.4 1.4 0 0 1 15 3.4V4.5" />
      <path d="M8.5 11h7M8.5 15h4.5" />
    </svg>
  )
}

export function ChatBubbleIcon({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M20.5 12.2a7.7 7.7 0 0 1-8.3 7.6l-5.7 1.7 1.7-4.2A7.7 7.7 0 1 1 20.5 12.2Z" />
    </svg>
  )
}
