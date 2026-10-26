import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { Checkbox, Radio } from './Checkbox';

// AuxoKit Checkbox & Radio — mirrors the Figma "Checkbox input" set (node 1149:54707).
const meta = {
  title: 'AuxoKit/Checkbox',
  component: Checkbox,
  args: { label: 'Remember me', disabled: false },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledCheckbox(args: ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      <p className="text-sm text-body">{checked ? 'Checked' : 'Unchecked'}</p>
    </div>
  );
}

function RadioGroupDemo() {
  const [plan, setPlan] = useState('pro');
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-sm font-medium text-heading">Plan</legend>
      {['Starter', 'Pro', 'Enterprise'].map((name) => (
        <Radio key={name} name="plan" value={name.toLowerCase()} label={name} checked={plan === name.toLowerCase()} onChange={() => setPlan(name.toLowerCase())} />
      ))}
    </fieldset>
  );
}

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithDescription: Story = { args: { label: 'Email notifications', description: 'Get a weekly summary of activity.' } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const Controlled: Story = { render: (args) => <ControlledCheckbox {...args} /> };
export const RadioGroup: Story = { render: () => <RadioGroupDemo /> };

export const AllStates: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
      <span className="text-xs font-medium text-body-subtle">Checkbox</span>
      <span className="text-xs font-medium text-body-subtle">Radio</span>
      <Checkbox {...args} label="Unchecked" />
      <Radio {...args} label="Unchecked" />
      <Checkbox {...args} label="Checked" defaultChecked />
      <Radio {...args} label="Checked" defaultChecked />
      <Checkbox {...args} label="Disabled" disabled />
      <Radio {...args} label="Disabled" disabled />
      <Checkbox {...args} label="Disabled checked" disabled defaultChecked />
      <Radio {...args} label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};
