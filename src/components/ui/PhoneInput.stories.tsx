import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { HelperText, Input, InputGroup, Label } from './Input';
import { defaultCountries, PhoneInput } from './PhoneInput';
import { Select } from './Select';
import { AngleDownIcon, ClipboardIcon, PhoneIcon, QuestionCircleIcon } from '../icons';

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
      <div className="w-max min-w-80 max-w-full">
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

// ---- Figma Type: each as in Figma, a Label (Required & icon) + the field + Helper ---------------------------------------

const lastUpdate = 'Last update: 20:45 AM, November 20, 2023';
function Field({ id, label, helper = lastUpdate, children }: { id: string; label: string; helper?: string; children: ReactNode }) {
  return (
    <div className="w-full">
      <Label htmlFor={id} required icon={<QuestionCircleIcon />}>{label}</Label>
      {children}
      <HelperText>{helper}</HelperText>
    </div>
  );
}
function MenuButton({ label, children, items, size, color = 'secondary' }: { label: string; children: ReactNode; items: string[]; size?: 'xs'; color?: 'secondary' | 'tertiary' }) {
  return (
    <Dropdown label={label} trigger={<Button color={color} size={size} className="shrink-0" rightIcon={<AngleDownIcon />}>{children}</Button>}>
      {items.map((i) => <DropdownItem key={i} onSelect={() => {}}>{i}</DropdownItem>)}
    </Dropdown>
  );
}
const country = <MenuButton label="Country code" items={['🇺🇸 +1', '🇬🇧 +44', '🇮🇳 +91']}><span aria-hidden>🇺🇸</span> +1</MenuButton>;
const sendCode = <MenuButton label="Send code by" items={['SMS', 'Voice call', 'WhatsApp']}>Send code</MenuButton>;
const width = (w: string) => [(Story: () => ReactNode) => <div className={w}><Story /></div>];

export const FigmaDefault: Story = {
  name: 'Default',
  render: () => (
    <Field id="ph-default" label="Phone number" helper="Select a phone number that matches the format.">
      <Input id="ph-default" type="tel" autoComplete="tel" placeholder="123-456-7890" leftIcon={<PhoneIcon />} />
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const OneButton: Story = {
  render: (args) => <Field id="ph-one" label="Phone number"><PhoneDemo {...args} id="ph-one" aria-label={undefined} /></Field>,
  decorators: width('w-96 max-w-full'),
};

export const InnerButton: Story = {
  render: () => (
    <Field id="ph-inner" label="Phone number">
      <Input id="ph-inner" type="tel" autoComplete="tel" placeholder="123-456-7890" leftIcon={<PhoneIcon />}
        endAction={<MenuButton label="Send code by" items={['SMS', 'Voice call']} size="xs" color="tertiary">Send SMS</MenuButton>} />
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const ThreeButtons: Story = {
  render: () => (
    <Field id="ph-three" label="Phone number">
      <InputGroup>
        {country}
        <Input id="ph-three" type="tel" autoComplete="tel-national" placeholder="123-456-7890" leftIcon={<PhoneIcon />} />
        {sendCode}
      </InputGroup>
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const StackedWithButton: Story = {
  render: () => (
    <Field id="ph-stacked" label="Phone number">
      <div className="flex flex-col gap-2.5">
        <InputGroup>
          {country}
          <Input id="ph-stacked" type="tel" autoComplete="tel-national" placeholder="123-456-7890" leftIcon={<PhoneIcon />} />
          {sendCode}
        </InputGroup>
        <Button className="w-full">Activate account</Button>
      </div>
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const SelectAndButton: Story = {
  render: () => (
    <Field id="ph-primary" label="Primary phone number" helper="Please set your primary phone number.">
      <InputGroup>
        <Select id="ph-primary" leftIcon={<PhoneIcon />} defaultValue="123-456-7890">
          {['123-456-7890', '456-789-0123'].map((n) => <option key={n}>{n}</option>)}
        </Select>
        <Button color="secondary" iconOnly aria-label="Copy phone number" className="shrink-0 text-body"><ClipboardIcon /></Button>
      </InputGroup>
    </Field>
  ),
  decorators: width('w-80'),
};

export const WithSpacedButtons: Story = {
  render: () => (
    <Field id="ph-spaced" label="Phone number">
      <div className="flex gap-4">
        {country}
        <Input id="ph-spaced" type="tel" autoComplete="tel-national" placeholder="123-456-7890" className="min-w-0 flex-1" />
        <Button className="shrink-0">Send code</Button>
      </div>
    </Field>
  ),
  decorators: width('w-md max-w-full'),
};

export const Inline: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Label htmlFor="ph-inline" className="mb-0 shrink-0">Phone number</Label>
      <div className="flex flex-1 gap-4">
        {country}
        <Input id="ph-inline" type="tel" autoComplete="tel-national" placeholder="123-456-7890" className="min-w-0 flex-1" />
        <Button className="shrink-0">Send code</Button>
      </div>
    </div>
  ),
  decorators: width('w-xl max-w-full'),
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
