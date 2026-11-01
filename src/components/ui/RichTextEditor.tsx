// AD Design Kit Rich text editor — Figma "Rich text editor input" (node 1149:49749, page 3279:34618).
// This template gives the AD Design Kit shell, toolbar and states around a minimal contentEditable editor (browser editing
// commands). For production editing, keep these classes and swap the editable area for Tiptap or Lexical.
// Figma Type: Default = no footer · Buttons inside = `footer` · Buttons outside = put Buttons after the component.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  AlignCenterIcon, AlignLeftIcon, AlignRightIcon, AngleDownIcon, FontColorIcon, FontFamilyIcon, FontHighlightIcon, HorizontalLinesIcon,
  ImageIcon, LetterBoldIcon, LetterItalicIcon, LetterUnderlineIcon, ListIcon, OrderedListIcon, QuoteIcon, TextSlashIcon, TextUnderlineIcon,
} from '../icons';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';

// A browser editing command, or `wrap`: put the selection in an element with token classes (no inline colours).
type Command = { label: string; icon: ReactNode; cmd?: string; arg?: string; wrap?: { tag: string; className: string } };

// Figma toolbar, row 1: text styles | alignment. Row 2: Format menu, image, lists, quote, horizontal rule.
const textStyles: Command[] = [
  { cmd: 'bold', label: 'Bold', icon: <LetterBoldIcon /> },
  { cmd: 'removeFormat', label: 'Clear formatting', icon: <TextSlashIcon /> },
  { cmd: 'italic', label: 'Italic', icon: <LetterItalicIcon /> },
  { cmd: 'underline', label: 'Underline', icon: <LetterUnderlineIcon /> },
  { wrap: { tag: 'span', className: 'text-lg' }, label: 'Text size', icon: <TextUnderlineIcon /> },
  { wrap: { tag: 'span', className: 'text-fg-brand' }, label: 'Text color', icon: <FontColorIcon /> },
  { wrap: { tag: 'mark', className: 'bg-warning-soft text-heading' }, label: 'Highlight', icon: <FontHighlightIcon /> },
  { wrap: { tag: 'span', className: 'font-mono' }, label: 'Monospace font', icon: <FontFamilyIcon /> }, // ad-design-kit-lint-ignore: user content (code), not UI type
];
const alignment: Command[] = [
  { cmd: 'justifyLeft', label: 'Align left', icon: <AlignLeftIcon /> },
  { cmd: 'justifyCenter', label: 'Align center', icon: <AlignCenterIcon /> },
  { cmd: 'justifyRight', label: 'Align right', icon: <AlignRightIcon /> },
];
const blocks: Command[] = [
  { cmd: 'insertUnorderedList', label: 'Bulleted list', icon: <ListIcon /> },
  { cmd: 'insertOrderedList', label: 'Numbered list', icon: <OrderedListIcon /> },
  { cmd: 'formatBlock', arg: 'blockquote', label: 'Quote', icon: <QuoteIcon /> },
  { cmd: 'insertHorizontalRule', label: 'Horizontal rule', icon: <HorizontalLinesIcon /> },
];
const formats = [
  { tag: 'p', label: 'Paragraph' },
  { tag: 'h2', label: 'Heading 1' },
  { tag: 'h3', label: 'Heading 2' },
  { tag: 'h4', label: 'Heading 3' },
];

export interface InsertedImage {
  src: string;
  /** Alternative text; required so screen readers can describe the image. */
  alt: string;
}

export interface RichTextEditorProps {
  /** Initial HTML. The editor is uncontrolled; read changes through onChange. */
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** Figma "Buttons inside": footer row under the editor (e.g. Brand sm "Send message"). */
  footer?: ReactNode;
  /** Image button: return the image to insert (e.g. after an upload). Defaults to asking for a URL and a description. */
  onInsertImage?: () => InsertedImage | null | undefined | Promise<InsertedImage | null | undefined>;
  /** Accessible name. */
  label: string;
  minRows?: 3 | 5 | 8;
  className?: string;
}

const minHeights = { 3: 'min-h-20', 5: 'min-h-32', 8: 'min-h-44' } as const;

