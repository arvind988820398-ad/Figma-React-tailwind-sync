// AuxoKit Device mockup — Figma set "Mockups" (node 1149:41354, page 702:18224).
// Figma Type → device: iPhone=iphone · Android=android · Android & pen / Stylus pen=android · Tablet=tablet ·
// Laptop=laptop · iMac=imac · Smartwatch=watch. Bezels bg-neutral-quaternary, stands bg-neutral-tertiary(-medium).
// Children fill the screen slot (an <img> or any content); sizes keep the Figma aspect ratios and scale with width.
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type Device = 'iphone' | 'android' | 'tablet' | 'laptop' | 'imac' | 'watch';

export interface DeviceMockupProps {
  device: Device;
  /** Screen content; images fill and crop to the screen. */
  children: ReactNode;
  /** Accessible description of what the screen shows. */
  label?: string;
  className?: string;
}

const screen = 'relative h-full w-full overflow-hidden bg-neutral-primary-soft [&>img]:h-full [&>img]:w-full [&>img]:object-cover';

export function DeviceMockup({ device, children, label, className }: DeviceMockupProps) {
  const wrap = (node: ReactNode, w: string) => (
    <figure role={label ? 'img' : undefined} aria-label={label} className={cn('mx-auto w-full', w, className)}>
      {node}
    </figure>
  );

  switch (device) {
    case 'iphone':
    case 'android':
      // 448×896 → 1:2
      return wrap(
        <div className="relative aspect-1/2 rounded-xl bg-neutral-quaternary p-3 shadow-xl">
          <span className="absolute top-0 left-1/2 z-10 h-4 w-1/3 -translate-x-1/2 rounded-b-xl bg-neutral-quaternary" aria-hidden />
          <span className="absolute -start-1 top-1/4 h-10 w-1 rounded-s-lg bg-neutral-quaternary" aria-hidden />
          <span className="absolute -end-1 top-1/3 h-14 w-1 rounded-e-lg bg-neutral-quaternary" aria-hidden />
          <div className={cn(screen, device === 'iphone' ? 'rounded-lg' : 'rounded-base')}>{children}</div>
        </div>,
        'max-w-72',
      );
    case 'tablet':
      // 768×1012 → 3:4
      return wrap(
        <div className="aspect-3/4 rounded-xl bg-neutral-quaternary p-4 shadow-xl">
          <div className={cn(screen, 'rounded-lg')}>{children}</div>
        </div>,
        'max-w-md',
      );
    case 'laptop':
      // 896×473: screen 16:10 + base
      return wrap(
        <div className="flex flex-col items-center">
          <div className="w-10/12 rounded-t-xl bg-neutral-quaternary p-2 pb-3 shadow-xl">
            <div className={cn(screen, 'aspect-16/10 rounded-sm')}>{children}</div>
          </div>
          <div className="h-3 w-full rounded-b-xl bg-neutral-tertiary-medium" aria-hidden />
          <div className="h-1.5 w-1/6 rounded-b-lg bg-neutral-quaternary" aria-hidden />
        </div>,
        'max-w-3xl',
      );
    case 'imac':
      // 896×735: 16:9 screen + chin + stand
      return wrap(
        <div className="flex flex-col items-center">
          <div className="w-full rounded-t-xl bg-neutral-quaternary p-3 shadow-xl">
            <div className={cn(screen, 'aspect-video rounded-sm')}>{children}</div>
          </div>
          <div className="h-8 w-full rounded-b-xl bg-neutral-tertiary-medium" aria-hidden />
          <div className="h-16 w-1/5 bg-neutral-tertiary" aria-hidden />
          <div className="h-2 w-1/3 rounded-t-sm bg-neutral-tertiary-medium" aria-hidden />
        </div>,
        'max-w-3xl',
      );
    case 'watch':
      // 320×476 → 2:3 with strap
      return wrap(
        <div className="flex flex-col items-center">
          <div className="h-10 w-1/2 rounded-t-xl bg-neutral-tertiary" aria-hidden />
          <div className="relative aspect-square w-full rounded-xl bg-neutral-quaternary p-3 shadow-xl">
            <span className="absolute -end-1.5 top-1/3 h-8 w-1.5 rounded-e-lg bg-neutral-quaternary" aria-hidden />
            <div className={cn(screen, 'rounded-lg')}>{children}</div>
          </div>
          <div className="h-10 w-1/2 rounded-b-xl bg-neutral-tertiary" aria-hidden />
        </div>,
        'max-w-56',
      );
  }
}
