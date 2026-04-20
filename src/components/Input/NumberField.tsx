/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · NumberField
   TextField preset with type="number". Browser spin buttons are hidden via CSS;
   use step/min/max props to constrain values.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef } from 'react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';

export type NumberFieldProps = Omit<TextFieldProps, 'type'>;

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (props, ref) => (
    <TextField
      ref={ref}
      type="number"
      inputMode="numeric"
      {...props}
    />
  ),
);

NumberField.displayName = 'NumberField';
