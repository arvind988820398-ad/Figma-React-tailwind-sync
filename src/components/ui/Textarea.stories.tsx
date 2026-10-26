import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { HelperText, Label } from './Input';
import { Textarea, TextareaToolButton } from './Textarea';
import { CogIcon, PlusIcon } from '../icons';

// AuxoKit Textarea — mirrors the Figma "Textarea input" set (node 1149:49679), examples 1149:50131.
const meta = {
  title: 'AuxoKit/Textarea',
  component: Textarea,
  args: { placeholder: 'Write your thoughts here…', rows: 4, disabled: false, 'aria-label': 'Message' },
  argTypes: {
    status: { control: 'select', options: ['success', 'danger'] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'The design system keeps Figma and code in sync.' } };
export const Success: Story = { args: { status: 'success', defaultValue: 'Looks good.' } };
export const Danger: Story = { args: { status: 'danger', defaultValue: 'Too short' } };
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } };

// Figma "Buttons inside": a toolbar row joined under the text area.
export const WithFooter: Story = {
  args: {
    'aria-label': 'Comment',
    placeholder: 'Write a comment…',
    footer: (
      <>
        <div className="flex gap-1">
          <TextareaToolButton label="Attach file"><PlusIcon /></TextareaToolButton>
          <TextareaToolButton label="Formatting options"><CogIcon /></TextareaToolButton>
        </div>
        <Button size="sm">Post comment</Button>
      </>
    ),
  },
};

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div>
      <Label htmlFor="ta-notes">Notes</Label>
      <Textarea {...args} id="ta-notes" placeholder="Anything we should know?" aria-label={undefined} />
      <HelperText>Optional. Visible to the whole team.</HelperText>
    </div>
  ),
};
