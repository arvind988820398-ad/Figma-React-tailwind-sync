import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';
import { CogIcon, MailIcon, PlusIcon } from '../icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Dropdown, DropdownCheckboxItem, DropdownHeader, DropdownItem, DropdownSeparator, type DropdownProps } from './Dropdown';

// AD Design Kit Dropdown — mirrors the Figma "Dropdown menu" set (node 1149:39895), item 1149:39651, header 1149:39866.
const meta = {
  title: 'Components/Dropdown',
  parameters: { design: figmaDesign('Dropdown') },
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
        <DropdownHeader name="Ada Lovelace" email="ada@ad-design-kit.dev" />
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
    // Named by the avatar (the person's name); aria-haspopup="menu" announces the menu.
    trigger: (
      <Button color="ghost" iconOnly className="rounded-full">
        <Avatar name="Grace Hopper" size="base" />
      </Button>
    ),
    children: (
      <>
        <DropdownHeader name="Grace Hopper" email="grace@ad-design-kit.dev" avatar={<Avatar name="Grace Hopper" size="sm" />} />
        <DropdownItem>Profile</DropdownItem>
        <DropdownItem>Sign out</DropdownItem>
      </>
    ),
  },
};

// ── Interaction tests ────────────────────────────────────────────────────────────────────────────────────────────────

const onNewProject = fn();
const onSettings = fn();

// Arrow keys wrap and skip the disabled item, Home/End jump, Escape closes and returns focus to the trigger.
export const KeyboardNavigation: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Dropdown' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('aria-controls');

    await userEvent.click(trigger);
    const menu = canvas.getByRole('menu', { name: 'Actions' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', menu.id);
    const [newProject, invite, settings, disabled] = within(menu).getAllByRole('menuitem');
    await expect(disabled).toBeDisabled();
    // Opening moves focus to the first enabled item.
    await waitFor(() => expect(newProject).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    await expect(invite).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(settings).toHaveFocus();
    // The disabled item is skipped and the list wraps to the top.
    await userEvent.keyboard('{ArrowDown}');
    await expect(newProject).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(settings).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(newProject).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(settings).toHaveFocus();
    // Unhandled keys do nothing.
    await userEvent.keyboard('a');
    await expect(settings).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};

// Clicking or pressing Enter on an item calls onSelect, closes the menu and returns focus to the trigger.
export const SelectItem: Story = {
  args: {
    children: (
      <>
        <DropdownItem icon={<PlusIcon />} onSelect={onNewProject}>New project</DropdownItem>
        <DropdownItem icon={<CogIcon />} onSelect={onSettings}>Settings</DropdownItem>
        <DropdownItem>No handler</DropdownItem>
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    onNewProject.mockClear();
    onSettings.mockClear();
    const trigger = canvas.getByRole('button', { name: 'Dropdown' });

    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Settings' }));
    await expect(onSettings).toHaveBeenCalledTimes(1);
    await expect(onNewProject).not.toHaveBeenCalled();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'New project' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(onNewProject).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    // An item without onSelect still closes the menu.
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'No handler' }));
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

// Clicking the trigger again or anywhere outside closes the menu; clicks inside it do not; Tab moves on and closes it.
export const DismissBehaviour: Story = {
  args: { ...UserProfile.args },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /Ada Lovelace/ });

    await userEvent.click(trigger);
    const menu = canvas.getByRole('menu', { name: 'Account' });
    await expect(within(menu).getByText('ada@ad-design-kit.dev')).toBeVisible();
    await expect(within(menu).getByRole('separator')).toBeInTheDocument();
    await expect(within(menu).getByRole('menuitem', { name: /Plan/ })).toHaveTextContent('Billing and invoices');
    await expect(within(menu).getByRole('menuitem', { name: /Notifications/ })).toHaveTextContent('3');
    // Pointer down inside the menu (on the header) keeps it open.
    await userEvent.click(within(menu).getByText('ada@ad-design-kit.dev'));
    await expect(canvas.getByRole('menu')).toBeVisible();
    // Trigger toggles.
    await userEvent.click(trigger);
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(canvas.getByRole('menu')).toBeVisible();
    await userEvent.click(canvasElement.ownerDocument.body);
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Dashboard' })).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

// Checkbox items toggle aria-checked and keep the menu open.
export const ToggleCheckboxItems: Story = {
  render: (args) => <ColumnsDemo {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
    const menu = canvas.getByRole('menu', { name: 'Columns' });
    const [name, , revenue] = within(menu).getAllByRole('menuitemcheckbox');
    await expect(name).toHaveAttribute('aria-checked', 'true');
    await expect(revenue).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(revenue);
    await expect(revenue).toHaveAttribute('aria-checked', 'true');
    await expect(menu).toBeVisible();
    await userEvent.click(name);
    await expect(name).toHaveAttribute('aria-checked', 'false');
    // Keyboard reaches checkbox items too.
    await userEvent.keyboard('{End}');
    await expect(revenue).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(revenue).toHaveAttribute('aria-checked', 'false');
    await expect(menu).toBeVisible();
  },
};

// align="end" anchors the open menu to the trigger's end edge; a header without an email shows only the name.
export const OpenAlignedEnd: Story = {
  ...IconTriggerAlignEnd,
  args: {
    ...IconTriggerAlignEnd.args,
    children: (
      <>
        <DropdownHeader name="Grace Hopper" />
        <DropdownItem>Edit</DropdownItem>
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'More actions' }));
    const menu = canvas.getByRole('menu', { name: 'More' });
    await expect(menu).toHaveClass('end-0');
    await expect(menu).not.toHaveClass('start-0');
    await expect(within(menu).getByText('Grace Hopper')).toBeVisible();
    await expect(within(menu).queryByText(/@/)).not.toBeInTheDocument();
  },
};

// Destructive item: color="danger" (Figma Color = Danger). Red text and icon, danger-soft hover.
export const DangerItem: Story = {
  args: {
    label: 'Chat options',
    trigger: <Button color="secondary">Options</Button>,
    children: (
      <>
        <DropdownItem>Rename</DropdownItem>
        <DropdownItem color="danger">Delete</DropdownItem>
      </>
    ),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Options' }));
    const del = within(canvasElement).getByRole('menuitem', { name: 'Delete' });
    await expect(del).toHaveClass('text-fg-danger-strong');
    await expect(within(canvasElement).getByRole('menuitem', { name: 'Rename' })).not.toHaveClass('text-fg-danger-strong');
  },
};
