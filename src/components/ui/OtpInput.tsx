// AD Design Kit OTP input — Figma "OTP Inputs" boxes (node 1149:49523) and examples (1149:49576), page 3279:34618.
// Figma examples → variant: Default=default · Spaced=spaced · Separator=separator · Separator spaced=separator-spaced.
// Typing advances, Backspace goes back, arrows move, pasting fills every box.
import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';
import { inputVariants, type FieldSize, type FieldStatus } from './Input';

export type OtpInputVariant = 'default' | 'spaced' | 'separator' | 'separator-spaced';

const boxSize: Record<FieldSize, string> = { sm: 'size-9', base: 'size-10', lg: 'size-12', xl: 'size-13' };

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  variant?: OtpInputVariant;
  size?: FieldSize;
  status?: FieldStatus;
  disabled?: boolean;
  readOnly?: boolean;
  /** Accessible name for the group, e.g. "Verification code". */
  label?: string;
  /** Allowed characters; digits by default. */
  pattern?: RegExp;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  variant = 'default',
  size = 'sm',
  status,
  disabled,
  readOnly,
  label = 'One-time code',
  pattern = /\d/,
  className,
}: OtpInputProps) {
  const id = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? '');
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setAt = (i: number, ch: string) => {
    const next = [...chars];
    next[i] = ch;
    onChange(next.join('').slice(0, length));
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[i]) setAt(i, '');
      else if (i > 0) {
        setAt(i - 1, '');
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft') focus(i - 1);
    else if (e.key === 'ArrowRight') focus(i + 1);
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = [...e.clipboardData.getData('text')].filter((c) => pattern.test(c)).join('').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focus(pasted.length);
  };

  const spaced = variant === 'spaced' || variant === 'separator-spaced';
  const withSeparator = variant === 'separator' || variant === 'separator-spaced';
  const half = Math.ceil(length / 2);

  return (
    <div role="group" aria-label={label} className={cn('flex items-center', spaced ? 'gap-4' : 'gap-2', className)}>
      {chars.map((ch, i) => (
        <span key={i} className={cn('flex items-center', spaced ? 'gap-4' : 'gap-2')}>
          {withSeparator && i === half && <span aria-hidden className="w-3 border-t-2 border-dark" />}
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={i === 0 ? id : undefined}
            aria-label={`Character ${i + 1} of ${length}`}
            inputMode={pattern.source === '\\d' ? 'numeric' : 'text'}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={ch}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
              const c = e.target.value.slice(-1);
              if (c && !pattern.test(c)) return;
              setAt(i, c);
              if (c) focus(i + 1);
            }}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
            className={cn(inputVariants({ size, status }), boxSize[size], 'p-0 text-center text-base font-semibold leading-4')}
          />
        </span>
      ))}
    </div>
  );
}
