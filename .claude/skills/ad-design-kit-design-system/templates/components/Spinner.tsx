// AD Design Kit Spinner — Figma set "Spinner" (node 1149:83311, page 3284:24046).
import type { SVGAttributes } from 'react';
import { cn } from '../../lib/cn';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Figma sizes: xs 12 · sm 24 · md 50 · lg 75 · xl 100.
const sizes: Record<SpinnerSize, string> = { xs: 'size-3', sm: 'size-6', md: 'size-12.5', lg: 'size-18.75', xl: 'size-25' }; // ad-design-kit-lint-ignore: Figma pixel sizes 50/75

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  size?: SpinnerSize;
  track?: boolean;
  label?: string;
}

export function Spinner({ size = 'sm', track = true, label = 'Loading…', className, ...props }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex">
      <svg viewBox="0 0 100 101" className={cn('animate-spin', sizes[size], className)} aria-hidden {...props}>
        {track && (
          <path
            className="fill-neutral-quaternary"
            d="M100 50.59c0 27.615-22.386 50.001-50 50.001S0 78.205 0 50.59 22.386.59 50 .59s50 22.386 50 50zm-90.919 0c0 22.6 18.32 40.92 40.919 40.92s40.919-18.32 40.919-40.92C90.919 27.99 72.599 9.67 50 9.67S9.081 27.99 9.081 50.59z"
          />
        )}
        <path
          className="fill-brand"
          d="M93.968 39.04c2.425-.636 3.894-3.128 3.04-5.486A50 50 0 0 0 41.735 1.279c-2.474.414-3.922 2.919-3.285 5.344.637 2.426 3.12 3.852 5.6 3.484a40.916 40.916 0 0 1 44.131 25.769c.902 2.34 3.361 3.802 5.787 3.165z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
