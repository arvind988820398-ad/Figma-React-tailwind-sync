// AD Design Kit Popover — Figma set "Popover" (node 1149:81090, page 3303:16685), content 1149:81187.
// Click-to-open panel anchored to its trigger; Esc and outside click close it. `placement` is the preferred side: the
// panel flips and shifts to stay on screen and is not clipped by a parent's overflow (see lib/floating.ts).
import { cloneElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useAnchored, type Side } from '../../lib/floating';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

// The arrow sits on the panel's edge that faces the trigger; its position along that edge comes from lib/floating.
const arrows: Record<Side, string> = {
  top: 'top-full -translate-y-1.5 border-t-0 border-s-0',
  bottom: 'bottom-full translate-y-1.5 border-b-0 border-e-0',
  left: 'left-full -translate-x-1.5 border-b-0 border-s-0',
  right: 'right-full translate-x-1.5 border-t-0 border-e-0',
};

export interface PopoverProps {
  trigger: ReactElement<{ onClick?: () => void; 'aria-expanded'?: boolean; 'aria-controls'?: string; 'aria-haspopup'?: string }>;
  /** Optional header bar ("Popover title"). */
  title?: ReactNode;
  children: ReactNode;
  placement?: PopoverPlacement;
  /** Content padding: `text` = px-3 py-2 (Figma "Text"); `rich` = p-3 stack; `none` for Figma "Vertical items":
   *  the panel hugs its rows and divides them with a border. */
  padding?: 'text' | 'rich' | 'none';
  className?: string;
  /** Accessible name when there is no title (a dialog must be named). */
  label?: string;
  /** Start open, e.g. to document the panel; the trigger, Esc and outside clicks still control it afterwards. */
  defaultOpen?: boolean;
}

export function Popover({ trigger, title, children, placement = 'top', padding = 'text', className, label = 'More information', defaultOpen = false }: PopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const a = useAnchored({ open, placement, gap: 12, withArrow: true });

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
    <span
      ref={(el) => {
        rootRef.current = el;
        a.setReference(el);
      }}
      className="relative inline-flex"
    >
      {cloneElement(trigger, {
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? id : undefined,
      })}
      {open && (
        <div
          id={id}
          ref={a.setFloating}
          style={a.floatingStyles}
          data-placement={a.placement}
          role="dialog"
          aria-labelledby={title ? `${id}-title` : undefined}
          aria-label={title ? undefined : label}
          className={cn(
            'z-40 rounded-base border border-default-medium bg-neutral-primary-medium text-sm text-body shadow-lg',
            padding === 'none' ? 'w-max' : 'w-64',
            className,
          )}
        >
          <span aria-hidden ref={a.arrowRef} style={a.arrowStyle} className={cn('absolute size-3 rotate-45 border border-default-medium bg-neutral-primary-medium', arrows[a.side])} />
          <div className="relative overflow-hidden rounded-base">
            {title && (
              <div id={`${id}-title`} className="border-b border-default-medium bg-neutral-tertiary-medium px-3 py-1.5 text-sm font-medium leading-5 text-heading">
                {title}
              </div>
            )}
            <div
              className={cn(
                padding === 'text' && 'px-3 py-2',
                padding === 'rich' && 'flex flex-col gap-2.5 p-3',
                padding === 'none' && 'flex flex-col divide-y divide-default-medium',
              )}
            >
              {children}
            </div>
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
