// AD Design Kit OTP input — Figma "OTP Inputs" boxes (node 1149:49523) and examples (1149:49576), page 3279:34618.
// Figma examples → variant: Default=default (boxes joined into one bar) · Spaced=spaced (8px apart) ·
// Separator=separator / Separator spaced=separator-spaced (groups of three split by a dash).
// Typing advances, Backspace goes back, arrows move, pasting fills every box.
import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';
import { inputVariants, type FieldSize, type FieldStatus } from './Input';

export type OtpInputVariant = 'default' | 'spaced' | 'separator' | 'separator-spaced';

const boxSize: Record<FieldSize, string> = { sm: 'size-9 text-base leading-4', base: 'size-10 text-base leading-4', lg: 'size-12 text-2xl leading-6', xl: 'size-13 text-2xl leading-6' };

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
  // A space in `value` marks an empty box between filled ones, so clearing a box never shifts later characters.
  const chars = Array.from({ length }, (_, i) => (value[i] && value[i] !== ' ' ? value[i] : ''));
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setAt = (i: number, ch: string) => {
    const next = [...chars];
    next[i] = ch;
    onChange(next.map((c) => c || ' ').join('').replace(/\s+$/, '').slice(0, length));
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
  const groups = withSeparator ? Array.from({ length: Math.ceil(length / 3) }, (_, g) => [g * 3, Math.min(length, g * 3 + 3)]) : [[0, length]];

  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-2', className)}>
      {groups.map(([from, to], g) => (
        <span key={from} className="contents">
          {g > 0 && <span aria-hidden className="w-2.5 border-t border-dark" />}
          <span className={cn('flex', spaced ? 'gap-2' : '-space-x-px rounded-base shadow-xs')}>
            {chars.slice(from, to).map((ch, k) => {
              const i = from + k;
              return (
                <input
                  key={i}
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
                  className={cn(
                    inputVariants({ size, status }),
                    boxSize[size],
                    'p-0 text-center font-semibold',
                    !spaced && 'relative rounded-none shadow-none first:rounded-s-base last:rounded-e-base focus:z-10',
                  )}
                />
              );
            })}
          </span>
        </span>
      ))}
    </div>
  );
}
