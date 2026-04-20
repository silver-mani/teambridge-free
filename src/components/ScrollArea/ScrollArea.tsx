import { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './ScrollArea.module.css';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export interface ScrollAreaProps extends ComponentPropsWithoutRef<'div'> {
  /** Which scrollbar axis to display. Defaults to 'vertical'. */
  orientation?: ScrollAreaOrientation;
  /** How long (ms) after the last scroll event before the scrollbar fades out. Defaults to 1200. */
  hideDelay?: number;
}

/**
 * ScrollArea
 *
 * Wraps scrollable content and replaces native scrollbars with Alloy-styled
 * overlay scrollbars. Scrollbars fade in on scroll and out after `hideDelay` ms.
 *
 * Thumb position is updated via direct DOM mutation — no React re-render on
 * every scroll tick — keeping animation frame-perfect and lag-free.
 *
 * @example
 * <ScrollArea orientation="vertical" style={{ height: 300 }}>
 *   <LongContent />
 * </ScrollArea>
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ orientation = 'vertical', hideDelay = 1200, className, children, ...props }, ref) => {
    const viewportRef  = useRef<HTMLDivElement>(null);
    const vTrackRef    = useRef<HTMLDivElement>(null);
    const vThumbRef    = useRef<HTMLDivElement>(null);
    const hTrackRef    = useRef<HTMLDivElement>(null);
    const hThumbRef    = useRef<HTMLDivElement>(null);
    const hideTimer    = useRef<ReturnType<typeof setTimeout>>(undefined);
    const rafId        = useRef<number>(0);

    // Only visible state triggers a React render (opacity toggle)
    const [visible, setVisible]   = useState(false);
    // Whether the scrollbars should be rendered at all (content larger than viewport)
    const [showV, setShowV] = useState(false);
    const [showH, setShowH] = useState(false);

    const showScrollbars = useCallback(() => {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), hideDelay);
    }, [hideDelay]);

    /** Updates thumb size & position directly on the DOM — zero React overhead. */
    const updateThumbs = useCallback(() => {
      const el = viewportRef.current;
      if (!el) return;

      const needsV = (orientation === 'vertical' || orientation === 'both');
      const needsH = (orientation === 'horizontal' || orientation === 'both');

      if (needsV) {
        const ratio     = el.clientHeight / el.scrollHeight;
        const size      = Math.max(ratio * 100, 8);
        const maxScroll = el.scrollHeight - el.clientHeight;
        const offset    = maxScroll > 0 ? (el.scrollTop / maxScroll) * (100 - size) : 0;
        const thumb     = vThumbRef.current;
        if (thumb) {
          thumb.style.height = `${size}%`;
          thumb.style.top    = `${offset}%`;
        }
        setShowV(ratio < 0.99);
      }

      if (needsH) {
        const ratio     = el.clientWidth / el.scrollWidth;
        const size      = Math.max(ratio * 100, 8);
        const maxScroll = el.scrollWidth - el.clientWidth;
        const offset    = maxScroll > 0 ? (el.scrollLeft / maxScroll) * (100 - size) : 0;
        const thumb     = hThumbRef.current;
        if (thumb) {
          thumb.style.width = `${size}%`;
          thumb.style.left  = `${offset}%`;
        }
        setShowH(ratio < 0.99);
      }
    }, [orientation]);

    useEffect(() => {
      updateThumbs();
      const el = viewportRef.current;
      if (!el) return;

      const onScroll = () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          updateThumbs();
          showScrollbars();
        });
      };

      const ro = new ResizeObserver(() => updateThumbs());
      el.addEventListener('scroll', onScroll, { passive: true });
      ro.observe(el);

      return () => {
        el.removeEventListener('scroll', onScroll);
        ro.disconnect();
        if (hideTimer.current) clearTimeout(hideTimer.current);
        if (rafId.current) cancelAnimationFrame(rafId.current);
      };
    }, [updateThumbs, showScrollbars]);

    const hasV = orientation === 'vertical'   || orientation === 'both';
    const hasH = orientation === 'horizontal' || orientation === 'both';

    return (
      <div ref={ref} className={clsx(styles.root, className)} {...props}>
        {/* Scrollable viewport — native scrollbars hidden via CSS */}
        <div
          ref={viewportRef}
          className={clsx(
            styles.viewport,
            hasV && styles.scrollV,
            hasH && styles.scrollH,
            !hasV && styles.noScrollV,
            !hasH && styles.noScrollH,
          )}
          onMouseEnter={() => { updateThumbs(); showScrollbars(); }}
        >
          {children}
        </div>

        {/* Vertical scrollbar — only mounted when content overflows */}
        {hasV && showV && (
          <div
            ref={vTrackRef}
            className={clsx(styles.track, styles.trackV, visible && styles.visible)}
            aria-hidden="true"
          >
            <div className={styles.rail}>
              <div ref={vThumbRef} className={styles.thumb} />
            </div>
          </div>
        )}

        {/* Horizontal scrollbar */}
        {hasH && showH && (
          <div
            ref={hTrackRef}
            className={clsx(styles.track, styles.trackH, visible && styles.visible)}
            aria-hidden="true"
          >
            <div className={styles.rail}>
              <div ref={hThumbRef} className={clsx(styles.thumb, styles.thumbH)} />
            </div>
          </div>
        )}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';
