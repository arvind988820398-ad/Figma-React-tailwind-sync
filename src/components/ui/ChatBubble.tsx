// AuxoKit Chat bubble — Figma set "Chat bubble" (node 1149:35720, page 380:18014), bubble 1149:35687, content 1149:35600.
// Figma Direction: Left = received (bg-neutral-tertiary), Right = sent (bg-brand-softer, row mirrored).
// Figma Type = the content child: Text (plain children), File, Audio, Images, URL (ChatFile / ChatAudio / ChatImages /
// ChatLinkPreview below); Calendar is a composition. "Clean" = no fill.
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ChatBubbleProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'received' | 'sent';
  name: ReactNode;
  time?: ReactNode;
  /** 32px Avatar. */
  avatar?: ReactNode;
  /** Footer status, e.g. "Delivered". */
  status?: ReactNode;
  /** Trailing actions (e.g. a ghost "more" icon button), size-5 icons. */
  menu?: ReactNode;
  clean?: boolean;
}

export function ChatBubble({ direction = 'received', name, time, avatar, status, menu, clean, className, children, ...props }: ChatBubbleProps) {
  const sent = direction === 'sent';
  return (
    <div className={cn('flex items-start gap-2.5', sent && 'flex-row-reverse', className)} {...props}>
      {avatar}
      <div
        className={cn(
          'flex w-full max-w-80 flex-col gap-1.5 rounded-base',
          !clean && 'p-4',
          !clean && (sent ? 'bg-brand-softer' : 'bg-neutral-tertiary'),
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-heading">{name}</span>
          {time && <span className="text-sm text-body-subtle">{time}</span>}
        </div>
        <div className="text-sm text-body">{children}</div>
        {status && <span className="text-sm text-body-subtle">{status}</span>}
      </div>
      {menu && <div className="shrink-0 text-body [&_svg]:size-5">{menu}</div>}
    </div>
  );
}

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
    <path d="M14 3v5h5" strokeLinejoin="round" />
  </svg>
);

/** File content: name + meta, with a download action. */
export function ChatFile({ name, meta, action }: { name: ReactNode; meta?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-3 rounded-base bg-neutral-secondary-strong p-2">
      <span className="text-heading [&_svg]:size-5"><FileIcon /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-heading">{name}</span>
        {meta && <span className="text-xs text-body">{meta}</span>}
      </span>
      {action}
    </div>
  );
}

/** Audio content: play button, waveform bars (played part bg-brand) and duration. */
export function ChatAudio({ duration, progress = 0.4, onPlay }: { duration: ReactNode; progress?: number; onPlay?: () => void }) {
  const bars = [3, 5, 8, 4, 7, 9, 5, 3, 6, 8, 4, 6, 9, 5, 3, 7, 4, 6, 8, 3];
  return (
    <div className="mt-1 flex items-center gap-3">
      <button
        type="button"
        aria-label="Play voice message"
        onClick={onPlay}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-heading hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d="M7 4v16l13-8z" /></svg>
      </button>
      <span className="flex h-6 flex-1 items-center gap-0.5" aria-hidden>
        {bars.map((h, i) => (
          <span key={i} className={cn('w-1 rounded-full', i / bars.length < progress ? 'bg-brand' : 'bg-gray', ['h-1', 'h-1.5', 'h-2', 'h-2.5', 'h-3', 'h-3.5', 'h-4', 'h-5', 'h-6', 'h-6'][h])} />
        ))}
      </span>
      <span className="text-sm font-medium text-heading">{duration}</span>
    </div>
  );
}

/** Images content: up to 4 tiles; extra images show "+N" on bg-overlay-dark. */
export function ChatImages({ images }: { images: { src: string; alt: string }[] }) {
  const shown = images.slice(0, 4);
  const extra = images.length - shown.length;
  return (
    <div className={cn('mt-1 grid gap-2', shown.length > 1 && 'grid-cols-2')}>
      {shown.map((img, i) => (
        <div key={i} className="relative overflow-hidden rounded-base">
          <img src={img.src} alt={img.alt} className="aspect-square w-full object-cover" />
          {i === shown.length - 1 && extra > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-overlay-dark text-xl font-medium text-white">+{extra}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** URL content: link preview card. */
export function ChatLinkPreview({ href, title, description, image }: { href: string; title: ReactNode; description?: ReactNode; image?: ReactNode }) {
  return (
    <div className="mt-1 flex flex-col gap-2">
      <a href={href} className="text-sm font-medium break-all text-fg-brand underline-offset-2 hover:underline">{href}</a>
      <a href={href} className="flex flex-col gap-2 rounded-base bg-neutral-secondary-strong p-4 hover:bg-neutral-quaternary">
        {image}
        <span className="text-sm font-medium text-heading">{title}</span>
        {description && <span className="text-xs text-body-subtle">{description}</span>}
      </a>
    </div>
  );
}
