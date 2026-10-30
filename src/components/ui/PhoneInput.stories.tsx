import type { Meta, StoryObj } from '@storybook/react-vite';
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
