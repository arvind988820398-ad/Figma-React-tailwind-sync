import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps } from 'react';
import { Avatar } from './Avatar';
import { HelperText, Label } from './Input';
import { TagInput } from './TagInput';

// AD Design Kit Tag input — mirrors the Figma "Tag input" set (node 1149:49173).
const meta = {
  title: 'Components/TagInput',
  parameters: { design: figmaDesign('TagInput') },
  component: TagInput,
  args: { value: ['design', 'tokens'], onChange: () => {}, size: 'base', placeholder: 'Add a tag…', disabled: false, 'aria-label': 'Tags' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
  },
  render: (args) => <TagDemo {...args} />,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Type and press Enter or comma to add; Backspace in an empty field removes the last tag.
function TagDemo(args: ComponentProps<typeof TagInput>) {
  const [value, setValue] = useState(args.value);
  return <TagInput {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {};
export const Empty: Story = { args: { value: [] } };
export const WithLeadingAvatar: Story = {
  args: {
    value: ['ada@ad-design-kit.dev', 'grace@ad-design-kit.dev'],
    placeholder: 'Add email…',
    'aria-label': 'Invite emails',
    renderLeading: (tag) => <Avatar name={tag} size="xs" />,
  },
};
export const Success: Story = { args: { value: ['valid'], status: 'success' } };
export const Danger: Story = { args: { value: ['too-long-tag-name'], status: 'danger' } };
export const Disabled: Story = { args: { value: ['locked'], disabled: true } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor="tags-topics">Topics</Label>
      <TagDemo {...args} id="tags-topics" aria-describedby="tags-topics-help" aria-label={undefined} />
      <HelperText id="tags-topics-help">Press Enter or comma to add a topic.</HelperText>
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <TagDemo key={size} {...args} size={size} aria-label={`Tags (${size})`} />
      ))}
    </div>
  ),
};

// ---- Interaction tests -------------------------------------------------------------------------------------------
const chips = (canvas: { queryAllByRole: (role: string, opts: { name: RegExp }) => HTMLElement[] }) =>
  canvas.queryAllByRole('button', { name: /^Remove / }).map((b) => b.getAttribute('aria-label')?.replace('Remove ', ''));

// Enter and comma add a tag; duplicates and blanks are ignored; Backspace in an empty field removes the last tag;
// the chip's × removes that tag; leaving the field commits the draft.
export const AddAndRemoveTags: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Tags' });
    await expect(chips(canvas)).toEqual(['design', 'tokens']);
    await expect(field).toHaveAttribute('placeholder', '');

    await userEvent.type(field, 'react{Enter}');
    await expect(chips(canvas)).toEqual(['design', 'tokens', 'react']);
    await expect(field).toHaveValue('');

    await userEvent.type(field, 'ui,');
    await expect(chips(canvas)).toEqual(['design', 'tokens', 'react', 'ui']);

    await userEvent.type(field, 'design{Enter}');
    await userEvent.type(field, '   {Enter}');
    await expect(chips(canvas)).toEqual(['design', 'tokens', 'react', 'ui']);
    await expect(field).toHaveValue('');

    // Backspace with a draft only edits the draft.
    await userEvent.type(field, 'x{Backspace}');
    await expect(chips(canvas)).toHaveLength(4);
    await userEvent.keyboard('{Backspace}');
    await expect(chips(canvas)).toEqual(['design', 'tokens', 'react']);

    await userEvent.click(canvas.getByRole('button', { name: 'Remove design' }));
    await expect(chips(canvas)).toEqual(['tokens', 'react']);

    await userEvent.type(field, 'blurred');
    await userEvent.tab();
    await expect(chips(canvas)).toEqual(['tokens', 'react', 'blurred']);
    await expect(field).toHaveValue('');
  },
};

// Starting empty shows the placeholder; it hides once a tag exists and returns when the last tag is removed.
export const PlaceholderWhenEmpty: Story = {
  args: { value: [], status: 'success' },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Tags' });
    await expect(field).toHaveAttribute('placeholder', 'Add a tag…');
    await expect(field).not.toHaveAttribute('aria-invalid');
    await userEvent.type(field, 'first{Enter}');
    await expect(field).toHaveAttribute('placeholder', '');
    await userEvent.keyboard('{Backspace}');
    await expect(chips(canvas)).toEqual([]);
    await expect(field).toHaveAttribute('placeholder', 'Add a tag…');
    // Backspace with nothing left does nothing.
    await userEvent.keyboard('{Backspace}');
    await expect(chips(canvas)).toEqual([]);
  },
};

// Disabled: no remove buttons, the field is disabled. Danger: the field is marked invalid.
export const DisabledAndDanger: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <TagDemo {...args} value={['locked']} disabled aria-label="Locked tags" />
      <TagDemo {...args} value={['bad']} status="danger" aria-label="Invalid tags" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Locked tags' })).toBeDisabled();
    await expect(canvas.getByText('locked')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Remove locked' })).toBeNull();
    await expect(canvas.getByRole('textbox', { name: 'Invalid tags' })).toHaveAttribute('aria-invalid', 'true');
  },
};
