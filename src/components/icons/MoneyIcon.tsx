import type { SVGProps } from 'react';

export interface MoneyIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

export const MoneyIcon = ({ size = 16, color = 'currentColor', strokeWidth, ...props }: MoneyIconProps) => {
  const s = typeof size === 'number' ? size : parseFloat(size as string);
  const sw = strokeWidth ?? (s <= 12 ? 2 : s <= 16 ? 1.75 : s <= 20 ? 1.5 : 1.25);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth={sw}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M14.2222 9.77789V9.55566C14.2222 8.4511 13.3268 7.55566 12.2222 7.55566H11.7778C10.6732 7.55566 9.77777 8.45109 9.77777 9.55566V9.65293C9.77777 10.4105 10.2058 11.103 10.8833 11.4418L13.1166 12.5584C13.7942 12.8972 14.2222 13.5897 14.2222 14.3473V14.4446C14.2222 15.5491 13.3268 16.4446 12.2222 16.4446H11.7778C10.6732 16.4446 9.77777 15.5491 9.77777 14.4446V14.2223"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 7.55572V5.3335" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 18.6666V16.4443" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

MoneyIcon.displayName = 'MoneyIcon';
