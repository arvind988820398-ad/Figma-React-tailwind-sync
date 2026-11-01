import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { AngleDownIcon, AngleLeftIcon, AngleRightIcon, CodeBranchIcon, DatabaseIcon, HomeIcon } from '../icons';
import { Badge } from './Badge';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { Button } from './Button';
import { ButtonGroup, ButtonGroupItem } from './ButtonGroup';
import { Dropdown, DropdownItem } from './Dropdown';

// AD Design Kit Breadcrumb — one story per Figma "Breadcrumb" Type (node 1148:31317), with Figma's content.
// The last item is the current page.
const trail: BreadcrumbItem[] = [
  { label: 'Home', href: '#', icon: <HomeIcon /> },
  { label: 'E-commerce', href: '#' },
  { label: 'Users', href: '#' },
  { label: 'All users' },
];

const meta = {
  title: 'Components/Breadcrumb',
  parameters: { design: figmaDesign('Breadcrumb') },
  component: Breadcrumb,
  args: { items: trail, variant: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'background', 'buttons'] } },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Default": text crumbs with a home icon on the first.
export const Default: Story = {};

// Figma "Background": the same trail in a bordered neutral container.
export const Background: Story = { args: { variant: 'background' } };

// Figma "With dropdown": the last crumb is a Secondary xs Button opening a Dropdown.
export const WithDropdown: Story = {
  decorators: [(Story) => <div className="min-h-56"><Story /></div>],
  args: {
    items: [
      { label: 'Home', href: '#', icon: <HomeIcon /> },
      { label: 'Settings', href: '#' },
      { label: 'Databases', href: '#' },
      {
        label: (
          <Dropdown label="Databases" trigger={<Button size="xs" color="secondary" leftIcon={<DatabaseIcon />} rightIcon={<AngleDownIcon />}>AD Design Kit</Button>}>
            <DropdownItem>AD Design Kit</DropdownItem>
            <DropdownItem>Marketing site</DropdownItem>
            <DropdownItem>Mobile app</DropdownItem>
          </Dropdown>
        ),
      },
    ],
  },
};

// Figma "With badge": the current crumb carries a Badge and a branch picker.
export const WithBadge: Story = {
  decorators: [(Story) => <div className="min-h-56"><Story /></div>],
  args: {
    items: [
      { label: 'addesignkit.com', href: '#' },
      { label: 'develop', href: '#' },
      {
        label: (
          <span className="inline-flex items-center gap-2.5">
            Issue #312
            <Badge color="brand" size="sm">docs</Badge>
            <Dropdown label="Branches" trigger={<Button size="xs" color="secondary" leftIcon={<CodeBranchIcon />} rightIcon={<AngleDownIcon />}>Fix #6597</Button>}>
              <DropdownItem>Fix #6597</DropdownItem>
              <DropdownItem>develop</DropdownItem>
              <DropdownItem>main</DropdownItem>
            </Dropdown>
          </span>
        ),
      },
    ],
  },
};

// Figma "With group buttons": back/forward controls before the trail.
export const WithGroupButtons: Story = {
  args: {
    items: [{ label: 'Home', href: '#', icon: <HomeIcon /> }, { label: 'Settings', href: '#' }, { label: 'User settings' }],
    leading: (
      <ButtonGroup size="sm" color="white" label="History">
        <ButtonGroupItem iconOnly aria-label="Back"><AngleLeftIcon /></ButtonGroupItem>
        <ButtonGroupItem iconOnly aria-label="Forward"><AngleRightIcon /></ButtonGroupItem>
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
    items: [
      { label: <>addesignkit.com <AngleDownIcon /></>, href: '#', icon: <CodeBranchIcon /> },
      { label: <>databaseName <AngleDownIcon /></>, icon: <DatabaseIcon /> },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'addesignkit.com' })).toHaveClass('rounded-base');
    await expect(canvas.getByText('databaseName').closest('[aria-current]')).toHaveAttribute('aria-current', 'page');
  },
};
