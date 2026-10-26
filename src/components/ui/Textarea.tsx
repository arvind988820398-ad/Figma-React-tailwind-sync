// AuxoKit Textarea — Figma set "Textarea input" (node 1149:49679, page 3279:34618), examples 1149:50131.
// Default = Input shell with p-3.5. "Buttons inside" = pass `footer` (toolbar icons + Brand sm submit).
import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import type { FieldStatus } from './Input';

const statusClasses: Record<'default' | FieldStatus, string> = {
  default:
    'border-default-medium bg-neutral-secondary-medium text-heading placeholder:text-body-subtle ' +
    'focus:border-brand read-only:bg-neutral-tertiary read-only:text-body disabled:text-fg-disabled',
  success: 'border-success-subtle bg-success-soft text-fg-success-strong placeholder:text-fg-success-strong',
  danger: 'border-danger-subtle bg-danger-soft text-fg-danger-strong placeholder:text-fg-danger-strong',
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: FieldStatus;
  /** Figma "Buttons inside": a toolbar row joined under the text area. */
  footer?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { status, footer, rows = 4, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  if (!footer) {
    return (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={status === 'danger' || undefined}
        className={cn(
          'block w-full rounded-base border p-3.5 text-sm leading-5 shadow-xs transition-colors focus:outline-none focus-visible:shadow-focus-brand',
          statusClasses[status ?? 'default'],
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-base border border-default-medium bg-neutral-secondary-medium shadow-xs transition-colors',
        'focus-within:border-brand focus-within:shadow-focus-brand',
        className,
      )}
    >
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className="block w-full resize-none bg-transparent p-3.5 text-sm leading-5 text-heading placeholder:text-body-subtle focus:outline-none"
        {...props}
      />
      <div className="flex items-center justify-between gap-4 border-t border-default-medium bg-neutral-tertiary-medium px-2.5 py-2.5">{footer}</div>
    </div>
  );
});

/** Icon button for the Textarea toolbar ("Buttons inside"): size-5 icons, text-body → hover text-heading. */
export function TextareaToolButton({ label, children, ...props }: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-8 items-center justify-center rounded-base text-body hover:bg-neutral-quaternary hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none [&_svg]:size-5"
      {...props}
    >
      {children}
    </button>
  );
}
