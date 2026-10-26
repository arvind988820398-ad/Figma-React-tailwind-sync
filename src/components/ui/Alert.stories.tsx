import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, type AlertColor } from './Alert';
import { Badge } from './Badge';
import { Button } from './Button';
import { InfoIcon } from '../icons';

// AuxoKit Alert — mirrors the Figma "Alert" set (node 1146:15151).
const colors = ['neutral', 'info', 'success', 'warning', 'danger'] as const satisfies readonly AlertColor[];

const meta = {
  title: 'AuxoKit/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  args: { color: 'neutral', variant: 'default', children: 'A short message for the user.' },
  argTypes: {
    color: { control: 'select', options: colors },
    variant: { control: 'select', options: ['default', 'complex', 'pill', 'border-top'] }, // auxokit-lint-ignore: Alert prop values, not classes
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIcon: Story = { args: { color: 'info', icon: <InfoIcon /> } };
export const Dismissible: Story = { args: { color: 'success', icon: <InfoIcon />, onDismiss: () => {} } };
export const BorderTop: Story = { args: { variant: 'border-top', color: 'warning', icon: <InfoIcon /> } }; // auxokit-lint-ignore: Alert prop value, not a class

// Figma "Complex": title + body + action buttons + dismiss.
export const Complex: Story = {
  args: {
    variant: 'complex',
    color: 'danger',
    icon: <InfoIcon />,
    title: 'Danger alert',
    onDismiss: () => {},
    actions: (
      <>
        <Button size="xs" color="danger">View more</Button>
        <Button size="xs" color="tertiary">Dismiss</Button>
      </>
    ),
    children: 'More detail about this message goes here.',
  },
};

// Figma "Pill": inline announcement, also used as a Jumbotron eyebrow.
export const Pill: Story = {
  parameters: { layout: 'centered' },
  args: {
    variant: 'pill',
    color: 'info',
    children: (
      <span className="flex items-center gap-2">
        <Badge color="brand" size="sm">New</Badge>
        AuxoKit 2.0 is out
      </span>
    ),
  },
};

export const AllColors: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {colors.map((color) => (
        <Alert key={color} {...args} color={color} icon={<InfoIcon />}>
          <span className="font-medium">{color}</span> — a short message for the user.
        </Alert>
      ))}
    </div>
  ),
};
