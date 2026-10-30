// AD Design Kit Kbd — Figma set "KBD" (node 1149:92754, page 13693:81938).
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center gap-2.5 rounded-base border border-default-medium bg-neutral-tertiary px-2 py-1.5 font-sans text-xs font-semibold leading-4 text-heading [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}
