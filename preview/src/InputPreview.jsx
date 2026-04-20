/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Input / Field Preview
   TextField · TextArea · SelectField · PasswordField · SearchField
   Variants: outlined · underlined   States: all   Sizes: sm · md · lg
   ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react'
import { useIsMobile } from './useIsMobile.js'
import { MultiSelectField } from '../../src/components/Input/MultiSelectField'
import { SelectField } from '../../src/components/Input/SelectField'
import { FileUploader } from '../../src/components/FileUploader/FileUploader'

/* ── Inline icons (preview mirrors) ─────────────────────────────────────────── */
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 11H7C5.89543 11 5 11.8954 5 13V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V13C19 11.8954 18.1046 11 17 11ZM17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12H22M12 2C9.33333 5.33333 8 8.66667 8 12C8 15.3333 9.33333 18.6667 12 22C14.6667 18.6667 16 15.3333 16 12C16 8.66667 14.6667 5.33333 12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 20.71 15.95M14.12 14.12A3 3 0 1 1 9.88 9.88" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 3L21 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const TrashIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CloudUploadIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16.2A4.5 4.5 0 0 1 7.5 8h.056A6.001 6.001 0 0 1 18.45 9.43 3.5 3.5 0 1 1 18 16.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21v-9m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CheckCircleIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill={color}/>
    <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const FileIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2.27V6.4c0 .56 0 .84.109 1.054.096.188.249.341.437.437C14.76 8 15.04 8 15.6 8H19.73M20 9.99V17.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 22 16.88 22 15.2 22H8.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4 19.72 4 18.88 4 17.2V6.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.28 2 7.12 2 8.8 2h3.212c.734 0 1.1 0 1.446.083.305.073.598.195.866.36.302.185.561.444 1.08.963l3.19 3.188c.519.52.778.779.963 1.08.165.268.287.561.36.866.083.347.083.713.083 1.45z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const AlertCircleSmIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill={color}/>
    <path d="M12 8V12M12 16H12.01" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Icon slot ───────────────────────────────────────────────────────────────── */
const Icon = ({ children, size = 16 }) => (
  <span className="alloy-icon-slot" style={{ width: size, height: size }}>
    {children}
  </span>
)

const ROLE_OPTIONS  = [
  { value: 'eng',     label: 'Engineer'    },
  { value: 'design',  label: 'Designer'    },
  { value: 'pm',      label: 'Product'     },
  { value: 'growth',  label: 'Growth'      },
  { value: 'data',    label: 'Data'        },
  { value: 'ops',     label: 'Operations'  },
]
const TAG_OPTIONS   = [
  { value: 'frontend',  label: 'Frontend'  },
  { value: 'backend',   label: 'Backend'   },
  { value: 'infra',     label: 'Infra'     },
  { value: 'mobile',    label: 'Mobile'    },
  { value: 'design-sys',label: 'Design System' },
  { value: 'disabled-opt', label: 'Unavailable', disabled: true },
]
const COUNTRY_OPTIONS = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
]

function MultiSelectDemo() {
  const isMobile = useIsMobile()
  const [roles, setRoles]       = useState(['eng', 'design'])
  const [tags, setTags]         = useState([])
  const [errorVal, setErrorVal] = useState([])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Sizes */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 12px' }}>sizes — sm · md · lg</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['sm','md','lg'].map(s => (
            <MultiSelectField
              key={s}
              size={s}
              label={`Size ${s}`}
              options={ROLE_OPTIONS}
              defaultValue={s === 'md' ? ['eng'] : []}
              placeholder={`Select roles (${s})…`}
              style={{ maxWidth: 320 }}
            />
          ))}
        </div>
      </div>

      {/* Controlled with chips */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 12px' }}>controlled — chip removal · select all</p>
        <MultiSelectField
          label="Roles"
          hint="Click chips to remove. Keyboard: Backspace removes last."
          options={ROLE_OPTIONS}
          value={roles}
          onChange={setRoles}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Variants */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 12px' }}>variants — outlined · underlined</p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <MultiSelectField label="Outlined" options={ROLE_OPTIONS} defaultValue={['pm']} style={{ flex: 1, minWidth: isMobile ? 120 : 200 }} />
          <MultiSelectField label="Underlined" variant="underlined" options={ROLE_OPTIONS} defaultValue={['pm']} style={{ flex: 1, minWidth: isMobile ? 120 : 200 }} />
        </div>
      </div>

      {/* States */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 12px' }}>states — empty · disabled · error</p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <MultiSelectField label="Empty" placeholder="Nothing selected yet" options={ROLE_OPTIONS} style={{ flex: 1, minWidth: isMobile ? 120 : 180 }} />
          <MultiSelectField label="Disabled" options={ROLE_OPTIONS} defaultValue={['eng', 'design']} disabled style={{ flex: 1, minWidth: isMobile ? 120 : 180 }} />
          <MultiSelectField
            label="Error"
            error="Please select at least one role"
            options={ROLE_OPTIONS}
            value={errorVal}
            onChange={setErrorVal}
            style={{ flex: 1, minWidth: isMobile ? 120 : 180 }}
          />
        </div>
      </div>

      {/* Disabled option */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 12px' }}>disabled options</p>
        <MultiSelectField
          label="Tags"
          hint="'Unavailable' option is non-interactive."
          options={TAG_OPTIONS}
          value={tags}
          onChange={setTags}
          style={{ maxWidth: 400 }}
        />
      </div>
    </div>
  )
}

/* ── Section helper ──────────────────────────────────────────────────────────── */
function Section({ title, note, children }) {
  const isMobile = useIsMobile()
  return (
    <section style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-opaque)', borderRadius: 'var(--radius-xl)', padding: isMobile ? 20 : 32 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', margin: '0 0 4px' }}>{title}</p>
        {note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-content-tertiary)', margin: 0, lineHeight: 1.5 }}>{note}</p>}
      </div>
      {children}
    </section>
  )
}

/* ── Multi-file uploader interactive demo ───────────────────────────────────── */

function MultiFileDemo() {
  const [files, setFiles] = useState([])
  return (
    <FileUploader
      multiple
      files={files}
      onFilesSelect={(newFiles) =>
        setFiles((prev) => [
          ...prev,
          ...newFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        ])
      }
      onRemoveFile={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
    />
  )
}

/* ── FileUploader helpers ────────────────────────────────────────────────────── */

function getFileExt(file) {
  const dot = file.name.lastIndexOf('.')
  if (dot !== -1) return file.name.slice(dot + 1).toUpperCase()
  if (file.type) return (file.type.split('/').pop() ?? 'FILE').toUpperCase()
  return 'FILE'
}

/* Mirrors Button tertiary xs (24px) */
function SmallBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: 24, padding: '0 8px', gap: 4,
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-opaque)',
        borderRadius: 'var(--radius-button)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-content-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 1px 2px rgba(10,13,20,0.03)',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

