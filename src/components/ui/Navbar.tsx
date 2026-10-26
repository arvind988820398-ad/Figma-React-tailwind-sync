// AuxoKit Navbar — Figma set "Navbar" (node 1149:74216, page 3279:21067), nav link 1149:74002, mobile menu 1149:75488.
// Breakpoint variants are responsive classes: links show from md, the menu button below md.
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

export interface NavbarProps {
  logo: ReactNode;
  links?: NavbarLink[];
  /** Right side: Secondary + Brand base buttons, icon buttons or an avatar. */
  actions?: ReactNode;
  /** Figma "With search input": a search field between links and actions (md and up). */
  search?: ReactNode;
  /** Pin to the top of the viewport. */
  sticky?: boolean;
  className?: string;
}

export function Navbar({ logo, links = [], actions, search, sticky, className }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  return (
    <nav className={cn('w-full border-b border-default bg-neutral-primary-soft', sticky && 'sticky top-0 z-40', className)}>
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-8 px-4 py-6">
        <div className="flex shrink-0 items-center">{logo}</div>
        {links.length > 0 && (
          <ul className="hidden flex-1 items-center gap-8 md:flex">
            {links.map((l, i) => (
              <li key={i}>
                <NavLink href={l.href} current={l.current} disabled={l.disabled}>{l.label}</NavLink>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-3">
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
          <ul className="flex flex-col gap-3">
            {links.map((l, i) => (
              <li key={i} className="border-b border-light pb-3">
                <NavLink href={l.href} current={l.current} disabled={l.disabled} className="w-full">{l.label}</NavLink>
              </li>
            ))}
          </ul>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>
      )}
    </nav>
  );
}
