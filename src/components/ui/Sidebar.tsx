// AD Design Kit Sidebar — Figma set "Sidebar (Free component)" (node 1149:82628, page 3279:34616),
// item 1149:82699, header 1149:82737. Figma "Contracted" → `collapsed` (icons only, labels in tooltips).
// Figma Type "Double sidebar" → `rail`: a collapsed icon rail for the app's areas beside the panel for the current area.
// Items with `items` are the Figma expandable Navigation list items (chevron, indented sub-pages). The Figma
// "Sidebar header" Type=User select is `SidebarUser` (pass it as `header` with `headerDivider={false}`, or as `footer`).
import { useId, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AngleDownIcon, AngleUpIcon, ChevronSortIcon } from '../icons';
import { Avatar } from './Avatar';
import { Tooltip } from './Tooltip';

export interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  current?: boolean;
  disabled?: boolean;
  /** Trailing count, e.g. <Badge color="danger" size="sm">3</Badge>. */
  badge?: ReactNode;
  /** Second line under the label (e.g. a timestamp). Code ahead of Figma: see figma-audit.md. */
  meta?: ReactNode;
  /** Item actions, e.g. a <Dropdown> with a ghost xs kebab Button. Rendered beside the link (never inside it),
   *  shown on hover and keyboard focus, always on touch screens. Code ahead of Figma: see figma-audit.md. */
  actions?: ReactNode;
  /** Sub-pages: the item becomes an expandable group (button with a chevron) listing them indented. */
  items?: SidebarItem[];
  /** Start expanded. Default: expanded when a sub-page is current. */
  defaultOpen?: boolean;
}

export interface SidebarProps {
  /** Header: logo or heading (gets the bottom divider), or a SidebarUser. */
  header?: ReactNode;
  /** Bottom divider under the header (Figma Sidebar header Type=Logo). Off for a User select header. */
  headerDivider?: boolean;
  /** Sections after the first are separated by a top border. */
  sections: SidebarItem[][];
  /** Bottom slot, e.g. Figma "With alert": <Alert variant="complex" color="info">. Hidden when collapsed. */
  footer?: ReactNode;
  collapsed?: boolean;
  /** Accessible name for the navigation landmark. */
  label?: string;
  /** Figma "Double sidebar": an icon rail (collapsed sidebar) before the panel, separated by a border. The panel's
   *  header is usually the area title plus a small search Input. */
  rail?: { sections: SidebarItem[][]; header?: ReactNode; label?: string };
  className?: string;
}

const itemBase = 'flex items-center gap-1.5 rounded-base text-base font-medium transition-colors focus-visible:shadow-focus-brand focus-visible:outline-none [&_svg]:size-5 [&_svg]:shrink-0';
const itemState = (current?: boolean, disabled?: boolean) =>
  disabled
    ? 'pointer-events-none text-fg-disabled'
    : current
      ? 'bg-neutral-secondary-medium text-fg-brand'
      : 'text-body hover:bg-neutral-secondary-medium hover:text-fg-brand';