/* Mirrors Tag sm neutral subtle */
function TagMirror({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 20, padding: '0 8px',
      borderRadius: 6, border: '1px solid var(--color-border-opaque)',
      background: 'var(--color-bg-tertiary)',
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)',
      letterSpacing: 'var(--tracking-wide)', color: 'var(--color-content-secondary)',
      whiteSpace: 'nowrap', userSelect: 'none', flexShrink: 0,
    }}>
      {children}
    </span>
  )
}

function FileRow({ file, state, onClear }) {
  const ext = getFileExt(file)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left' }}>
      <span className="alloy-icon-slot" style={{ color: 'var(--color-content-tertiary)', flexShrink: 0, width: 16, height: 16 }}>
        <FileIcon size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.name}
      </span>
      <TagMirror>{ext}</TagMirror>
      {state === 'complete' && (
        <span className="alloy-icon-slot" style={{ color: 'var(--color-green-content-secondary)', flexShrink: 0, width: 16, height: 16 }}>
          <CheckCircleIcon size={16} />
        </span>
      )}
      <button
        onClick={onClear}
        aria-label="Remove file"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-content-tertiary)', borderRadius: 'var(--radius-xs)', flexShrink: 0 }}
      >
        <span className="alloy-icon-slot" style={{ width: 14, height: 14 }} aria-hidden="true">
          <TrashIcon size={14} />
        </span>
      </button>
    </div>
  )
}

function FileUploaderArea({ state = 'empty', progress = 0, file, errorMessage, title = 'Choose a file or drag & drop it here.', description = 'JPEG, PNG, PDF, and MP4 formats, up to 50 MB.', disabled, dragHover, onClear, onRetry }) {
  const borderColor = state === 'error' ? 'var(--color-error-border)' : dragHover ? 'var(--color-border-focus)' : 'var(--color-border-opaque)'
  const bg = disabled ? 'var(--color-bg-disabled)' : dragHover ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32, width: '100%', border: `1px dashed ${borderColor}`, borderRadius: 'var(--radius-button)', background: bg, textAlign: 'center', boxSizing: 'border-box' }}>
      {state === 'empty' && (
        <>
          <span className="alloy-icon-slot" style={{ color: 'var(--color-content-tertiary)', width: 24, height: 24 }}><CloudUploadIcon size={24} /></span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-primary)', lineHeight: 1.4 }}>{title}</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-secondary)', lineHeight: 1.4 }}>{description}</p>
          </div>
          <SmallBtn disabled={disabled}>Browse File</SmallBtn>
        </>
      )}

      {state === 'uploading' && file && (
        <>
          <FileRow file={file} state="uploading" onClear={onClear} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', textAlign: 'left' }}>
            <div style={{ width: '100%', height: 4, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-border-focus)', borderRadius: 'var(--radius-full)', transition: 'width 200ms ease' }} />
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', lineHeight: 1.4 }}>{progress}% uploaded</p>
          </div>
        </>
      )}

      {state === 'complete' && file && (
        <FileRow file={file} state="complete" onClear={onClear} />
      )}

      {state === 'error' && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left' }}>
            <span className="alloy-icon-slot" style={{ color: 'var(--color-red-content-secondary)', flexShrink: 0, marginTop: 1, width: 18, height: 18 }}><AlertCircleSmIcon size={18} color="var(--color-red-content-secondary)" /></span>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--color-error-content)', lineHeight: 1.4 }}>{errorMessage ?? 'Upload failed. Please try again.'}</p>
          </div>
          <SmallBtn onClick={onRetry}>Try Again</SmallBtn>
        </>
      )}
    </div>
  )
}

function FileUploaderInline({ state = 'empty', progress = 0, file, errorMessage, title = 'Choose a file or drag & drop it here.', disabled, onClear, fieldVariant = 'outlined' }) {
  const borderColor = state === 'error' ? 'var(--color-error-border)' : state === 'complete' ? 'var(--color-success-border)' : 'var(--color-border-opaque)'
  const iconEl = {
    empty:     <CloudUploadIcon size={16} />,
    uploading: <FileIcon size={16} />,
    complete:  <CheckCircleIcon size={16} />,
    error:     <AlertCircleSmIcon size={16} />,
  }[state]
  const iconColor = state === 'complete' ? 'var(--color-green-content-secondary)' : state === 'error' ? 'var(--color-red-content-secondary)' : 'var(--color-content-tertiary)'
  const textColor = state === 'error' ? 'var(--color-error-content)' : (file && state !== 'empty') ? 'var(--color-content-primary)' : 'var(--color-content-tertiary)'
  const textWeight = (file && state !== 'empty') ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)'
  const hasFile = (state === 'uploading' || state === 'complete') && !!file

  const hasTrailingAction = state === 'uploading' || state === 'complete' || state === 'error'
  const isUnderlined = fieldVariant === 'underlined'
  const pr = (!isUnderlined && hasTrailingAction) ? 8 : (isUnderlined ? 0 : 12)
  const pl = isUnderlined ? 0 : 12

  const containerStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    paddingLeft: pl, paddingRight: pr,
    height: 40, width: '100%',
    ...(isUnderlined
      ? { border: 'none', borderBottom: `1px solid ${borderColor}`, borderRadius: 0, background: 'transparent' }
      : { border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-button)', background: disabled ? 'var(--color-bg-disabled)' : 'var(--color-bg-primary)' }
    ),
    position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
  }

  return (
    <div style={containerStyle}>
      <span className="alloy-icon-slot" style={{ color: iconColor, flexShrink: 0, width: 16, height: 16 }}>{iconEl}</span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: textWeight, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
        {state === 'empty'     && title}
        {state === 'uploading' && file?.name}
        {state === 'complete'  && file?.name}
        {state === 'error'     && (errorMessage ?? 'Upload failed. Please try again.')}
      </span>
      {hasFile && <TagMirror>{getFileExt(file)}</TagMirror>}
      {(state === 'uploading' || state === 'complete' || state === 'error') && (
        <button
          onClick={onClear}
          aria-label="Remove file"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-content-tertiary)', borderRadius: 'var(--radius-xs)', flexShrink: 0 }}
        >
          <span className="alloy-icon-slot" style={{ width: 14, height: 14 }} aria-hidden="true">
            <TrashIcon size={14} />
          </span>
        </button>
      )}
      {state === 'empty' && <SmallBtn disabled={disabled}>Browse</SmallBtn>}
      {state === 'uploading' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--color-bg-tertiary)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-border-focus)', transition: 'width 200ms ease' }} />
        </div>
      )}
    </div>
  )
}

