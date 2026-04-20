/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · EmailField
   TextField preset with type="email" and email-specific autocomplete.
   ───────────────────────────────────────────────────────────────────────────── */

import { forwardRef } from 'react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';

export type EmailFieldProps = Omit<TextFieldProps, 'type'>;

export const EmailField = forwardRef<HTMLInputElement, EmailFieldProps>(
  (props, ref) => (
    <TextField
      ref={ref}
      type="email"
      autoComplete="email"
      inputMode="email"
      {...props}
    />
  ),
);

EmailField.displayName = 'EmailField';
