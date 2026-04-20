import type { SVGProps } from 'react';

export interface SettingsGearIconProps extends SVGProps<SVGSVGElement> {
  /** Width and height in px. */
  size?: number | string;
  strokeWidth?: number;
}

/** Hexagonal gear — Element/settings-gear (16×16 stroke+fill) */
export const SettingsGearIcon = ({ size = 16, color = 'currentColor', strokeWidth, ...props }: SettingsGearIconProps) => {
  const s = typeof size === 'number' ? size : parseFloat(size as string);
  const sw = strokeWidth ?? (s <= 12 ? 2 : s <= 16 ? 1.25 : s <= 20 ? 1.5 : 1.25);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd" clipRule="evenodd"
        d="M7.41787 1.59151C7.7782 1.38405 8.2218 1.38405 8.58213 1.59151L13.4155 4.37431C13.7771 4.58253 14 4.96807 14 5.38538V10.6145C14 11.0318 13.7771 11.4174 13.4155 11.6256L8.58213 14.4084C8.22173 14.6158 7.77827 14.6158 7.41787 14.4084L2.58457 11.6258C2.22291 11.4176 2 11.032 2 10.6147V5.38536C2 4.96805 2.22289 4.58252 2.58455 4.3743L7.41787 1.59151ZM5.58335 8.00004C5.58335 6.66535 6.66533 5.58337 8 5.58337C9.33473 5.58337 10.4167 6.66535 10.4167 8.00004C10.4167 9.33471 9.33473 10.4167 8 10.4167C6.66533 10.4167 5.58335 9.33471 5.58335 8.00004Z"
        stroke={color as string} strokeWidth={sw}
      />
    </svg>
  );
};

SettingsGearIcon.displayName = 'SettingsGearIcon';