/* ── Field primitives (preview mirrors of the Alloy components) ──────────────── */

/* FieldWrapper — label + footer */
function FieldWrapper({ label, hint, error, success, required, htmlFor, children, style }) {
  const footerText = error ?? success ?? hint
  const footerKind = error ? 'error' : success ? 'success' : 'hint'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', ...style }}>
      {label != null && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <label htmlFor={htmlFor} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-content-secondary)', lineHeight: 1.4 }}>
            {label}
          </label>
          {required && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-error-content)', lineHeight: 1, userSelect: 'none' }} aria-hidden="true">*</span>}
        </div>
      )}
      {children}
      {footerText && (
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', lineHeight: 1.4, color: footerKind === 'error' ? 'var(--color-error-content)' : footerKind === 'success' ? 'var(--color-success-content)' : 'var(--color-content-tertiary)' }}
          role={footerKind === 'error' ? 'alert' : undefined}>{footerText}</p>
      )}
    </div>
  )
}

/* FieldShell — the visual bordered box */
function FieldShell({ variant = 'outlined', size = 'md', error, success, disabled, readOnly, leadingIcon, trailingIcon, trailingAction, isTextarea, children }) {
  const sizeMap = { sm: { h: 32, fs: 'var(--text-xs)', px: 8, icon: 14 }, md: { h: 40, fs: 'var(--text-sm)', px: 12, icon: 16 }, lg: { h: 48, fs: 'var(--text-base)', px: 16, icon: 18 } }
  const s = sizeMap[size]
  const successIcon = success && !error && !trailingIcon && !trailingAction ? <CheckCircleIcon size={s.icon} /> : null
  const errorIcon   = error && !trailingIcon && !trailingAction ? <AlertCircleSmIcon size={s.icon} color="var(--color-red-content-secondary)" /> : null
  const hasLeading  = !!leadingIcon
  const hasTrailing = !!(trailingIcon || trailingAction || successIcon || errorIcon)
  const ctrlPl = variant === 'underlined' ? (hasLeading  ? 8 : 0) : (hasLeading  ? 8 : s.px)
  const ctrlPr = variant === 'underlined' ? (hasTrailing ? 8 : 0) : (hasTrailing ? 8 : s.px)

  const baseShell = {
    display: 'flex', alignItems: isTextarea ? 'flex-start' : 'center',
    position: 'relative', width: '100%',
    transition: 'border-color 100ms ease, box-shadow 100ms ease, background 100ms ease',
  }
  const outlined = {
    ...baseShell,
    background: disabled ? 'var(--color-bg-disabled)' : readOnly ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
    border: `1px solid ${error ? 'var(--color-error-border)' : success ? 'var(--color-success-border)' : 'var(--color-border-opaque)'}`,
    borderRadius: 'var(--radius-button)', /* 6px */
  }
  const underlined = {
    ...baseShell,
    background: 'transparent',
    borderBottom: `1px solid ${error ? 'var(--color-error-border)' : success ? 'var(--color-success-border)' : 'var(--color-border-opaque)'}`,
  }
  const shellStyle = variant === 'outlined' ? outlined : underlined

  const ctrlStyle = {
    flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
    fontFamily: 'var(--font-sans)', fontSize: s.fs, fontWeight: 'var(--font-weight-regular)',
    color: disabled ? 'var(--color-content-disabled)' : 'var(--color-content-primary)',
    caretColor: 'var(--color-content-primary)',
    lineHeight: 'var(--line-height-snug)',
    height: isTextarea ? 'auto' : s.h,
    paddingTop: isTextarea ? (variant === 'outlined' ? 8 : 4) : 0,
    paddingBottom: isTextarea ? 8 : 0,
    paddingLeft: ctrlPl, paddingRight: ctrlPr,
    resize: isTextarea ? 'vertical' : 'none',
    minHeight: isTextarea ? 80 : undefined,
    cursor: disabled ? 'not-allowed' : readOnly ? 'default' : undefined,
  }

  /* Icon slot: two levels — outer handles edge padding, inner holds the fixed icon dimensions.
     This prevents the box-sizing:border-box trap where padding + width shrinks SVG content. */
  const iconColor = disabled ? 'var(--color-content-disabled)' : 'var(--color-content-tertiary)'
  const outerPad  = variant === 'outlined' ? s.px : 0
  const taBase    = { alignSelf: isTextarea ? 'flex-start' : undefined, marginTop: isTextarea ? (variant === 'outlined' ? 8 : 4) : 0 }

  return (
    <div className={`fi-shell fi-${variant} fi-${size}${error ? ' fi-error' : ''}${success ? ' fi-success' : ''}${disabled ? ' fi-disabled' : ''}${readOnly ? ' fi-readonly' : ''}`} style={shellStyle}>
      {leadingIcon && (
        <span style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: outerPad, pointerEvents: 'none', flexShrink: 0, ...taBase }}>
          <span className="alloy-icon-slot" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: s.icon, height: s.icon, color: iconColor }}>
            {leadingIcon}
          </span>
        </span>
      )}
      {children({ ctrlStyle })}
      {trailingAction ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', paddingRight: outerPad, flexShrink: 0, ...taBase }}>
          {trailingAction({ size: s.icon, disabled })}
        </span>
      ) : (trailingIcon || successIcon || errorIcon) ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', paddingRight: outerPad, pointerEvents: 'none', flexShrink: 0, ...taBase }}>
          <span className="alloy-icon-slot" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: s.icon, height: s.icon, color: successIcon ? 'var(--color-green-content-secondary)' : errorIcon ? 'var(--color-red-content-secondary)' : iconColor }}>
            {trailingIcon ?? successIcon ?? errorIcon}
          </span>
        </span>
      ) : null}
    </div>
  )
}

