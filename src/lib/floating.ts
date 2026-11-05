// Positioning for panels anchored to a trigger: Dropdown, Popover, Tooltip, Autocomplete and Datepicker.
//
// The panel stays in the trigger's DOM subtree (no portal), so it keeps the theme and dark-mode scope of a
// `[data-theme]` / `.dark` wrapper, and outside-click checks keep working. It is positioned `fixed`, so a parent with
// `overflow: hidden` or a scroll area (a Table, a Card, a Drawer) no longer clips it; it flips to the other side when
// there is no room and shifts to stay inside the viewport. Only an ancestor with a transform, filter or `contain` can
// still clip it, as with any fixed element.
import { arrow, autoUpdate, flip, offset, shift, size, useFloating, type Placement } from '@floating-ui/react-dom';
import { useRef, type CSSProperties } from 'react';

export type Side = 'top' | 'bottom' | 'left' | 'right';

export interface AnchoredOptions {
  open: boolean;
  placement: Placement;
  /** Distance between trigger and panel in px (Figma: 8 for menus and tooltips, 12 for popovers). */
  gap: number;
  /** Position an arrow element (attach `arrowRef`, style it with `arrowStyle`). */
  withArrow?: boolean;
  /** Make the panel as wide as the trigger (Autocomplete's list under its input). */
  matchWidth?: boolean;
}

const EDGE = 8;

export function useAnchored({ open, placement, gap, withArrow = false, matchWidth = false }: AnchoredOptions) {
  const arrowRef = useRef<HTMLSpanElement>(null);
  const f = useFloating({
    open,
    placement,
    strategy: 'fixed',
    // Only while the panel is mounted: listeners for scroll, resize and layout shifts are removed when it closes.
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(gap),
      flip({ padding: EDGE }),
      shift({ padding: EDGE }),
      matchWidth &&
        size({
          apply({ rects, elements }) {
            elements.floating.style.width = `${rects.reference.width}px`;
          },
        }),
      withArrow && arrow({ element: arrowRef, padding: EDGE }),
    ],
  });
  const side = f.placement.split('-')[0] as Side;
  const a = f.middlewareData.arrow;
  // The arrow sits on the edge facing the trigger (classes per side) and follows the trigger along that edge.
  const arrowStyle: CSSProperties = side === 'top' || side === 'bottom' ? { left: a?.x ?? undefined } : { top: a?.y ?? undefined };
  return {
    setReference: f.refs.setReference,
    setFloating: f.refs.setFloating,
    /** Before the first measurement the panel would flash at 0,0, so it is transparent until positioned. Opacity, not
     *  visibility: a menu or calendar moves focus inside as it opens, and a hidden element cannot take focus. */
    floatingStyles: { ...f.floatingStyles, opacity: f.isPositioned ? undefined : 0 } as CSSProperties,
    placement: f.placement,
    side,
    arrowRef,
    arrowStyle,
  };
}
