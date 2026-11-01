// AD Design Kit Copy to clipboard — Figma set "Copy to clipboard form" (node 1149:46768, page 3279:34618).
// Read-only Input field + copy Button. Figma types → variant: Default with button=joined (Brand base) ·
// Inner button / Large input=inner (Tertiary xs inside) · Default=icon (Secondary icon button joined).
// "Copied" is announced through an aria-live region.
import { useEffect, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { CheckIcon, FileCopyIcon } from '../icons';
import { buttonVariants } from './Button';
import { inputVariants } from './Input';

export type CopyInputVariant = 'joined' | 'inner' | 'icon';

export interface CopyInputProps {
  value: string;
  variant?: CopyInputVariant;
  /** Accessible name for the field (or use <Label htmlFor={id}>). */
  'aria-label'?: string;
  id?: string;
  className?: string;
}

export function CopyInput({ value, variant = 'joined', id, className, ...aria }: CopyInputProps) {
  const autoId = useId();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); the field stays selectable for manual copy.
      document.getElementById(id ?? autoId)?.focus();
    }
  };

  const input = (extra?: string) => (
    <input
      id={id ?? autoId}
      readOnly
      value={value}
      onFocus={(e) => e.target.select()}
      className={cn(inputVariants(), 'text-heading', extra)}
      {...aria}
    />
  );
  const status = <span className="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>;

  if (variant === 'inner') {
    return (
      <div className={cn('relative', className)}>
        {input('pe-24')}
        <span className="absolute inset-y-0 end-0 flex items-center pe-1.5">
          <button type="button" onClick={copy} className={cn(buttonVariants({ color: 'tertiary', size: 'xs' }), 'rounded')}>
            {copied ? <CheckIcon /> : <FileCopyIcon />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </span>
        {status}
      </div>
    );
  }

  return (
    <div className={cn('flex rounded-base shadow-xs', className)}>
      {input('rounded-e-none shadow-none')}
      <button
        type="button"
        onClick={copy}
        aria-label={variant === 'icon' ? (copied ? 'Copied' : 'Copy to clipboard') : undefined}
        className={cn(
          buttonVariants(variant === 'icon' ? { color: 'secondary', iconOnly: true } : {}),
          '-ms-px shrink-0 rounded-s-none shadow-none',
          variant === 'icon' && 'text-body',
        )}
      >
        {copied ? <CheckIcon /> : <FileCopyIcon />}
        {variant === 'joined' && (copied ? 'Copied' : 'Copy')}
      </button>
      {status}
    </div>
  );
}
