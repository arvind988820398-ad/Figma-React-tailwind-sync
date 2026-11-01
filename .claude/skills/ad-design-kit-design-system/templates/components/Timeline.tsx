// AD Design Kit Timeline — Figma set "Timeline" (node 1149:91254, page 1149:91247), item 1149:91357, dot 1149:91248.
// Figma Type → variant: Default = default (ellipse dots, gray date badge) · Icons & Card = icons (icon dots, card items,
// brand date badge beside the title) · User actions = cards (avatar dots, card items, brand "time ago" badge, quoted
// comment) · Stacked cards = stacked (one card per date with avatar rows) · Horizontal = horizontal · Horizontal advanced =
// horizontal-advanced (centred items, line through the dots). Breakpoint=Mobile is the same layout at a narrow width;
// the horizontal types show two items per row below sm.
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CalendarMonthIcon, ClockIcon } from '../icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export type TimelineVariant = 'default' | 'icons' | 'cards' | 'stacked' | 'horizontal' | 'horizontal-advanced';

/** A row inside a Stacked cards group. */
export interface TimelineEntry {
  /** Avatar name (initials fallback) and optional photo. */
  name: string;
  src?: string;
  /** "Neil Sims likes Bonnie Green's post …", links underlined. */
  title: ReactNode;
  /** Quoted comment, `text-sm text-body-subtle`. */
  description?: ReactNode;
  /** White sm badge, e.g. <><GlobeIcon /> Public</>. */
  meta?: ReactNode;
}

export interface TimelineItem {
  /** Date or time: gray badge with a calendar icon (default, horizontal), brand badge (icons), brand badge with a clock icon (cards), group heading (stacked). */
  date: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Icon for the "icons" dot (size-2.5 text-fg-brand). */
  icon?: ReactNode;
  /** Avatar for the avatar dot (cards variant). */
  avatar?: ReactNode;
  /** Secondary sm + Brand sm buttons, or a link. */
  actions?: ReactNode;
  /** Stacked cards: the rows under this date. */
  entries?: TimelineEntry[];
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: TimelineVariant;
  className?: string;
}

const ellipse = 'size-3 rounded-full border border-buffer bg-neutral-tertiary';
const card = 'flex flex-col gap-5 rounded-base border border-default bg-neutral-primary-soft p-6 shadow-xs';
const titleText = 'text-lg font-semibold leading-7 text-heading';

function DateBadge({ children }: { children: ReactNode }) {
  return (
    <Badge color="gray" size="sm" className="self-start" leading={<CalendarMonthIcon className="size-3" aria-hidden />}>
      {children}
    </Badge>
  );
}

function Dot({ variant, item }: { variant: TimelineVariant; item: TimelineItem }) {
  if (variant === 'icons' || (variant === 'cards' && item.icon && !item.avatar)) {
    return (
      <span className="absolute -start-2.5 flex size-5 items-center justify-center rounded-full border-2 border-buffer bg-brand-softer text-fg-brand [&_svg]:size-2.5" aria-hidden>
        {item.icon}
      </span>
    );
  }
  if (item.avatar) {
    return (
      <span className="absolute -start-2.5 flex size-5 overflow-hidden rounded-full border-2 border-buffer [&>*]:size-full" aria-hidden>
        {item.avatar}
      </span>
    );
  }
  // Ellipse dot: centred on the title row (badge 20 + gap 8 + half of the 28px title line).
  return <span className={cn('absolute -start-1.5 mt-9', ellipse)} aria-hidden />;
}

