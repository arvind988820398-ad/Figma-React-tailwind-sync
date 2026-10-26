import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';
import { ArrowRightIcon } from '../icons';

// AuxoKit Kbd — mirrors the Figma "KBD" set (node 1149:92754).
const meta = {
  title: 'AuxoKit/Kbd',
  component: Kbd,
  args: { children: 'Ctrl' },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: { 'aria-label': 'Arrow right', children: <ArrowRightIcon /> },
};

export const KeyCombination: Story = {
  render: (args) => (
    <span className="flex items-center gap-1 text-sm text-body">
      <Kbd {...args}>Ctrl</Kbd> + <Kbd {...args}>Shift</Kbd> + <Kbd {...args}>K</Kbd>
    </span>
  ),
};

export const InSentence: Story = {
  render: (args) => (
    <p className="text-sm text-body">
      Press <Kbd {...args}>⌘</Kbd> + <Kbd {...args}>K</Kbd> to open search, or <Kbd {...args}>Esc</Kbd> to close a dialog.
    </p>
  ),
};

export const CommonKeys: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {['Shift', 'Ctrl', 'Tab', 'Caps Lock', 'Esc', 'Spacebar', 'Enter', '⌘', 'Alt', 'Fn'].map((key) => (
        <Kbd key={key} {...args}>
          {key}
        </Kbd>
      ))}
    </div>
  ),
};
