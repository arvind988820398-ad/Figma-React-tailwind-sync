// AuxoKit Rich text editor — Figma "Rich text editor input" (node 1149:49749, page 3279:34618).
// This template gives the AuxoKit shell, toolbar and states around a minimal contentEditable editor (browser editing
// commands). For production editing, keep these classes and swap the editable area for Tiptap or Lexical.
// Figma Type: Default = no footer · Buttons inside = `footer` · Buttons outside = put Buttons after the component.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Command = { cmd: string; label: string; icon: ReactNode; arg?: string };

const I = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const groups: Command[][] = [
  [
    { cmd: 'bold', label: 'Bold', icon: I('M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z') },
    { cmd: 'italic', label: 'Italic', icon: I('M10 5h8M6 19h8M14 5l-4 14') },
    { cmd: 'underline', label: 'Underline', icon: I('M7 4v7a5 5 0 0 0 10 0V4M5 20h14') },
  ],
  [
    { cmd: 'insertUnorderedList', label: 'Bulleted list', icon: I('M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01') },
    { cmd: 'insertOrderedList', label: 'Numbered list', icon: I('M10 6h10M10 12h10M10 18h10M4 5h1v4M4 9h2M4 15h2l-2 3h2') },
  ],
  [
    { cmd: 'formatBlock', arg: 'blockquote', label: 'Quote', icon: I('M7 7h4v6H5V11a4 4 0 0 1 2-4m8 0h4v6h-6V11a4 4 0 0 1 2-4') },
    { cmd: 'removeFormat', label: 'Clear formatting', icon: I('M6 4h12M10 4 8 20M14 4l-1 6M4 20l16-16') },
  ],
];

export interface RichTextEditorProps {
  /** Initial HTML. The editor is uncontrolled; read changes through onChange. */
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Figma "Buttons inside": footer row under the editor (e.g. Brand sm "Publish"). */
  footer?: ReactNode;
  /** Accessible name. */
  label: string;
  minRows?: 3 | 5 | 8;
  className?: string;
}

const minHeights = { 3: 'min-h-20', 5: 'min-h-32', 8: 'min-h-48' } as const;

export function RichTextEditor({ defaultValue = '', onChange, placeholder = 'Write something…', footer, label, minRows = 5, className }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [empty, setEmpty] = useState(!defaultValue);

  useEffect(() => {
    if (ref.current && defaultValue) ref.current.innerHTML = defaultValue;
    // Set once: the editor owns its content afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = (c: Command) => {
    ref.current?.focus();
    document.execCommand(c.cmd, false, c.arg);
    emit();
  };
  const emit = () => {
    const html = ref.current?.innerHTML ?? '';
    setEmpty(!ref.current?.textContent?.trim());
    onChange?.(html);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-base border border-default-medium bg-neutral-secondary-medium shadow-xs transition-colors',
        'focus-within:border-brand focus-within:shadow-focus-brand',
        className,
      )}
    >
      <div role="toolbar" aria-label={`${label} formatting`} aria-controls={id} className="flex flex-wrap items-center gap-0.5 border-b border-default-medium bg-neutral-secondary-medium p-3">
        {groups.map((g, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <span className="mx-1.5 h-5 w-px bg-neutral-quaternary" aria-hidden />}
            {g.map((c) => (
              <button
                key={c.label}
                type="button"
                aria-label={c.label}
                title={c.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(c)}
                className="inline-flex items-center justify-center rounded-lg p-1 text-body hover:bg-neutral-tertiary-medium hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none [&_svg]:size-5"
              >
                {c.icon}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="relative bg-neutral-primary-soft">
        {empty && <span className="pointer-events-none absolute start-3.5 top-3.5 text-sm text-body-subtle" aria-hidden>{placeholder}</span>}
        <div
          ref={ref}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          className={cn(
            'p-3.5 text-sm text-heading focus:outline-none',
            '[&_blockquote]:border-s-4 [&_blockquote]:border-default-medium [&_blockquote]:ps-3 [&_blockquote]:italic [&_blockquote]:text-body',
            '[&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:list-disc [&_ul]:ps-5',
            minHeights[minRows],
          )}
        />
      </div>
      {footer && <div className="flex items-center justify-between gap-4 border-t border-default-medium bg-neutral-secondary-medium px-3 py-2.5">{footer}</div>}
    </div>
  );
}
