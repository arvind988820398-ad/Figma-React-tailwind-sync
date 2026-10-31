// AD Design Kit Navbar — Figma set "Navbar" (node 1149:74216, page 3279:21067), nav link 1149:74002, mobile menu 1149:75488.
// Breakpoint variants are responsive classes: links show from md, the menu button below md.
// Size: base = py-6 bar (Figma Size=Default); compact = py-1, 44px tall with sm controls (Figma Size=Compact).
// `fluid` drops the centered max-w-screen-xl container so the bar spans an app shell (Figma Width=Fluid).
// `centered` = Figma Type "Centered logo": from md, links left · logo centre · actions right (gap-6 between links).
import { useId, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  current?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

/** Figma "Nav link" Default: Initial text-body · Hover/Active text-fg-brand · Disabled text-fg-disabled. */
export function NavLink({ current, disabled, icon, className, children, ...props }: NavLinkProps) {
  return (
    <a
      aria-current={current ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded text-sm font-medium leading-5 transition-colors focus-visible:shadow-focus-brand focus-visible:outline-none [&_svg]:size-4.5',
        disabled ? 'pointer-events-none text-fg-disabled' : current ? 'text-fg-brand' : 'text-body hover:text-fg-brand',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </a>
  );
}

export interface NavbarLink {
  label: ReactNode;
  href: string;
  current?: boolean;
  disabled?: boolean;
}

export type NavbarSize = 'base' | 'compact';

export interface NavbarProps {
  logo: ReactNode;
  /** base = Figma bar (py-6). compact = dense app bar (py-1; pair with sm controls for a 44px header). */
  size?: NavbarSize;
  /** Full-width content row (app shells) instead of the centered max-w-screen-xl container. */
  fluid?: boolean;
  links?: NavbarLink[];
  /** Right side: Secondary + Brand base buttons, icon buttons or an avatar. */
  actions?: ReactNode;
  /** Figma "With search input": a search field between links and actions (md and up). */
  search?: ReactNode;
  /** Figma "Centered logo": links on the left, logo in the middle, actions on the right (md and up). */
  centered?: boolean;
  /** Pin to the top of the viewport. */
  sticky?: boolean;
  className?: string;
}

export function Navbar({ logo, size = 'base', fluid = false, links = [], actions, search, centered = false, sticky, className }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  return (
    <nav className={cn('w-full border-b border-default bg-neutral-primary-soft', sticky && 'sticky top-0 z-40', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-8 px-4',
          centered && 'md:grid md:grid-cols-3',
          !fluid && 'mx-auto max-w-screen-xl',
          size === 'compact' ? 'py-1' : 'py-6',
        )}
      >
        <div className={cn('flex shrink-0 items-center', centered && 'md:justify-self-center')}>{logo}</div>
        {links.length > 0 && (
          <ul className={cn('hidden flex-1 items-center md:flex', centered ? 'gap-6 md:order-first' : 'gap-8')}>
            {links.map((l, i) => (
              <li key={i}>
                <NavLink href={l.href} current={l.current} disabled={l.disabled}>{l.label}</NavLink>
              </li>
            ))}
          </ul>
        )}
        <div className={cn('flex items-center gap-3', centered && 'md:justify-self-end')}>
          {search && <div className="hidden md:block">{search}</div>}
          {actions && <div className="hidden items-center gap-3 md:flex">{actions}</div>}
          <button
            type="button"
            aria-controls={menuId}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center rounded-base text-heading hover:bg-neutral-secondary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none md:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" d={menuOpen ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id={menuId} className="flex flex-col gap-4 border-t border-default bg-neutral-primary-soft p-4 md:hidden">
          {search}
          {links.length > 0 && (
          <ul className="flex flex-col gap-3">
            {links.map((l, i) => (
              <li key={i} className="border-b border-light pb-3">
                <NavLink href={l.href} current={l.current} disabled={l.disabled} className="w-full">{l.label}</NavLink>
              </li>
            ))}
          </ul>
          )}
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
      )}
    </nav>
  );
}
