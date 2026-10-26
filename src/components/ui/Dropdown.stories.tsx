import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CogIcon, MailIcon, PlusIcon } from '../icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Dropdown, DropdownCheckboxItem, DropdownHeader, DropdownItem, DropdownSeparator, type DropdownProps } from './Dropdown';

// AuxoKit Dropdown — mirrors the Figma "Dropdown menu" set (node 1149:39895), item 1149:39651, header 1149:39866.
const meta = {
  title: 'AuxoKit/Dropdown',
  component: Dropdown,
  // Leave room below the trigger for the open menu.
  decorators: [(Story) => <div className="flex min-h-72 items-start"><Story /></div>],
  args: {
    label: 'Actions',
    align: 'start',
    trigger: <Button>Dropdown</Button>,
    children: (
      <>
        <DropdownItem icon={<PlusIcon />}>New project</DropdownItem>
        <DropdownItem icon={<MailIcon />}>Invite people</DropdownItem>
        <DropdownItem icon={<CogIcon />}>Settings</DropdownItem>
        <DropdownItem disabled>Disabled item</DropdownItem>
      </>
    ),
  },
  argTypes: { align: { control: 'select', options: ['start', 'end'] } },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma "Dropdown header" + separator; items with trailing Badge and a description line.
export const UserProfile: Story = {
  args: {
    label: 'Account',
    trigger: (
      <Button color="ghost">
        <Avatar name="Ada Lovelace" size="sm" />
        Ada Lovelace
      </Button>
    ),
    children: (
      <>
        <DropdownHeader name="Ada Lovelace" email="ada@auxokit.dev" />
        <DropdownItem>Dashboard</DropdownItem>
        <DropdownItem trailing={<Badge color="white" size="sm">3</Badge>}>Notifications</DropdownItem>
        <DropdownItem description="Billing and invoices">Plan</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Sign out</DropdownItem>
      </>
    ),
  },
};

// Figma "Checkbox" type: toggling keeps the menu open.
function ColumnsDemo(args: DropdownProps) {
  const [cols, setCols] = useState({ name: true, status: true, revenue: false });
  return (
    <Dropdown {...args} label="Columns" trigger={<Button color="secondary">Columns</Button>}>
      {(Object.keys(cols) as (keyof typeof cols)[]).map((k) => (
        <DropdownCheckboxItem key={k} checked={cols[k]} onCheckedChange={(v) => setCols((c) => ({ ...c, [k]: v }))}>
          {k[0].toUpperCase() + k.slice(1)}
        </DropdownCheckboxItem>
      ))}
    </Dropdown>
  );
}
export const CheckboxItems: Story = { render: (args) => <ColumnsDemo {...args} /> };

export const IconTriggerAlignEnd: Story = {
  decorators: [(Story) => <div className="flex w-80 justify-end"><Story /></div>],
  args: {
    label: 'More',
    align: 'end',
    trigger: (
      <Button color="ghost" iconOnly aria-label="More actions">
        <CogIcon />
      </Button>
    ),
    children: (
      <>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Delete</DropdownItem>
      </>
    ),
  },
};

export const AvatarTrigger: Story = {
  args: {
    label: 'Account',
    trigger: (
      <Button color="ghost" iconOnly aria-label="Open account menu" className="rounded-full">
        <Avatar name="Grace Hopper" size="base" />
      </Button>
    ),
    children: (
      <>
        <DropdownHeader name="Grace Hopper" email="grace@auxokit.dev" avatar={<Avatar name="Grace Hopper" size="sm" />} />
        <DropdownItem>Profile</DropdownItem>
        <DropdownItem>Sign out</DropdownItem>
      </>
    ),
  },
};
