// AD Design Kit Speed dial — Figma "Speed dial (ready to use examples)" (node 1149:84847, page 14231:74723),
// item 1149:84896, menus 1149:84972. Figma Type → variant: Default=default · Rounded=rounded (icon-only items with a
// tooltip) · Menu=menu (compact "Dropdown menu" list, w-32) · Article dropdown menu=dropdown (same list, w-44).
// Figma Position → direction; the menu lines up with the trigger's end edge (Figma align MAX).
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { PlusIcon } from '../icons';
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
  /** Start open, as the Figma examples are drawn (docs and previews). */
  defaultOpen?: boolean;
  label?: string;
  className?: string;
}

const layout: Record<SpeedDialDirection, { root: string; menu: string }> = {
  // DOM order is [menu, trigger]; reverse it when the menu opens below / to the right.
  top: { root: 'flex-col items-end', menu: 'flex-col' },
  bottom: { root: 'flex-col-reverse items-end', menu: 'flex-col' },
  left: { root: 'flex-row items-end', menu: 'flex-row' },
  right: { root: 'flex-row-reverse items-end', menu: 'flex-row' },
};
const tooltipSide: Record<SpeedDialDirection, 'left' | 'right' | 'top' | 'bottom'> = { top: 'left', bottom: 'left', left: 'top', right: 'top' };

export function SpeedDial({ actions, variant = 'default', direction = 'top', fixed, defaultOpen = false, label = 'Quick actions', className }: SpeedDialProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  // Focus moves into the menu only when the user opens it, not when it starts open.
  const userOpened = useRef(false);

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

  const actionButtons = () => [...(document.getElementById(id)?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])];
  useEffect(() => {
    if (open && userOpened.current) document.getElementById(id)?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
  }, [open, id]);
  const onListKey = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    const items = actionButtons();
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const prev = ['ArrowUp', 'ArrowLeft'].includes(e.key);
    const next = ['ArrowDown', 'ArrowRight'].includes(e.key);
    if (!prev && !next && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (next ? 1 : -1) + items.length) % items.length;
    items[to]?.focus();
  };

  const select = (a: SpeedDialAction) => {
    a.onSelect?.();
    setOpen(false);
  };

  const l = layout[direction];

  return (
    <div ref={rootRef} className={cn('inline-flex gap-3 p-1', l.root, fixed && 'fixed end-6 bottom-6 z-40', className)}>
      {open &&
        (variant === 'menu' || variant === 'dropdown' ? (
          <ul
            id={id}
            aria-label={label}
            onKeyDown={onListKey}
            className={cn('flex flex-col gap-1.5 rounded-base border border-default-medium bg-neutral-primary-medium p-2 shadow-lg', variant === 'menu' ? 'w-32' : 'w-44')}
          >
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
          <ul id={id} aria-label={label} onKeyDown={onListKey} className={cn('flex gap-2', l.menu)}>
            {actions.map((a) => {
              const item = (
                <button
                  type="button"
                  disabled={a.disabled}
                  aria-label={a.label}
                  onClick={() => select(a)}
                  className={cn(
                    'flex size-12 items-center justify-center border border-default bg-neutral-primary text-body shadow-xs transition-colors [&_svg]:size-6',
                    'hover:bg-neutral-tertiary hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none',
                    'disabled:pointer-events-none disabled:text-fg-disabled',
                    variant === 'rounded' ? 'rounded-full' : 'rounded-base',
                  )}
                >
                  {a.icon}
                </button>
              );
              return (
                <li key={a.label}>
                  <Tooltip content={a.label} placement={tooltipSide[direction]}>{item}</Tooltip>
                </li>
              );
            })}
          </ul>
        ))}
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          userOpened.current = true;
          setOpen((o) => !o);
        }}
        className={cn(buttonVariants({ size: 'xl', iconOnly: true }), open && 'bg-brand-strong', variant === 'rounded' && 'rounded-full')}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
