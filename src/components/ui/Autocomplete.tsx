// AD Design Kit Autocomplete — Figma "Autocomplete input (ready to use examples)" (node 1149:53126, page 1149:53107),
// menu 1149:53147, item 1149:53218. Combobox pattern: input with role="combobox", listbox popup, arrow keys move the
// active option (aria-activedescendant), Enter selects, Esc closes. Matching text is highlighted (Figma "Highlighted text").
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { inputVariants, type FieldSize } from './Input';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  /** Leading icon or 24px avatar. */
  icon?: ReactNode;
  /** Group heading (Figma "Categories"). */
  group?: string;
  disabled?: boolean;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  size?: FieldSize;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: string;
  /** Footer slot, e.g. Brand xs "Add new" (Figma CTA / With save option). */
  footer?: ReactNode;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-heading">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

export function Autocomplete({ options, value, onChange, size = 'base', placeholder = 'Search', emptyText = 'No results', footer, id, className, ...aria }: AutocompleteProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const selected = options.find((o) => o.value === value) ?? null;
  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q && q !== selected?.label.toLowerCase() ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query, selected]);
  const enabled = filtered.filter((o) => !o.disabled);

  const choose = (o: AutocompleteOption) => {
    onChange(o.value);
    setQuery(o.label);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      const next = (active + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) % Math.max(enabled.length, 1);
      setActive(next);
      listRef.current?.querySelector(`#${CSS.escape(`${listId}-${enabled[next]?.value}`)}`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && open && enabled[active]) {
      e.preventDefault();
      choose(enabled[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const activeOption = open ? enabled[active] : undefined;

  return (
    <div className={cn('relative', className)}>
      <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-body-subtle [&_svg]:size-4">
        <SearchIcon />
      </span>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption ? `${listId}-${activeOption.value}` : undefined}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          if (!e.target.value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={cn(inputVariants({ size }), 'ps-9')}
        {...aria}
      />
      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 flex flex-col gap-1.5 rounded-base border border-default-medium bg-neutral-primary-medium p-2 shadow-lg">
          <ul ref={listRef} id={listId} role="listbox" className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
            {filtered.length === 0 && <li className="p-2 text-sm text-body-subtle">{emptyText}</li>}
            {filtered.map((o, i) => {
              const heading = o.group && o.group !== filtered[i - 1]?.group ? o.group : undefined;
              const isActive = activeOption?.value === o.value;
              return (
                <li key={o.value} role="presentation">
                  {heading && <p className="px-2.5 pt-2 pb-1 text-sm font-semibold text-heading" role="presentation">{heading}</p>}
                  <div
                    id={`${listId}-${o.value}`}
                    role="option"
                    aria-selected={o.value === value}
                    aria-disabled={o.disabled || undefined}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !o.disabled && choose(o)}
                    onMouseEnter={() => !o.disabled && setActive(enabled.indexOf(o))}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded p-2 text-sm font-medium leading-none [&_svg]:size-4',
                      o.disabled ? 'cursor-not-allowed text-fg-disabled' : isActive ? 'bg-neutral-tertiary-medium text-heading' : 'text-body',
                    )}
                  >
                    {o.icon && <span className="inline-flex shrink-0">{o.icon}</span>}
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate"><Highlight text={o.label} query={query.trim()} /></span>
                      {o.description && <span className="text-xs font-normal text-body-subtle">{o.description}</span>}
                    </span>
                    {o.value === value && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-brand" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-10" />
                      </svg>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {footer && <div className="border-t border-default-medium pt-2" onMouseDown={(e) => e.preventDefault()}>{footer}</div>}
        </div>
      )}
    </div>
  );
}