/* Pre-built field types */
function TextField({ label, hint, error, success, required, variant, size = 'md', type = 'text', leadingIcon, trailingIcon, placeholder, value, onChange, disabled, readOnly, style }) {
  const id = `tf-${Math.random().toString(36).slice(2)}`
  return (
    <FieldWrapper label={label} hint={hint} error={error} success={success} required={required} htmlFor={id} style={style}>
      <FieldShell variant={variant} size={size} error={!!error} success={!!success} disabled={disabled} readOnly={readOnly} leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {({ ctrlStyle }) => (
          <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} readOnly={readOnly} aria-invalid={!!error || undefined} style={{ ...ctrlStyle, WebkitAppearance: 'none', MozAppearance: 'textfield' }} />
        )}
      </FieldShell>
    </FieldWrapper>
  )
}

function TextArea({ label, hint, error, success, required, variant, size = 'md', placeholder, disabled, readOnly, style }) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} success={success} required={required} style={style}>
      <FieldShell variant={variant} size={size} error={!!error} success={!!success} disabled={disabled} readOnly={readOnly} isTextarea>
        {({ ctrlStyle }) => (
          <textarea placeholder={placeholder} disabled={disabled} readOnly={readOnly} style={{ ...ctrlStyle, lineHeight: 1.5, fontFamily: 'var(--font-sans)' }} />
        )}
      </FieldShell>
    </FieldWrapper>
  )
}


function PasswordField({ label, hint, error, success, required, variant, size = 'md', placeholder, disabled, style }) {
  const [visible, setVisible] = useState(false)
  return (
    <FieldWrapper label={label} hint={hint} error={error} success={success} required={required} style={style}>
      <FieldShell variant={variant} size={size} error={!!error} success={!!success} disabled={disabled}
        trailingAction={({ size: iconSize, disabled: dis }) => (
          <button type="button" onClick={() => !dis && setVisible(v => !v)} aria-label={visible ? 'Hide password' : 'Show password'}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: iconSize, height: iconSize, background: 'none', border: 'none', padding: 0, cursor: dis ? 'not-allowed' : 'pointer', color: dis ? 'var(--color-content-disabled)' : 'var(--color-content-tertiary)', borderRadius: 'var(--radius-xs)' }}>
            <span className="alloy-icon-slot" style={{ width: iconSize, height: iconSize }}>
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </button>
        )}>
        {({ ctrlStyle }) => (
          <input type={visible ? 'text' : 'password'} placeholder={placeholder} disabled={disabled} autoComplete="current-password" style={ctrlStyle} />
        )}
      </FieldShell>
    </FieldWrapper>
  )
}

function SearchField({ label, hint, error, variant, size = 'md', placeholder, disabled, value, onChange, onClear, style }) {
  const sizeMap = { sm: 14, md: 16, lg: 18 }
  const hasValue = value !== undefined && String(value).length > 0
  const iconSize = sizeMap[size] || 16
  return (
    <FieldWrapper label={label} hint={hint} error={error} style={style}>
      <FieldShell variant={variant} size={size} error={!!error} disabled={disabled}
        leadingIcon={<SearchIcon />}
        trailingAction={hasValue ? ({ size: is, disabled: dis }) => (
          <button type="button" onClick={onClear} aria-label="Clear search"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: is, height: is, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-content-tertiary)', borderRadius: 'var(--radius-xs)' }}>
            <span className="alloy-icon-slot" style={{ width: is, height: is }}><XIcon /></span>
          </button>
        ) : undefined}>
        {({ ctrlStyle }) => (
          <input type="search" placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
            style={{ ...ctrlStyle, WebkitAppearance: 'none' }} />
        )}
      </FieldShell>
    </FieldWrapper>
  )
}

/* ── Horizontal field row helper ────────────────────────────────────────────── */
function HRow({ label, description, hint, error, children }) {
  const footerText = error ?? description ?? hint
  const isError = !!error
  return (
    <div className="fi-h-row">
      <div className="fi-h-label-col">
        <div className="fi-h-label">{label}</div>
      </div>
      <div className="fi-h-control-col">
        {children}
        {footerText && (
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', lineHeight: 1.4, color: isError ? 'var(--color-error-content)' : 'var(--color-content-tertiary)' }}>{footerText}</p>
        )}
      </div>
    </div>
  )
}

/* ── Specimen helpers ────────────────────────────────────────────────────────── */
function SpecimenGroup({ label }) {
  return (
    <div style={{
      padding:      '9px 20px 8px',
      borderTop:    '1px solid var(--color-border-opaque)',
      borderBottom: '1px solid var(--color-border-opaque)',
      background:   'var(--color-bg-secondary)',
    }}>
      <span style={{
        fontFamily:    'var(--font-sans)',
        fontSize:      '10px',
        fontWeight:    700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         'var(--color-content-disabled)',
      }}>{label}</span>
    </div>
  )
}

