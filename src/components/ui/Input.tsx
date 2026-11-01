// AD Design Kit Input field — Figma set "Input field" (node 1149:46826, page 3279:34618),
// Label (1149:94727) and Helper (1149:94741).
// Figma Type → slot: Default · Add-on icon = `addonIcon` · Add-on text = `addonText` · Inner button = `endAction` ·
// Stacked placeholder = `stackedLabel`. Every type takes `leftIcon` (Figma "user") and `onClear` (Figma "close").
// Sizes and states are shared with every other field. InputGroup joins fields, selects and buttons into one bar.
import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';

export type FieldSize = 'sm' | 'base' | 'lg' | 'xl';
export type FieldStatus = 'success' | 'danger';

// inner: Inner button padding (Figma: 10/8/8 on sm … 16/14/14 on xl, a 32px button → 48–60px tall).
// stacked: Stacked placeholder padding (value 16px + 2px + label 14–16px, centred in the field height).
// addon: Add-on segment padding (Figma: 32/36/44/48px wide with a 16/20px icon).
const sizes: Record<FieldSize, { box: string; withLeft: string; withRight: string; icon: string; iconPos: string; inner: string; stacked: string; addon: string }> = {
  sm: { box: 'px-2.5 py-2 text-sm leading-5', withLeft: 'ps-8.5', withRight: 'pe-8.5', icon: '[&_svg]:size-4', iconPos: 'px-2.5', inner: 'ps-2.5 pe-2 py-2', stacked: 'py-0.5', addon: 'px-2' }, // ad-design-kit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
  base: { box: 'px-3 py-2.5 text-sm leading-5', withLeft: 'ps-9', withRight: 'pe-9', icon: '[&_svg]:size-4', iconPos: 'px-3', inner: 'ps-3 pe-2.5 py-2.5', stacked: 'py-1', addon: 'px-2.5' },
  lg: { box: 'px-3.5 py-3 text-base leading-6', withLeft: 'ps-11', withRight: 'pe-11', icon: '[&_svg]:size-5', iconPos: 'px-3.5', inner: 'ps-3.5 pe-3 py-3', stacked: 'py-1.5', addon: 'px-3' },
  xl: { box: 'px-4 py-3.5 text-base leading-6', withLeft: 'ps-12', withRight: 'pe-12', icon: '[&_svg]:size-5', iconPos: 'px-4', inner: 'ps-4 pe-3.5 py-3.5', stacked: 'py-2', addon: 'px-3.5' },
};

const statusClasses: Record<'default' | FieldStatus, string> = {
  default:
    'border-default-medium bg-neutral-secondary-medium text-heading placeholder:text-body-subtle ' +
    'focus:border-brand read-only:bg-neutral-tertiary read-only:text-body disabled:text-fg-disabled disabled:placeholder:text-fg-disabled',
  success: 'border-success-subtle bg-success-soft text-fg-success-strong placeholder:text-fg-success-strong',
  danger: 'border-danger-subtle bg-danger-soft text-fg-danger-strong placeholder:text-fg-danger-strong',
};

export function inputVariants({ size = 'base', status }: { size?: FieldSize; status?: FieldStatus } = {}) {
  return cn(
    'block w-full rounded-base border shadow-xs transition-colors',
    'focus:outline-none focus-visible:shadow-focus-brand disabled:cursor-not-allowed',
    sizes[size].box,
    statusClasses[status ?? 'default'],
  );
}

// Shell used when the field wraps more than the <input> (Inner button, Stacked placeholder): focus moves to the wrapper.
// A <div> always matches :read-only, so the shell takes the read-only fill from its <input> instead.
const shell =
  'focus-within:border-brand focus-within:shadow-focus-brand read-only:bg-neutral-secondary-medium read-only:text-heading ' +
  'has-[input:read-only]:bg-neutral-tertiary';
