// AuxoKit Modal — Figma set "Modal" (node 1149:71305, page 3284:23179), header 1149:71403, footer 1149:71444.
// Uses the native <dialog> element for focus trapping, Esc handling and top-layer stacking.
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
// Figma widths: 384 (Sign In, Popup, OTP), 448 (Share, lists), 576 (Info).
const sizes: Record<ModalSize, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' };

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Destructive confirmations should not close on backdrop click. */
  dismissible?: boolean;
  className?: string;
}

export function Modal({ open, onOpenChange, title, children, footer, size = 'md', dismissible = true, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      onCancel={(e) => { if (!dismissible) e.preventDefault(); }}
      onClick={(e) => { if (dismissible && e.target === e.currentTarget) onOpenChange(false); }}
      className={cn(
        'm-auto w-full rounded-base border border-default bg-neutral-primary-soft p-6 text-body shadow-xl backdrop:bg-black/50',
        sizes[size],
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4 border-b border-default pb-5">
          <h2 id={titleId} className="text-lg font-medium leading-7 text-heading">{title}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="inline-flex size-9 items-center justify-center rounded-base text-body hover:bg-neutral-secondary-medium hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="flex flex-col gap-4 text-base text-body">{children}</div>
        {footer && <footer className="flex items-center gap-4 border-t border-default pt-6">{footer}</footer>}
      </div>
    </dialog>
  );
}
