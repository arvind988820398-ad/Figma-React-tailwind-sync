// AD Design Kit Navbar — Figma set "Navbar" (node 1149:74216, page 3279:21067), nav link 1149:74002, mobile menu 1149:75488.
// Breakpoint variants are responsive classes. Figma Desktop = lg, Tablet = md, Mobile = below md:
// links show from `linksFrom` (md, or lg for Centered logo / With search), the menu button below it; `tabletLinks`
// keeps the first N links between md and lg and moves the rest into a "More" menu (Figma Tablet). `actions` show from md;
// `mobileActions` are the controls Figma keeps beside the menu button on Mobile (Login, icon buttons).
// Size: base = py-6 bar (Figma Size=Default); compact = py-1, 44px tall with sm controls (Figma Size=Compact).
// `fluid` drops the centered max-w-screen-xl container so the bar spans an app shell (Figma Width=Fluid).
// `centered` = Figma Type "Centered logo": links left · logo centre · actions right.
// `search` = Figma Type "With search input": the field sits beside the logo, links move right.
import { useId, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AngleDownIcon, BarsIcon, CloseIcon } from '../icons';
import { Dropdown, DropdownItem } from './Dropdown';

export interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  current?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  /** Figma Nav link "Right icon" / "Two icons": e.g. a chevron after "Products". */
  rightIcon?: ReactNode;
}

/** Figma "Nav link" Default: Initial text-body · Hover/Active text-fg-brand · Disabled text-fg-disabled. */
export function NavLink({ current, disabled, icon, rightIcon, className, children, ...props }: NavLinkProps) {
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
      {rightIcon}
    </a>
  );
}

export interface NavbarLink {
  label: ReactNode;
  href: string;
  current?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
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
  /** Figma "With search input": a search field beside the logo (md and up); the links move to the right. */
  search?: ReactNode;
  /** Breakpoint from which the links row shows; below it the menu button. Default md (lg when centered or search). */
  linksFrom?: 'md' | 'lg';
  /** Figma Tablet: between md and lg show only the first N links and a "More" menu with the rest. */
  tabletLinks?: number;
  /** Figma Mobile: controls kept beside the menu button below md (e.g. a Login button or icon buttons). */
  mobileActions?: ReactNode;
  /** Figma "Centered logo": links on the left, logo in the middle, actions on the right (md and up). */
  centered?: boolean;
  /** Pin to the top of the viewport. */
  sticky?: boolean;
  className?: string;
}

const fromClasses = {
  md: { links: 'hidden md:flex', menu: 'md:hidden', grid: 'md:grid md:grid-cols-3', center: 'md:justify-self-center', end: 'md:justify-self-end', first: 'md:order-first' },
  lg: { links: 'hidden lg:flex', menu: 'lg:hidden', grid: 'lg:grid lg:grid-cols-3', center: 'lg:justify-self-center', end: 'lg:justify-self-end', first: 'lg:order-first' },
};

export function Navbar({
  logo,
  size = 'base',
  fluid = false,
  links = [],
  actions,
  search,
  linksFrom,
  tabletLinks,
  mobileActions,
  centered = false,
  sticky,
  className,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const from = fromClasses[linksFrom ?? (centered || search ? 'lg' : 'md')];
  const overflow = tabletLinks !== undefined && links.length > tabletLinks ? links.slice(tabletLinks) : [];

  return (
    <nav className={cn('w-full border-b border-default bg-neutral-primary-soft', sticky && 'sticky top-0 z-40', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-4 px-4 md:gap-8',
          centered && from.grid,
          !fluid && 'mx-auto max-w-screen-xl',
          size === 'compact' ? 'py-1' : 'py-6',
        )}
      >
        <div className={cn('flex shrink-0 items-center gap-4', centered && from.center)}>
          {logo}
          {search && <div className="hidden md:block">{search}</div>}
        </div>
        {links.length > 0 && (
          <ul className={cn(from.links, 'flex-1 items-center gap-6', centered && from.first, search && 'justify-end')}>
            {links.map((l, i) => (
              <li key={i} className={cn(tabletLinks !== undefined && i >= tabletLinks && 'md:hidden lg:list-item')}>
                <NavLink href={l.href} current={l.current} disabled={l.disabled} icon={l.icon} rightIcon={l.rightIcon}>{l.label}</NavLink>
              </li>
            ))}
            {overflow.length > 0 && (
              <li className="lg:hidden">
                <Dropdown
                  label="More links"
                  trigger={
                    <button type="button" className="inline-flex items-center gap-1.5 rounded text-sm font-medium leading-5 text-body hover:text-fg-brand focus-visible:shadow-focus-brand focus-visible:outline-none">
                      More <AngleDownIcon className="size-4" />
                    </button>
                  }
                >
                  {overflow.map((l, i) => (
                    <DropdownItem key={i} disabled={l.disabled} onSelect={() => window.location.assign(l.href)}>
                      {l.label}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </li>
            )}
          </ul>
        )}
        <div className={cn('flex items-center gap-3', centered && from.end)}>
          {actions && <div className="hidden items-center gap-3 md:flex">{actions}</div>}
          {mobileActions && <div className="flex items-center gap-1 md:hidden">{mobileActions}</div>}
          <button
            type="button"
            aria-controls={menuId}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-base text-heading hover:bg-neutral-secondary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none',
              from.menu,
            )}
          >
            {menuOpen ? <CloseIcon className="size-5" /> : <BarsIcon className="size-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id={menuId} className={cn('flex flex-col gap-4 border-t border-default bg-neutral-primary-soft p-4', from.menu)}>
          {/* Search and actions already show in the bar from md. */}
          {search && <div className="md:hidden">{search}</div>}
          {links.length > 0 && (
          <ul className="flex flex-col gap-3">
            {links.map((l, i) => (
              <li key={i} className="border-b border-light pb-3">
                <NavLink href={l.href} current={l.current} disabled={l.disabled} icon={l.icon} rightIcon={l.rightIcon} className="w-full">{l.label}</NavLink>
              </li>
            ))}
          </ul>
          )}
          {actions && <div className="flex gap-3 md:hidden">{actions}</div>}
        </div>
      )}
    </nav>
  );
}
