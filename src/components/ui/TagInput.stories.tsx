import type { Meta, StoryObj } from '@storybook/react-vite';
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
