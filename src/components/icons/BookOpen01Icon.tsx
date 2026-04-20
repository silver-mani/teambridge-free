import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export function BookOpen01Icon({ size = 16, color = 'currentColor', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 3H8.5C9.43174 3 10.3252 3.36875 10.9749 4.02513C11.6246 4.6815 12 5.57174 12 6.5V21C12 20.337 11.7366 19.7011 11.2678 19.2322C10.7989 18.7634 10.163 18.5 9.5 18.5H2V3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 3H15.5C14.5683 3 13.6752 3.36875 13.0251 4.02513C12.375 4.6815 12 5.57174 12 6.5V21C12 20.337 12.2634 19.7011 12.7322 19.2322C13.2011 18.7634 13.837 18.5 14.5 18.5H22V3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
