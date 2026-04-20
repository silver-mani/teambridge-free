/* ─────────────────────────────────────────────────────────────────────────────
   Alloy · Input — public API
   ───────────────────────────────────────────────────────────────────────────── */

// Field components
export { TextField }      from './TextField';
export type { TextFieldProps, TextFieldType }  from './TextField';

export { TextArea }       from './TextArea';
export type { TextAreaProps }       from './TextArea';

export { SelectField }    from './SelectField';
export type { SelectFieldProps, SelectOption } from './SelectField';

export { PasswordField }  from './PasswordField';
export type { PasswordFieldProps }  from './PasswordField';

export { SearchField }    from './SearchField';
export type { SearchFieldProps }    from './SearchField';

export { EmailField }     from './EmailField';
export type { EmailFieldProps }     from './EmailField';

export { NumberField }    from './NumberField';
export type { NumberFieldProps }    from './NumberField';

export { MultiSelectField } from './MultiSelectField';
export type { MultiSelectFieldProps, MultiSelectOption } from './MultiSelectField';

// Shared types
export type { FieldVariant, FieldSize } from './FieldShell';
export type { FieldLayout } from './FieldWrapper';
