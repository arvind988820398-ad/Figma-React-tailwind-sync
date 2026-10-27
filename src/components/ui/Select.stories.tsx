import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { HelperText, Label } from './Input';
import { Select } from './Select';

// AuxoKit Select — mirrors the Figma "Select form" set (node 1149:46541).
const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'India', 'Japan'];
const countryOptions = (
  <>
    <option value="" disabled>Choose a country</option>
    {countries.map((c) => <option key={c}>{c}</option>)}
  </>
);

const meta = {
  title: 'Components/Select',
  parameters: { design: figmaDesign('Select') },
  component: Select,
  args: { children: countryOptions, defaultValue: '', size: 'base', disabled: false, 'aria-label': 'Country' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'Canada' } };
export const Success: Story = { args: { status: 'success', defaultValue: 'Canada' } };
export const Danger: Story = { args: { status: 'danger', defaultValue: 'Canada' } };
export const Disabled: Story = { args: { disabled: true } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="sel-country">Country</Label>
        <Select {...args} id="sel-country" aria-label={undefined} />
        <HelperText>Used for tax calculation.</HelperText>
      </div>
      <div className="flex items-center gap-4">
        <Label htmlFor="sel-sort" className="mb-0 shrink-0">Sort by</Label>
        <Select {...args} id="sel-sort" size="sm" defaultValue="Newest" aria-label={undefined}>
          <option>Newest</option>
          <option>Oldest</option>
          <option>Popular</option>
        </Select>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <Select key={size} {...args} size={size} aria-label={`Country (${size})`} />
      ))}
    </div>
  ),
};