export function Timeline({ items, variant = 'default', className }: TimelineProps) {
  if (variant === 'horizontal' || variant === 'horizontal-advanced') {
    const advanced = variant === 'horizontal-advanced';
    return (
      <ol className={cn('grid grid-cols-2 gap-y-8 sm:flex sm:gap-y-0', className)}>
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              'relative flex-1',
              advanced ? 'flex flex-col items-center gap-4 px-5 text-center' : 'border-t border-default pe-11 pt-5 last:pe-0 max-sm:even:pe-0',
            )}
          >
            {advanced ? (
              <>
                <DateBadge>{item.date}</DateBadge>
                {/* The line runs through the dots and across the gaps between items. */}
                <span className="relative flex w-full justify-center before:absolute before:-inset-x-5 before:top-1/2 before:border-t before:border-default" aria-hidden>
                  <span className={cn('relative', ellipse)} />
                </span>
                <div className="flex flex-col items-center gap-0.5">
                  {item.title && <h3 className={titleText}>{item.title}</h3>}
                  {item.description && <p className="text-base text-body">{item.description}</p>}
                </div>
                {item.actions && <div className="text-sm font-medium text-fg-brand">{item.actions}</div>}
              </>
            ) : (
              <>
                <span className={cn('absolute -top-1.5 start-0', ellipse)} aria-hidden />
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <DateBadge>{item.date}</DateBadge>
                    {item.title && <h3 className={titleText}>{item.title}</h3>}
                    {item.description && <p className="text-base text-body">{item.description}</p>}
                  </div>
                  {item.actions && <div className="flex flex-wrap gap-3">{item.actions}</div>}
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    );
  }

  if (variant === 'stacked') {
    return (
      <ol className={cn('flex flex-col gap-11', className)}>
        {items.map((item, i) => (
          <li key={i} className="flex flex-col gap-4 rounded-base border border-default bg-neutral-secondary-soft p-5">
            <h3 className={titleText}>{item.date}</h3>
            <ul className="flex flex-col gap-4">
              {item.entries?.map((entry, j) => (
                <li key={j} className="flex gap-2.5 border-b border-default pb-4 last:border-b-0 last:pb-0">
                  <Avatar name={entry.name} src={entry.src} size="xl" className="shrink-0" />
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-base text-heading [&_a]:underline [&_a]:underline-offset-2">{entry.title}</p>
                      {entry.description && <p className="text-sm text-body-subtle">{entry.description}</p>}
                    </div>
                    {entry.meta && (
                      <Badge color="white" size="sm" className="self-start [&_svg]:size-3">
                        {entry.meta}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={cn('relative flex flex-col gap-11 border-s border-default', variant === 'default' ? 'ps-4' : 'ps-6', className)}>
      {items.map((item, i) => (
        // Dots are absolutely placed against the <ol> (the line), at the top of a card or beside the title.
        <li key={i}>
          <Dot variant={variant} item={item} />
          {variant === 'icons' ? (
            <div className={card}>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                  {item.title && <h3 className={titleText}>{item.title}</h3>}
                  <Badge color="brand" size="sm">{item.date}</Badge>
                </div>
                {item.description && <p className="text-base text-body">{item.description}</p>}
              </div>
              {item.actions && <div className="flex flex-wrap gap-3">{item.actions}</div>}
            </div>
          ) : variant === 'cards' ? (
            <div className={card}>
              <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-11">
                {item.title && <p className="text-base text-body [&_a]:font-medium [&_a]:text-heading [&_a]:underline [&_a]:underline-offset-2">{item.title}</p>}
                <Badge color="brand" size="sm" className="shrink-0" leading={<ClockIcon className="size-3" aria-hidden />}>
                  {item.date}
                </Badge>
              </div>
              {item.description && <div className="rounded border border-default-medium bg-neutral-secondary-medium p-3 text-sm italic text-body">{item.description}</div>}
              {item.actions && <div className="flex flex-wrap gap-3">{item.actions}</div>}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <DateBadge>{item.date}</DateBadge>
                {item.title && <h3 className={titleText}>{item.title}</h3>}
                {item.description && <p className="text-base text-body">{item.description}</p>}
              </div>
              {item.actions && <div className="flex flex-wrap gap-3">{item.actions}</div>}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
