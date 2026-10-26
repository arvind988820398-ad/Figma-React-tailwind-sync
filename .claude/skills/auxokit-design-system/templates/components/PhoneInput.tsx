// AuxoKit Phone input — Figma set "Phone form" (node 1149:46719, page 3279:34618).
// Country selector = Secondary base Button (flag + dial code + chevron) joined to the Input field; it opens a Dropdown.
import { useId } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { inputVariants, type FieldStatus } from './Input';

export interface Country {
  code: string; // ISO, e.g. "US"
  name: string;
  dial: string; // e.g. "+1"
  flag: string; // emoji flag
}

export const defaultCountries: Country[] = [
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
];

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  country: string;
  onCountryChange: (code: string) => void;
  countries?: Country[];
  status?: FieldStatus;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  country,
  onCountryChange,
  countries = defaultCountries,
  status,
  disabled,
  placeholder = '123-456-7890',
  id,
  className,
  ...aria
}: PhoneInputProps) {
  const autoId = useId();
  const current = countries.find((c) => c.code === country) ?? countries[0];
  return (
    <div className={cn('flex rounded-base shadow-xs', className)}>
      <Dropdown
        label="Country code"
        trigger={
          <Button
            color="secondary"
            disabled={disabled}
            aria-label={`Country code ${current.name} ${current.dial}`}
            className="shrink-0 rounded-e-none shadow-none"
            rightIcon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            <span aria-hidden>{current.flag}</span>
            {current.dial}
          </Button>
        }
      >
        {countries.map((c) => (
          <DropdownItem key={c.code} onSelect={() => onCountryChange(c.code)} trailing={<span className="text-xs text-body-subtle">{c.dial}</span>}>
            <span aria-hidden className="me-1.5">{c.flag}</span>
            {c.name}
          </DropdownItem>
        ))}
      </Dropdown>
      <input
        id={id ?? autoId}
        type="tel"
        autoComplete="tel-national"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={status === 'danger' || undefined}
        className={cn(inputVariants({ status }), '-ms-px rounded-s-none shadow-none')}
        {...aria}
      />
    </div>
  );
}
