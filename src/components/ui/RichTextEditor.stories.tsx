import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './Button';
import { RichTextEditor, type RichTextEditorProps } from './RichTextEditor';

// AuxoKit Rich text editor — mirrors the Figma "Rich text editor input" (node 1149:49749).
const meta = {
  title: 'AuxoKit/RichTextEditor',
  component: RichTextEditor,
  args: {
    label: 'Article body',
    defaultValue: '<p>AuxoKit keeps <b>Figma</b> and <i>code</i> in sync.</p>',
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
