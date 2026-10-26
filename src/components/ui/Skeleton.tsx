// AuxoKit Skeleton — Figma set "Skeleton" (node 1149:85600, page 13251:80911).
// Primary lines bg-gray, secondary lines bg-neutral-quaternary, media blocks rounded-lg bg-gray with a placeholder icon.
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type SkeletonType = 'text' | 'simple-text' | 'image' | 'card' | 'list' | 'widget';

/** One loading line. `tone="secondary"` for meta/sub lines. Set width with w-* classes. */
export function SkeletonLine({ tone = 'primary', className }: { tone?: 'primary' | 'secondary'; className?: string }) {
  return <div className={cn('h-2 rounded-full', tone === 'primary' ? 'bg-gray' : 'bg-neutral-quaternary', className)} />;
}

/** Image/video placeholder block. */
export function SkeletonMedia({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center rounded-lg bg-gray', className)}>
      <svg viewBox="0 0 20 18" className="size-5 fill-neutral-quaternary" aria-hidden>
        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
      </svg>
    </div>
  );
}

function TextLines() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonLine className="h-2.5 w-1/2" />
      <SkeletonLine tone="secondary" className="w-full" />
      <SkeletonLine tone="secondary" className="w-11/12" />
      <SkeletonLine tone="secondary" className="w-4/5" />
      <SkeletonLine tone="secondary" className="w-3/5" />
    </div>
  );
}

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
        <div className="flex flex-col gap-3">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
          <SkeletonLine className="w-3/5" />
        </div>
      );
      break;
    case 'image':
      body = (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <SkeletonMedia className="h-36 w-full sm:w-60" />
          <div className="flex-1">
            <TextLines />
          </div>
        </div>
      );
      break;
    case 'card':
      body = (
        <div className="flex flex-col gap-4 rounded-base border border-default p-4 shadow-xs">
          <SkeletonMedia className="h-40 w-full" />
          <TextLines />
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gray" />
            <div className="flex flex-col gap-2">
              <SkeletonLine className="w-24" />
              <SkeletonLine tone="secondary" className="w-32" />
            </div>
          </div>
        </div>
      );
      break;
    case 'list':
      body = (
        <div className="divide-y divide-default rounded-base border border-default p-4 shadow-xs">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-2">
                <SkeletonLine className="w-24" />
                <SkeletonLine tone="secondary" className="w-32" />
              </div>
              <SkeletonLine className="w-12" />
            </div>
          ))}
        </div>
      );
      break;
    case 'widget':
      body = (
        <div className="flex flex-col gap-4 rounded-base border border-default p-4 shadow-xs">
          <SkeletonLine className="h-2.5 w-1/3" />
          <SkeletonLine tone="secondary" className="w-1/2" />
          <div className="flex h-40 items-end gap-4">
            {['h-3/4', 'h-full', 'h-2/3', 'h-5/6', 'h-1/2', 'h-4/5'].map((h, i) => (
              <div key={i} className={cn('flex-1 rounded-t-lg bg-gray', h)} />
            ))}
          </div>
        </div>
      );
      break;
    default:
      body = <TextLines />;
  }
  return (
    <div role="status" aria-busy="true" className={cn('animate-pulse', className)} {...props}>
      {body}
      <span className="sr-only">{label}</span>
    </div>
  );
}
