// AD Design Kit Speed dial — Figma "Speed dial (ready to use examples)" (node 1149:84847, page 14231:74723),
// item 1149:84896, menus 1149:84972. Figma Type → variant: Default=default · Rounded=rounded · Menu=menu (icon + label
// inside the item) · Article dropdown menu=dropdown. Figma Position → direction.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';
import { Tooltip } from './Tooltip';

export type SpeedDialVariant = 'default' | 'rounded' | 'menu' | 'dropdown';
export type SpeedDialDirection = 'top' | 'bottom' | 'left' | 'right';

export interface SpeedDialAction {
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface SpeedDialProps {
  actions: SpeedDialAction[];
  variant?: SpeedDialVariant;
  direction?: SpeedDialDirection;
  /** Pin to the bottom-end corner of the viewport (fixed end-6 bottom-6). */
  fixed?: boolean;
  label?: string;
  className?: string;
}

const layout: Record<SpeedDialDirection, { root: string; menu: string }> = {
  // DOM order is [menu, trigger]; reverse it when the menu opens below / to the right.
  top: { root: 'flex-col items-center', menu: 'flex-col' },
  bottom: { root: 'flex-col-reverse items-center', menu: 'flex-col' },
  left: { root: 'flex-row items-center', menu: 'flex-row' },
  right: { root: 'flex-row-reverse items-center', menu: 'flex-row' },
};
const tooltipSide: Record<SpeedDialDirection, 'left' | 'right' | 'top' | 'bottom'> = { top: 'left', bottom: 'left', left: 'top', right: 'top' };

export function SpeedDial({ actions, variant = 'default', direction = 'top', fixed, label = 'Quick actions', className }: SpeedDialProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector<HTMLElement>(`[aria-controls="${id}"]`)?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, id]);

  const select = (a: SpeedDialAction) => {
    a.onSelect?.();
    setOpen(false);
  };

  const l = layout[direction];

  return (
    <div ref={rootRef} className={cn('inline-flex gap-3 p-1', l.root, fixed && 'fixed end-6 bottom-6 z-40', className)}>
      {open &&
        (variant === 'dropdown' ? (
          <ul id={id} aria-label={label} className="flex w-44 flex-col gap-1.5 rounded-base border border-default-medium bg-neutral-primary-medium p-2 shadow-lg">
            {actions.map((a) => (
              <li key={a.label}>
                <button
                  type="button"
                  disabled={a.disabled}
                  onClick={() => select(a)}
                  className="flex w-full items-center gap-1.5 rounded p-2 text-sm font-medium leading-none text-body hover:bg-neutral-tertiary-medium hover:text-heading focus-visible:bg-neutral-tertiary-medium focus-visible:outline-none disabled:pointer-events-none disabled:text-fg-disabled [&_svg]:size-4"
                >
                  {a.icon}
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul id={id} aria-label={label} className={cn('flex gap-2', l.menu)}>
            {actions.map((a) => {
              const item = (
                <button
                  type="button"
                  disabled={a.disabled}
                  aria-label={variant === 'menu' ? undefined : a.label}
                  onClick={() => select(a)}
                  className={cn(
                    'flex flex-col items-center justify-center border border-default bg-neutral-primary text-body shadow-xs transition-colors',
                    'hover:bg-neutral-tertiary hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none',
                    'disabled:pointer-events-none disabled:text-fg-disabled',
                    variant === 'menu' ? 'size-14 gap-1 rounded-base [&_svg]:size-5' : 'size-12 [&_svg]:size-6',
                    variant === 'rounded' ? 'rounded-full' : 'rounded-base',
                  )}
                >
                  {a.icon}
                  {variant === 'menu' && <span className="text-xs font-medium leading-3">{a.label}</span>}
                </button>
              );
              return <li key={a.label}>{variant === 'menu' ? item : <Tooltip content={a.label} placement={tooltipSide[direction]}>{item}</Tooltip>}</li>;
            })}
          </ul>
        ))}
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(buttonVariants({ size: 'xl', iconOnly: true }), variant === 'rounded' && 'rounded-full')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn('transition-transform', open && 'rotate-45')} aria-hidden>
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
