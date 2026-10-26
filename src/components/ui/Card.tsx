// AuxoKit Card — Figma set "Card" (node 1149:34153, page 13559:76418).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma "Default" text card uses p-7; image/pricing cards use p-6. */
  padding?: 'base' | 'roomy' | 'none';
  media?: ReactNode;
}

const paddings = { base: 'p-6', roomy: 'p-7', none: '' } as const;

export function Card({ padding = 'base', media, className, children, ...props }: CardProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-base border border-default bg-neutral-primary-soft shadow-xs', className)} {...props}>
      {media}
      <div className={cn('flex flex-1 flex-col gap-6', paddings[padding])}>{children}</div>
    </div>
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-2xl font-semibold tracking-tight text-heading', className)} {...props} />;
}

export function CardText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-base text-body', className)} {...props} />;
}
