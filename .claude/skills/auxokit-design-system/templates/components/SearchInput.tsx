// AuxoKit Search input — Figma set "Search form" (node 1149:46581, page 3279:34618).
// Input field with a leading search icon inside <form role="search">. Figma types → variant:
// Default=default · With button (spaced)=button · With button (no-space)=joined · Inner button=inner.
import { useState, type FormEvent } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';
import { inputVariants, type FieldSize } from './Input';

export type SearchInputVariant = 'default' | 'button' | 'joined' | 'inner';

export interface SearchInputProps {
  onSearch: (query: string) => void;
  variant?: SearchInputVariant;
  size?: Extract<FieldSize, 'sm' | 'base'>;
  placeholder?: string;
  /** Accessible name for the field (and the search landmark). */
  label?: string;
  defaultValue?: string;
  buttonLabel?: string;
  className?: string;
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

export function SearchInput({
  onSearch,
  variant = 'default',
  size = 'base',
  placeholder = 'Search',
  label = 'Search',
  defaultValue = '',
  buttonLabel = 'Search',
  className,
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };
  const iconPad = size === 'sm' ? 'ps-8.5' : 'ps-9'; // auxokit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
  const iconPos = size === 'sm' ? 'ps-2.5' : 'ps-3';

  return (
    <form role="search" aria-label={label} onSubmit={submit} className={cn('flex w-full', variant === 'button' && 'gap-2', className)}>
      <div className="relative min-w-0 flex-1">
        <span className={cn('pointer-events-none absolute inset-y-0 start-0 flex items-center text-body-subtle [&_svg]:size-4', iconPos)}>
          <SearchIcon />
        </span>
        <input
          type="search"
          aria-label={label}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            inputVariants({ size }),
            iconPad,
            variant === 'joined' && 'rounded-e-none',
            variant === 'inner' && (size === 'sm' ? 'pe-20' : 'pe-24'),
          )}
        />
        {variant === 'inner' && (
          <span className="absolute inset-y-0 end-0 flex items-center pe-1.5">
            <button type="submit" className={cn(buttonVariants({ color: 'tertiary', size: 'xs' }), 'rounded')}>
              {buttonLabel}
            </button>
          </span>
        )}
      </div>
      {(variant === 'button' || variant === 'joined') && (
        <button
          type="submit"
          className={cn(buttonVariants({ size: size === 'sm' ? 'sm' : 'base' }), variant === 'joined' && '-ms-px rounded-s-none')}
        >
          {buttonLabel}
        </button>
      )}
    </form>
  );
}
