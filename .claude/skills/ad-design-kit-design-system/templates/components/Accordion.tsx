// AD Design Kit Accordion — Figma set "Accordion" (node 1146:19028, page 3282:18777).
// Figma Style → variant: Default=default · Flush=flush · Separate Cards=cards · Multi-level=nested · With sub-header=subheader.
import { useId, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type AccordionVariant = 'default' | 'flush' | 'cards' | 'nested' | 'subheader';

export interface AccordionItem {
  value: string;
  title: ReactNode;
  content: ReactNode;
  /** "With sub-header": 36px leading icon / IconShape and a sub line. */
  icon?: ReactNode;
  subtitle?: ReactNode;
  /** "Multi-level": child items rendered inside this item's panel. */
  items?: AccordionItem[];
}

export interface AccordionProps {
  items: AccordionItem[];
  variant?: AccordionVariant;
  /** Allow several items open at once. */
  multiple?: boolean;
  defaultValue?: string[];
  className?: string;
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" className={cn('size-5 shrink-0 transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Accordion({ items, variant = 'default', multiple = false, defaultValue = [], className }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultValue);
  const toggle = (v: string) =>
    setOpen((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : multiple ? [...cur, v] : [v]));

  return (
    <div
      className={cn(
        variant === 'flush' && 'flex flex-col',
        variant === 'cards' && 'flex flex-col gap-4',
        (variant === 'default' || variant === 'nested' || variant === 'subheader') &&
          'divide-y divide-default overflow-hidden rounded-base border border-default shadow-xs',
        className,
      )}
    >
      {items.map((item) => (
        <AccordionRow key={item.value} item={item} variant={variant} open={open.includes(item.value)} onToggle={() => toggle(item.value)} />
      ))}
    </div>
  );
}

function AccordionRow({ item, variant, open, onToggle, nested }: { item: AccordionItem; variant: AccordionVariant; open: boolean; onToggle: () => void; nested?: boolean }) {
  const id = useId();
  const flush = variant === 'flush';
  const [childOpen, setChildOpen] = useState<string[]>([]);
  return (
    <div
      className={cn(
        variant === 'cards' && 'overflow-hidden rounded-base border border-default shadow-xs',
        flush && 'border-b border-default',
      )}
    >
      <h3>
        <button // ad-design-kit-lint-ignore: disclosure trigger (aria-expanded), not an action Button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-between gap-3 py-5 text-start text-base font-medium transition-colors focus-visible:outline-none focus-visible:shadow-focus-brand',
            flush ? 'px-0' : 'px-6',
            nested && 'bg-neutral-secondary-medium ps-12',
            open ? cn('text-heading', !flush && !nested && 'bg-neutral-tertiary') : 'text-body hover:text-heading',
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            {item.icon && <span className="inline-flex size-9 shrink-0 items-center justify-center [&_svg]:size-5" aria-hidden>{item.icon}</span>}
            <span className="flex min-w-0 flex-col gap-1">
              <span>{item.title}</span>
              {item.subtitle && <span className="text-sm font-normal text-body">{item.subtitle}</span>}
            </span>
          </span>
          <Chevron open={open} />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!open}
        className={cn('text-base text-body [&_a]:text-fg-brand', flush ? 'pb-5' : 'border-t border-default bg-neutral-primary-soft px-6 py-5')}
      >
        {item.content}
        {item.items && item.items.length > 0 && (
          <div className="mt-4 divide-y divide-default-medium overflow-hidden rounded-base border border-default-medium">
            {item.items.map((child) => (
              <AccordionRow
                key={child.value}
                item={child}
                variant={variant}
                nested
                open={childOpen.includes(child.value)}
                onToggle={() => setChildOpen((c) => (c.includes(child.value) ? c.filter((x) => x !== child.value) : [...c, child.value]))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
