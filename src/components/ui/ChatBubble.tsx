// AD Design Kit Chat bubble — Figma set "Chat bubble" (node 1149:35720, page 380:18014), bubble 1149:35687, content 1149:35600.
// Figma Direction: Left = received (bg-neutral-tertiary), Right = sent (bg-brand-softer, row mirrored).
// Figma Type = the content child: Text (plain children), File, Audio, Images, URL (ChatFile / ChatAudio / ChatImages /
// ChatLinkPreview below); Calendar is a composition. "Clean" = no fill. Put text before a content part in a <p>:
// parts after another element get the Figma 10px gap.
import { Fragment, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { DownloadIcon, FileIcon, PauseIcon, PlayIcon } from '../icons';

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
  /** Figma Width: Fixed = the 320px bubble (default). Fluid = the bubble fills the conversation up to 80% of its width
   *  (full-page chat). */
  width?: 'fixed' | 'fluid';
}

export function ChatBubble({ direction = 'received', name, time, avatar, status, menu, clean, width = 'fixed', className, children, ...props }: ChatBubbleProps) {
  const sent = direction === 'sent';
  return (
    <div className={cn('flex items-start gap-2.5', sent && 'flex-row-reverse', className)} {...props}>
      {avatar}
      <div
        className={cn(
          'flex w-full flex-col gap-3 rounded-base',
          width === 'fluid' ? 'max-w-4/5' : 'max-w-80',
          !clean && 'p-4',
          !clean && (sent ? 'bg-brand-softer' : 'bg-neutral-tertiary'),
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-heading">{name}</span>
          {time && <span className="text-sm text-body">{time}</span>}
        </div>
        <div className="text-sm text-body [&>*+*]:mt-2.5">{children}</div>
        {status && <span className="text-sm text-body">{status}</span>}
      </div>
      {menu && <div className="shrink-0 text-body [&_svg]:size-5">{menu}</div>}
    </div>
  );
}

/** File content (Figma Bubble content "File"): icon + name, "12 Pages • 18 MB • PDF" meta, and a download action. */
export function ChatFile({ name, meta, icon, action }: { name: ReactNode; meta?: ReactNode | ReactNode[]; icon?: ReactNode; action?: ReactNode }) {
  const parts = Array.isArray(meta) ? meta : meta ? [meta] : [];
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex items-start gap-1.5">
          <span className="shrink-0 text-heading [&_svg]:size-5">{icon ?? <FileIcon />}</span>
          <span className="min-w-0 text-sm font-medium break-words text-heading">{name}</span>
        </span>
        {parts.length > 0 && (
          <span className="flex flex-wrap items-center gap-2 text-xs text-body">
            {parts.map((part, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="size-1 rounded-full bg-current text-body-subtle" aria-hidden />}
                <span>{part}</span>
              </Fragment>
            ))}
          </span>
        )}
      </span>
      {action}
    </div>
  );
}

/** Figma "Download" action for ChatFile: a 20px ghost icon button. */
export function ChatFileDownload({ label, href, onClick }: { label: string; href?: string; onClick?: () => void }) {
  const cls = 'inline-flex size-6 shrink-0 items-center justify-center rounded-base text-body hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none [&_svg]:size-5';
  return href ? (
    <a href={href} download aria-label={label} className={cls}>
      <DownloadIcon />
    </a>
  ) : (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      <DownloadIcon />
    </button>
  );
}

// Figma waveform: 28 bars, heights on the 4px scale.
const waveform = ['h-1.5', 'h-2', 'h-7', 'h-7', 'h-8', 'h-8', 'h-7', 'h-5', 'h-3', 'h-2', 'h-4', 'h-8', 'h-8', 'h-10', 'h-10', 'h-9', 'h-7', 'h-5', 'h-4', 'h-9', 'h-9', 'h-6', 'h-5', 'h-5', 'h-3', 'h-2', 'h-1', 'h-2'];

/** Audio content: play / pause button, waveform bars (played part bg-brand) and duration. */
export function ChatAudio({ duration, progress = 0.36, playing, onPlay }: { duration: ReactNode; progress?: number; playing?: boolean; onPlay?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
        onClick={onPlay}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-heading hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none"
      >
        {playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
      </button>
      <span className="flex h-10 min-w-0 flex-1 items-center gap-1 overflow-hidden" aria-hidden>
        {waveform.map((h, i) => (
          <span key={i} className={cn('w-1 shrink-0 rounded-full', h, i / waveform.length < progress ? 'bg-brand' : 'bg-gray')} />
        ))}
      </span>
      <span className="text-sm font-medium text-heading">{duration}</span>
    </div>
  );
}

/** Images content: a 2×2 grid; with more than 4 images the fourth tile shows "+N" (the images not shown) on bg-overlay-dark. */
export function ChatImages({ images }: { images: { src: string; alt: string }[] }) {
  const overflow = images.length > 4;
  const shown = images.slice(0, 4);
  const extra = images.length - 3;
  return (
    <div className={cn('grid gap-2', shown.length > 1 && 'grid-cols-2')}>
      {shown.map((img, i) => (
        <div key={i} className="relative overflow-hidden rounded-base">
          <img src={img.src} alt={overflow && i === 3 ? '' : img.alt} className="aspect-square w-full object-cover" />
          {overflow && i === 3 && (
            <span className="absolute inset-0 flex items-center justify-center bg-overlay-dark text-xl font-medium text-white">
              +{extra}
              <span className="sr-only"> more images</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** URL content: the link, then a preview card (image, title, domain). */
export function ChatLinkPreview({ href, title, description, image }: { href: string; title: ReactNode; description?: ReactNode; image?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <a href={href} className="text-sm font-medium break-all text-fg-brand underline underline-offset-2 hover:no-underline">{href}</a>
      <a href={href} className="flex flex-col gap-2 rounded-base bg-neutral-secondary-strong p-4 hover:bg-neutral-quaternary">
        {image}
        <span className="flex flex-col gap-1">
          <span className="text-sm font-medium text-heading">{title}</span>
          {description && <span className="text-xs text-body">{description}</span>}
        </span>
      </a>
    </div>
  );
}
