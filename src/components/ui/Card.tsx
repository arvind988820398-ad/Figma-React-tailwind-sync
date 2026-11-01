// AD Design Kit Card — Figma set "Card" (node 1149:34153, page 13559:76418).
// Figma Mobile Version=True is responsive: the base card is p-5 gap-5 below sm (Figma 20px), p-6 gap-6 from sm.
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma "Default" text card and Grid card use p-7, most types p-6 (both p-5 on mobile); `none` for full-bleed layouts. */
  padding?: 'base' | 'roomy' | 'none';
  media?: ReactNode;
}

const paddings = { base: 'gap-5 p-5 sm:gap-6 sm:p-6', roomy: 'gap-5 p-5 sm:gap-6 sm:p-7', none: 'gap-6' } as const;

export function Card({ padding = 'base', media, className, children, ...props }: CardProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-base border border-default bg-neutral-primary-soft shadow-xs', className)} {...props}>
      {media}
      <div className={cn('flex flex-1 flex-col', paddings[padding])}>{children}</div>
    </div>
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-2xl font-semibold leading-8 text-heading', className)} {...props} />;
}

export function CardText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-base text-body', className)} {...props} />;
}
