import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps } from 'react';
import { HelperText, Label } from './Input';
import { defaultCountries, PhoneInput } from './PhoneInput';

// AD Design Kit Phone input — mirrors the Figma "Phone form" set (node 1149:46719).
const meta = {
  title: 'Components/PhoneInput',
  parameters: { design: figmaDesign('PhoneInput') },
  component: PhoneInput,
  args: { value: '', onChange: () => {}, country: 'US', onCountryChange: () => {}, placeholder: '123-456-7890', disabled: false, 'aria-label': 'Phone number' },
  argTypes: {
    status: { control: 'select', options: ['success', 'danger'] },
  },
  render: (args) => <PhoneDemo {...args} />,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function PhoneDemo(args: ComponentProps<typeof PhoneInput>) {
  const [value, setValue] = useState(args.value);
  const [country, setCountry] = useState(args.country);
  return <PhoneInput {...args} value={value} onChange={setValue} country={country} onCountryChange={setCountry} />;
}

export const Default: Story = {};
export const Filled: Story = { args: { value: '7700 900123', country: 'GB' } };
export const Success: Story = { args: { value: '555-0100', status: 'success' } };
export const Danger: Story = { args: { value: '12', status: 'danger' } };
export const Disabled: Story = { args: { value: '555-0100', disabled: true } };
export const CustomCountries: Story = {
  args: { countries: defaultCountries.filter((c) => c.code === 'DE' || c.code === 'GB'), country: 'DE' },
};

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="ph-phone">Phone number</Label>
        <PhoneDemo {...args} id="ph-phone" aria-describedby="ph-phone-help" aria-label={undefined} />
        <HelperText id="ph-phone-help">We’ll text a verification code.</HelperText>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="ph-phone-bad">Phone number</Label>
        <PhoneDemo {...args} id="ph-phone-bad" value="12" country="GB" status="danger" aria-describedby="ph-phone-bad-help" aria-label={undefined} />
        <HelperText id="ph-phone-bad-help" status="danger">Enter a full phone number.</HelperText>
      </div>
    </div>
  ),
};

// ---- Interaction tests -------------------------------------------------------------------------------------------
// Typing fills the number; the country menu changes the dial code shown on the trigger.
export const TypeAndPickCountry: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Phone number' });
    await userEvent.type(field, '555-0100');
    await expect(field).toHaveValue('555-0100');

    const trigger = canvas.getByRole('button', { name: 'Country code United States +1' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(5);
    await userEvent.click(canvas.getByRole('menuitem', { name: /India/ }));

    const updated = canvas.getByRole('button', { name: 'Country code India +91' });
    await expect(updated).toHaveTextContent('+91');
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(field).toHaveValue('555-0100');
  },
};

// An unknown country code falls back to the first country in the list.
export const UnknownCountryFallsBack: Story = {
  args: { country: 'XX' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Country code United States +1' })).toBeVisible();
  },
};

// Disabled: neither the country trigger nor the field accept input; danger marks the field invalid.
export const DisabledAndInvalid: Story = {
  args: { value: '12', disabled: true, status: 'danger' },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Phone number' });
    await expect(field).toBeDisabled();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('button', { name: /Country code/ })).toBeDisabled();
  },
};
