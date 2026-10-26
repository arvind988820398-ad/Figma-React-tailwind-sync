import type { Meta, StoryObj } from '@storybook/react-vite';
import { CogIcon } from '../icons';
import { Badge } from './Badge';
import { Breadcrumb } from './Breadcrumb';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';

// AuxoKit Breadcrumb — mirrors the Figma "Breadcrumb" set (node 1148:31317). The last item is the current page.
const meta = {
  title: 'AuxoKit/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [{ label: 'Home', href: '#' }, { label: 'Projects', href: '#' }, { label: 'AuxoKit' }],
    variant: 'default',
  },
  argTypes: { variant: { control: 'select', options: ['default', 'background'] } },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma "Background": bordered neutral container.
export const Background: Story = { args: { variant: 'background' } };

export const WithIcon: Story = {
  args: { items: [{ label: 'Settings', href: '#', icon: <CogIcon /> }, { label: 'Team', href: '#' }, { label: 'Members' }] },
};

// Figma "With badge": a Badge as the last label.
export const WithBadge: Story = {
  args: { items: [{ label: 'Home', href: '#' }, { label: 'Releases', href: '#' }, { label: <Badge color="brand" size="sm">v2.0</Badge> }] },
};

// Figma "With dropdown": a Dropdown as the last label.
export const WithDropdown: Story = {
  decorators: [(Story) => <div className="min-h-48"><Story /></div>],
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Projects', href: '#' },
      {
        label: (
          <Dropdown label="Projects" trigger={<Button size="xs" color="secondary">AuxoKit</Button>}>
            <DropdownItem>AuxoKit</DropdownItem>
            <DropdownItem>Marketing site</DropdownItem>
            <DropdownItem>Mobile app</DropdownItem>
          </Dropdown>
        ),
      },
    ],
  },
};

export const SingleLevel: Story = { args: { items: [{ label: 'Home', href: '#' }, { label: 'Dashboard' }] } };
