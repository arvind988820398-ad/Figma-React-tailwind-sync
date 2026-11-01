// AD Design Kit Copy to clipboard — Figma set "Copy to clipboard form" (node 1149:46768, page 3279:34618).
// Read-only Input field + copy control (Figma "clipboard" icon). Figma types → variant:
// Default=icon (clipboard icon button inside the field) · Default with button=button (Brand "Copy", 16px gap) ·
// Inner button=inner (Tertiary xs inside a 52px field) · Large input=large (multi-line value, Tertiary xs top-right) ·
// joined = the field with a joined Brand "Copy" (code-ahead). Inline, With spaced buttons, Three buttons, Select & Button,
// Add-on and Two buttons are compositions. "Copied" is announced through an aria-live region.
import { useEffect, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { CheckIcon, ClipboardIcon } from '../icons';
import { buttonVariants } from './Button';
import { inputVariants } from './Input';

export type CopyInputVariant = 'icon' | 'button' | 'joined' | 'inner' | 'large';

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

  // Figma keeps the copy field on the normal field fill, not the read-only one.
  const field = 'text-heading read-only:bg-neutral-secondary-medium read-only:text-heading';
  const input = (extra?: string) => (
    <input
      id={id ?? autoId}
      readOnly
      value={value}
      onFocus={(e) => e.target.select()}
      className={cn(inputVariants(), field, extra)}
      {...aria}
    />
  );
  const status = <span className="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>;
  const icon = copied ? <CheckIcon /> : <ClipboardIcon />;
  const tertiary = (
    <button type="button" onClick={copy} className={cn(buttonVariants({ color: 'tertiary', size: 'xs' }), 'rounded')}>
      {icon}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );

  if (variant === 'large') {
    return (
      <div className={cn('relative', className)}>
        <textarea
          id={id ?? autoId}
          readOnly
          value={value}
          rows={6}
          onFocus={(e) => e.target.select()}
          className={cn(inputVariants(), field, 'resize-none pe-24 text-sm')}
          {...aria}
        />
        <span className="absolute end-2.5 top-2.5">{tertiary}</span>
        {status}
      </div>
    );
  }

  if (variant === 'inner') {
    return (
      <div className={cn('relative', className)}>
        {input('py-4 pe-24')}
        <span className="absolute inset-y-0 end-0 flex items-center pe-2.5">{tertiary}</span>
        {status}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={cn('relative', className)}>
        {input('pe-9')}
        <span className="absolute inset-y-0 end-0 flex items-center pe-3">
          <button // ad-design-kit-lint-ignore: Figma "clipboard" icon inside the field, a 16px copy control
            type="button"
            onClick={copy}
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
            className="inline-flex rounded-xs text-body-subtle hover:text-heading focus-visible:shadow-focus-brand focus-visible:outline-none [&_svg]:size-4"
          >
            {icon}
          </button>
        </span>
        {status}
      </div>
    );
  }

  const spaced = variant === 'button';
  return (
    <div className={cn('flex', spaced ? 'gap-4' : 'rounded-base shadow-xs', className)}>
      {input(spaced ? undefined : 'rounded-e-none shadow-none')}
      <button type="button" onClick={copy} className={cn(buttonVariants(), 'shrink-0', !spaced && '-ms-px rounded-s-none shadow-none')}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      {status}
    </div>
  );
}