export function RichTextEditor({ defaultValue = '', onChange, placeholder = 'Write something…', footer, onInsertImage, label, minRows = 5, className }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [empty, setEmpty] = useState(!defaultValue);

  useEffect(() => {
    if (ref.current && defaultValue) ref.current.innerHTML = defaultValue;
    // Set once: the editor owns its content afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The selection inside the editor, kept so toolbar buttons and the Format menu act on it after taking focus.
  const saved = useRef<Range | null>(null);
  const remember = () => {
    const sel = window.getSelection();
    if (sel?.rangeCount && ref.current?.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange();
  };
  useEffect(() => {
    document.addEventListener('selectionchange', remember);
    return () => document.removeEventListener('selectionchange', remember);
  });
  const restore = () => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (saved.current && sel) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
    return sel;
  };
  const emit = () => {
    const html = ref.current?.innerHTML ?? '';
    setEmpty(!ref.current?.textContent?.trim());
    onChange?.(html);
  };
  const exec = (cmd: string, arg?: string) => {
    restore();
    document.execCommand(cmd, false, arg);
    remember();
    emit();
  };
  const run = (c: Command) => {
    if (c.cmd) return exec(c.cmd, c.arg);
    const sel = restore();
    if (!c.wrap || !sel?.rangeCount || sel.getRangeAt(0).collapsed) return;
    const range = sel.getRangeAt(0);
    const el = document.createElement(c.wrap.tag);
    el.className = c.wrap.className;
    el.appendChild(range.extractContents());
    range.insertNode(el);
    sel.selectAllChildren(el);
    remember();
    emit();
  };
  const insertImage = async () => {
    const image = onInsertImage ? await onInsertImage() : askForImage();
    if (!image?.src) return;
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    exec('insertHTML', img.outerHTML);
  };

  const tool = (c: Command) => (
    <ToolButton key={c.label} label={c.label} onClick={() => run(c)}>
      {c.icon}
    </ToolButton>
  );

  return (
    <div
      className={cn(
        'overflow-hidden rounded-base border border-default-medium bg-neutral-secondary-medium shadow-xs transition-colors',
        'focus-within:border-brand focus-within:shadow-focus-brand',
        className,
      )}
    >
      <div role="toolbar" aria-label={`${label} formatting`} aria-controls={id} className="flex flex-col gap-2 border-b border-default-medium bg-neutral-secondary-medium p-3">
        <div className="flex flex-wrap items-center gap-1">
          {textStyles.map(tool)}
          <span className="mx-1 h-4 w-px bg-neutral-quaternary" aria-hidden />
          {alignment.map(tool)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            label="Format"
            trigger={
              <Button size="xs" color="tertiary" rightIcon={<AngleDownIcon />} onMouseDown={(e) => e.preventDefault()}>
                Format
              </Button>
            }
          >
            {formats.map((f) => (
              <DropdownItem key={f.tag} onSelect={() => exec('formatBlock', f.tag)}>
                {f.label}
              </DropdownItem>
            ))}
          </Dropdown>
          <ToolButton label="Insert image" onClick={insertImage}>
            <ImageIcon />
          </ToolButton>
          {blocks.map(tool)}
        </div>
      </div>
      <div className="relative">
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
            'p-3.5 text-sm leading-5 text-heading focus:outline-none',
            '[&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:text-lg [&_h4]:font-semibold',
            '[&_hr]:my-3 [&_hr]:border-default-medium [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-base',
            '[&_blockquote]:border-s-4 [&_blockquote]:border-default-medium [&_blockquote]:ps-3 [&_blockquote]:italic [&_blockquote]:text-body',
            '[&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:list-disc [&_ul]:ps-5',
            minHeights[minRows],
          )}
        />
      </div>
      {footer && <div className="flex items-center justify-between gap-4 border-t border-default-medium bg-neutral-secondary-medium p-3">{footer}</div>}
    </div>
  );
}

/** Toolbar icon button: 28px, size-5 icon, text-body → hover text-heading (Figma toolbar "Button"). */
function ToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded-base text-body hover:bg-neutral-tertiary-medium hover:text-heading focus-visible:shadow-focus-secondary focus-visible:outline-none [&_svg]:size-5"
    >
      {children}
    </button>
  );
}

function askForImage(): InsertedImage | null {
  const src = window.prompt('Image URL');
  return src ? { src, alt: window.prompt('Describe the image') ?? '' } : null;
}
