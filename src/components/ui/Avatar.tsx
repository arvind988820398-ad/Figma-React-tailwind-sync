// AD Design Kit Avatar — Figma set "Avatar" (node 1146:5178, page 3197:21106), dot 1146:5625, group 1146:5549,
// group label 1146:5592, remove button 1146:5641 (Figma Type "With remove button" = `onRemove`).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';

export type AvatarSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away';

// Figma "Avatar dot" (top-right, no ring) and "Avatar remove button" size and offset per avatar size.
const sizes: Record<AvatarSize, { box: string; text: string; dot: string; remove: string }> = {
  xs: { box: 'size-4.5', text: 'text-xxs', dot: 'top-0 end-0 size-1.5', remove: '-end-1.5 -top-0.5 size-3 [&_svg]:size-2' },
  sm: { box: 'size-6', text: 'text-xs', dot: 'top-px -end-0.5 size-2', remove: '-end-1.5 -top-0.5 size-3.5 [&_svg]:size-2.5' },
  base: { box: 'size-8', text: 'text-sm', dot: 'top-px -end-px size-2.5', remove: '-end-1.5 top-0 size-4 [&_svg]:size-3' },
  lg: { box: 'size-11', text: 'text-lg', dot: 'top-1 -end-0.5 size-3', remove: '-end-1.5 top-0.5 size-4 [&_svg]:size-3' },
  xl: { box: 'size-14', text: 'text-2xl', dot: 'top-0.5 -end-0.5 size-4', remove: '-end-1.5 top-px size-5 [&_svg]:size-3.5' },
  '2xl': { box: 'size-16', text: 'text-2xl', dot: 'top-1 -end-px size-4', remove: '-end-1.5 top-0.5 size-5 [&_svg]:size-3.5' },
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
            'absolute inline-flex items-center justify-center rounded-full bg-neutral-tertiary-medium text-body before:absolute before:-inset-1.5 hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none',
            s.remove,
          )}
        >
          <CloseIcon />
        </button>
      )}
      {status && (
        <span className={cn('absolute rounded-full', s.dot, statusColors[status])}>
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

export type AvatarGroupLabelSize = 'sm' | 'base' | 'lg' | 'xl';

// Figma "Avatar group label": Type "Heading & helper text" (with `helper`) or "Text" (name only, one avatar size smaller).
const labelSizes: Record<AvatarGroupLabelSize, { avatar: AvatarSize; textAvatar: AvatarSize; gap: string; textGap: string; name: string; helper: string; stack: string }> = {
  sm: { avatar: 'sm', textAvatar: 'xs', gap: 'gap-1.5', textGap: 'gap-1.5', name: 'text-xs leading-4', helper: 'text-xs leading-3', stack: 'gap-0.5' },
  base: { avatar: 'base', textAvatar: 'sm', gap: 'gap-2', textGap: 'gap-1.5', name: 'text-base leading-4', helper: 'text-sm leading-3.5', stack: 'gap-1.5' },
  lg: { avatar: 'lg', textAvatar: 'base', gap: 'gap-2.5', textGap: 'gap-2', name: 'text-base leading-4', helper: 'text-base leading-4', stack: 'gap-1.5' },
  xl: { avatar: 'xl', textAvatar: 'lg', gap: 'gap-2.5', textGap: 'gap-2', name: 'text-xl leading-5', helper: 'text-lg leading-4.5', stack: 'gap-1.5' },
};

export interface AvatarGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  /** Figma Type "Heading & helper text": a line under the name (email, role). Without it: Type "Text". */
  helper?: ReactNode;
  size?: AvatarGroupLabelSize;
}

/** An avatar with the person's name (and a helper line) beside it. The visible name labels the avatar, so the image is decorative. */
export function AvatarGroupLabel({ name, src, helper, size = 'base', className, ...props }: AvatarGroupLabelProps) {
  const s = labelSizes[size];
  return (
    <div className={cn('flex items-center', helper ? s.gap : s.textGap, className)} {...props}>
      <Avatar name={name} src={src} size={helper ? s.avatar : s.textAvatar} aria-hidden />
      <div className={cn('flex min-w-0 flex-col text-start', s.stack)}>
        <span className={cn('font-medium text-heading', s.name)}>{name}</span>
        {helper && <span className={cn('text-body', s.helper)}>{helper}</span>}
      </div>
    </div>
  );
}
