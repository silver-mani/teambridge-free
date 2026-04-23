import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

/* Untitled-UI "currency-dollar-circle" — $ glyph inside a ring. Used for the
   Pay tab in the left navigation. */
export function CurrencyDollarCircleIcon({ size = 16, color = 'currentColor', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M14.5 9.25C13.9 8.48 13 8 12 8C10.34 8 9 9.12 9 10.5C9 11.88 10.34 13 12 13C13.66 13 15 14.12 15 15.5C15 16.88 13.66 18 12 18C11 18 10.1 17.52 9.5 16.75M12 6.5V8M12 18V19.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
