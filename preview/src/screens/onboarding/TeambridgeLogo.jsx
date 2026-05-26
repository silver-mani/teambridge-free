/* Teambridge brand mark — renders the actual logo PNG. The image
 * has its own dark rounded-square background, so the host container
 * doesn't need to supply one. */
const SRC = `${import.meta.env.BASE_URL}favicon.png`

export default function TeambridgeLogo({ size = 16 }) {
  return (
    <img
      src={SRC}
      alt=""
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: 'var(--radius-sm)' }}
    />
  )
}
