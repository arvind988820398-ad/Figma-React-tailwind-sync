// AD Design Kit Avatar — Figma set "Avatar" (node 1146:5178, page 3197:21106), dot 1146:5625, group 1146:5549.
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type AvatarSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away';

const sizes: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  xs: { box: 'size-4.5', text: 'text-xxs', dot: 'size-1.5' },
  sm: { box: 'size-6', text: 'text-xs', dot: 'size-2.5' },
  base: { box: 'size-8', text: 'text-sm', dot: 'size-2' },
  lg: { box: 'size-11', text: 'text-lg', dot: 'size-3' },
  xl: { box: 'size-14', text: 'text-2xl', dot: 'size-4' },
  '2xl': { box: 'size-16', text: 'text-2xl', dot: 'size-4' },
};

const statusColors: Record<AvatarStatus, string> = { online: 'bg-success', offline: 'bg-danger', away: 'bg-gray' };

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  /** Use inside AvatarGroup so overlapping avatars get the buffer ring. */
  bordered?: boolean;
}

export function Avatar({ src, name, size = 'base', status, bordered, className, ...props }: AvatarProps) {
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
          {initials}
        </span>
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
