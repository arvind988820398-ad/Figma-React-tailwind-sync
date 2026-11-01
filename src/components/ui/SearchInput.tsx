// AD Design Kit Search input — Figma set "Search form" (node 1149:46581, page 3279:34618).
// Input field with a leading search icon inside <form role="search">. Figma types → variant:
// Default=default · With button (spaced)=button (Brand, 16px gap) · With button (no-space)=joined · Inner button=inner
// (Brand xs inside the field). With buttons / With spaced buttons / Three buttons / Inline are compositions.
import { useState, type FormEvent } from 'react';
import { cn } from '../../lib/cn';
import { SearchIcon } from '../icons';
import { Button } from './Button';
import { Input, InputGroup, type FieldSize } from './Input';

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
  /** Field id, for a visible <Label htmlFor>. */
  id?: string;
  className?: string;
}

export function SearchInput({
  onSearch,
  variant = 'default',
  size = 'base',
  placeholder = 'Search',
  label = 'Search',
  defaultValue = '',
  buttonLabel = 'Search',
  id,
  className,
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };
  const button = (
    <Button type="submit" size={variant === 'inner' ? 'xs' : size} className="shrink-0">
      {buttonLabel}
    </Button>
  );
  const field = (
    <Input
      id={id}
      type="search"
      size={size}
      aria-label={label}
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      leftIcon={<SearchIcon />}
      endAction={variant === 'inner' ? button : undefined}
      className="min-w-0 flex-1"
    />
  );

  return (
    <form role="search" aria-label={label} onSubmit={submit} className={cn('flex w-full', variant === 'button' && 'gap-4', className)}>
      {variant === 'joined' ? (
        <InputGroup>
          {field}
          {button}
        </InputGroup>
      ) : (
        <>
          {field}
          {variant === 'button' && button}
        </>
      )}
    </form>
  );
}
