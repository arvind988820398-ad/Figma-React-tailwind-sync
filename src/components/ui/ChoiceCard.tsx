// AD Design Kit Choice cards — Figma set "Checkbox/Radio form" (node 1149:54726, page 1149:54696), groups 1149:55022.
// The whole card is a <label> around a real checkbox/radio, so clicking anywhere selects it. Figma types → variant:
// Left checkbox card / Icon & text / Advanced = card · Bordered left input = bordered · Simple = chip ·
// Only text / Only icon = circle. Card layouts: `control` places the input at the start, the end or hides it
// (Icon & text and With side icon & text: end; Box icon & logo and Icons & text: none), `iconPlacement="top"` stacks
// the icon above the text, `details` adds a row under the text (Advanced) and `footer` a full-width block (Advanced radio).
// Checked styling uses `peer-checked:` on a surface layer that follows the input, not `:has(:checked)` on the label:
// Chromium does not always restyle `:has()` when React unchecks a sibling radio, but sibling selectors are reliable.
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CheckIcon } from '../icons';

export type ChoiceCardVariant = 'card' | 'bordered' | 'chip' | 'circle';

const layout: Record<ChoiceCardVariant, string> = {
  card: 'flex items-start gap-2.5 p-4',
  bordered: 'flex items-start gap-2.5 p-4',
  chip: 'inline-flex items-center px-3 py-2 text-sm font-medium',
  circle: 'inline-flex size-9 items-center justify-center text-sm font-medium [&_svg]:size-4',
};

// Surface layer: fill, border, radius, shadow, hover and checked states.
const surface: Record<ChoiceCardVariant, string> = {
  card: 'rounded-base peer-checked:border-brand-subtle peer-checked:bg-brand-softer peer-checked:group-hover:bg-brand-softer',
  bordered: 'rounded-base peer-checked:border-brand',
  chip: 'rounded-base peer-checked:border-brand-subtle peer-checked:bg-brand-softer peer-checked:group-hover:bg-brand-softer',
  circle: 'rounded-full peer-checked:border-brand-subtle peer-checked:bg-brand-softer peer-checked:group-hover:bg-brand-softer',
};

// Text that turns brand-strong when checked (Bordered keeps neutral text).
const checkedText: Record<ChoiceCardVariant, string> = {
  card: 'peer-checked:*:text-fg-brand-strong',
  bordered: '',
  chip: 'peer-checked:text-fg-brand-strong',
  circle: 'peer-checked:text-fg-brand-strong',
};

const controlClass =
  'peer mt-0.5 size-4 shrink-0 appearance-none border border-default-strong bg-neutral-secondary-strong ' +
  'checked:border-brand focus-visible:outline-none disabled:cursor-not-allowed';

export interface ChoiceCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title'> {
  type?: 'checkbox' | 'radio';
  variant?: ChoiceCardVariant;
  title: ReactNode;
  description?: ReactNode;
  /** Leading icon / logo (card and bordered variants). For circle, pass the icon as `title` and an aria-label. */
  icon?: ReactNode;
  /** Trailing content, e.g. a price or an arrow. */
  trailing?: ReactNode;
  /** Card and bordered variants: where the input sits (default start); `none` keeps it visually hidden. */
  control?: 'start' | 'end' | 'none';
  /** Card variants: icon beside the text (default) or above it (Figma "Icon & text", "Box icon & logo"). */
  iconPlacement?: 'start' | 'top';
  /** Row under the title and description, e.g. a Badge, a count and an AvatarGroup (Figma "Advanced"). */
  details?: ReactNode;
  /** Full-width block under the card's first row, e.g. a price and a summary (Figma "Advanced (Radio inputs)"). */
  footer?: ReactNode;
}

export const ChoiceCard = forwardRef<HTMLInputElement, ChoiceCardProps>(function ChoiceCard(
  {
    type = 'radio', variant = 'card', title, description, icon, trailing, control = 'start', iconPlacement = 'start', details, footer, id, className, disabled, ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const compact = variant === 'chip' || variant === 'circle';
  const hiddenControl = compact || control === 'none';
  // Visual order (the input stays first in the DOM so the `peer-checked:` surface and text follow it).
  const end = control === 'end';

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'group relative isolate',
        layout[variant],
        footer && 'flex-wrap',
        disabled ? 'cursor-not-allowed text-fg-disabled' : 'cursor-pointer text-heading',
        className,
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type={type}
        disabled={disabled}
        className={
          hiddenControl
            ? 'peer sr-only'
            : cn(controlClass, end && 'order-4', type === 'radio' ? 'rounded-full checked:border-4 checked:bg-neutral-primary-soft' : 'rounded-xs checked:bg-brand')
        }
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 -z-10 border border-default bg-neutral-primary-soft shadow-xs transition-colors',
          'peer-focus-visible:shadow-focus-brand',
          !disabled && 'group-hover:bg-neutral-secondary-medium',
          surface[variant],
        )}
      />
      {type === 'checkbox' && !hiddenControl && (
        <CheckIcon className={cn('pointer-events-none absolute top-4.5 hidden size-4 text-white peer-checked:block', end ? 'end-4' : 'start-4')} />
      )}
      {compact ? (
        <span className={cn(!disabled && checkedText[variant])}>{title}</span>
      ) : (
        <>
          {icon && iconPlacement === 'start' && (
            <span className={cn('order-1 inline-flex shrink-0 [&>svg]:size-6', !disabled && variant === 'card' && 'peer-checked:text-fg-brand-strong')}>{icon}</span>
          )}
          <span className={cn('order-2 flex min-w-0 flex-1 flex-col gap-1', !disabled && checkedText[variant])}>
            {icon && iconPlacement === 'top' && <span className="mb-1 inline-flex text-body [&>svg]:size-7">{icon}</span>}
            <span className={cn('text-sm font-medium leading-5', disabled ? 'text-fg-disabled' : 'text-heading')}>{title}</span>
            {description && <span className={cn('text-sm', disabled ? 'text-fg-disabled' : 'text-body')}>{description}</span>}
            {details && <span className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-body">{details}</span>}
          </span>
          {trailing && (
            <span className={cn('order-3 ms-auto inline-flex shrink-0 text-sm font-medium [&>svg]:size-5', disabled ? 'text-fg-disabled' : 'text-heading')}>{trailing}</span>
          )}
          {footer && <span className={cn('order-5 flex basis-full flex-col gap-3', !disabled && checkedText[variant])}>{footer}</span>}
        </>
      )}
    </label>
  );
});

/** Stack of choice cards (gap-4); use `columns` for grid groups. */
export function ChoiceGroup({ label, columns, children, className }: { label: string; columns?: 2 | 3; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cn(columns ? cn('grid gap-4', columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3') : 'flex flex-col gap-4', className)}>
      <legend className="mb-3 text-sm font-medium text-heading">{label}</legend>
      {children}
    </fieldset>
  );
}
