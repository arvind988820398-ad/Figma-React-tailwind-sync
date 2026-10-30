import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { CogIcon, MailIcon, PlusIcon } from '../icons';
import { ButtonGroup, ButtonGroupItem, type ButtonGroupProps, type ButtonGroupSize } from './ButtonGroup';

// AD Design Kit Button group — mirrors the Figma "Group button" set (node 1149:31694). Gray = Secondary, White = Tertiary.
const meta = {
  title: 'Components/ButtonGroup',
  parameters: { design: figmaDesign('ButtonGroup') },
  component: ButtonGroup,
  args: {
    color: 'white',
    size: 'base',
    vertical: false,
    label: 'Navigation',
    children: (
      <>
        <ButtonGroupItem>Profile</ButtonGroupItem>
        <ButtonGroupItem>Settings</ButtonGroupItem>
        <ButtonGroupItem>Messages</ButtonGroupItem>
      </>
    ),
  },
  argTypes: {
    color: { control: 'select', options: ['gray', 'white'] },
    size: { control: 'select', options: ['xs', 'sm', 'base', 'lg'] },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const White: Story = {};
export const Gray: Story = { args: { color: 'gray' } };
export const Vertical: Story = { args: { vertical: true, size: 'sm' } };

// Selected item uses the Tertiary Hover style and sets aria-pressed.
function CalendarViewDemo(args: ButtonGroupProps) {
  const [view, setView] = useState('Week');
  return (
    <ButtonGroup {...args} label="Calendar view">
      {['Day', 'Week', 'Month'].map((v) => (
        <ButtonGroupItem key={v} active={view === v} onClick={() => setView(v)}>
          {v}
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  );
}
export const ActiveItem: Story = { render: (args) => <CalendarViewDemo {...args} /> };

export const IconOnly: Story = {
  args: {
    size: 'sm',
    label: 'Quick actions',
    children: (
      <>
        <ButtonGroupItem iconOnly aria-label="Message"><MailIcon /></ButtonGroupItem>
        <ButtonGroupItem iconOnly aria-label="Settings"><CogIcon /></ButtonGroupItem>
        <ButtonGroupItem iconOnly aria-label="Add"><PlusIcon /></ButtonGroupItem>
      </>
    ),
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      {(['xs', 'sm', 'base', 'lg'] as ButtonGroupSize[]).map((size) => (
        <ButtonGroup key={size} {...args} size={size} label={`${size} group`} />
      ))}
    </div>
  ),
};