// The bare <input> inside such a shell: the shell owns padding, border and colors.
const bare =
  'block w-full min-w-0 border-0 bg-transparent p-0 shadow-none placeholder:text-body-subtle focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:placeholder:text-fg-disabled';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: FieldSize;
  status?: FieldStatus;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Figma "Add-on icon": a leading segment holding an icon, joined to the field. */
  addonIcon?: ReactNode;
  /** Figma "Add-on text": a leading segment holding text ("https://", "₹", "@"), joined to the field. */
  addonText?: ReactNode;
  /** Figma "Inner button": a Tertiary xs Button inside the end of the field. */
  endAction?: ReactNode;
  /** Figma "Stacked placeholder": the value centred above a small label (with `leftIcon` beside the label). */
  stackedLabel?: ReactNode;
  /** Figma close icon at the end of the field: renders a "Clear" button that calls this. */
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'base', status, leftIcon, rightIcon, addonIcon, addonText, endAction, stackedLabel, onClear, className, ...props },
  ref,
) {
  const s = sizes[size];
  const iconColor = status === 'success' ? 'text-fg-success-strong' : status === 'danger' ? 'text-fg-danger-strong' : 'text-body-subtle';
  const invalid = status === 'danger' || undefined;
  const end = onClear ? (
    <button // ad-design-kit-lint-ignore: Figma "close" icon inside the field, a 16px clear control
      type="button"
      aria-label="Clear"
      onClick={onClear}
      disabled={props.disabled}
      className="inline-flex rounded-xs text-body hover:text-heading focus-visible:shadow-focus-brand focus-visible:outline-none disabled:pointer-events-none disabled:text-fg-disabled"
    >
      <CloseIcon />
    </button>
  ) : (
    rightIcon
  );

  if (stackedLabel) {
    return (
      <div className={cn(inputVariants({ size, status }), !status && shell, status && 'focus-within:shadow-focus-brand', 'flex flex-col items-center justify-center gap-0.5 text-center', s.stacked, className)}>
        <input ref={ref} aria-invalid={invalid} className={cn(bare, 'text-center text-sm leading-4')} {...props} />
        <span className={cn('inline-flex items-center gap-0.5 text-xs leading-3.5 text-body [&_svg]:size-3.5', status && iconColor)}>
          {leftIcon && <span aria-hidden className="inline-flex">{leftIcon}</span>}
          {stackedLabel}
        </span>
      </div>
    );
  }

  if (endAction) {
    return (
      <div className={cn(inputVariants({ size, status }), !status && shell, status && 'focus-within:shadow-focus-brand', 'flex items-center gap-2', s.inner, className)}>
        {leftIcon && <span className={cn('inline-flex shrink-0', iconColor, s.icon)} aria-hidden>{leftIcon}</span>}
        <input ref={ref} aria-invalid={invalid} className={bare} {...props} />
        <span className="inline-flex shrink-0 items-center [&_button]:rounded">{endAction}</span>
      </div>
    );
  }

  // Leading and trailing icons sit over the field's padding.
  const withIcons = (field: ReactElement, wrapper?: string) => (
    <div className={cn('relative', wrapper)}>
      {leftIcon && (
        <span className={cn('pointer-events-none absolute inset-y-0 start-0 flex items-center', s.iconPos, iconColor, s.icon)} aria-hidden>
          {leftIcon}
        </span>
      )}
      {field}
      {end && <span className={cn('absolute inset-y-0 end-0 flex items-center', s.iconPos, iconColor, s.icon)}>{end}</span>}
    </div>
  );
  const pad = cn(leftIcon && s.withLeft, end && s.withRight);

  if (addonIcon || addonText) {
    const input = <input ref={ref} aria-invalid={invalid} className={cn(inputVariants({ size, status }), 'rounded-s-none', pad)} {...props} />;
    return (
      <div className={cn('flex w-full', className)}>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-s-base border border-e-0 border-default-medium bg-neutral-tertiary text-sm text-body',
            addonIcon ? s.addon : s.iconPos,
            s.icon,
          )}
          aria-hidden
        >
          {addonIcon ?? addonText}
        </span>
        {leftIcon || end ? withIcons(input, 'min-w-0 flex-1') : input}
      </div>
    );
  }

  const input = <input ref={ref} aria-invalid={invalid} className={cn(inputVariants({ size, status }), pad, !leftIcon && !end && className)} {...props} />;
  if (!leftIcon && !end) return input;
  return withIcons(input, className);
});

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  /** Figma "Show label icon": a 14px icon after the text and asterisk (question-circle for a hint). */
  icon?: ReactNode;
  /** Figma "Two texts": a second text at the end of the label row. */
  hint?: ReactNode;
}

export function Label({ required, icon, hint, className, children, ...props }: LabelProps) {
  return (
    <label className={cn('mb-2.5 flex items-center justify-between gap-2 text-sm font-medium leading-5 text-heading', className)} {...props}>
      <span className="inline-flex items-center gap-1">
        <span>
          {children}
          {required && <span className="ms-1 text-fg-danger" aria-hidden>*</span>}
        </span>
        {icon && <span className="inline-flex text-body-subtle [&_svg]:size-3.5" aria-hidden>{icon}</span>}
      </span>
      {hint && <span className="text-xs font-normal text-body-subtle">{hint}</span>}
    </label>
  );
}

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  status?: FieldStatus;
}

export function HelperText({ status, className, ...props }: HelperTextProps) {
  return (
    <p
      className={cn('mt-2.5 text-xs leading-4', status === 'danger' ? 'text-fg-danger' : status === 'success' ? 'text-fg-success' : 'text-body', className)}
      {...props}
    />
  );
}

// Joined bar for Figma's "With buttons", "Three buttons", "Left button", "2 inputs" … compositions: neighbours overlap
// by 1px and only the outer corners stay rounded. Children: Input, Select, Button, or a Dropdown with a Button trigger
// (the corner rules reach one level down: Select's <select>, an icon Input's <input>, a Dropdown's trigger).
const groupClasses = cn(
  'flex w-full',
  '[&>*]:relative [&>*:focus-within]:z-10 [&>*:not(:first-child)]:-ms-px',
  '[&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child):not(:last-child)>:is(input,select,button)]:rounded-none',
  '[&>:first-child:not(:last-child)]:rounded-e-none [&>:first-child:not(:last-child)>:is(input,select,button)]:rounded-e-none',
  '[&>:last-child:not(:first-child)]:rounded-s-none [&>:last-child:not(:first-child)>:is(input,select,button)]:rounded-s-none',
  '[&>*:has(input,select)]:min-w-0 [&>*:has(input,select)]:flex-1 [&>input]:min-w-0 [&>input]:flex-1',
);

export function InputGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="group" className={cn(groupClasses, className)} {...props} />;
}
