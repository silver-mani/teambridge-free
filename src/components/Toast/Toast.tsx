/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Toast
   Top-right fixed stack · slide-in/out animations · auto-dismiss · portal
   ───────────────────────────────────────────────────────────────────────────── */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Alert } from '../Alert/Alert';
import type { AlertStatus, AlertVariant, AlertSize } from '../Alert/Alert';
import styles from './Toast.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ToastOptions {
  /** Alert heading (required) */
  title: string;
  /** Supporting description — shown in lg size only */
  description?: string;
  /** Semantic status */
  status?: AlertStatus;
  /** lighter = tinted bg; stroke = white bg. @default 'stroke' */
  variant?: AlertVariant;
  /** sm = single-line; lg = title + description. @default 'sm' */
  size?: AlertSize;
  /** Primary action label */
  action?: string;
  /** Primary action click handler */
  onAction?: () => void;
  /** Auto-dismiss duration in ms. 0 = persist until manually dismissed. @default 4000 */
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, 'status' | 'variant' | 'size' | 'duration'>> {
  id: string;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
  /** true while the exit animation is playing */
  exiting: boolean;
}

interface ToastContextValue {
  addToast: (opts: ToastOptions) => string;
  removeToast: (id: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── useToast hook ─────────────────────────────────────────────────────────────

export interface ToastFn {
  (opts: ToastOptions): string;
  success: (title: string, opts?: Omit<ToastOptions, 'title' | 'status'>) => string;
  error:   (title: string, opts?: Omit<ToastOptions, 'title' | 'status'>) => string;
  warning: (title: string, opts?: Omit<ToastOptions, 'title' | 'status'>) => string;
  info:    (title: string, opts?: Omit<ToastOptions, 'title' | 'status'>) => string;
}

export function useToast(): { toast: ToastFn } {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');

  const toast = useCallback(
    (opts: ToastOptions) => ctx.addToast(opts),
    [ctx],
  ) as ToastFn;

  toast.success = (title, opts) => ctx.addToast({ ...opts, title, status: 'success' });
  toast.error   = (title, opts) => ctx.addToast({ ...opts, title, status: 'error' });
  toast.warning = (title, opts) => ctx.addToast({ ...opts, title, status: 'warning' });
  toast.info    = (title, opts) => ctx.addToast({ ...opts, title, status: 'info' });

  return { toast };
}

// ── ToastItem ─────────────────────────────────────────────────────────────────
// Renders a single Alert with auto-dismiss timer and exit animation.

function ToastItem({
  id,
  title,
  description,
  status,
  variant,
  size,
  action,
  onAction,
  duration,
  exiting,
  onRemove,
}: ToastItem & { onRemove: (id: string) => void }) {

  // Start exit animation then remove from DOM after it completes
  const handleDismiss = useCallback(() => onRemove(id), [id, onRemove]);

  return (
    <div
      className={clsx(styles.item, exiting && styles.itemExiting)}
      onAnimationEnd={exiting ? handleDismiss : undefined}
    >
      <Alert
        status={status}
        variant={variant}
        size={size}
        title={title}
        description={description}
        action={action}
        onAction={onAction}
        onDismiss={handleDismiss}
        style={{ width: '100%' }}
      />
    </div>
  );
}

// ── ToastStack ────────────────────────────────────────────────────────────────
// Fixed top-right container rendered into document.body via portal.

function ToastStack({
  toasts,
  onStartExit,
  onRemove,
}: {
  toasts: ToastItem[];
  onStartExit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  // Auto-dismiss timers
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    toasts.forEach(t => {
      if (t.duration > 0 && !t.exiting) {
        timers.push(setTimeout(() => onStartExit(t.id), t.duration));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts, onStartExit]);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.stack} aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <ToastItem
          key={t.id}
          {...t}
          onRemove={onRemove}
        />
      ))}
    </div>,
    document.body,
  );
}

// ── ToastProvider ─────────────────────────────────────────────────────────────
// Wrap your app (or preview shell) with this once.

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((opts: ToastOptions): string => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [
      ...prev,
      {
        id,
        title:       opts.title,
        description: opts.description,
        status:      opts.status  ?? 'info',
        variant:     opts.variant ?? 'stroke',
        size:        opts.size    ?? 'sm',
        action:      opts.action,
        onAction:    opts.onAction,
        duration:    opts.duration ?? 4000,
        exiting:     false,
      },
    ]);
    return id;
  }, []);

  // Triggers exit animation — actual removal happens in onRemove after animation ends
  const startExit = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
  }, []);

  // Called after exit animation completes
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast: startExit }}>
      {children}
      <ToastStack toasts={toasts} onStartExit={startExit} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
