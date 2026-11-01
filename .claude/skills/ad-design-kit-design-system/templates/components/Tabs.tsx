// AD Design Kit Tabs — Figma set "Nav tabs" (node 1149:80530, page 3283:24214), tab 1149:80596.
// Figma Type → variant: Default=text · Border bottom=underline · Pills=pills · Button=button (Ghost buttons in a card) ·
// Button group=segmented (joined Ghost buttons) · Vertical pills=vertical-pills · Vertical with list item=vertical-list
// (Navigation list items in a card). Figma Mobile=True = `mobile`: below sm, Default/Pills/Border bottom become a Select
// and Button/Button group stack vertically. Without `mobile` the row scrolls sideways (overflow-x-auto).
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';
import { Select } from './Select';

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
  /** Figma "Mobile": below sm, text/pills/underline switch to a Select; button/segmented stack vertically. */
  mobile?: boolean;
  className?: string;
}

const focus = 'focus-visible:outline-none focus-visible:shadow-focus-brand';
const tabBase = `inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors [&_svg]:size-4 disabled:pointer-events-none disabled:text-fg-disabled ${focus}`;
const pill = 'rounded-base px-4 py-2.5';
const pillActive = 'bg-brand text-white';
const pillIdle = 'text-body hover:bg-neutral-secondary-medium hover:text-heading';
// Button / Button group: Ghost base items; the selected one uses the Ghost Hover style.
const ghost = buttonVariants({ color: 'ghost', size: 'base' });
const ghostActive = 'bg-neutral-secondary-medium text-heading';

const styles: Record<TabsVariant, { list: string; tab: (active: boolean) => string }> = {
  text: { list: 'flex gap-6', tab: (a) => cn(tabBase, 'rounded', a ? 'text-fg-brand' : 'text-body hover:text-fg-brand') },
  underline: {
    list: 'flex gap-6 border-b border-default',
    tab: (a) => cn(tabBase, '-mb-px border-b pb-4', a ? 'border-brand text-fg-brand' : 'border-transparent text-body hover:text-fg-brand'),
  },
  pills: { list: 'flex gap-6', tab: (a) => cn(tabBase, pill, a ? pillActive : pillIdle) },
  button: {
    list: 'inline-flex gap-1 rounded-base border border-default bg-neutral-primary-soft p-3',
    tab: (a) => cn(ghost, a && ghostActive),
  },
  segmented: {
    list: 'inline-flex overflow-hidden rounded-base border border-default bg-neutral-primary-soft',
    tab: (a) => cn(ghost, 'rounded-none border-e border-default last:border-e-0', a && ghostActive),
  },
  'vertical-pills': { list: 'flex flex-col gap-3', tab: (a) => cn(tabBase, pill, 'w-full', a ? pillActive : pillIdle) },
  'vertical-list': {
    list: 'flex flex-col gap-3 rounded-base border border-default bg-neutral-primary-soft p-3',
    tab: (a) =>
      cn(
        tabBase,
        'w-full rounded-base px-2 py-1.5 text-base [&_svg]:size-5',
        a ? 'bg-neutral-secondary-medium text-fg-brand' : 'text-body hover:bg-neutral-secondary-medium hover:text-fg-brand',
      ),
  },
};

// Figma Mobile=True layouts of Button / Button group: full-width items stacked in the card.
const mobileStack: Partial<Record<TabsVariant, string>> = {
  button: 'max-sm:flex max-sm:w-full max-sm:flex-col',
  segmented: 'max-sm:flex max-sm:w-full max-sm:flex-col',
};
const mobileTab: Partial<Record<TabsVariant, string>> = {
  button: 'max-sm:w-full',
  segmented: 'max-sm:w-full max-sm:border-e-0 max-sm:border-b max-sm:last:border-b-0',
};

export function Tabs({ items, value, onValueChange, variant = 'text', label, mobile, className }: TabsProps) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const vertical = variant.startsWith('vertical');
  const s = styles[variant];
  const hasPanels = items.some((i) => i.content !== undefined);
  const asSelect = mobile && (variant === 'text' || variant === 'pills' || variant === 'underline');

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    if (![...keys, 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const enabled = items.filter((i) => !i.disabled);
    if (enabled.length === 0) return; // every tab disabled: nothing to move to
    const idx = enabled.findIndex((i) => i.value === value);
    const next =
      e.key === 'Home' ? enabled[0] : e.key === 'End' ? enabled[enabled.length - 1] : enabled[(idx + (e.key === keys[1] ? 1 : -1) + enabled.length) % enabled.length];
    onValueChange(next.value);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };

  return (
    <div className={cn(vertical ? 'flex flex-col gap-6 md:flex-row' : 'flex flex-col gap-6', className)}>
      {asSelect && (
        <Select className="sm:hidden" aria-label={label} value={value} onChange={(e) => onValueChange(e.target.value)}>
          {items.map((item) => (
            <option key={item.value} value={item.value} disabled={item.disabled}>
              {typeof item.label === 'string' ? item.label : item.value}
            </option>
          ))}
        </Select>
      )}
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        onKeyDown={onKeyDown}
        className={cn(
          s.list,
          // Text rows scroll sideways when they do not fit; Button / Button group keep their card clipped.
          !vertical && (variant === 'button' || variant === 'segmented' ? 'max-w-full' : 'max-w-full overflow-x-auto'),
          variant === 'vertical-pills' && 'md:w-40 md:shrink-0',
          variant === 'vertical-list' && 'md:w-64 md:shrink-0',
          asSelect && 'max-sm:hidden',
          mobile && mobileStack[variant],
        )}
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
              className={cn(s.tab(active), mobile && mobileTab[variant])}
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
