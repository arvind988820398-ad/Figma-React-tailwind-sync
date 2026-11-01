// AD Design Kit Accordion — Figma set "Accordion" (node 1146:19028, page 3282:18777).
// Figma Style → variant: Default=default · Flush=flush · Separate Cards=cards · Multi-level=nested · With sub-header=subheader.
// Figma Icon=True: a 20px leading icon (question-circle) before each title; With sub-header uses a 36px white IconShape circle.
// Breakpoint variants are responsive classes: Mobile rows are px-4 py-3.5 (panels p-4), Desktop px-6 py-5.
import { useId, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AngleDownIcon } from '../icons';

export type AccordionVariant = 'default' | 'flush' | 'cards' | 'nested' | 'subheader';

export interface AccordionItem {
  value: string;
  title: ReactNode;
  content: ReactNode;
  /** Leading icon: a 20px icon, or an IconShape (base, white, circle) for "With sub-header". */
  icon?: ReactNode;
  subtitle?: ReactNode;
  /** "Multi-level": child items listed under this item's header (chevron first, indented). */
  items?: AccordionItem[];
}

export interface AccordionProps {
  items: AccordionItem[];
  variant?: AccordionVariant;
  /** Allow several items open at once. */
  multiple?: boolean;
  /** Open item values; for Multi-level this may include child item values. */
  defaultValue?: string[];
  className?: string;
}

const Chevron = ({ open }: { open: boolean }) => <AngleDownIcon className={cn('size-5 shrink-0 transition-transform', open && 'rotate-180')} />;

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
        <AccordionRow key={item.value} item={item} variant={variant} defaultValue={defaultValue} open={open.includes(item.value)} onToggle={() => toggle(item.value)} />
      ))}
    </div>
  );
}

function AccordionRow({ item, variant, defaultValue = [], open, onToggle, nested }: { item: AccordionItem; variant: AccordionVariant; defaultValue?: string[]; open: boolean; onToggle: () => void; nested?: boolean }) {
  const id = useId();
  const flush = variant === 'flush';
  const children = item.items && item.items.length > 0 ? item.items : null;
  const [childOpen, setChildOpen] = useState<string[]>(() => (children ?? []).map((c) => c.value).filter((v) => defaultValue.includes(v)));
  return (
    <div
      className={cn(
        variant === 'cards' && 'overflow-hidden rounded-base border border-default shadow-xs',
        flush && 'border-b border-default',
        nested && 'border-t border-default-medium',
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
            'flex w-full items-center justify-between gap-6 py-3.5 text-start text-base font-medium transition-colors focus-visible:outline-none focus-visible:shadow-focus-brand sm:py-5',
            flush ? 'px-0' : 'px-4 sm:px-6',
            nested ? 'justify-start gap-2 bg-neutral-secondary-medium sm:ps-12' : !flush && (open ? 'bg-neutral-tertiary' : 'bg-neutral-primary-soft'),
            open || variant === 'subheader' ? 'text-heading' : 'text-body hover:text-heading',
          )}
        >
          {nested && <Chevron open={open} />}
          <span className={cn('flex min-w-0 flex-1 items-center', variant === 'subheader' ? 'gap-2.5' : 'gap-2')}>
            {item.icon && <span className="inline-flex shrink-0 [&>svg]:size-5" aria-hidden>{item.icon}</span>}
            <span className="flex min-w-0 flex-col gap-px">
              <span>{item.title}</span>
              {item.subtitle && <span className="text-sm font-normal text-body">{item.subtitle}</span>}
            </span>
          </span>
          {!nested && <Chevron open={open} />}
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!open}
        className={cn(
          'text-base text-body [&_a]:text-fg-brand [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:no-underline',
          !children &&
            cn(
                'space-y-3 border-t',
                flush ? 'border-default py-5' : 'p-4 sm:px-6 sm:py-5',
                nested ? 'border-default-medium bg-neutral-secondary-medium' : !flush && 'border-default bg-neutral-primary-soft',
              ),
        )}
      >
        {children ? (
          <>
            {item.content && <div className="space-y-3 bg-neutral-primary-soft p-4 sm:px-6 sm:py-5">{item.content}</div>}
            {children.map((child) => (
              <AccordionRow
                key={child.value}
                item={child}
                variant={variant}
                nested
                open={childOpen.includes(child.value)}
                onToggle={() => setChildOpen((c) => (c.includes(child.value) ? c.filter((x) => x !== child.value) : [...c, child.value]))}
              />
            ))}
          </>
        ) : (
          item.content
        )}
      </div>
    </div>
  );
}
