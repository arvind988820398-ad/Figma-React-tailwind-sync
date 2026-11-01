// AD Design Kit Modal — Figma set "Modal" (node 1149:71305, page 3284:23179), header 1149:71403, footer 1149:71444.
// Uses the native <dialog> element for focus trapping, Esc handling and top-layer stacking.
// Figma "Modal header" types → props: Default = title · Heading & supporting text / With Logo / Icon + Heading & helper
// text = `icon` + `description`. Figma Popup and With progress bar have no header: `header={false}` keeps only a
// floating close button and moves the title to screen readers.
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
// Figma widths: 384 (Sign In, Popup, OTP), 448 (Share, lists), 576 (Info).
const sizes: Record<ModalSize, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' };

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Header title; with `header={false}` it only names the dialog for screen readers. */
  title: ReactNode;
  /** Figma header "With Logo" (a 24px logo) or "Icon + Heading & helper text" (an IconShape) before the title. */
  icon?: ReactNode;
  /** Supporting line under the title ("Enter your details"). */
  description?: ReactNode;
  /** false = no header row or divider, only the close button in the top corner (Figma Popup, With progress bar). */
  header?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Destructive confirmations should not close on backdrop click. */
  dismissible?: boolean;
  className?: string;
}

export function Modal({ open, onOpenChange, title, icon, description, header = true, children, footer, size = 'md', dismissible = true, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const closeButton = (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      aria-label="Close"
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-base text-body hover:bg-neutral-secondary-medium hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none"
    >
      <CloseIcon className="size-4" />
    </button>
  );

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Only this dialog's own close/cancel: a dialog opened inside this one closes on its own.
      onClose={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
      onCancel={(e) => { if (!dismissible && e.target === e.currentTarget) e.preventDefault(); }}
      onClick={(e) => { if (dismissible && e.target === e.currentTarget) onOpenChange(false); }}
      className={cn(
        'm-auto w-full rounded-base border border-default bg-neutral-primary-soft p-6 text-body shadow-xl backdrop:bg-black/50',
        sizes[size],
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        {header ? (
          <header className="flex items-center justify-between gap-4 border-b border-default pb-5">
            <div className="flex min-w-0 items-center gap-3">
              {icon && <span className="inline-flex shrink-0 text-heading [&>svg]:size-6">{icon}</span>}
              <div className="flex min-w-0 flex-col">
                <h2 id={titleId} className="text-lg font-medium leading-7 text-heading">{title}</h2>
                {description && <p className="text-base leading-6 text-body">{description}</p>}
              </div>
            </div>
            {closeButton}
          </header>
        ) : (
          <>
            <h2 id={titleId} className="sr-only">{title}</h2>
            <div className="absolute end-1.5 top-1.5">{closeButton}</div>
          </>
        )}
        <div className="flex flex-col gap-4 text-base text-body">{children}</div>
        {footer && <footer className="flex items-center gap-4 border-t border-default pt-6">{footer}</footer>}
      </div>
    </dialog>
  );
}