/** Figma expandable Navigation list item: icon, label and chevron; sub-pages indented to the label. */
function Group({ item }: { item: SidebarItem }) {
  const childCurrent = item.items!.some((i) => i.current);
  const [open, setOpen] = useState(item.defaultOpen ?? childCurrent);
  const id = useId();
  const Chevron = open ? AngleUpIcon : AngleDownIcon;
  return (
    <li className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        disabled={item.disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(itemBase, 'w-full px-2 py-1.5 text-start', itemState(item.current || childCurrent, item.disabled))}
      >
        {item.icon}
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge}
        <Chevron className="size-4!" />
      </button>
      {open && (
        <ul id={id} className="flex flex-col gap-2 ps-7">
          {item.items!.map((sub) => (
            <Item key={sub.label} item={sub} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Item({ item, collapsed }: { item: SidebarItem; collapsed?: boolean }) {
  if (item.items && !collapsed) return <Group item={item} />;
  const link = (
    <a
      href={item.href}
      aria-current={item.current ? 'page' : undefined}
      aria-disabled={item.disabled || undefined}
      aria-label={collapsed ? item.label : undefined}
      tabIndex={item.disabled ? -1 : undefined}
      className={cn(
        itemBase,
        collapsed ? 'size-9 justify-center' : 'px-2 py-1.5',
        !collapsed && item.actions && 'pe-10',
        itemState(item.current || item.items?.some((i) => i.current), item.disabled),
      )}
    >
      {item.icon}
      {!collapsed &&
        (item.meta ? (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate">{item.label}</span>
            <span className="truncate text-xs font-normal leading-4 text-body">{item.meta}</span>
          </span>
        ) : (
          <span className="flex-1 truncate">{item.label}</span>
        ))}
      {!collapsed && item.badge}
    </a>
  );
  if (collapsed) return <li><Tooltip content={item.label} placement="right">{link}</Tooltip></li>;
  if (!item.actions) return <li>{link}</li>;
  return (
    <li className="group/item relative focus-within:z-10 has-[[aria-expanded=true]]:z-10">
      {link}
      <div className="absolute end-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover/item:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 pointer-coarse:opacity-100">
        {item.actions}
      </div>
    </li>
  );
}

export interface SidebarUserProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  email: string;
  /** Avatar photo; initials when missing. */
  src?: string;
}

/** Figma "Sidebar header" Type=User select: avatar, name and email with a sort chevron, e.g. an account switcher trigger. */
export function SidebarUser({ name, email, src, className, ...props }: SidebarUserProps) {
  return (
    <button // ad-design-kit-lint-ignore: Figma Sidebar header "User select" part, not a Button variant
      type="button"
      className={cn(
        'flex w-full items-center gap-2 rounded-base p-2 text-start transition-colors hover:bg-neutral-secondary-medium focus-visible:shadow-focus-brand focus-visible:outline-none',
        className,
      )}
      {...props}
    >
      <Avatar src={src} name={name} size="base" />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate text-base font-medium leading-4 text-heading">{name}</span>
        <span className="truncate text-sm leading-4 text-body">{email}</span>
      </span>
      <ChevronSortIcon className="size-5 shrink-0 text-body" />
    </button>
  );
}

export function Sidebar({ header, headerDivider = true, sections, footer, collapsed = false, label = 'Sidebar', rail, className }: SidebarProps) {
  if (rail) {
    return (
      <div className={cn('flex h-full', className)}>
        <Sidebar collapsed header={rail.header} sections={rail.sections} label={rail.label ?? 'Areas'} className="border-e border-default" />
        <Sidebar header={header} headerDivider={headerDivider} sections={sections} footer={footer} label={label} />
      </div>
    );
  }
  return (
    <nav
      aria-label={label}
      className={cn(
        'flex h-full flex-col bg-neutral-primary-soft',
        collapsed ? 'w-16 items-center gap-4 px-0 py-5' : 'w-72 gap-5 p-5',
        className,
      )}
    >
      {header && (
        <div className={cn(headerDivider && cn('border-b border-default', collapsed ? 'pb-4' : 'pb-5'), collapsed && 'flex w-full justify-center')}>{header}</div>
      )}
      {/* Figma "Content": the item lists, 16px apart. */}
      <div className={cn('flex flex-col gap-4', collapsed && 'w-full items-center')}>
        {sections.map((items, i) => (
          <ul key={i} className={cn('flex flex-col gap-2', i > 0 && 'border-t border-default pt-4', collapsed && 'w-full items-center')}>
            {items.map((item) => (
              <Item key={item.label} item={item} collapsed={collapsed} />
            ))}
          </ul>
        ))}
      </div>
      {footer && !collapsed && <div className="mt-auto">{footer}</div>}
    </nav>
  );
}
