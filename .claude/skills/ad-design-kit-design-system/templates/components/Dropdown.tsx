// AD Design Kit Dropdown — Figma set "Dropdown menu" (node 1149:39895, page 3282:18862), item 1149:39651, header 1149:39866,
// triggers 1149:40204. Minimal menu (arrow keys, Esc, outside click). For collision-aware positioning, wrap a headless
// primitive (Radix DropdownMenu / Floating UI) and keep these classes.
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

const CloseContext = createContext<() => void>(() => {});

export interface DropdownProps {
  /** A Button (or Avatar button / link-styled button) that opens the menu. */
  trigger: ReactElement<{ onClick?: () => void; 'aria-haspopup'?: string; 'aria-expanded'?: boolean; 'aria-controls'?: string }>;
  children: ReactNode;
  align?: 'start' | 'end';
  /** Accessible name for the menu. */
  label?: string;
  className?: string;
}

const ITEM_SELECTOR = '[role^="menuitem"]:not(:disabled)';

export function Dropdown({ trigger, children, align = 'start', label, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) rootRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
  };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      {cloneElement(trigger, {
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? id : undefined,
      })}
      {open && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          className={cn(
            'absolute top-full z-40 mt-2 flex w-52 flex-col gap-1.5 rounded-base border border-default-medium bg-neutral-primary-medium p-2 shadow-lg',
            align === 'end' ? 'end-0' : 'start-0',
            className,
          )}
        >
          <CloseContext.Provider value={() => close()}>{children}</CloseContext.Provider>
        </div>
      )}
    </div>
  );
}

const itemClasses =
  'flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-start text-sm font-medium leading-5 text-body [&_svg]:size-4 ' +
  'hover:bg-neutral-tertiary-medium hover:text-heading focus-visible:bg-neutral-tertiary-medium focus-visible:text-heading focus-visible:outline-none ' +
  'disabled:pointer-events-none disabled:text-fg-disabled';

export interface DropdownItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  icon?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Right side: Badge, shortcut, chevron… */
  trailing?: ReactNode;
  onSelect?: () => void;
  /** danger = destructive action (Delete, Remove): fg-danger-strong text and icon, danger-soft hover.
   *  Code ahead of Figma: see figma-audit.md "Code ahead of Figma". */
  color?: 'default' | 'danger';
}

// fg-danger-strong keeps 4.5:1 on the menu and on the danger-soft hover in every theme (fg-danger drops to 3.9:1 in dark).
const dangerClasses =
  'text-fg-danger-strong hover:bg-danger-soft hover:text-fg-danger-strong focus-visible:bg-danger-soft focus-visible:text-fg-danger-strong';

export function DropdownItem({ icon, description, trailing, onSelect, color = 'default', className, children, ...props }: DropdownItemProps) {
  const close = useContext(CloseContext);
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(itemClasses, color === 'danger' && dangerClasses, className)}
      {...props}
    >
      {icon}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span>{children}</span>
        {description && <span className="text-xs font-normal leading-4 text-body">{description}</span>}
      </span>
      {trailing && <span className="ms-auto inline-flex shrink-0 items-center [&_svg]:size-3.5">{trailing}</span>}
    </button>
  );
}

export interface DropdownCheckboxItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** Figma "Checkbox" type: stays open on toggle. Box matches the Checkbox component. */
export function DropdownCheckboxItem({ checked, onCheckedChange, className, children, ...props }: DropdownCheckboxItemProps) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      onClick={() => onCheckedChange(!checked)}
      className={cn(itemClasses, 'gap-2', className)}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'inline-flex size-4 shrink-0 items-center justify-center rounded-xs border',
          checked ? 'border-brand bg-brand text-white' : 'border-default-strong bg-neutral-secondary-strong',
        )}
      >
        {checked && (
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3">
            <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return (
    <div role="separator" className="py-1">
      <div className="h-px bg-neutral-quaternary" />
    </div>
  );
}

/** Figma "Dropdown header": user name + email (optionally a leading avatar). */
export function DropdownHeader({ name, email, avatar }: { name: ReactNode; email?: ReactNode; avatar?: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 rounded bg-neutral-secondary-strong px-2.5 py-2">
      {avatar}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium leading-5 text-heading">{name}</span>
        {email && <span className="truncate text-sm text-body">{email}</span>}
      </div>
    </div>
  );
}
