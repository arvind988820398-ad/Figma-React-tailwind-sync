// AD Design Kit Skeleton — Figma set "Skeleton" (node 1149:85600, page 13251:80911).
// Primary lines bg-gray, secondary lines bg-neutral-quaternary, media blocks rounded-lg bg-gray with a placeholder icon.
// Each `type` draws the matching Figma Type: Text = centred heading + author · Simple text = paragraph rows ·
// Image + Text = media beside text · Card + Image = media, text and author · List = 5 divided rows · Widget = bar chart.
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { UserCircleIcon } from '../icons';

export type SkeletonType = 'text' | 'simple-text' | 'image' | 'card' | 'list' | 'widget';

/** One loading line. `tone="secondary"` for meta/sub lines. Set width with w-* classes. */
export function SkeletonLine({ tone = 'primary', className }: { tone?: 'primary' | 'secondary'; className?: string }) {
  return <div className={cn('h-2 rounded-full', tone === 'primary' ? 'bg-gray' : 'bg-neutral-quaternary', className)} />;
}

/** Image/video placeholder block. */
export function SkeletonMedia({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center rounded-lg bg-gray', className)}>
      <svg viewBox="0 0 20 18" className="h-8 w-auto fill-neutral-quaternary" aria-hidden>
        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
      </svg>
    </div>
  );
}

/** Author row: a user-circle placeholder with name and role lines. */
function Author({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <UserCircleIcon className="size-5 shrink-0 [&_path]:fill-neutral-quaternary" />
      {compact ? (
        <>
          <SkeletonLine className="h-1.5 w-14" />
          <SkeletonLine tone="secondary" className="h-1 w-10" />
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <SkeletonLine className="w-17" />
          <SkeletonLine tone="secondary" className="h-1.5 w-22" />
        </div>
      )}
    </div>
  );
}

/** Heading line plus body lines, as in Figma "Card + Image" and "Image + Text". */
function TextBlock({ widths, gap }: { widths: string[]; gap: string }) {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonLine tone="secondary" className="h-2 w-36" />
      <div className={cn('flex flex-col', gap)}>
        {widths.map((w, i) => (
          <SkeletonLine key={i} tone="secondary" className={cn('h-1.5', w)} />
        ))}
      </div>
    </div>
  );
}

// Figma "Simple text": rows of 8px lines, some split into three blocks (primary · secondary · primary).
const simpleRows: (string | [string, string, string])[] = ['w-full', 'w-3/5', ['w-1/4', 'w-1/4', 'w-1/4'], 'w-11/12', 'w-2/3', ['flex-1', 'flex-1', 'flex-1'], 'w-1/2'];

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma Type: Text · Simple text · Image + Text · Card + Image · List · Widget. */
  type?: SkeletonType;
  /** Screen-reader label. */
  label?: string;
}

export function Skeleton({ type = 'text', label = 'Loading…', className, ...props }: SkeletonProps) {
  let body;
  switch (type) {
    case 'simple-text':
      body = (
        <div className="flex flex-col gap-2.5">
          {simpleRows.map((row, i) =>
            typeof row === 'string' ? (
              <SkeletonLine key={i} className={row} />
            ) : (
              <div key={i} className="flex gap-3">
                <SkeletonLine className={row[0]} />
                <SkeletonLine tone="secondary" className={row[1]} />
                <SkeletonLine className={row[2]} />
              </div>
            ),
          )}
        </div>
      );
      break;
    case 'image':
      body = (
        <div className="flex flex-col gap-4 p-4 sm:flex-row">
          <SkeletonMedia className="h-37 w-full shrink-0 sm:w-56" />
          <div className="flex-1">
            <TextBlock widths={['w-11/12', 'w-full', 'w-3/4', 'w-2/5']} gap="gap-2" />
          </div>
        </div>
      );
      break;
    case 'card':
      body = (
        <div className="flex flex-col gap-4 p-4">
          <SkeletonMedia className="h-24 w-full" />
          <TextBlock widths={['w-11/12', 'w-full', 'w-3/5']} gap="gap-2.5" />
          <Author />
        </div>
      );
      break;
    case 'list':
      body = (
        <div className="divide-y divide-default border-b border-default">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="flex flex-col gap-1.5">
                <SkeletonLine className="h-2 w-29" />
                <SkeletonLine tone="secondary" className="h-1.5 w-18" />
              </div>
              <SkeletonLine tone="secondary" className="h-1 w-5" />
            </div>
          ))}
        </div>
      );
      break;
    case 'widget':
      body = (
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-col gap-2">
            <SkeletonLine className="w-30 rounded-xxs" />
            <SkeletonLine tone="secondary" className="h-1.5 w-20 rounded-xxs" />
          </div>
          <div className="flex h-58 justify-between">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-4.5 rounded-t-sm bg-neutral-quaternary" />
            ))}
          </div>
        </div>
      );
      break;
    default:
      // Figma "Text": a centred two-line heading and a compact author row.
      body = (
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="flex w-full flex-col items-center gap-2.5">
            <SkeletonLine className="h-2 w-2/3" />
            <SkeletonLine className="h-2 w-2/5" />
          </div>
          <Author compact />
        </div>
      );
  }
  return (
    <div role="status" aria-busy="true" className={cn('animate-pulse', className)} {...props}>
      {body}
      <span className="sr-only">{label}</span>
    </div>
  );
}
