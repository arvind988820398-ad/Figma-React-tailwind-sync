// Shared <svg> wrapper for the generated Figma icons (figma.tsx).
// Icons are 1em squares that inherit the text colour, so a parent's text size or [&_svg]:size-* rule sizes them.
// Decorative by default (aria-hidden); pass `title` when the icon is the only content of its control.
import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Accessible name; without it the icon is hidden from assistive technology. */
  title?: string;
}

export function createIcon(name: string, viewBox: string, children: ReactNode) {
  function Icon({ title, ...props }: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        width="1em"
        height="1em"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        focusable="false"
        data-icon={name}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        {children}
      </svg>
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}
