// AuxoKit Download app button — Figma set "Download App Button" (node 1146:24595, page 2542:21012).
// Figma Device → store, Type → tone. Always a link (<a>) to the store listing. The glyphs here are simplified;
// follow Apple / Google badge guidelines (or their official badges) when shipping.
import type { AnchorHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface DownloadAppButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  store: 'app-store' | 'google-play';
  tone?: 'light' | 'dark';
  href: string;
}

const AppleGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9zM14 5.6c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
  </svg>
);
const PlayGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 2.6v18.8c0 .3.3.5.6.3L15 12 4.6 2.3c-.3-.2-.6 0-.6.3zm12.2 10.5-2.3 2.2 3.6 2.1 2.9-1.7c.6-.4.6-1.2 0-1.6l-2.9-1.7-1.3 1.3v-.6zM5.6 2.2 16.2 8.4l-2.3 2.2zm8.3 10.8L5.6 21.8l10.6-6.2z" />
  </svg>
);

export function DownloadAppButton({ store, tone = 'dark', className, ...props }: DownloadAppButtonProps) {
  const apple = store === 'app-store';
  return (
    <a
      className={cn(
        'inline-flex items-center gap-3 rounded-base px-4 py-2.5 transition-colors focus-visible:outline-none [&_svg]:size-7',
        tone === 'dark'
          ? 'bg-dark text-white hover:bg-dark-strong focus-visible:shadow-focus-dark'
          : 'border border-default bg-neutral-primary-soft text-heading hover:bg-neutral-secondary-medium focus-visible:shadow-focus-secondary',
        className,
      )}
      {...props}
    >
      {apple ? <AppleGlyph /> : <PlayGlyph />}
      <span className="flex flex-col text-start">
        <span className="text-xs leading-4">{apple ? 'Download on the' : 'Get it on'}</span>
        <span className="text-base font-semibold leading-5">{apple ? 'App Store' : 'Google Play'}</span>
      </span>
    </a>
  );
}
