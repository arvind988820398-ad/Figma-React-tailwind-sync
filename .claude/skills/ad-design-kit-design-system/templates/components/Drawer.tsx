// AD Design Kit Drawer — Figma set "Drawer" (node 1149:37097, page 13261:80923), heading 1149:37184, footer 1149:37232.
// Native <dialog> (focus trap, Esc, top layer) pinned to an edge. Body content (forms, lists, alerts, navigation)
// is composed from other AD Design Kit components.
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type DrawerPlacement = 'start' | 'end' | 'bottom';
export type DrawerSize = 'sm' | 'md';

// Figma widths: 320 (forms, navigation), 384 (default/list content).
const widths: Record<DrawerSize, string> = { sm: 'w-80', md: 'w-96' };

const placements: Record<DrawerPlacement, string> = {
  start: 'inset-y-0 start-0 end-auto h-dvh max-h-dvh max-w-full',
  end: 'inset-y-0 end-0 start-auto h-dvh max-h-dvh max-w-full',
  bottom: 'inset-x-0 bottom-0 top-auto h-auto max-h-svh w-full max-w-none rounded-t-base',
};

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  className?: string;
}

export function Drawer({ open, onOpenChange, title, children, footer, placement = 'start', size = 'sm', className }: DrawerProps) {
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
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
      className={cn(
        'fixed m-0 bg-neutral-primary-soft text-body shadow-xl backdrop:bg-black/50',
        placements[placement],
        placement !== 'bottom' && widths[size],
        className,
      )}
    >
      <div className="flex h-full flex-col gap-5 overflow-y-auto p-5">
        {placement === 'bottom' && <div className="mx-auto h-1.5 w-8 shrink-0 rounded-full bg-neutral-quaternary" aria-hidden />}
        <header className="flex items-center justify-between gap-4 border-b border-default pb-4">
          <h2 id={titleId} className="text-lg font-medium leading-6 text-heading">{title}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-base text-body hover:bg-neutral-secondary-medium hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="flex flex-1 flex-col gap-4 text-base text-body">{children}</div>
        {footer && <footer className="flex gap-4 border-t border-default pt-5">{footer}</footer>}
      </div>
    </dialog>
  );
}
