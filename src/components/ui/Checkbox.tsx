// AuxoKit Checkbox & Radio — Figma set "Checkbox input" (node 1149:54707, page 1149:54696).
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

const box =
  'peer size-4 shrink-0 appearance-none border border-default-strong bg-neutral-secondary-strong ' +
  'focus-visible:outline-none focus-visible:shadow-focus-brand disabled:border-light disabled:cursor-not-allowed';

export interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
}

function ChoiceLayout({ id, label, description, control }: { id: string; label?: ReactNode; description?: ReactNode; control: ReactNode }) {
  if (!label) return <>{control}</>;
  return (
    <div className="flex items-start gap-2.5">
      <span className="relative mt-0.5 flex">{control}</span>
      <div className="text-sm">
        <label htmlFor={id} className="font-medium leading-4 text-heading">{label}</label>
        {description && <p className="text-body">{description}</p>}
      </div>
    </div>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, ChoiceProps>(function Checkbox({ label, description, id, className, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const control = (
    <span className="relative inline-flex">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={cn(box, 'rounded-xs checked:border-brand checked:bg-brand disabled:checked:border-light disabled:checked:bg-neutral-secondary-strong', className)}
        {...props}
      />
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute inset-0 hidden size-4 stroke-white peer-checked:block peer-disabled:stroke-fg-disabled"
        fill="none"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M4 8.5l2.5 2.5L12 5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
  return <ChoiceLayout id={inputId} label={label} description={description} control={control} />;
});

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>(function Radio({ label, description, id, className, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const control = (
    <span className="relative inline-flex">
      <input ref={ref} id={inputId} type="radio" className={cn(box, 'rounded-full checked:border-brand disabled:checked:border-light', className)} {...props} />
      <span
        className="pointer-events-none absolute inset-1 hidden rounded-full bg-brand peer-checked:block peer-disabled:bg-neutral-quaternary"
        aria-hidden
      />
    </span>
  );
  return <ChoiceLayout id={inputId} label={label} description={description} control={control} />;
});
