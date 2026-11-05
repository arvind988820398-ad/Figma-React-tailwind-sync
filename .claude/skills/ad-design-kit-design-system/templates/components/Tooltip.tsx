// AD Design Kit Tooltip — Figma set "Tooltip" (node 1149:93859, page 3283:24170).
// Shown on hover and focus; `placement` is the preferred side: the bubble flips and shifts to stay on screen and is
// not clipped by a parent's overflow (see lib/floating.ts).
import { useId, useState, type ReactElement, type ReactNode, cloneElement } from 'react';
import { cn } from '../../lib/cn';
import { useAnchored, type Side } from '../../lib/floating';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

// The arrow sits on the bubble's edge that faces the trigger; its position along that edge comes from lib/floating.
const arrows: Record<Side, string> = {
  top: 'top-full -mt-1',
  bottom: 'bottom-full -mb-1',
  left: 'left-full -ms-1',
  right: 'right-full -me-1',
};

export interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  children: ReactElement<{ 'aria-describedby'?: string }>;
  /** Start shown, e.g. to document the bubble; hover, focus and Escape still control it afterwards. */
  defaultOpen?: boolean;
}

export function Tooltip({ content, placement = 'top', children, defaultOpen = false }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const a = useAnchored({ open, placement, gap: 8, withArrow: true });
  return (
    <span
      ref={a.setReference}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {cloneElement(children, { 'aria-describedby': open ? id : undefined })}
      <span
        role="tooltip"
        id={id}
        // Measured only while shown, so a page full of tooltips keeps no scroll or resize listeners.
        ref={open ? a.setFloating : undefined}
        style={a.floatingStyles}
        data-placement={a.placement}
        className={cn(
          'pointer-events-none z-50 w-max max-w-xs rounded-base bg-dark px-3 py-2 text-sm font-medium leading-4 text-white shadow-md transition-opacity',
          open ? 'opacity-100' : 'invisible opacity-0',
        )}
      >
        {content}
        <span aria-hidden ref={a.arrowRef} style={a.arrowStyle} className={cn('absolute size-2 rotate-45 bg-dark', arrows[a.side])} />
      </span>
    </span>
  );
}
