/* Small sparkle/spark icon — used for "build your account" affordance.
 * Matches Alloy's stroke style (1.5, round caps). */
export function SparkleIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth={1.5}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <path d="M12 8.5a3.5 3.5 0 0 0 3.5 3.5 3.5 3.5 0 0 0-3.5 3.5 3.5 3.5 0 0 0-3.5-3.5A3.5 3.5 0 0 0 12 8.5Z" />
    </svg>
  )
}
