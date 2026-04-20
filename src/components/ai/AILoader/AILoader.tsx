import { forwardRef, useId } from 'react';
import type { SVGProps } from 'react';
import { clsx } from 'clsx';
import styles from './AILoader.module.css';

export type AILoaderSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AILoaderVariant = 'gradient' | 'gradient-fill' | 'inverse' | 'inverse-light' | 'stroke' | 'stroke-light';

const SIZE_PX: Record<AILoaderSize, number> = {
  xs: 16, sm: 24, md: 32, lg: 48, xl: 64,
};

const STROKE_WIDTH: Record<AILoaderSize, number> = {
  xs: 1.75, sm: 1.5, md: 1.25, lg: 1.1, xl: 1.0,
};

export interface AILoaderProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?:    AILoaderSize | number;
  variant?: AILoaderVariant;
  className?: string;
}

const STAR_PATH =
  'M22.2808 11.6847C17.6641 9.97486 14.0252 6.33591 12.3153 1.71918C12.2076 1.42694 11.7937 1.42694 11.6847 1.71918C9.97486 6.33591 6.33591 9.97482 1.71918 11.6847C1.42694 11.7924 1.42694 12.2063 1.71918 12.3153C6.33591 14.0251 9.97482 17.6641 11.6847 22.2808C11.7924 22.5731 12.2063 22.5731 12.3153 22.2808C14.0251 17.6641 17.6641 14.0252 22.2808 12.3153C22.5731 12.2076 22.5731 11.7937 22.2808 11.6847Z';

const isSolid  = (v: AILoaderVariant) => v === 'inverse'       || v === 'inverse-light';
const isStroke = (v: AILoaderVariant) => v === 'stroke'        || v === 'stroke-light';

export const AILoader = forwardRef<SVGSVGElement, AILoaderProps>(
  ({ size = 'md', variant = 'gradient', className, style, ...props }, ref) => {
    const uid    = useId().replace(/[^a-z0-9]/gi, '');
    const gradId = `aigrad-${uid}`;
    const glowId = `aiglow-${uid}`;

    const isNamed = typeof size === 'string';
    const px = isNamed ? SIZE_PX[size as AILoaderSize] : (size as number);
    const sw = isNamed
      ? STROKE_WIDTH[size as AILoaderSize]
      : px <= 16 ? 1.75 : px <= 24 ? 1.5 : px <= 32 ? 1.25 : 1.1;

    /* ── Per-variant fill / stroke ── */
    // Solid + stroke variants use currentColor so CSS .variant-* rules handle
    // the always-dark / always-light theming via color property overrides.
    const pathFill   = variant === 'gradient-fill' ? `url(#${gradId})`
                     : isSolid(variant)             ? 'currentColor'
                     : 'none';

    const pathStroke = isSolid(variant)  ? 'none'
                     : isStroke(variant) ? 'currentColor'
                     : `url(#${gradId})`;

    const ghostStroke = 'currentColor';

    const useGlow = variant !== 'stroke' && variant !== 'stroke-light' && !isSolid(variant);

    return (
      <svg
        ref={ref}
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className={clsx(styles.root, styles[`variant-${variant}`], className)}
        style={style}
        aria-label="Loading"
        role="status"
        {...props}
      >
        {!isSolid(variant) && (
          <defs>
            <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="22" y1="2" x2="2" y2="22">
              <stop offset="0%"   stopColor="var(--ai-grad-start)" stopOpacity="1"   />
              <stop offset="55%"  stopColor="var(--ai-grad-mid)"   stopOpacity="1"   />
              <stop offset="100%" stopColor="var(--ai-grad-end)"   stopOpacity="0.1" />
            </linearGradient>

            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        {/* Ghost underlay */}
        <path
          d={STAR_PATH}
          stroke={ghostStroke}
          strokeWidth={sw * 0.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.08"
          className={styles.ghost}
        />

        {/* Animated path */}
        <path
          d={STAR_PATH}
          fill={pathFill}
          stroke={pathStroke === 'none' ? undefined : pathStroke}
          strokeWidth={pathStroke === 'none' ? undefined : sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={useGlow ? `url(#${glowId})` : undefined}
          className={styles.path}
        />
      </svg>
    );
  }
);

AILoader.displayName = 'AILoader';
