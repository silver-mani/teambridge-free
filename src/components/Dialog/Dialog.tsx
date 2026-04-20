/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Dialog
   Composable modal: Dialog + DialogHeader + DialogContent + DialogFooter
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef, useEffect, useRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import styles from './Dialog.module.css';
import { XIcon } from '../icons/XIcon';

// ── Types ────────────────────────────────────────────────────────────────────

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps {
  /** Controls visibility. */
  open: boolean;
  /** Called when the overlay or Escape key is triggered. */
  onClose: () => void;
  /** Dialog width. sm = 440px · md = 560px · lg = 680px. @default 'sm' */
  size?: DialogSize;
  children: ReactNode;
  /** Accessible label when there is no visible DialogHeader. */
  'aria-label'?: string;
  /** ID of the element that labels this dialog (usually the DialogHeader title). */
  'aria-labelledby'?: string;
}

export interface DialogHeaderProps extends ComponentPropsWithoutRef<'div'> {
  /** When provided, renders the close (×) button. */
  onClose?: () => void;
  children: ReactNode;
}

export type DialogContentProps = ComponentPropsWithoutRef<'div'>;
export type DialogFooterProps  = ComponentPropsWithoutRef<'div'>;

// ── DialogHeader ──────────────────────────────────────────────────────────────
// Header bar: title on the left, optional close button on the right.
// padding: 16px · border-bottom

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ onClose, children, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props}>
      <span className={styles.title}>{children}</span>
      {onClose && (
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  ),
);
DialogHeader.displayName = 'DialogHeader';

// ── DialogContent ─────────────────────────────────────────────────────────────
// Scrollable body area. padding: 16px · flex: 1 · overflow-y: auto

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.content, className)} {...props}>
      {children}
    </div>
  ),
);
DialogContent.displayName = 'DialogContent';

// ── DialogFooter ──────────────────────────────────────────────────────────────
// Right-aligned button row. padding: 16px · border-top
// Place one button or a group — they'll be right-aligned with 8px gap.

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.footer, className)} {...props}>
      {children}
    </div>
  ),
);
DialogFooter.displayName = 'DialogFooter';

// ── Dialog (root) ─────────────────────────────────────────────────────────────
// Renders a dimmed overlay + dialog container into document.body via portal.
// Escape key and clicking the backdrop both call onClose.

export function Dialog({
  open,
  onClose,
  size = 'sm',
  children,
  'aria-label':       ariaLabel,
  'aria-labelledby':  ariaLabelledby,
}: DialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Escape → close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      // Click on the backdrop (not on the dialog itself) → close
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        className={clsx(styles.dialog, styles[size])}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
