// AD Design Kit Avatar — Figma set "Avatar" (node 1146:5178, page 3197:21106), dot 1146:5625, group 1146:5549,
// remove button 1146:5641 (Figma Type "With remove button" = `onRemove`).
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type AvatarSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away';

// remove: Figma "Avatar remove button" size per avatar size (xs 12 · sm 14 · base/lg 16 · xl/2xl 20) and its icon.
const sizes: Record<AvatarSize, { box: string; text: string; dot: string; remove: string }> = {
  xs: { box: 'size-4.5', text: 'text-xxs', dot: 'size-1.5', remove: 'size-3 [&_svg]:size-2' },
  sm: { box: 'size-6', text: 'text-xs', dot: 'size-2.5', remove: 'size-3.5 [&_svg]:size-2.5' },
  base: { box: 'size-8', text: 'text-sm', dot: 'size-2', remove: 'size-4 [&_svg]:size-3' },
  lg: { box: 'size-11', text: 'text-lg', dot: 'size-3', remove: 'size-4 [&_svg]:size-3' },
  xl: { box: 'size-14', text: 'text-2xl', dot: 'size-4', remove: 'size-5 [&_svg]:size-3.5' },
  '2xl': { box: 'size-16', text: 'text-2xl', dot: 'size-4', remove: 'size-5 [&_svg]:size-3.5' },
};

const statusColors: Record<AvatarStatus, string> = { online: 'bg-success', offline: 'bg-danger', away: 'bg-gray' };

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  /** Use inside AvatarGroup so overlapping avatars get the buffer ring. */
  bordered?: boolean;
  /** Figma "With remove button": a round remove button on the top-right edge (e.g. a selected person in a picker). */
  onRemove?: () => void;
  /** Accessible name of the remove button. Default: "Remove <name>". */
  removeLabel?: string;
}

export function Avatar({ src, name, size = 'base', status, bordered, onRemove, removeLabel, className, ...props }: AvatarProps) {
  const s = sizes[size];
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={cn('relative inline-flex shrink-0', s.box, className)} {...props}>
      {src ? (
        <img src={src} alt={name} className={cn('size-full rounded-full object-cover', bordered && 'border-2 border-buffer')} />
      ) : (
        <span
          role="img"
          aria-label={name}
          className={cn('flex size-full items-center justify-center rounded-full bg-neutral-tertiary font-semibold text-body', s.text, bordered && 'border-2 border-buffer')}
        >
          <span aria-hidden>{initials}</span>
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove ${name}`}
          className={cn(
            // The hit area extends past the small visible circle (::before) so it stays easy to tap.
            'absolute -end-1 -top-0.5 inline-flex items-center justify-center rounded-full bg-neutral-tertiary-medium text-body before:absolute before:-inset-1.5 hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none',
            s.remove,
          )}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {status && (
        <span className={cn('absolute bottom-0 end-0 rounded-full border-2 border-buffer', s.dot, statusColors[status])}>
          <span className="sr-only">{status}</span>
        </span>
      )}
    </span>
  );
}

export function AvatarGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  // Figma overlap: lg -16px, base -14px, sm -8px.
  return <div className={cn('flex -space-x-3.5 rtl:space-x-reverse', className)} {...props} />;
}
