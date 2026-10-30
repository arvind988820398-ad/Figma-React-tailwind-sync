import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn } from 'storybook/test';
import { useState, type ComponentProps } from 'react';
import { Toggle } from './Toggle';

// AD Design Kit Toggle — mirrors the Figma "Toggle switches" set (node 1149:54432).
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

// ---- Interaction tests ----------------------------------------------------------------------------------------------

// Like ControlledToggle, but also forwards every change to args.onCheckedChange so tests can assert it.
function SpyToggle({ onCheckedChange, ...args }: ComponentProps<typeof Toggle>) {
  const [checked, setChecked] = useState(args.checked);
  return (
    <Toggle
      {...args}
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        onCheckedChange(next);
      }}
    />
  );
}

export const ToggleWithClickAndKeyboard: Story = {
  args: { onCheckedChange: fn(), description: 'Get a weekly summary of activity.' },
  render: (args) => <SpyToggle {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const toggle = canvas.getByRole('switch', { name: 'Enable notifications' });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Space toggles a focused switch; Enter too (it is a button).
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Clicking the visible label toggles it as well.
    await userEvent.click(canvas.getByText('Enable notifications'));
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(4);
  },
};

export const ToggleDisabledIgnoresInput: Story = {
  args: { onCheckedChange: fn(), disabled: true, checked: true },
  render: (args) => <SpyToggle {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const toggle = canvas.getByRole('switch', { name: 'Enable notifications' });
    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    await userEvent.click(canvas.getByText('Enable notifications'));
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
