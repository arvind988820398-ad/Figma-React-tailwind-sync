// AD Design Kit Tooltip — Figma set "Tooltip" (node 1149:93859, page 3283:24170).
// Minimal CSS-positioned tooltip. For collision-aware positioning, wrap a headless
// primitive (Radix Tooltip / Floating UI) and keep these classes on the bubble.
import { useId, useState, type ReactElement, type ReactNode, cloneElement } from 'react';
import { cn } from '../../lib/cn';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const placements: Record<TooltipPlacement, { bubble: string; arrow: string }> = {
  top: { bubble: 'bottom-full left-1/2 mb-2 -translate-x-1/2', arrow: 'top-full left-1/2 -translate-x-1/2 -mt-1' },
  bottom: { bubble: 'top-full left-1/2 mt-2 -translate-x-1/2', arrow: 'bottom-full left-1/2 -translate-x-1/2 -mb-1' },
  left: { bubble: 'right-full top-1/2 me-2 -translate-y-1/2', arrow: 'left-full top-1/2 -translate-y-1/2 -ms-1' },
  right: { bubble: 'left-full top-1/2 ms-2 -translate-y-1/2', arrow: 'right-full top-1/2 -translate-y-1/2 -me-1' },
};

export interface TooltipProps {
  content: ReactNode;
  placement?: TooltipPlacement;
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const p = placements[placement];
  return (
    <span
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
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-xs rounded-base bg-dark px-3 py-2 text-sm font-medium leading-4 text-white shadow-md transition-opacity',
          p.bubble,
          open ? 'opacity-100' : 'invisible opacity-0',
        )}
      >
        {content}
        <span aria-hidden className={cn('absolute size-2 rotate-45 bg-dark', p.arrow)} />
      </span>
    </span>
  );
}
