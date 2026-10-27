import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { useState, type ComponentProps } from 'react';
import { Toggle } from './Toggle';

// AuxoKit Toggle — mirrors the Figma "Toggle switches" set (node 1149:54432).
const meta = {
  title: 'Components/Toggle',
  parameters: { design: figmaDesign('Toggle') },
  component: Toggle,
  args: { checked: false, onCheckedChange: () => {}, size: 'base', children: 'Enable notifications', disabled: false },
  argTypes: {
    size: { control: 'select', options: ['base', 'lg'] },
  },
  render: (args) => <ControlledToggle {...args} />,
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledToggle(args: ComponentProps<typeof Toggle>) {
  const [checked, setChecked] = useState(args.checked);
  return <Toggle {...args} checked={checked} onCheckedChange={setChecked} />;
}

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Large: Story = { args: { size: 'lg', checked: true } };
export const WithDescription: Story = {
  args: { children: 'Email notifications', description: 'Get a weekly summary of activity.' },
};
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, checked: true } };
export const WithoutVisibleLabel: Story = { args: { children: undefined, 'aria-label': 'Enable notifications' } };

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['base', 'lg'] as const).map((size) => (
        <ControlledToggle key={size} {...args} size={size} checked>
          {`size="${size}"`}
        </ControlledToggle>
      ))}
    </div>
  ),
};
