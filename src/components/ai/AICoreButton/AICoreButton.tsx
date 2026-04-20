import { forwardRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import { AILoader } from '../AILoader/AILoader';
import styles from './AICoreButton.module.css';

export type AICoreButtonSize = 'sm' | 'md' | 'lg';

export interface AICoreButtonProps extends ComponentPropsWithoutRef<'button'> {
  size?: AICoreButtonSize;
  dark?: boolean;
  loading?: boolean;
}

const ICON_SIZE: Record<AICoreButtonSize, number> = {
  sm: 12,
  md: 14,
  lg: 18,
};

function SparkleIcon({ size, light }: { size: number; light?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="42 18 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {!light && (
        <defs>
          <linearGradient
            id="ai-core-btn-sparkle"
            x1="41.875"
            y1="24"
            x2="54.125"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8C4FE2" />
            <stop offset="0.5" stopColor="#446CFF" />
            <stop offset="1" stopColor="#1EDFDE" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M53.9971 23.8161C51.3041 22.8187 49.1814 20.6959 48.1839 18.0029C48.1211 17.8324 47.8796 17.8324 47.8161 18.0029C46.8187 20.6959 44.6959 22.8186 42.0029 23.8161C41.8324 23.8789 41.8324 24.1204 42.0029 24.1839C44.6959 25.1813 46.8186 27.3041 47.8161 29.9971C47.8789 30.1676 48.1204 30.1676 48.1839 29.9971C49.1813 27.3041 51.3041 25.1814 53.9971 24.1839C54.1676 24.1211 54.1676 23.8796 53.9971 23.8161Z"
        fill={light ? 'white' : 'url(#ai-core-btn-sparkle)'}
      />
    </svg>
  );
}

export const AICoreButton = forwardRef<HTMLButtonElement, AICoreButtonProps>(
  ({ size = 'md', dark, loading, className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const [hovered, setHovered] = useState(false);
    const showLoader = loading || hovered;

    return (
      <button
        ref={ref}
        className={clsx(
          styles.root,
          styles[size],
          dark && styles.dark,
          loading ? styles.loading : hovered && styles.hovered,
          className,
        )}
        aria-busy={loading || undefined}
        onMouseEnter={e => { setHovered(true);  onMouseEnter?.(e); }}
        onMouseLeave={e => { setHovered(false); onMouseLeave?.(e); }}
        {...props}
      >
        <span className={styles.icon}>
          {loading
            ? <AILoader size={ICON_SIZE[size]} variant={dark ? 'inverse-light' : 'gradient-fill'} />
            : <SparkleIcon size={ICON_SIZE[size]} light={dark} />}
        </span>
      </button>
    );
  }
);

AICoreButton.displayName = 'AICoreButton';
