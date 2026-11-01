// AD Design Kit Autocomplete — Figma "Autocomplete input (ready to use examples)" (node 1149:53126, page 1149:53107),
// menu 1149:53147, item 1149:53218. Combobox pattern: input with role="combobox", listbox popup, arrow keys move the
// active option (aria-activedescendant), Enter selects, Esc closes. Matching text is highlighted (Figma "Highlighted text").
// Item actions (Figma list item "Bordered": save | remove) are pointer shortcuts with keyboard twins: Shift+Delete
// removes the active option, Ctrl/⌘+S saves it. `header` holds category buttons (Figma "Categories").
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CheckIcon, CloseIcon, FloppyDiskAltIcon, SearchIcon } from '../icons';
import { inputVariants, type FieldSize } from './Input';

export interface AutocompleteOption {
  value: string;
  label: string;
  /** Second line (Figma "Heading & description" helper). */
  description?: string;
  /** Inline secondary text after the label (Figma "With secondary text"), e.g. a role or a file size. */
  meta?: string;
  /** Leading icon, xs avatar or IconShape. */
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
  /** Header slot above the list, e.g. Secondary xs category buttons (Figma "Categories"). */
  header?: ReactNode;
  /** Group headings: `plain` text (Default) or `filled` rows (Figma "Advanced", "Categories"). */
  groupStyle?: 'plain' | 'filled';
  /** Remove button on each option (Figma: close), e.g. to forget a recent search. Keyboard: Shift+Delete. */
  onRemove?: (option: AutocompleteOption) => void;
  /** Save button on each option (Figma: floppy disk, "Save" tooltip). Keyboard: Ctrl/⌘+S. */
  onSave?: (option: AutocompleteOption) => void;
  /** Classes for the popup, e.g. a width wider than the field (`w-lg`). */
  menuClassName?: string;
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
      <mark className="bg-transparent text-fg-brand">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export function Autocomplete({
  options, value, onChange, size = 'base', placeholder = 'Search', emptyText = 'No results', footer, header, groupStyle = 'plain', onRemove, onSave, menuClassName, id, className, ...aria
}: AutocompleteProps) {
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
    } else if (e.key === 'Delete' && e.shiftKey && onRemove && open && enabled[active]) {
      e.preventDefault();
      onRemove(enabled[active]);
      setActive(Math.max(0, Math.min(active, enabled.length - 2)));
    } else if (e.key.toLowerCase() === 's' && (e.metaKey || e.ctrlKey) && onSave && open && enabled[active]) {
      e.preventDefault();
      onSave(enabled[active]);
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
        <div className={cn('absolute start-0 top-full z-40 mt-2 flex w-full flex-col gap-2 rounded-base border border-default-medium bg-neutral-primary-medium p-2 shadow-lg', menuClassName)}>
          {header && <div className="flex flex-wrap items-center gap-2" onMouseDown={(e) => e.preventDefault()}>{header}</div>}
          <ul ref={listRef} id={listId} role="listbox" className="flex max-h-150 flex-col gap-1 overflow-y-auto">
            {filtered.length === 0 && <li className="p-2 text-sm text-body-subtle">{emptyText}</li>}
            {filtered.map((o, i) => {
              const heading = o.group && o.group !== filtered[i - 1]?.group ? o.group : undefined;
              const isActive = activeOption?.value === o.value;
              return (
                <li key={o.value} role="presentation">
                  {heading && (
                    <p
                      className={cn(
                        'text-sm font-semibold leading-5 text-heading',
                        groupStyle === 'filled' ? 'mb-1 rounded bg-neutral-secondary-medium px-2.5 py-2' : 'px-2.5 pt-2',
                        i > 0 && 'mt-1',
                      )}
                      role="presentation"
                    >
                      {heading}
                    </p>
                  )}
                  <div className={cn('flex items-center gap-2 rounded pe-2', o.disabled ? 'text-fg-disabled' : isActive ? 'bg-neutral-tertiary-medium' : '')}>
                    <div
                      id={`${listId}-${o.value}`}
                      role="option"
                      aria-selected={o.value === value}
                      aria-disabled={o.disabled || undefined}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => !o.disabled && choose(o)}
                      onMouseEnter={() => !o.disabled && setActive(enabled.indexOf(o))}
                      className={cn(
                        'flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 py-1.5 ps-2 text-sm font-medium leading-5 [&_svg]:size-4',
                        o.description && 'gap-2.5 py-2',
                        o.disabled ? 'cursor-not-allowed text-fg-disabled' : isActive ? 'text-heading' : 'text-body',
                      )}
                    >
                      {o.icon && <span className="inline-flex shrink-0">{o.icon}</span>}
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex min-w-0 items-baseline gap-1.5">
                          <span className={cn(o.description ? 'text-heading' : 'truncate')}><Highlight text={o.label} query={query.trim()} /></span>
                          {o.meta && <span className="shrink-0 text-xs font-normal text-body-subtle">{o.meta}</span>}
                        </span>
                        {o.description && <span className={cn('text-sm font-normal', o.disabled ? 'text-fg-disabled' : 'text-body')}>{o.description}</span>}
                      </span>
                      {o.value === value && <CheckIcon className="text-fg-brand" />}
                    </div>
                    {(onSave || onRemove) && !o.disabled && (
                      // Pointer shortcuts; the keyboard twins are Ctrl/⌘+S and Shift+Delete on the active option.
                      <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
                        {onSave && (
                          <button type="button" tabIndex={-1} title="Save" onMouseDown={(e) => e.preventDefault()} onClick={() => onSave(o)} className="rounded-xs text-body hover:text-fg-brand [&_svg]:size-3.5">
                            <FloppyDiskAltIcon />
                          </button>
                        )}
                        {onSave && onRemove && <span className="h-2.5 w-px bg-neutral-quaternary" />}
                        {onRemove && (
                          <button type="button" tabIndex={-1} title="Remove" onMouseDown={(e) => e.preventDefault()} onClick={() => onRemove(o)} className="rounded-xs text-body hover:text-heading [&_svg]:size-3.5">
                            <CloseIcon />
                          </button>
                        )}
                      </span>
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
