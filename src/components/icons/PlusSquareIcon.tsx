import type { SVGProps } from 'react';

export interface PlusSquareIconProps extends SVGProps<SVGSVGElement> {
  /** Width and height in px. */
  size?: number | string;
  strokeWidth?: number;
}

/** Plus inside a rounded square — Element/plus-square (16×16 stroke) */
export const PlusSquareIcon = ({ size = 16, color = 'currentColor', strokeWidth, ...props }: PlusSquareIconProps) => {
  const s = typeof size === 'number' ? size : parseFloat(size as string);
  const sw = strokeWidth ?? (s <= 12 ? 2 : s <= 16 ? 1.75 : s <= 20 ? 1.5 : 1.25);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8 5.33333V10.6667M5.33333 8H10.6667M5.2 14H10.8C11.9201 14 12.4802 14 12.908 13.782C13.2843 13.5903 13.5903 13.2843 13.782 12.908C14 12.4802 14 11.9201 14 10.8V5.2C14 4.0799 14 3.51984 13.782 3.09202C13.5903 2.71569 13.2843 2.40973 12.908 2.21799C12.4802 2 11.9201 2 10.8 2H5.2C4.0799 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.0799 2 5.2V10.8C2 11.9201 2 12.4802 2.21799 12.908C2.40973 13.2843 2.71569 13.5903 3.09202 13.782C3.51984 14 4.0799 14 5.2 14Z"
        stroke={color as string} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
};

PlusSquareIcon.displayName = 'PlusSquareIcon';
