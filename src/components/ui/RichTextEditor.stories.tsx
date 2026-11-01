import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { Button } from './Button';
import { RichTextEditor, type RichTextEditorProps } from './RichTextEditor';

// AD Design Kit Rich text editor — one story per Figma "Rich text editor input" Type (node 1149:49749) and State
// (Initial, Focus, Filled), with the Figma texts.
const filledText =
  '<p>Standard glass, 3.8GHz 8-core 10th-generation Intel Core i7 processor, Turbo Boost up to 5.0GHz, 16GB 2666MHz DDR4 memory, ' +
  'Radeon Pro 5500 XT with 8GB of GDDR6 memory, 256GB SSD storage, Gigabit Ethernet, Magic Mouse 2, Magic Keyboard - US.</p>';

const meta = {
  title: 'Components/RichTextEditor',
  parameters: { design: figmaDesign('RichTextEditor') },
  component: RichTextEditor,
  args: {
    label: 'Message',
    defaultValue: '',
    placeholder: 'Write text here ...',
    minRows: 8,
    className: 'w-full',
  },
  argTypes: {
    minRows: { control: 'select', options: [3, 5, 8] },
    footer: { control: false },
    onChange: { action: 'change' },
  },
  decorators: [
    (Story) => (
      <div className="w-lg max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma State is a CSS state: the Focus stories focus the editor.
const focusEditor: Story['play'] = async ({ canvas }) => {
  const editor = canvas.getByRole('textbox');
  editor.focus();
  await expect(editor).toHaveFocus();
};

// Type = Default
export const Default: Story = {};
export const DefaultFocus: Story = { play: focusEditor };
export const DefaultFilled: Story = { args: { defaultValue: filledText } };

// Type = Buttons inside: a footer row with the Brand sm submit.
const footer = <Button size="sm">Send message</Button>;
export const ButtonsInside: Story = { args: { footer } };
export const ButtonsInsideFocus: Story = { args: { footer }, play: focusEditor };
export const ButtonsInsideFilled: Story = { args: { footer, defaultValue: filledText } };

// Type = Buttons outside: the editor, then a Brand sm button 16px below.
export const ButtonsOutside: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <RichTextEditor {...args} />
      <Button size="sm">Send message</Button>
    </div>
  ),
};
export const ButtonsOutsideFocus: Story = { ...ButtonsOutside, play: focusEditor };
export const ButtonsOutsideFilled: Story = { ...ButtonsOutside, args: { defaultValue: filledText } };

export const Short: Story = { args: { minRows: 3, defaultValue: '<p>AD Design Kit keeps <b>Figma</b> and <i>code</i> in sync.</p>' } };

function LiveHtmlDemo(args: RichTextEditorProps) {
  const [html, setHtml] = useState(args.defaultValue ?? '');
  return (
    <div className="flex flex-col gap-4">
      <RichTextEditor {...args} onChange={setHtml} />
      <pre className="overflow-x-auto rounded-base border border-default bg-neutral-secondary-soft p-4 text-xs text-body">{html || '(empty)'}</pre>
    </div>
  );
}

export const LiveHtml: Story = { render: (args) => <LiveHtmlDemo {...args} /> };

// ---- Interaction tests ----------------------------------------------------------------------------------------------

/** Selects all text in the editor, as a user would by dragging across it. */
function selectAll(editor: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(editor);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(range);
}

export const TypeAndFormat: Story = {
  args: { defaultValue: '', onChange: fn(), label: 'Comment', placeholder: 'Write a comment…' },
  play: async ({ canvas, userEvent, args }) => {
    const editor = canvas.getByRole('textbox', { name: 'Comment' });
    await expect(canvas.getByText('Write a comment…')).toBeInTheDocument();

    await userEvent.click(editor);
    await userEvent.keyboard('Hello world');
    await expect(editor).toHaveTextContent('Hello world');
    // The placeholder disappears once there is text, and every edit reports the HTML.
    await waitFor(() => expect(canvas.queryByText('Write a comment…')).not.toBeInTheDocument());
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining('Hello world'));

    const toolbar = canvas.getByRole('toolbar', { name: 'Comment formatting' });
    const press = async (name: string) => {
      selectAll(editor);
      await userEvent.click(within(toolbar).getByRole('button', { name }));
    };

    await press('Bold');
    await expect(editor.querySelector('b, strong')).toHaveTextContent('Hello world');
    await press('Italic');
    await expect(editor.querySelector('i, em')).toHaveTextContent('Hello world');
    await press('Underline');
    await expect(editor.querySelector('u')).toHaveTextContent('Hello world');
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining('<u>'));

    await press('Clear formatting');
    await expect(editor.querySelector('b, strong, i, em, u')).toBeNull();
    await expect(editor).toHaveTextContent('Hello world');
  },
};

