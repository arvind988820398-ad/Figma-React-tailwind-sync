// AD Design Kit Number input — Figma set "Number form" (node 1149:46630, page 3279:34618).
// Figma types → variant: Default=default (plain field) · With buttons=buttons (−/+ joined to a centered field) ·
// With spaced buttons=spaced · Ghost input=ghost (borderless sm field with 32px buttons).
import { useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { MinusIcon, PlusIcon } from '../icons';
import { buttonVariants } from './Button';
import { inputVariants, type FieldSize } from './Input';

export type NumberInputVariant = 'default' | 'buttons' | 'spaced' | 'ghost';

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  variant?: NumberInputVariant;
  size?: Extract<FieldSize, 'sm' | 'base'>;
  disabled?: boolean;
  /** Accessible name (or use <Label htmlFor={id}>). */
  'aria-label'?: string;
  id?: string;
  className?: string;
}

export function NumberInput({ value, onChange, min = -Infinity, max = Infinity, step = 1, variant = 'buttons', size = 'base', disabled, id, className, ...aria }: NumberInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const set = (n: number) => {
    setDraft(null);
    onChange(clamp(n));
  };
  // What the user is typing: may be empty or out of range until blur, so the field can be cleared and retyped.
  const [draft, setDraft] = useState<string | null>(null);
  const onType = (text: string) => {
    setDraft(text);
    const n = Number(text);
    if (text !== '' && Number.isFinite(n) && n >= min && n <= max) onChange(n);
  };
  const commit = () => {
    if (draft === null) return;
    const n = Number(draft);
    if (draft !== '' && Number.isFinite(n)) set(n);
    else setDraft(null);
  };

  const field = (extra?: string) => (
    <input
      id={inputId}
      type="number"
      inputMode="numeric"
      value={draft ?? (Number.isFinite(value) ? value : '')}
      min={Number.isFinite(min) ? min : undefined}
      max={Number.isFinite(max) ? max : undefined}
      step={step}
      disabled={disabled}
      onChange={(e) => onType(e.target.value)}
      onBlur={commit}
      className={cn(inputVariants({ size }), '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none', extra)}
      {...aria}
    />
  );
  if (variant === 'default') return <div className={className}>{field()}</div>;

  const ghost = variant === 'ghost';
  const btn = (dir: -1 | 1, extra?: string) => (
    <button
      type="button"
      aria-label={dir < 0 ? 'Decrease' : 'Increase'}
      aria-controls={inputId}
      disabled={disabled || (dir < 0 ? value <= min : value >= max)}
      onClick={() => set(value + dir * step)}
      className={cn(
        ghost
          ? 'inline-flex size-8 items-center justify-center rounded-base border border-default-medium bg-neutral-secondary-medium text-body hover:bg-neutral-tertiary-medium hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none disabled:pointer-events-none disabled:text-fg-disabled [&_svg]:size-3'
          : cn(buttonVariants({ color: 'secondary', size, iconOnly: true }), 'text-body'),
        extra,
      )}
    >
      {dir < 0 ? <MinusIcon /> : <PlusIcon />}
    </button>
  );

  if (ghost) {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        {btn(-1)}
        {field('w-12 shrink-0 border-0 bg-transparent px-0 text-center shadow-none focus-visible:shadow-none')}
        {btn(1)}
      </div>
    );
  }
  if (variant === 'spaced') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {btn(-1)}
        {field('text-center')}
        {btn(1)}
      </div>
    );
  }
  return (
    <div className={cn('flex -space-x-px rounded-base shadow-xs', className)}>
      {btn(-1, 'rounded-e-none shadow-none')}
      {field('relative rounded-none text-center shadow-none focus:z-10')}
      {btn(1, 'rounded-s-none shadow-none')}
    </div>
  );
}
