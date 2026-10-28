// AuxoKit Device mockup — Figma set "Mockups" (node 1149:41354, page 702:18224).
// Figma Type → device: iPhone=iphone · Android=android · Android & pen=android-pen (phone with a stylus beside it) ·
// Stylus pen=stylus (the pen alone) · Tablet=tablet · Laptop=laptop · iMac=imac · Smartwatch=watch.
// Bezels bg-neutral-quaternary, stands and pen caps bg-neutral-tertiary(-medium).
// Children fill the screen slot (an <img> or any content); sizes keep the Figma aspect ratios and scale with width.
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type Device = 'iphone' | 'android' | 'android-pen' | 'stylus' | 'tablet' | 'laptop' | 'imac' | 'watch';

export interface DeviceMockupProps {
  device: Device;
  /** Screen content; images fill and crop to the screen. */
  children: ReactNode;
  /** Accessible description of what the screen shows. */
  label?: string;
  className?: string;
}

const screen = 'relative h-full w-full overflow-hidden bg-neutral-primary-soft [&>img]:h-full [&>img]:w-full [&>img]:object-cover';

/** Figma "Stylus pen": cap, body and tip, drawn with the bezel tokens. */
function Pen({ className }: { className?: string }) {
  return (
    <div className={cn('flex w-5 flex-col items-center', className)} aria-hidden>
      <span className="h-3 w-3 rounded-t-full bg-neutral-tertiary-medium" />
      <span className="h-56 w-full rounded-sm bg-neutral-quaternary shadow-xl" />
      <span className="h-5 w-2 rounded-b-full bg-neutral-tertiary-medium" />
    </div>
  );
}

/** 448×896 phone frame shared by iPhone, Android and Android & pen. */
function Phone({ rounded, children }: { rounded: string; children: ReactNode }) {
  return (
    <div className="relative aspect-1/2 rounded-xl bg-neutral-quaternary p-3 shadow-xl">
      <span className="absolute top-0 left-1/2 z-10 h-4 w-1/3 -translate-x-1/2 rounded-b-xl bg-neutral-quaternary" aria-hidden />
      <span className="absolute -start-1 top-1/4 h-10 w-1 rounded-s-lg bg-neutral-quaternary" aria-hidden />
      <span className="absolute -end-1 top-1/3 h-14 w-1 rounded-e-lg bg-neutral-quaternary" aria-hidden />
      <div className={cn(screen, rounded)}>{children}</div>
    </div>
  );
}

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
      return wrap(<Phone rounded={device === 'iphone' ? 'rounded-lg' : 'rounded-base'}>{children}</Phone>, 'max-w-72');
    case 'android-pen':
      // Phone with the stylus leaning beside it.
      return wrap(
        <div className="flex items-end justify-center gap-4">
          <Pen className="mb-8 -rotate-12" />
          <div className="w-full max-w-72">
            <Phone rounded="rounded-base">{children}</Phone>
          </div>
        </div>,
        'max-w-80',
      );
    case 'stylus':
      // The pen alone; `children` is not rendered (there is no screen).
      return wrap(<Pen className="mx-auto" />, 'max-w-72');
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
