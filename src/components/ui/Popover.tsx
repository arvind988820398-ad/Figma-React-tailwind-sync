// AD Design Kit Popover — Figma set "Popover" (node 1149:81090, page 3303:16685), content 1149:81187.
// Click-to-open panel anchored to its trigger; Esc and outside click close it. For collision-aware positioning,
// wrap a headless primitive (Radix Popover / Floating UI) and keep these classes.
import { cloneElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

const placements: Record<PopoverPlacement, { panel: string; arrow: string }> = {
  top: { panel: 'bottom-full left-1/2 mb-3 -translate-x-1/2', arrow: 'top-full left-1/2 -translate-x-1/2 -translate-y-1.5 border-t-0 border-s-0' },
  bottom: { panel: 'top-full left-1/2 mt-3 -translate-x-1/2', arrow: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1.5 border-b-0 border-e-0' },
  left: { panel: 'right-full top-1/2 me-3 -translate-y-1/2', arrow: 'left-full top-1/2 -translate-y-1/2 -translate-x-1.5 border-b-0 border-s-0' },
  right: { panel: 'left-full top-1/2 ms-3 -translate-y-1/2', arrow: 'right-full top-1/2 -translate-y-1/2 translate-x-1.5 border-t-0 border-e-0' },
};

export interface PopoverProps {
  trigger: ReactElement<{ onClick?: () => void; 'aria-expanded'?: boolean; 'aria-controls'?: string; 'aria-haspopup'?: string }>;
  /** Optional header bar ("Popover title"). */
  title?: ReactNode;
  children: ReactNode;
  placement?: PopoverPlacement;
  /** Content padding: `text` = px-3 py-2 (Figma "Text"); `rich` = p-3 stack; `none` for vertical item lists. */
  padding?: 'text' | 'rich' | 'none';
  className?: string;
  /** Accessible name when there is no title (a dialog must be named). */
  label?: string;
}

export function Popover({ trigger, title, children, placement = 'top', padding = 'text', className, label = 'More information' }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const p = placements[placement];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="dialog"]')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex">
      {cloneElement(trigger, {
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? id : undefined,
      })}
      {open && (
        <div
          id={id}
          role="dialog"
          aria-labelledby={title ? `${id}-title` : undefined}
          aria-label={title ? undefined : label}
          className={cn('absolute z-40 w-64 rounded-base border border-default-medium bg-neutral-primary-medium text-sm text-body shadow-lg', p.panel, className)}
        >
          <span aria-hidden className={cn('absolute size-3 rotate-45 border border-default-medium bg-neutral-primary-medium', p.arrow)} />
          <div className="relative overflow-hidden rounded-base">
            {title && (
              <div id={`${id}-title`} className="border-b border-default-medium bg-neutral-tertiary-medium px-3 py-1.5 text-sm font-medium leading-5 text-heading">
                {title}
              </div>
            )}
            <div className={cn(padding === 'text' && 'px-3 py-2', padding === 'rich' && 'flex flex-col gap-2.5 p-3')}>{children}</div>
          </div>
        </div>
      )}
    </span>
  );
}

/** Figma "Vertical items" content: icon + text rows. */
export function PopoverItem({ icon, children, href }: { icon?: ReactNode; children: ReactNode; href?: string }) {
  const cls = 'flex items-center gap-1.5 px-3 py-2 text-sm leading-none text-body [&_svg]:size-4';
  return href ? (
    <a href={href} className={cn(cls, 'hover:bg-neutral-tertiary-medium hover:text-heading')}>
      {icon}
      {children}
    </a>
  ) : (
    <div className={cls}>
      {icon}
      {children}
    </div>
  );
}
