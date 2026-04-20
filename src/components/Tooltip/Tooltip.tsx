import { useState, useRef, useId, useEffect, useCallback } from 'react';
import type { ReactNode, ReactElement } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import styles from './Tooltip.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Content to display inside the tooltip bubble. */
  content: ReactNode;
  /** Placement relative to the trigger element. @default 'top' */
  placement?: TooltipPlacement;
  /** Delay in ms before the tooltip appears. @default 0 */
  delay?: number;
  /** When true the tooltip never shows. */
  disabled?: boolean;
  /** Max width of the bubble; use for long-text tooltips. @default 280 */
  maxWidth?: number | string;
  /** The element that acts as the trigger. Must be a single ReactElement. */
  children: ReactElement;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Tooltip = ({
  content,
  placement = 'top',
  delay = 0,
  disabled = false,
  maxWidth = 280,
  children,
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const id = useId();

  const computeCoords = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const GAP = 6;
    let top = 0;
    let left = 0;
    switch (placement) {
      case 'top':
        top  = rect.top - GAP;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top  = rect.bottom + GAP;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top  = rect.top + rect.height / 2;
        left = rect.left - GAP;
        break;
      case 'right':
        top  = rect.top + rect.height / 2;
        left = rect.right + GAP;
        break;
    }
    setCoords({ top, left });
  }, [placement]);

  const show = useCallback(() => {
    if (disabled) return;
    computeCoords();
    clearTimeout(timeoutRef.current);
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(true);
    }
  }, [disabled, delay, computeCoords]);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  // Keep position in sync while visible (handles scroll / resize)
  useEffect(() => {
    if (!visible) return;
    const update = () => computeCoords();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [visible, computeCoords]);

  // Inject aria-describedby into the trigger so screen readers announce the tooltip
  const trigger = React.cloneElement(children, {
    'aria-describedby': visible ? id : undefined,
  });

  const bubble = (
    <span
      id={id}
      role="tooltip"
      className={clsx(styles.tooltip, styles[placement], styles.portal)}
      data-visible={visible || undefined}
      style={{
        top:      coords.top,
        left:     coords.left,
        maxWidth: maxWidth !== undefined ? maxWidth : undefined,
      }}
    >
      {content}
    </span>
  );

  return (
    <span
      ref={wrapperRef}
      className={styles.wrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      {createPortal(bubble, document.body)}
    </span>
  );
};

Tooltip.displayName = 'Tooltip';
