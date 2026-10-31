import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { CogIcon } from '../icons';
import { Badge } from './Badge';
import { Breadcrumb } from './Breadcrumb';
import { Button } from './Button';
import { ButtonGroup, ButtonGroupItem } from './ButtonGroup';
import { Dropdown, DropdownItem } from './Dropdown';

// AD Design Kit Breadcrumb — mirrors the Figma "Breadcrumb" set (node 1148:31317). The last item is the current page.
const meta = {
  title: 'Components/Breadcrumb',
  parameters: { design: figmaDesign('Breadcrumb') },
  component: Breadcrumb,
  args: {
    items: [{ label: 'Home', href: '#' }, { label: 'Projects', href: '#' }, { label: 'AD Design Kit' }],
    variant: 'default',
  },
  argTypes: { variant: { control: 'select', options: ['default', 'background', 'buttons'] } },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma "Background": bordered neutral container.
export const Background: Story = { args: { variant: 'background' } };

const Arrow = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Figma "With group buttons": back/forward controls before the trail.
export const WithGroupButtons: Story = {
  args: {
    items: [{ label: 'Home', href: '#' }, { label: 'Settings', href: '#' }, { label: 'User settings' }],
    leading: (
      <ButtonGroup size="sm" color="white" label="History">
        <ButtonGroupItem iconOnly aria-label="Back"><Arrow d="m15 6-6 6 6 6" /></ButtonGroupItem>
        <ButtonGroupItem iconOnly aria-label="Forward"><Arrow d="m9 6 6 6-6 6" /></ButtonGroupItem>
      </ButtonGroup>
    ),
  },
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(within(nav).getByRole('group', { name: 'History' })).toBeVisible();
    await expect(within(nav).getByText('User settings')).toHaveAttribute('aria-current', 'page');
  },
};

// Figma "Only buttons": every crumb is a Ghost xs Button, e.g. repository › database pickers in a toolbar.
export const OnlyButtons: Story = {
  args: {
    variant: 'buttons',
    items: [{ label: 'addesignkit.com', href: '#' }, { label: 'databaseName' }],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'addesignkit.com' })).toHaveClass('rounded-base');
    await expect(canvas.getByText('databaseName')).toHaveAttribute('aria-current', 'page');
  },
};

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
          <Dropdown label="Projects" trigger={<Button size="xs" color="secondary">AD Design Kit</Button>}>
            <DropdownItem>AD Design Kit</DropdownItem>
            <DropdownItem>Marketing site</DropdownItem>
            <DropdownItem>Mobile app</DropdownItem>
          </Dropdown>
        ),
      },
    ],
  },
};

export const SingleLevel: Story = { args: { items: [{ label: 'Home', href: '#' }, { label: 'Dashboard' }] } };
