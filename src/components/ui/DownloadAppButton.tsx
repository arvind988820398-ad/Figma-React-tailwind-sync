// AD Design Kit Download app button — Figma set "Download App Button" (node 1146:24595, page 2542:21012).
// Figma Device → store, Type → tone. Always a link (<a>) to the store listing. The Google Play glyph is simplified;
// follow Apple / Google badge guidelines (or their official badges) when shipping.
// Figma labels both stores "Download on the"; code keeps the store wording ("Get it on" Google Play).
import type { AnchorHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { AppleIcon } from '../icons';

export interface DownloadAppButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  store: 'app-store' | 'google-play';
  tone?: 'light' | 'dark';
  href: string;
}

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
        'inline-flex items-center gap-2 rounded-base border px-4 py-3 transition-colors focus-visible:outline-none [&_svg]:size-7',
        tone === 'dark'
          ? 'border-dark-subtle bg-dark text-white hover:bg-dark-strong focus-visible:shadow-focus-dark'
          : 'border-default-medium bg-neutral-primary-medium text-body hover:bg-neutral-secondary-medium focus-visible:shadow-focus-secondary',
        className,
      )}
      {...props}
    >
      {apple ? <AppleIcon /> : <PlayGlyph />}
      <span className="flex flex-col text-start">
        <span className="text-xs leading-3">{apple ? 'Download on the' : 'Get it on'}</span>
        <span className="text-sm font-bold leading-5">{apple ? 'App Store' : 'Google Play'}</span>
      </span>
    </a>
  );
}
