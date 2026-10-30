import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { Button } from './Button';
import { RichTextEditor, type RichTextEditorProps } from './RichTextEditor';

// AD Design Kit Rich text editor — mirrors the Figma "Rich text editor input" (node 1149:49749).
const meta = {
  title: 'Components/RichTextEditor',
  parameters: { design: figmaDesign('RichTextEditor') },
  component: RichTextEditor,
  args: {
    label: 'Article body',
    defaultValue: '<p>AD Design Kit keeps <b>Figma</b> and <i>code</i> in sync.</p>',
    placeholder: 'Write something…',
    minRows: 5,
    className: 'w-full',
  },
  argTypes: {
    minRows: { control: 'select', options: [3, 5, 8] },
    footer: { control: false },
    onChange: { action: 'change' },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { defaultValue: '' } };

// Figma "Buttons inside": footer row under the editor.
export const ButtonsInside: Story = {
  args: {
    label: 'Comment',
    defaultValue: '',
    placeholder: 'Write a comment…',
    minRows: 3,
    footer: (
      <>
        <span className="text-xs text-body-subtle">Markdown shortcuts supported</span>
        <Button size="sm">Post comment</Button>
      </>
    ),
  },
};

// Figma "Buttons outside": actions placed after the component.
export const ButtonsOutside: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <RichTextEditor {...args} />
      <div className="flex justify-end gap-3">
        <Button color="secondary">Save draft</Button>
        <Button>Publish</Button>
      </div>
    </div>
  ),
};

export const Tall: Story = { args: { minRows: 8 } };

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
    const editor = canvas.getByRole('textbox', { name: 'Article body' });
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
    const editor = canvas.getByRole('textbox', { name: 'Article body' });
    await expect(canvas.queryByText('Write something…')).not.toBeInTheDocument();
    selectAll(editor);
    await userEvent.keyboard('{Backspace}');
    await expect(editor).toHaveTextContent('');
    await waitFor(() => expect(canvas.getByText('Write something…')).toBeInTheDocument());
    await expect(args.onChange).toHaveBeenCalled();
  },
};
