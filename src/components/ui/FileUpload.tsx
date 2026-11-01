// AD Design Kit File upload — Figma "File upload input" examples (node 1149:48972) and dropzone (1149:48981), page 3279:34618.
// FileInput = Figma "Default" (Input field Add-on text: a "Choose file" segment). FileDropzone = Figma "Advanced" /
// "With CTAs" × Initial/Hover/Disabled/Success/Danger. The real <input type="file"> stays in the accessibility tree.
import { useId, useState, type DragEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SearchIcon, UploadIcon } from '../icons';
import { buttonVariants } from './Button';
import type { FieldStatus } from './Input';

export interface FileInputProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-describedby'?: string;
  className?: string;
}

export function FileInput({ onFiles, accept, multiple, disabled, id, className, ...aria }: FileInputProps) {
  const autoId = useId();
  const [names, setNames] = useState<string[]>([]);
  return (
    <label
      htmlFor={id ?? autoId}
      className={cn(
        'flex w-full overflow-hidden rounded-base border border-default-medium bg-neutral-secondary-medium text-sm leading-5 shadow-xs',
        'focus-within:border-brand focus-within:shadow-focus-brand',
        disabled ? 'cursor-not-allowed text-fg-disabled' : 'cursor-pointer',
        className,
      )}
    >
      <input
        id={id ?? autoId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          setNames(files.map((f) => f.name));
          onFiles(files);
        }}
        {...aria}
      />
      <span className={cn('shrink-0 border-e border-default-medium bg-neutral-tertiary px-3 py-2.5 font-medium', disabled ? 'text-fg-disabled' : 'text-heading')}>
        Choose file
      </span>
      <span className={cn('truncate px-3 py-2.5', names.length ? 'text-heading' : 'text-body-subtle')}>
        {names.length ? names.join(', ') : 'No file chosen'}
      </span>
    </label>
  );
}

export type FileDropzoneVariant = 'advanced' | 'ctas';

export interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  variant?: FileDropzoneVariant;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  status?: FieldStatus;
  /** e.g. "SVG, PNG, JPG or GIF (max. 800×400px)". */
  hint?: ReactNode;
  /** "With CTAs": the upload sources under "Drag and drop a file here, or:" (Figma: white circle IconShapes with a caption, gap-6). */
  actions?: ReactNode;
  className?: string;
}

const statusShell: Record<'default' | FieldStatus, string> = {
  default: 'border-default-medium bg-neutral-secondary-medium',
  success: 'border-success-subtle bg-success-soft text-fg-success-strong',
  danger: 'border-danger-subtle bg-danger-soft text-fg-danger-strong',
};

export function FileDropzone({ onFiles, variant = 'advanced', accept, multiple, disabled, status, hint, actions, className }: FileDropzoneProps) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const ctas = variant === 'ctas';
  const tone = disabled ? 'text-fg-disabled' : status ? '' : 'text-body';

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) onFiles([...e.dataTransfer.files]);
  };

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-base border border-dashed px-6 py-8 text-center transition-colors',
        'focus-within:shadow-focus-brand',
        statusShell[status ?? 'default'],
        disabled ? 'cursor-not-allowed' : cn('cursor-pointer', !status && 'hover:bg-neutral-tertiary', dragging && !status && 'bg-neutral-tertiary'),
        className,
      )}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => onFiles([...(e.target.files ?? [])])}
      />
      {ctas ? (
        <>
          <span className={cn('text-sm', tone)}>Drag and drop a file here, or:</span>
          {actions && <span className={cn('mt-2 flex flex-wrap items-center justify-center gap-6', tone)}>{actions}</span>}
        </>
      ) : (
        <>
          <span className={cn('[&_svg]:size-5', tone)}>
            <UploadIcon />
          </span>
          <span className={cn('text-sm', tone)}>Click to upload or drag and drop</span>
          {hint && <span className={cn('text-xs font-medium', tone)}>{hint}</span>}
          <span
            className={cn(buttonVariants({ size: 'xs' }), 'mt-2', disabled && 'pointer-events-none border border-default-medium bg-disabled text-fg-disabled')}
            aria-hidden
          >
            <SearchIcon />
            Browse file
          </span>
        </>
      )}
    </label>
  );
}
