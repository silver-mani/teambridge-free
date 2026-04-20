/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · FieldWrapper — internal layout helper (not exported publicly)
   Renders: optional label row → children (the visual shell) → optional footer

   layout="vertical"   (default) — label above, footer below
   layout="horizontal"            — label left column, control+footer right column
   ───────────────────────────────────────────────────────────────────────────── */

import type { CSSProperties, ReactNode } from 'react';
import { clsx } from 'clsx';
import { AlertCircleIcon } from '../icons/AlertCircleIcon';
import styles from './Input.module.css';

export type FieldLayout = 'vertical' | 'horizontal';

export interface FieldWrapperProps {
  /** Visible label text. Omit to render a shell-only field. */
  label?: ReactNode;
  /** Icon rendered immediately after the label text (e.g. InfoCircleIcon). */
  labelIcon?: ReactNode;
  /** In horizontal layout, a secondary description line below the label. */
  labelDescription?: string;
  /** Subtle helper text shown below the field. Overridden by `error` or `success`. */
  hint?: string;
  /** Error message — replaces hint, colors the footer red. */
  error?: string;
  /** Success message — replaces hint, colors the footer green. */
  success?: string;
  /** Appends a red asterisk after the label. */
  required?: boolean;
  /** Wires the label's `htmlFor` to the control's `id`. */
  htmlFor?: string;
  /** @default 'vertical' */
  layout?: FieldLayout;
  /** Width of the label column in horizontal layout. @default 160 */
  labelWidth?: number | string;
  className?: string;
  children: ReactNode;
}

export function FieldWrapper({
  label,
  labelIcon,
  labelDescription,
  hint,
  error,
  success,
  required,
  htmlFor,
  layout = 'vertical',
  labelWidth = 160,
  className,
  children,
}: FieldWrapperProps) {
  const footerText = error ?? success ?? hint;
  const footerKind = error ? 'error' : success ? 'success' : 'hint';

  const footer = footerText ? (
    <p
      className={clsx(
        styles.footer,
        footerKind === 'error'   && styles.footerError,
        footerKind === 'success' && styles.footerSuccess,
      )}
      role={footerKind === 'error' ? 'alert' : undefined}
      aria-live={footerKind === 'error' ? 'assertive' : undefined}
    >
      {footerKind === 'hint' && (
        <span className={`${styles.footerIcon} alloy-icon-slot`} aria-hidden="true">
          <AlertCircleIcon size={12} />
        </span>
      )}
      {footerText}
    </p>
  ) : null;

  const labelBlock = label != null ? (
    <div className={styles.labelRow}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {required && (
        <span className={styles.required} aria-hidden="true">*</span>
      )}
      {labelIcon && (
        <span className={`${styles.labelIcon} alloy-icon-slot`} aria-hidden="true">
          {labelIcon}
        </span>
      )}
    </div>
  ) : null;

  /* ── Horizontal layout ──────────────────────────────────────────────────── */
  if (layout === 'horizontal') {
    const colStyle: CSSProperties = {
      width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth,
    };
    return (
      <div className={clsx(styles.wrapper, styles.wrapperHorizontal, className)}>
        {(labelBlock || labelDescription) && (
          <div className={styles.horizontalLabelCol} style={colStyle}>
            {labelBlock}
            {labelDescription && (
              <p className={styles.horizontalLabelHint}>{labelDescription}</p>
            )}
          </div>
        )}
        <div className={styles.horizontalControlCol}>
          {children}
          {footer}
        </div>
      </div>
    );
  }

  /* ── Vertical layout (default) ──────────────────────────────────────────── */
  return (
    <div className={clsx(styles.wrapper, className)}>
      {labelBlock}
      {children}
      {footer}
    </div>
  );
}