export const ListsAndQuote: Story = {
  args: { defaultValue: '<p>First point</p>', onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const editor = canvas.getByRole('textbox', { name: 'Message' });
    const button = (name: string) => canvas.getByRole('button', { name });

    selectAll(editor);
    await userEvent.click(button('Bulleted list'));
    await expect(editor.querySelector('ul li')).toHaveTextContent('First point');

    selectAll(editor);
    await userEvent.click(button('Numbered list'));
    await expect(editor.querySelector('ol li')).toHaveTextContent('First point');
    await expect(editor.querySelector('ul')).toBeNull();
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining('<ol>'));

    // Toggle the list off, then turn the paragraph into a quote.
    selectAll(editor);
    await userEvent.click(button('Numbered list'));
    selectAll(editor);
    await userEvent.click(button('Quote'));
    await expect(editor.querySelector('blockquote')).toHaveTextContent('First point');
  },
};

export const DeletingAllTextShowsPlaceholder: Story = {
  args: { defaultValue: '<p>Draft</p>', onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const editor = canvas.getByRole('textbox', { name: 'Message' });
    await expect(canvas.queryByText('Write text here ...')).not.toBeInTheDocument();
    selectAll(editor);
    await userEvent.keyboard('{Backspace}');
    await expect(editor).toHaveTextContent('');
    await waitFor(() => expect(canvas.getByText('Write text here ...')).toBeInTheDocument());
    await expect(args.onChange).toHaveBeenCalled();
  },
};

// Interaction: colour and highlight use token classes, alignment and the Format menu change the block.
export const ColorAlignAndFormat: Story = {
  args: { defaultValue: '<p>Release notes</p>', onChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const editor = canvas.getByRole('textbox', { name: 'Message' });
    const button = (name: string) => canvas.getByRole('button', { name });

    // Colour and highlight wrap the selection in token classes, never inline colours.
    selectAll(editor);
    await userEvent.click(button('Text color'));
    await expect(editor.querySelector('span.text-fg-brand')).toHaveTextContent('Release notes');
    await userEvent.click(button('Highlight'));
    await expect(editor.querySelector('mark')).toHaveTextContent('Release notes');
    await expect(editor.innerHTML).not.toMatch(/color:|#[0-9a-f]{3,6}/i);

    selectAll(editor);
    await userEvent.click(button('Align center'));
    await expect(editor.innerHTML).toMatch(/text-align: center/);

    // The Format menu turns the paragraph into a heading.
    selectAll(editor);
    await userEvent.click(button('Format'));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Heading 1' }));
    await waitFor(() => expect(editor.querySelector('h2')).toHaveTextContent('Release notes'));
    await expect(args.onChange).toHaveBeenLastCalledWith(expect.stringContaining('<h2'));
  },
};

// Interaction: the image button inserts the image with its description; the rule button adds a divider.
export const InsertImageAndRule: Story = {
  args: { defaultValue: '<p>Photo</p>', onInsertImage: () => ({ src: '/favicon.svg', alt: 'AD Design Kit logo' }), onChange: fn() },
  play: async ({ canvas, userEvent }) => {
    const editor = canvas.getByRole('textbox', { name: 'Message' });
    selectAll(editor);
    await userEvent.click(canvas.getByRole('button', { name: 'Insert image' }));
    await waitFor(() => expect(editor.querySelector('img')).toHaveAttribute('src', '/favicon.svg'));
    await expect(editor.querySelector('img')).toHaveAttribute('alt', 'AD Design Kit logo');
    window.getSelection()!.collapseToEnd();
    await userEvent.click(canvas.getByRole('button', { name: 'Horizontal rule' }));
    await expect(editor.querySelector('hr')).not.toBeNull();
  },
};

// Interaction: without onInsertImage the image button asks for a URL and a description; cancelling inserts nothing.
// Wrapping commands need a selection: with only a caret they do nothing.
export const InsertImageByPrompt: Story = {
  args: { defaultValue: '<p>Photo</p>', onChange: fn() },
  play: async ({ canvas, userEvent }) => {
    const editor = canvas.getByRole('textbox', { name: 'Message' });
    const prompt = window.prompt;
    try {
      window.prompt = () => null;
      selectAll(editor);
      await userEvent.click(canvas.getByRole('button', { name: 'Insert image' }));
      await expect(editor.querySelector('img')).toBeNull();

      const answers = ['/favicon.svg', 'AD Design Kit logo'];
      window.prompt = () => answers.shift() ?? null;
      selectAll(editor);
      await userEvent.click(canvas.getByRole('button', { name: 'Insert image' }));
      await waitFor(() => expect(editor.querySelector('img')).toHaveAttribute('alt', 'AD Design Kit logo'));
    } finally {
      window.prompt = prompt;
    }

    window.getSelection()!.collapseToEnd();
    await userEvent.click(canvas.getByRole('button', { name: 'Text color' }));
    await expect(editor.querySelector('span.text-fg-brand')).toBeNull();
  },
};
