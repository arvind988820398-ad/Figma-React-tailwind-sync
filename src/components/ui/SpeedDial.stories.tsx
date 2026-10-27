import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { CheckIcon, CogIcon, MailIcon, PlusIcon } from '../icons';
import { SpeedDial, type SpeedDialDirection, type SpeedDialVariant } from './SpeedDial';

// AuxoKit Speed dial — mirrors the Figma "Speed dial (ready to use examples)" set (node 1149:84847).
// Shown inline (not `fixed`) so the canvas can display it; pass `fixed` in an app.
const actions = [
  { label: 'Share', icon: <MailIcon /> },
  { label: 'Settings', icon: <CogIcon /> },
  { label: 'New', icon: <PlusIcon /> },
  { label: 'Copy', icon: <CheckIcon />, disabled: true },
];

const variants: SpeedDialVariant[] = ['default', 'rounded', 'menu', 'dropdown'];
const directions: SpeedDialDirection[] = ['top', 'bottom', 'left', 'right'];

const meta = {
  title: 'Components/SpeedDial',
  parameters: { design: figmaDesign('SpeedDial') },
  component: SpeedDial,
  // Tall, wide frame so the menu has room to open in any direction.
  decorators: [(Story) => <div className="flex h-96 w-96 items-center justify-center"><Story /></div>],
  args: { actions, variant: 'default', direction: 'top', fixed: false },
  argTypes: {
    variant: { control: 'select', options: variants },
    direction: { control: 'select', options: directions },
  },
} satisfies Meta<typeof SpeedDial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Rounded: Story = { args: { variant: 'rounded' } };

// Figma "Menu": icon + label inside each item.
export const Menu: Story = { args: { variant: 'menu' } };

// Figma "Article dropdown menu": a Dropdown-style list.
export const DropdownMenu: Story = { args: { variant: 'dropdown', direction: 'bottom' } };

export const Directions: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-6">
      {directions.map((direction) => (
        <div key={direction} className="flex h-40 w-40 flex-col items-center justify-center gap-2">
          <SpeedDial {...args} direction={direction} label={`Quick actions (${direction})`} />
          <span className="text-xs text-body-subtle">direction="{direction}"</span>
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex items-end gap-12">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <SpeedDial {...args} variant={variant} label={`Quick actions (${variant})`} />
          <span className="text-xs text-body-subtle">{variant}</span>
        </div>
      ))}
    </div>
  ),
};
