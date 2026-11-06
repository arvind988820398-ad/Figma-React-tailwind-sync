// Pieces the three Damia panels share, and the app's micro-interactions. Motion lives on layout wrappers, never on a
// system component's own classes, and every transform or animation is motion-safe: with "reduce motion" on, things
// still change state, they just do not move.
import type { ReactNode } from 'react';
import { FileLinesIcon, FilePdfIcon, FilePptIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { Tooltip } from '../../components/ui/Tooltip';
import type { SourceKind } from './data';

/** Fades and slides a new element in as it mounts (CSS @starting-style through Tailwind's `starting:` variant). */
export const ENTER = 'transition duration-300 ease-out starting:opacity-0 motion-safe:starting:translate-y-2';
/** Scales an element in, for the hero orb and empty states. */
export const POP = 'transition duration-500 ease-out starting:opacity-0 motion-safe:starting:scale-75';
/** Raises a chip or tile slightly under the pointer. */
export const LIFT = 'inline-flex transition-transform duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0';
/** Panel width changes (open, default, closed). */
export const RESIZE = 'transition-all duration-300 ease-out';


/** A panel's title row: the title, then its icon actions. */
export function PanelHeader({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-2 border-b border-default px-4 py-3">
      <h2 className="truncate text-base font-semibold text-heading">{title}</h2>
      <div className="flex shrink-0 items-center gap-1">{children}</div>
    </div>
  );
}

/** An icon-only ghost button with its label as a Tooltip. */
export function IconAction({ label, onClick, children, pressed, disabled, placement = 'bottom' }: { label: string; onClick?: () => void; children: ReactNode; pressed?: boolean; disabled?: boolean; placement?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip content={label} placement={placement}>
      <Button color="ghost" size="xs" iconOnly aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
    </Tooltip>
  );
}

/** The icon of a source's type, coloured as in the reference: slides yellow, documents blue, PDFs red. */
export function SourceIcon({ kind }: { kind: SourceKind }) {
  if (kind === 'slides')
    return (
      <span className="inline-flex text-fg-yellow [&_svg]:size-4" aria-label="Slides" role="img">
        <FilePptIcon />
      </span>
    );
  if (kind === 'pdf')
    return (
      <span className="inline-flex text-fg-danger [&_svg]:size-4" aria-label="PDF" role="img">
        <FilePdfIcon />
      </span>
    );
  return (
    <span className="inline-flex text-fg-brand [&_svg]:size-4" aria-label="Document" role="img">
      <FileLinesIcon />
    </span>
  );
}
