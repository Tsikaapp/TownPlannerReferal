import type {
  InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes,
} from 'react';
import { useId } from 'react';

interface BaseProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

function Wrapper({
  label, hint, error, required, htmlFor, children,
}: BaseProps & { htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && <span className="ml-0.5 text-gold-600" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  label, hint, error, required, className = '', ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} htmlFor={id}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`field-input ${error ? 'field-error' : ''} ${className}`}
        {...rest}
      />
    </Wrapper>
  );
}

export function TextAreaField({
  label, hint, error, required, className = '', rows = 4, ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`field-input resize-y ${error ? 'field-error' : ''} ${className}`}
        {...rest}
      />
    </Wrapper>
  );
}

export function SelectField({
  label, hint, error, required, options, placeholder = 'Select…', className = '', ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
}) {
  const id = useId();
  const normalised = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} htmlFor={id}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`field-input cursor-pointer appearance-none bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10
          bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2378716c' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")]
          ${error ? 'field-error' : ''} ${className}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {normalised.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Wrapper>
  );
}
