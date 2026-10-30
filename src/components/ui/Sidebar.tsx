// AD Design Kit Sidebar — Figma set "Sidebar (Free component)" (node 1149:82628, page 3279:34616),
// item 1149:82699, header 1149:82737. Figma "Contracted" → `collapsed` (icons only, labels in tooltips).
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Tooltip } from './Tooltip';

export interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  current?: boolean;
  disabled?: boolean;
  /** Trailing count, e.g. <Badge color="danger" size="sm">3</Badge>. */
  badge?: ReactNode;
}

export interface SidebarProps {
  /** Header: logo or heading (gets the bottom divider). */
  header?: ReactNode;
  /** Sections after the first are separated by a top border. */
  sections: SidebarItem[][];
  /** Bottom slot, e.g. Figma "With alert": <Alert variant="complex" color="info">. Hidden when collapsed. */
  footer?: ReactNode;
  collapsed?: boolean;
  /** Accessible name for the navigation landmark. */
  label?: string;
  className?: string;
}

function Item({ item, collapsed }: { item: SidebarItem; collapsed?: boolean }) {
  const link = (
    <a
      href={item.href}
      aria-current={item.current ? 'page' : undefined}
      aria-disabled={item.disabled || undefined}
      aria-label={collapsed ? item.label : undefined}
      tabIndex={item.disabled ? -1 : undefined}
      className={cn(
        'flex items-center gap-1.5 rounded-base text-base font-medium transition-colors focus-visible:shadow-focus-brand focus-visible:outline-none [&_svg]:size-5 [&_svg]:shrink-0',
        collapsed ? 'size-10 justify-center' : 'px-2 py-1.5',
        item.disabled
          ? 'pointer-events-none text-fg-disabled'
          : item.current
            ? 'bg-neutral-secondary-medium text-fg-brand'
            : 'text-body hover:bg-neutral-secondary-medium hover:text-fg-brand',
      )}
    >
      {item.icon}
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge}
    </a>
  );
  return <li>{collapsed ? <Tooltip content={item.label} placement="right">{link}</Tooltip> : link}</li>;
}

export function Sidebar({ header, sections, footer, collapsed = false, label = 'Sidebar', className }: SidebarProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'flex h-full flex-col bg-neutral-primary-soft',
        collapsed ? 'w-16 items-center gap-4 px-0 py-5' : 'w-72 gap-5 p-5',
        className,
      )}
    >
      {header && <div className={cn('border-b border-default pb-4', collapsed && 'flex w-full justify-center')}>{header}</div>}
      {sections.map((items, i) => (
        <ul key={i} className={cn('flex flex-col gap-2', i > 0 && 'border-t border-default pt-4', collapsed && 'items-center')}>
          {items.map((item) => (
            <Item key={item.label} item={item} collapsed={collapsed} />
          ))}
        </ul>
      ))}
      {footer && !collapsed && <div className="mt-auto">{footer}</div>}
    </nav>
  );
}
