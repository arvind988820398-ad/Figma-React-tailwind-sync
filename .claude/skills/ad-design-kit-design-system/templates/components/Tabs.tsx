// AD Design Kit Tabs — Figma set "Nav tabs" (node 1149:80530, page 3283:24214), tab 1149:80596.
// Figma Type → variant: Default=text · Border bottom=underline · Pills=pills · Button=button · Button group=segmented ·
// Vertical pills=vertical-pills · Vertical with list item=vertical-list. Mobile = horizontal scroll (overflow-x-auto).
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';

export type TabsVariant = 'text' | 'underline' | 'pills' | 'button' | 'segmented' | 'vertical-pills' | 'vertical-list';

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  content?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: TabsVariant;
  /** Accessible name for the tab list. */
  label?: string;
  className?: string;
}

const focus = 'focus-visible:outline-none focus-visible:shadow-focus-brand';
const tabBase = `inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors [&_svg]:size-4 disabled:pointer-events-none disabled:text-fg-disabled ${focus}`;
const pill = 'rounded-base px-4 py-2.5';
const pillActive = 'bg-brand text-white';
const pillIdle = 'text-body hover:bg-neutral-secondary-medium hover:text-heading';
// Button / Button group: Tertiary items; the selected one uses the Tertiary Hover style.
const tertiaryActive = 'bg-neutral-secondary-medium text-heading';

const styles: Record<TabsVariant, { list: string; tab: (active: boolean) => string }> = {
  text: { list: 'flex gap-6', tab: (a) => cn(tabBase, 'rounded', a ? 'text-fg-brand' : 'text-body hover:text-fg-brand') },
  underline: {
    list: 'flex gap-6 border-b border-default',
    tab: (a) => cn(tabBase, '-mb-px border-b pb-4', a ? 'border-brand text-fg-brand' : 'border-transparent text-body hover:text-fg-brand'),
  },
  pills: { list: 'flex gap-6', tab: (a) => cn(tabBase, pill, a ? pillActive : pillIdle) },
  button: { list: 'flex gap-3', tab: (a) => cn(buttonVariants({ color: 'tertiary', size: 'sm' }), a && tertiaryActive) },
  segmented: {
    list: 'inline-flex -space-x-px rounded-base shadow-xs',
    tab: (a) => cn(buttonVariants({ color: 'tertiary', size: 'sm' }), 'rounded-none shadow-none first:rounded-s-base last:rounded-e-base', a && tertiaryActive),
  },
  'vertical-pills': { list: 'flex flex-col gap-2', tab: (a) => cn(tabBase, pill, 'w-full', a ? pillActive : pillIdle) },
  'vertical-list': {
    list: 'flex flex-col gap-2',
    tab: (a) => cn(tabBase, pill, 'w-full border', a ? cn(pillActive, 'border-brand') : cn(pillIdle, 'border-default bg-neutral-primary-soft')),
  },
};

export function Tabs({ items, value, onValueChange, variant = 'text', label, className }: TabsProps) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const vertical = variant.startsWith('vertical');
  const s = styles[variant];
  const hasPanels = items.some((i) => i.content !== undefined);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    if (![...keys, 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const enabled = items.filter((i) => !i.disabled);
    const idx = enabled.findIndex((i) => i.value === value);
    const next =
      e.key === 'Home' ? enabled[0] : e.key === 'End' ? enabled[enabled.length - 1] : enabled[(idx + (e.key === keys[1] ? 1 : -1) + enabled.length) % enabled.length];
    onValueChange(next.value);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };

  return (
    <div className={cn(vertical ? 'flex flex-col gap-6 md:flex-row' : 'flex flex-col gap-6', className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        onKeyDown={onKeyDown}
        className={cn(s.list, !vertical && 'max-w-full overflow-x-auto', vertical && 'md:w-56 md:shrink-0')}
      >
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`${id}-tab-${item.value}`}
              data-value={item.value}
              aria-selected={active}
              aria-controls={hasPanels ? `${id}-panel-${item.value}` : undefined}
              tabIndex={active ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              className={s.tab(active)}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
      {hasPanels &&
        items.map((item) => (
          <div
            key={item.value}
            role="tabpanel"
            id={`${id}-panel-${item.value}`}
            aria-labelledby={`${id}-tab-${item.value}`}
            hidden={item.value !== value}
            tabIndex={0}
            className="min-w-0 flex-1 text-base text-body focus-visible:outline-none"
          >
            {item.content}
          </div>
        ))}
    </div>
  );
}
