import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { HelperText, Input, Label } from './Input';
import { InfoIcon, MailIcon } from '../icons';

// AuxoKit Input field — mirrors the Figma "Input field" set (node 1149:46826), Label (1149:94727) and Helper (1149:94741).
const meta = {
  title: 'Components/Input',
  parameters: { design: figmaDesign('Input') },
  component: Input,
  args: { placeholder: 'name@company.com', size: 'base', disabled: false, 'aria-label': 'Email' },
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
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'ada@auxokit.dev' } };
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'Read only' } };

export const Statuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} status="success" defaultValue="Available" aria-label="Username (available)" />
      <Input {...args} status="danger" defaultValue="Taken" aria-label="Username (taken)" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} leftIcon={<MailIcon />} placeholder="Email" />
      <Input {...args} rightIcon={<InfoIcon />} placeholder="Search" aria-label="Search" />
    </div>
  ),
};

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="in-name" required>Full name</Label>
        <Input {...args} id="in-name" placeholder="Ada Lovelace" aria-label={undefined} />
        <HelperText>As it appears on your ID.</HelperText>
      </div>
      <div>
        <Label htmlFor="in-user">Username</Label>
        <Input {...args} id="in-user" status="success" defaultValue="ada" aria-label={undefined} />
        <HelperText status="success">Username is available.</HelperText>
      </div>
      <div>
        <Label htmlFor="in-mail">Email</Label>
        <Input {...args} id="in-mail" status="danger" defaultValue="ada@" aria-label={undefined} />
        <HelperText status="danger">Enter a valid email address.</HelperText>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <Input key={size} {...args} size={size} placeholder={`size="${size}"`} />
      ))}
    </div>
  ),
};
