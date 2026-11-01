import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Kbd } from './Kbd';
import { ArrowRightIcon, CaretDownIcon, CaretLeftIcon, CaretRightIcon, CaretUpIcon } from '../icons';

// AD Design Kit Kbd — mirrors the Figma "KBD" set (node 1149:92754): 49 keys (modifiers, letters, F1–F12, arrows).
const modifiers = ['Shift', 'Ctrl', 'Tab', 'Caps Lock', 'Esc', 'Spacebar', 'Enter'];
const letters = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
const functionKeys = Array.from({ length: 12 }, (_, i) => `F${i + 1}`);
const arrows = [
  { label: 'Arrow left', Icon: CaretLeftIcon },
  { label: 'Arrow right', Icon: CaretRightIcon },
  { label: 'Arrow down', Icon: CaretDownIcon },
  { label: 'Arrow up', Icon: CaretUpIcon },
];
const meta = {
  title: 'Components/Kbd',
  parameters: { design: figmaDesign('Kbd') },
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

// Every key in the Figma set, in the Figma order. Arrow keys are caret icons with screen-reader labels.
export const AllKeys: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {[...modifiers, ...letters, ...functionKeys].map((key) => (
        <Kbd key={key} {...args}>
          {key}
        </Kbd>
      ))}
      {arrows.map(({ label, Icon }) => (
        <Kbd key={label} {...args} aria-label={label}>
          <Icon />
        </Kbd>
      ))}
    </div>
  ),
};

export const ArrowKeys: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      {arrows.map(({ label, Icon }) => (
        <Kbd key={label} {...args} aria-label={label}>
          <Icon />
        </Kbd>
      ))}
    </div>
  ),
};
