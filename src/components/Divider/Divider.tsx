import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { clsx } from 'clsx';
import styles from './Divider.module.css';

export type DividerThickness = 1 | 2;
export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed';

export interface DividerProps extends ComponentPropsWithoutRef<'hr'> {
  thickness?: DividerThickness;
  orientation?: DividerOrientation;
  variant?: DividerVariant;
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      thickness = 1,
      orientation = 'horizontal',
      variant = 'solid',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <hr
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={clsx(
          styles.root,
          styles[`thickness-${thickness}`],
          styles[orientation],
          styles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
