import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { HelperText, InputGroup, Label } from './Input';
import { Select } from './Select';
import { AngleDownIcon, QuestionCircleIcon, ServerIcon } from '../icons';

// AD Design Kit Select — mirrors the Figma "Select form" set (node 1149:46541): one story per Figma Type,
// each a Label (Required & icon) + the field(s) + Helper, as in Figma. Joined types use <InputGroup>.
const languages = ['English (US)', 'English (UK)', 'Deutsch', 'Français', 'Español'];
const options = (items: string[], placeholder?: string) => (
  <>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {items.map((c) => <option key={c}>{c}</option>)}
  </>
);
const states = ['California', 'Texas', 'Washington', 'Florida', 'Virginia'];

const meta = {
  title: 'Components/Select',
  parameters: { design: figmaDesign('Select') },
  component: Select,
  args: { children: options(languages), defaultValue: 'English (US)', size: 'base', disabled: false, 'aria-label': 'Language' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function Field({ id, label, helper, children }: { id: string; label: string; helper?: string; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} required icon={<QuestionCircleIcon />}>{label}</Label>
      {children}
      {helper && <HelperText>{helper}</HelperText>}
    </div>
  );
}

// Secondary button that opens a menu, joined to the select (Figma "USA ▾" and "Delete ▾").
function MenuButton({ label, children, items }: { label: string; children: ReactNode; items: string[] }) {
  return (
    <Dropdown label={label} trigger={<Button color="secondary" className="shrink-0" rightIcon={<AngleDownIcon />}>{children}</Button>}>
      {items.map((i) => <DropdownItem key={i} onSelect={() => {}}>{i}</DropdownItem>)}
    </Dropdown>
  );
}
const countryButton = (
  <MenuButton label="Country" items={['USA', 'Canada', 'Mexico']}>
    <span aria-hidden>🇺🇸</span> USA
  </MenuButton>
);

// ---- Figma Type ------------------------------------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => (
    <Field id="sel-lang" label="Select language" helper="You can change the language later in settings.">
      <Select {...args} id="sel-lang" aria-label={undefined} />
    </Field>
  ),
};

export const Inline: Story = {
  decorators: [(Story) => <div className="w-xl max-w-full"><Story /></div>],
  render: (args) => (
    <div className="flex items-center gap-4">
      <Label htmlFor="sel-inline" className="mb-0 shrink-0">State</Label>
      <InputGroup>
        {countryButton}
        <Select {...args} id="sel-inline" aria-label={undefined} defaultValue="">{options(states, 'California')}</Select>
        <MenuButton label="Actions" items={['Delete', 'Archive']}>Delete</MenuButton>
      </InputGroup>
    </div>
  ),
};

export const WithButtons: Story = {
  render: (args) => (
    <Field id="sel-buttons" label="Choose your state" helper="Pick the state you ship to.">
      <InputGroup>
        {countryButton}
        <Select {...args} id="sel-buttons" aria-label={undefined} defaultValue="">{options(states, 'California')}</Select>
        <MenuButton label="Actions" items={['Delete', 'Archive']}>Delete</MenuButton>
      </InputGroup>
    </Field>
  ),
};

export const LeftButton: Story = {
  render: (args) => (
    <Field id="sel-left" label="Choose your state" helper="Pick the state you ship to.">
      <InputGroup>
        {countryButton}
        <Select {...args} id="sel-left" aria-label={undefined} defaultValue="">{options(states, 'California')}</Select>
      </InputGroup>
    </Field>
  ),
};

export const TwoInputs: Story = {
  render: (args) => (
    <Field id="sel-plan" label="Select your hosting plan" helper="Select your hosting plan and provider">
      <InputGroup>
        <Select {...args} id="sel-plan" aria-label={undefined} leftIcon={<ServerIcon />} defaultValue="Wordpress 10">
          {options(['Wordpress 10', 'Wordpress 20', 'VPS Basic'])}
        </Select>
        <Select {...args} aria-label="Provider" defaultValue="">{options(['GoDaddy', 'Bluehost', 'Hostinger'], 'GoDaddy')}</Select>
      </InputGroup>
    </Field>
  ),
};

export const ThreeInputs: Story = {
  render: (args) => (
    <Field id="sel-day" label="Date of birth" helper="We use it to confirm your age.">
      <div className="flex gap-2.5">
        <Select {...args} id="sel-day" aria-label="Day" defaultValue="" className="flex-1">{options(['1', '2', '3', '4', '5'], 'Day')}</Select>
        <Select {...args} aria-label="Month" defaultValue="" className="flex-1">{options(['January', 'February', 'March'], 'Month')}</Select>
        <Select {...args} aria-label="Year" defaultValue="" className="flex-1">{options(['2024', '2025', '2026'], 'Year')}</Select>
      </div>
    </Field>
  ),
};

export const RangeInputs: Story = {
  render: (args) => (
    <div className="flex gap-4">
      <div className="flex-1">
        <Field id="sel-from" label="From" helper="Minimum budget.">
          <Select {...args} id="sel-from" aria-label={undefined} defaultValue="$500">{options(['$500', '$1000', '$5000'])}</Select>
        </Field>
      </div>
      <div className="flex-1">
        <Field id="sel-to" label="To">
          <Select {...args} id="sel-to" aria-label={undefined} defaultValue="$10000">{options(['$5000', '$10000', '$50000'])}</Select>
        </Field>
      </div>
    </div>
  ),
};

// ---- Figma State and Size (from the Input field) ----------------------------------------------------------------------

export const Disabled: Story = { args: { disabled: true } };
export const Success: Story = { args: { status: 'success' } };
export const Danger: Story = { args: { status: 'danger' } };

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <Select key={size} {...args} size={size} aria-label={`Language (${size})`} />
      ))}
    </div>
  ),
};

// The joined group keeps only its outer corners rounded.
export const JoinedCorners: Story = {
  ...WithButtons,
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group');
    const select = group.querySelector('select')!;
    await expect(getComputedStyle(select).borderTopLeftRadius).toBe('0px');
    await expect(getComputedStyle(select).borderTopRightRadius).toBe('0px');
    const first = group.querySelector('button')!;
    await expect(getComputedStyle(first).borderTopRightRadius).toBe('0px');
    await expect(getComputedStyle(first).borderTopLeftRadius).not.toBe('0px');
  },
};