function SpecimenRow({ label, tags = [], note, isMobile, children }) {
  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
      alignItems:          'center',
      borderBottom:        '1px solid var(--color-border-opaque)',
      minHeight:           '52px',
    }}>
      <div style={{
        padding:     '12px 20px',
        borderRight: '1px solid var(--color-border-opaque)',
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        flexWrap:    'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize:   'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color:      'var(--color-content-primary)',
          lineHeight: 1,
        }}>{label}</span>
        {tags.map(t => (
          <span key={t} style={{
            fontFamily:   'var(--font-mono)',
            fontSize:     '10.5px',
            fontWeight:   500,
            color:        'var(--color-content-tertiary)',
            background:   'var(--color-bg-secondary)',
            border:       '1px solid var(--color-border-opaque)',
            borderRadius: 'var(--radius-sm)',
            padding:      '1px 6px',
            lineHeight:   1.6,
          }}>{t}</span>
        ))}
        {note && (
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize:   'var(--text-xs)',
            color:      'var(--color-content-disabled)',
            width:      '100%',
            marginTop:  '2px',
          }}>{note}</span>
        )}
      </div>
      <div style={{ padding: '12px 20px', overflowX: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function InputImportRow() {
  return (
    <div style={{
      padding:      '14px 20px',
      borderBottom: '1px solid var(--color-border-opaque)',
      fontFamily:   'var(--font-mono)',
      fontSize:     '12.5px',
      color:        'var(--color-content-secondary)',
    }}>
      <span className="specimen-import-kw">import </span>
      <span className="specimen-import-exp">{'{ TextField, TextArea, PasswordField, SearchField, SelectField, EmailField, NumberField, FileUploader, MultiSelectField }'}</span>
      <span className="specimen-import-kw"> from </span>
      <span className="specimen-import-src">'alloy-design-system'</span>
    </div>
  )
}

/* ── Preview component ───────────────────────────────────────────────────────── */
export default function InputPreview() {
  const isMobile = useIsMobile()
  const [searchVal, setSearchVal] = useState('')
  const [textVal, setTextVal] = useState('')

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }

        /* ─ Icon slot ─ */
        .alloy-icon-slot { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .alloy-icon-slot > svg, .alloy-icon-slot > svg * { stroke-width: 1.75; }
        .alloy-icon-slot > svg { display: block; width: 100%; height: 100%; }

        /* ─ Shell focus states ─ */
        .fi-shell input:focus, .fi-shell textarea:focus, .fi-shell select:focus { outline: none; }

        .fi-outlined:focus-within:not(.fi-disabled):not(.fi-readonly) {
          border-color: var(--color-border-selected) !important;
          box-shadow: var(--shadow-ring-default) !important;
        }
        .fi-outlined.fi-error:focus-within   { border-color: var(--color-error-border) !important; box-shadow: var(--shadow-ring-error) !important; }
        .fi-outlined.fi-success:focus-within { border-color: var(--color-success-border) !important; box-shadow: var(--shadow-ring-success) !important; }

        .fi-outlined:not(.fi-disabled):not(.fi-readonly):not(.fi-error):not(.fi-success):not(:focus-within):hover {
          border-color: var(--color-content-disabled) !important;
        }
        .fi-underlined:focus-within:not(.fi-disabled):not(.fi-readonly) {
          border-bottom-color: var(--color-border-selected) !important;
        }
        .fi-underlined:not(.fi-disabled):not(.fi-readonly):not(.fi-error):not(.fi-success):not(:focus-within):hover {
          border-bottom-color: var(--color-content-disabled) !important;
        }

        /* ─ Trailing action button hover ─ */
        .fi-shell button:hover { color: var(--color-content-secondary) !important; }
        .fi-shell button:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }

        /* ─ Placeholder color ─ */
        .fi-shell input::placeholder,
        .fi-shell textarea::placeholder { color: var(--color-content-tertiary); }

        /* ─ Select appearance reset ─ */
        .fi-shell select { -webkit-appearance: none; }

        /* ─ Number input — hide spin buttons ─ */
        .fi-shell input[type=number]::-webkit-outer-spin-button,
        .fi-shell input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .fi-shell input[type=number] { -moz-appearance: textfield; }

        /* ─ Search input — hide browser clear ─ */
        .fi-shell input[type=search]::-webkit-search-decoration,
        .fi-shell input[type=search]::-webkit-search-cancel-button { -webkit-appearance: none; }

        /* ─ Specimen ─ */
        .specimen-import-kw  { color: var(--color-content-disabled); }
        .specimen-import-exp { color: var(--color-content-primary); font-weight: 500; }
        .specimen-import-src { color: var(--color-content-secondary); }

        /* ─ Grid helpers ─ */
        .fi-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .fi-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        @media (max-width: 767px) {
          .fi-grid-2, .fi-grid-3 { grid-template-columns: 1fr; }
        }

        /* ─ Horizontal layout ─ */
        .fi-h-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          width: 100%;
        }
        .fi-h-row + .fi-h-row { margin-top: 1px; }
        .fi-h-label-col {
          flex-shrink: 0;
          width: 200px;
          padding-top: 11px; /* ~vertically centers with md (40px) input */
        }
        @media (max-width: 767px) {
          .fi-h-row { flex-direction: column; gap: 6px; }
          .fi-h-label-col { width: 100%; padding-top: 0; }
        }
        .fi-h-label {
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-content-secondary);
          line-height: 1.3;
        }
        .fi-h-control-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-sans)', padding: isMobile ? '24px 16px' : '48px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', color: 'var(--color-content-disabled)', marginBottom: 6 }}>Form</p>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-regular)', lineHeight: 'var(--line-height-snug)', color: 'var(--color-content-primary)', marginBottom: 8 }}>Input / Field</h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-content-tertiary)', lineHeight: 1.6 }}>TextField · TextArea · SelectField · PasswordField · SearchField · FileUploader · 2 variants · 2 layouts · 3 sizes · all states</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1 — Variants */}
          <Section title="Variants" note="outlined: full border · underlined: bottom border only — same spacing, typography, and states">
            <div className="fi-grid-2">
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 12 }}>outlined</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <TextField label="Full name" placeholder="Jane Smith" variant="outlined" />
                  <TextField label="Email" placeholder="jane@company.com" type="email" leadingIcon={<MailIcon />} variant="outlined" />
                  <SelectField label="Country" variant="outlined" options={COUNTRY_OPTIONS} />
                  <TextArea label="Bio" placeholder="Tell us about yourself…" variant="outlined" />
                </div>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 12 }}>underlined</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <TextField label="Full name" placeholder="Jane Smith" variant="underlined" />
                  <TextField label="Email" placeholder="jane@company.com" type="email" leadingIcon={<MailIcon />} variant="underlined" />
                  <SelectField label="Country" variant="underlined" options={COUNTRY_OPTIONS} />
                  <TextArea label="Bio" placeholder="Tell us about yourself…" variant="underlined" />
                </div>
              </div>
            </div>
          </Section>

          {/* 2 — Field Types */}
          <Section title="Field Types" note="All 7 field types — shared base, specialized behavior per type">
            <div className="fi-grid-3">
              <TextField label="Text" placeholder="Enter text…" hint="General purpose single-line" />
              <TextField label="Email" type="email" placeholder="you@example.com" leadingIcon={<MailIcon />} />
              <TextField label="Number" type="number" placeholder="0" leadingIcon={<span className="alloy-icon-slot" style={{ width: 16, height: 16, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)' }}>#</span>} hint="Browser spinners removed" />
              <PasswordField label="Password" placeholder="Enter password" hint="Toggle to reveal" />
              <SearchField label="Search" placeholder="Search anything…" value={searchVal} onChange={e => setSearchVal(e.target.value)} onClear={() => setSearchVal('')} hint="Clear button appears when filled" />
              <SelectField label="Select" options={[
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B' },
                { value: 'c', label: 'Option C' },
              ]} />
              <TextArea label="Text Area" placeholder="Multi-line input…" hint="Vertically resizable" style={{ gridColumn: '1 / -1' }} />
            </div>
          </Section>

          {/* 3 — Sizes */}
          <Section title="Sizes" note="sm: 32px · md: 40px (default) · lg: 48px — font size, icon size, and padding all scale">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['sm', 'md', 'lg'].map(size => (
                <div key={size} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-end', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', width: 28, flexShrink: 0, paddingBottom: isMobile ? 0 : 10 }}>{size}</span>
                  <TextField size={size} placeholder={`${size} text field`} leadingIcon={<UserIcon />} style={{ flex: 1, minWidth: isMobile ? 120 : 200 }} />
                  <PasswordField size={size} placeholder={`${size} password`} style={{ flex: 1, minWidth: isMobile ? 120 : 200 }} />
                  <SelectField size={size} style={{ flex: 1, minWidth: isMobile ? 120 : 200 }} options={[
                    { value: 'a', label: `${size} select` },
                    { value: 'b', label: 'Option B' },
                  ]} />
                  <SearchField size={size} placeholder={`${size} search`} style={{ flex: 1, minWidth: isMobile ? 120 : 200 }} />
                </div>
              ))}
            </div>
          </Section>

          {/* 4 — States */}
          <Section title="States" note="Consistent across all field types and both variants">
            <div className="fi-grid-2" style={{ gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>outlined</p>
                <TextField label="Default" placeholder="Idle, waiting for input" hint="Hint text appears here" />
                <TextField label="Filled" value={textVal || 'jane@company.com'} onChange={e => setTextVal(e.target.value)} hint="Value entered by user" />
                <TextField label="Error" defaultValue="invalid-email" error="Please enter a valid email address" />
                <TextField label="Success" defaultValue="jane@company.com" success="Email address is available" />
                <TextField label="Disabled" placeholder="Cannot be interacted with" hint="All interaction blocked" disabled />
                <TextField label="Read-only" value="Read-only value" readOnly hint="Visible but not editable" />
                <TextField label="Required" placeholder="This field is required" required hint="Asterisk indicates requirement" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>underlined</p>
                <TextField label="Default" placeholder="Idle, waiting for input" hint="Hint text appears here" variant="underlined" />
                <TextField label="Filled" value="jane@company.com" onChange={() => {}} hint="Value entered by user" variant="underlined" />
                <TextField label="Error" defaultValue="invalid-email" error="Please enter a valid email address" variant="underlined" />
                <TextField label="Success" defaultValue="jane@company.com" success="Email address is available" variant="underlined" />
                <TextField label="Disabled" placeholder="Cannot be interacted with" hint="All interaction blocked" disabled variant="underlined" />
                <TextField label="Read-only" value="Read-only value" readOnly hint="Visible but not editable" variant="underlined" />
                <TextField label="Required" placeholder="This field is required" required hint="Asterisk indicates requirement" variant="underlined" />
              </div>
            </div>
          </Section>

          {/* 5 — Icon Slots */}
          <Section title="Leading & Trailing Icons" note="leadingIcon for context · trailingIcon for decoration — both size-matched to the field tier">
            <div className="fi-grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 4 }}>leading icon</p>
                <TextField placeholder="Search users…" leadingIcon={<SearchIcon />} />
                <TextField placeholder="Email address" leadingIcon={<MailIcon />} />
                <TextField placeholder="Website URL" leadingIcon={<GlobeIcon />} />
                <TextField placeholder="Username" leadingIcon={<UserIcon />} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 4 }}>leading + trailing</p>
                <TextField placeholder="Email" leadingIcon={<MailIcon />} trailingIcon={<GlobeIcon />} />
                <TextField placeholder="Password" leadingIcon={<LockIcon />} trailingIcon={<EyeIcon />} />
                <TextField placeholder="Search" leadingIcon={<SearchIcon />} trailingIcon={<XIcon />} />
                <TextField placeholder="Username" leadingIcon={<UserIcon />} trailingIcon={<GlobeIcon />} />
              </div>
            </div>
          </Section>

          {/* 6 — Realistic form */}
          <Section title="Realistic Form" note="Sign-up flow — all field types, states, and icons working together">
            <div style={{ maxWidth: 480 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  <TextField label="First name" placeholder="Jane" required />
                  <TextField label="Last name" placeholder="Smith" required />
                </div>
                <TextField label="Email address" placeholder="jane@company.com" type="email" leadingIcon={<MailIcon />} required hint="We'll send a verification link" />
                <PasswordField label="Password" placeholder="Create a password" required hint="8+ characters, one number, one symbol" />
                <PasswordField label="Confirm password" placeholder="Repeat your password" required />
                <SelectField label="Country" required options={COUNTRY_OPTIONS} placeholder="Select your country…" />
                <TextArea label="About you" placeholder="Brief intro (optional)" hint="Up to 280 characters" />
              </div>
            </div>
          </Section>

          {/* 7 — Horizontal layout */}
          <Section title="Horizontal Layout" note="layout='horizontal' — label pinned to a fixed-width left column, control on the right. Ideal for settings pages and profile forms.">

            {/* Outlined variant */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 12 }}>outlined (default)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <HRow label="Display name" description="This is how others will see you.">
                  <FieldShell variant="outlined" size="md">
                    {({ ctrlStyle }) => <input placeholder="Jane Smith" style={ctrlStyle} />}
                  </FieldShell>
                </HRow>
                <HRow label="Email address" description="Used for login and notifications." hint="We'll send a verification link when changed.">
                  <FieldShell variant="outlined" size="md" leadingIcon={<MailIcon />}>
                    {({ ctrlStyle }) => <input type="email" placeholder="jane@company.com" style={ctrlStyle} />}
                  </FieldShell>
                </HRow>
                <HRow label="Password">
                  <FieldShell variant="outlined" size="md">
                    {({ ctrlStyle }) => <input type="password" placeholder="••••••••" style={ctrlStyle} />}
                  </FieldShell>
                </HRow>
                <SelectField
                  label="Timezone"
                  labelDescription="All dates display in this timezone."
                  layout="horizontal"
                  defaultValue="pacific"
                  options={[
                    { value: 'pacific', label: 'Pacific Time (UTC–8)' },
                    { value: 'eastern', label: 'Eastern Time (UTC–5)' },
                    { value: 'utc',     label: 'UTC' },
                  ]}
                />
                <HRow label="Bio" description="Short intro shown on your profile.">
                  <FieldShell variant="outlined" size="md" isTextarea>
                    {({ ctrlStyle }) => <textarea placeholder="Tell us about yourself…" style={{ ...ctrlStyle, lineHeight: 1.5, fontFamily: 'var(--font-sans)' }} />}
                  </FieldShell>
                </HRow>
              </div>
            </div>

            {/* Underlined variant */}
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 12 }}>underlined</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <HRow label="Full name">
                  <FieldShell variant="underlined" size="md">
                    {({ ctrlStyle }) => <input placeholder="Jane Smith" style={ctrlStyle} />}
                  </FieldShell>
                </HRow>
                <HRow label="Email" description="Used for login." error="This email is already taken.">
                  <FieldShell variant="underlined" size="md" error leadingIcon={<MailIcon />}>
                    {({ ctrlStyle }) => <input type="email" defaultValue="jane@taken.com" style={ctrlStyle} />}
                  </FieldShell>
                </HRow>
                <SelectField
                  label="Role"
                  labelDescription="Determines feature access."
                  layout="horizontal"
                  variant="underlined"
                  defaultValue="member"
                  options={[
                    { value: 'member', label: 'Member' },
                    { value: 'admin',  label: 'Admin'  },
                    { value: 'viewer', label: 'Viewer' },
                  ]}
                />
                <HRow label="Notifications disabled">
                  <FieldShell variant="underlined" size="md" disabled>
                    {({ ctrlStyle }) => <input placeholder="Disabled field" disabled style={ctrlStyle} />}
                  </FieldShell>
                </HRow>
              </div>
            </div>
          </Section>

          {/* 8 — Multi-Select */}
          <Section title="Multi-Select" note="Chip-based multi-select — controlled selection, removable chips, dropdown with checkboxes · sm · md · lg sizes">
            <MultiSelectDemo />
          </Section>

          {/* 9 — File Uploader */}
          <Section title="File Uploader" note="area: standalone drop zone · inline: input-row style — empty, uploading, complete, error states">
            {/* Area variant */}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 16 }}>area</p>
            <div className="fi-grid-2" style={{ marginBottom: 32 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 8 }}>empty</p>
                <FileUploaderArea state="empty" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 8 }}>empty · hover / drag over</p>
                <FileUploaderArea state="empty" dragHover />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 8 }}>uploading · 60%</p>
                <FileUploaderArea
                  state="uploading"
                  progress={60}
                  file={{ name: 'project-report.pdf', type: 'application/pdf' }}
                />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 8 }}>complete</p>
                <FileUploaderArea
                  state="complete"
                  file={{ name: 'project-report.pdf', type: 'application/pdf' }}
                />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 8 }}>error</p>
                <FileUploaderArea
                  state="error"
                  errorMessage="File exceeds the 50 MB limit. Please choose a smaller file."
                />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 8 }}>disabled</p>
                <FileUploaderArea state="empty" disabled />
              </div>
            </div>

            {/* Inline variant */}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginBottom: 16 }}>inline</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>empty</p>
                <FileUploaderInline state="empty" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>uploading · 40%</p>
                <FileUploaderInline state="uploading" progress={40} file={{ name: 'hero-banner.png', type: 'image/png' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>complete</p>
                <FileUploaderInline state="complete" file={{ name: 'hero-banner.png', type: 'image/png' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>error</p>
                <FileUploaderInline state="error" errorMessage="Unsupported file type." />
              </div>
            </div>

            {/* Multi-file variant */}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginTop: 24, marginBottom: 16 }}>area · multiple</p>
            <div style={{ maxWidth: 560 }}>
              <MultiFileDemo />
            </div>

            {/* Inline underlined variant */}
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)', marginTop: 24, marginBottom: 16 }}>inline · underlined</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>empty</p>
                <FileUploaderInline state="empty" fieldVariant="underlined" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>uploading · 40%</p>
                <FileUploaderInline state="uploading" progress={40} file={{ name: 'hero-banner.png', type: 'image/png' }} fieldVariant="underlined" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>complete</p>
                <FileUploaderInline state="complete" file={{ name: 'hero-banner.png', type: 'image/png' }} fieldVariant="underlined" />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-tertiary)', marginBottom: 6 }}>error</p>
                <FileUploaderInline state="error" errorMessage="Unsupported file type." fieldVariant="underlined" />
              </div>
            </div>
          </Section>

          {/* 10 — Specimen */}
          <Section title="Specimen" note="Quick-reference prop matrix — all variants, field types, sizes, states, icon slots, layouts, multi-select, and file uploader behaviors">
            <div style={{
              background:   'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border:       '1px solid var(--color-border-opaque)',
              overflow:     'hidden',
            }}>

              {/* Package */}
              <SpecimenGroup label="Package" />
              <InputImportRow />

              {/* Variant */}
              <SpecimenGroup label="Variant" />
              <SpecimenRow label="outlined" tags={['variant="outlined"', 'default']} isMobile={isMobile}>
                <TextField placeholder="Outlined field" variant="outlined" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="underlined" tags={['variant="underlined"']} isMobile={isMobile}>
                <TextField placeholder="Underlined field" variant="underlined" style={{ maxWidth: 400 }} />
              </SpecimenRow>

              {/* Field Type */}
              <SpecimenGroup label="Field Type" />
              <SpecimenRow label="TextField" tags={['type="text"']} isMobile={isMobile}>
                <TextField placeholder="Single-line text" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="TextArea" tags={['multiline', 'resize="vertical"']} isMobile={isMobile}>
                <TextArea placeholder="Multi-line text…" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="PasswordField" tags={['toggles visibility']} isMobile={isMobile}>
                <PasswordField placeholder="Enter password" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="SearchField" tags={['leadingIcon', 'clearable']} isMobile={isMobile}>
                <SearchField placeholder="Search anything…" value={searchVal} onChange={e => setSearchVal(e.target.value)} onClear={() => setSearchVal('')} style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="SelectField" tags={['native <select>']} isMobile={isMobile}>
                <SelectField options={[{value:'a',label:'Option A'},{value:'b',label:'Option B'},{value:'c',label:'Option C'}]} style={{ maxWidth: 400 }} />
              </SpecimenRow>

              {/* Size */}
              <SpecimenGroup label="Size" />
              <SpecimenRow label="sm — 32px" tags={['size="sm"']} isMobile={isMobile}>
                <TextField size="sm" placeholder="Small" leadingIcon={<UserIcon />} style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="md — 40px" tags={['size="md"', 'default']} isMobile={isMobile}>
                <TextField size="md" placeholder="Medium (default)" leadingIcon={<UserIcon />} style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="lg — 48px" tags={['size="lg"']} isMobile={isMobile}>
                <TextField size="lg" placeholder="Large" leadingIcon={<UserIcon />} style={{ maxWidth: 400 }} />
              </SpecimenRow>

              {/* State */}
              <SpecimenGroup label="State" />
              <SpecimenRow label="default" isMobile={isMobile}>
                <TextField placeholder="Idle, waiting for input" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="error" tags={['error="..."']} isMobile={isMobile}>
                <TextField defaultValue="bad-value" error="Please enter a valid email address" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="success" tags={['success="..."']} isMobile={isMobile}>
                <TextField defaultValue="jane@company.com" success="Email address verified" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="disabled" tags={['disabled']} isMobile={isMobile}>
                <TextField placeholder="Cannot be interacted with" disabled style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="read-only" tags={['readOnly']} isMobile={isMobile}>
                <TextField value="Read-only value" readOnly onChange={() => {}} style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="required" tags={['required']} isMobile={isMobile}>
                <TextField label="Field label" placeholder="Required field" required hint="Asterisk marks required" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="hint" tags={['hint="..."']} isMobile={isMobile}>
                <TextField placeholder="With hint text" hint="Helper text appears below the field" style={{ maxWidth: 400 }} />
              </SpecimenRow>

              {/* Icon Slots */}
              <SpecimenGroup label="Icon Slots" />
              <SpecimenRow label="leading icon" tags={['leadingIcon']} isMobile={isMobile}>
                <TextField placeholder="Email address" leadingIcon={<MailIcon />} style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="trailing icon" tags={['trailingIcon']} isMobile={isMobile}>
                <TextField placeholder="Website URL" trailingIcon={<GlobeIcon />} style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="leading + trailing" tags={['leadingIcon', 'trailingIcon']} isMobile={isMobile}>
                <TextField placeholder="Search users" leadingIcon={<SearchIcon />} trailingIcon={<XIcon />} style={{ maxWidth: 400 }} />
              </SpecimenRow>

              {/* Layout */}
              <SpecimenGroup label="Layout" />
              <SpecimenRow label="vertical" tags={['layout="vertical"', 'default']} isMobile={isMobile}>
                <TextField label="Full name" placeholder="Jane Smith" hint="Label stacked above field" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="horizontal" tags={['layout="horizontal"']} note="Label pinned left, control on the right" isMobile={isMobile}>
                <SelectField label="Timezone" labelDescription="All dates in this zone." layout="horizontal" defaultValue="utc" options={[{value:'utc',label:'UTC'},{value:'pacific',label:'Pacific (UTC–8)'},{value:'eastern',label:'Eastern (UTC–5)'}]} />
              </SpecimenRow>

              {/* Multi-Select */}
              <SpecimenGroup label="Multi-Select" />
              <SpecimenRow label="sm — 32px" tags={['size="sm"']} isMobile={isMobile}>
                <MultiSelectField size="sm" options={TAG_OPTIONS} placeholder="Select tags…" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="md — 40px" tags={['size="md"', 'default']} isMobile={isMobile}>
                <MultiSelectField size="md" options={TAG_OPTIONS} placeholder="Select tags…" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="lg — 48px" tags={['size="lg"']} isMobile={isMobile}>
                <MultiSelectField size="lg" options={TAG_OPTIONS} placeholder="Select tags…" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="underlined" tags={['variant="underlined"']} isMobile={isMobile}>
                <MultiSelectField variant="underlined" options={TAG_OPTIONS} placeholder="Select tags…" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="with selection" tags={['defaultValue']} isMobile={isMobile}>
                <MultiSelectField options={TAG_OPTIONS} defaultValue={['frontend', 'backend']} placeholder="Select tags…" style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="disabled" tags={['disabled']} isMobile={isMobile}>
                <MultiSelectField options={TAG_OPTIONS} defaultValue={['frontend']} placeholder="Disabled" disabled style={{ maxWidth: 400 }} />
              </SpecimenRow>
              <SpecimenRow label="error" tags={['error="..."']} isMobile={isMobile}>
                <MultiSelectField options={TAG_OPTIONS} error="At least one tag is required" style={{ maxWidth: 400 }} />
              </SpecimenRow>

              {/* File Uploader — area */}
              <SpecimenGroup label="File Uploader — area" />
              <SpecimenRow label="empty" tags={['state="empty"']} isMobile={isMobile}>
                <FileUploaderArea state="empty" />
              </SpecimenRow>
              <SpecimenRow label="drag hover" tags={['dragHover']} isMobile={isMobile}>
                <FileUploaderArea state="empty" dragHover />
              </SpecimenRow>
              <SpecimenRow label="uploading" tags={['state="uploading"', 'progress={60}']} isMobile={isMobile}>
                <FileUploaderArea state="uploading" progress={60} file={{ name: 'project-report.pdf', type: 'application/pdf' }} />
              </SpecimenRow>
              <SpecimenRow label="complete" tags={['state="complete"']} isMobile={isMobile}>
                <FileUploaderArea state="complete" file={{ name: 'project-report.pdf', type: 'application/pdf' }} />
              </SpecimenRow>
              <SpecimenRow label="error" tags={['state="error"', 'errorMessage']} isMobile={isMobile}>
                <FileUploaderArea state="error" errorMessage="File exceeds the 50 MB limit. Please choose a smaller file." />
              </SpecimenRow>
              <SpecimenRow label="disabled" tags={['disabled']} isMobile={isMobile}>
                <FileUploaderArea state="empty" disabled />
              </SpecimenRow>

              {/* File Uploader — inline */}
              <SpecimenGroup label="File Uploader — inline" />
              <SpecimenRow label="empty" tags={['state="empty"']} isMobile={isMobile}>
                <FileUploaderInline state="empty" />
              </SpecimenRow>
              <SpecimenRow label="uploading" tags={['state="uploading"', 'progress={40}']} isMobile={isMobile}>
                <FileUploaderInline state="uploading" progress={40} file={{ name: 'hero-banner.png', type: 'image/png' }} />
              </SpecimenRow>
              <SpecimenRow label="complete" tags={['state="complete"']} isMobile={isMobile}>
                <FileUploaderInline state="complete" file={{ name: 'hero-banner.png', type: 'image/png' }} />
              </SpecimenRow>
              <SpecimenRow label="error" tags={['state="error"', 'errorMessage']} isMobile={isMobile}>
                <FileUploaderInline state="error" errorMessage="Unsupported file type." />
              </SpecimenRow>
              <SpecimenRow label="underlined variant" tags={['fieldVariant="underlined"']} isMobile={isMobile}>
                <FileUploaderInline state="empty" fieldVariant="underlined" />
              </SpecimenRow>

            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border-opaque)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--color-content-disabled)', letterSpacing: 'var(--tracking-wide)' }}>Alloy — Input / Field v1.1</span>
        </div>

      </div>
    </>
  )
}
