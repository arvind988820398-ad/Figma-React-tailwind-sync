// AuxoKit Tag input — Figma set "Tag input" (node 1149:49173, page 3279:34618).
// Input field shell (same size scale and states) holding Badge white sm chips. Enter or comma adds a tag,
// Backspace in an empty field removes the last one.
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Badge } from './Badge';
import type { FieldSize, FieldStatus } from './Input';

const sizes: Record<FieldSize, string> = {
  sm: 'min-h-9 px-2.5 py-1.5 text-sm',
  base: 'min-h-10 px-3 py-2 text-sm',
  lg: 'min-h-12 px-3.5 py-2.5 text-base',
  xl: 'min-h-13 px-4 py-3 text-base',
};

const shells: Record<'default' | FieldStatus, string> = {
  default: 'border-default-medium bg-neutral-secondary-medium focus-within:border-brand',
  success: 'border-success-subtle bg-success-soft',
  danger: 'border-danger-subtle bg-danger-soft',
};

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  size?: FieldSize;
  status?: FieldStatus;
  disabled?: boolean;
  placeholder?: string;
  /** Optional leading element per chip, e.g. an xs Avatar for email tags. */
  renderLeading?: (tag: string) => ReactNode;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

export function TagInput({ value, onChange, size = 'base', status, disabled, placeholder = 'Add a tag…', renderLeading, id, className, ...aria }: TagInputProps) {
  const autoId = useId();
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim().replace(/,$/, '');
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && draft === '' && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center gap-2 rounded-base border shadow-xs transition-colors focus-within:shadow-focus-brand',
        sizes[size],
        shells[status ?? 'default'],
        disabled && 'cursor-not-allowed text-fg-disabled',
        className,
      )}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          color="white"
          size="sm"
          leading={renderLeading?.(tag)}
          rightIcon={
            !disabled && (
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} className="inline-flex rounded-xs text-body-subtle hover:text-heading focus-visible:shadow-focus-brand focus-visible:outline-none">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            )
          }
        >
          {tag}
        </Badge>
      ))}
      <input
        id={id ?? autoId}
        value={draft}
        disabled={disabled}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        aria-invalid={status === 'danger' || undefined}
        className={cn(
          'min-w-24 flex-1 bg-transparent focus:outline-none disabled:cursor-not-allowed',
          status === 'success' ? 'text-fg-success-strong placeholder:text-fg-success-strong' : status === 'danger' ? 'text-fg-danger-strong placeholder:text-fg-danger-strong' : 'text-heading placeholder:text-body-subtle',
          disabled && 'placeholder:text-fg-disabled',
        )}
        {...aria}
      />
    </div>
  );
}
