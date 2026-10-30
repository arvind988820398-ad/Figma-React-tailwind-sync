// AD Design Kit Kbd — Figma set "KBD" (node 1149:92754, page 13693:81938).
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/** Pass `aria-label` when the key is shown as an icon (e.g. an arrow): it becomes screen-reader text. */
export function Kbd({ className, children, 'aria-label': ariaLabel, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center gap-2.5 rounded-base border border-default-medium bg-neutral-tertiary px-2 py-1.5 font-sans text-xs font-semibold leading-4 text-heading [&_svg]:size-4',
        className,
      )}
      {...props}
    >
      {ariaLabel ? <span aria-hidden>{children}</span> : children}
      {ariaLabel && <span className="sr-only">{ariaLabel}</span>}
    </kbd>
  );
}
