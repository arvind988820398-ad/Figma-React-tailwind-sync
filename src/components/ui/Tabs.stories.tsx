import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { expect, fn, within } from 'storybook/test';
import { AdjustmentsHorizontalIcon, CheckCircleIcon, DownloadIcon, HomeIcon, UserCircleIcon, UserHeadsetIcon } from '../icons';
import { Tabs, type TabsProps, type TabsVariant } from './Tabs';

// AD Design Kit Tabs — one story per Figma "Nav tabs" Type (node 1149:80530), with Figma's content.
const variants: TabsVariant[] = ['text', 'underline', 'pills', 'button', 'segmented', 'vertical-pills', 'vertical-list'];

// Figma's tabs: Home, Settings, My account, Downloads, Support.
const items = [
  { value: 'home', label: 'Home', icon: <HomeIcon /> },
  { value: 'settings', label: 'Settings', icon: <AdjustmentsHorizontalIcon /> },
  { value: 'account', label: 'My account', icon: <UserCircleIcon /> },
  { value: 'downloads', label: 'Downloads', icon: <DownloadIcon /> },
  { value: 'support', label: 'Support', icon: <UserHeadsetIcon /> },
];

// Figma "Vertical with list item" repeats a "List item 1" placeholder with a check-circle icon; the story uses section names.
const listItems = ['Profile', 'Account', 'Security', 'Notifications', 'Billing', 'Integrations', 'Team', 'API keys', 'Appearance', 'Language'].map(
  (label) => ({ value: label.toLowerCase(), label, icon: <CheckCircleIcon /> }),
);

const withPanels = items.map((item) => ({
  ...item,
  content: (
    <div className="rounded-base border border-default bg-neutral-secondary-soft p-4 text-sm text-body">
      Content of the <span className="font-medium text-heading">{item.label}</span> tab.
    </div>
  ),
}));

// Interaction fixtures: a disabled tab between enabled ones.
const testItems = [
  { value: 'profile', label: 'Profile' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'settings', label: 'Settings' },
  { value: 'disabled', label: 'Disabled', disabled: true },
];
const testPanels = testItems.map((item) => ({ ...item, content: <p className="text-sm text-body">Content of the {item.label} tab.</p> }));

function TabsDemo({ value: initial, onValueChange, ...args }: TabsProps) {
  const [value, setValue] = useState(initial);
  return (
    <Tabs
      {...args}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onValueChange(v);
      }}
    />
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: { design: figmaDesign('Tabs'), layout: 'padded' },
  args: { items, value: 'settings', onValueChange: () => {}, variant: 'text', label: 'Tabs', mobile: false },
  argTypes: { variant: { control: 'select', options: variants } },
  render: (args) => <TabsDemo {...args} />,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Default": icon + label text tabs; Settings selected.
export const Default: Story = {};

// Figma "Pills": the selected tab is a Brand pill.
export const Pills: Story = { args: { variant: 'pills' } };

// Figma "Button": Ghost buttons in a bordered card; Home selected (Ghost Hover style).
export const Button: Story = { args: { variant: 'button', value: 'home' } };

// Figma "Button group": joined Ghost buttons with dividers; Home selected.
export const ButtonGroup: Story = { args: { variant: 'segmented', value: 'home' } };

// Figma "Border bottom", with tab panels.
export const BorderBottom: Story = { args: { variant: 'underline', items: withPanels } };

// Figma "Vertical with list item": Navigation list items in a card.
export const VerticalWithListItem: Story = { args: { variant: 'vertical-list', items: listItems, value: 'profile' } };

// Figma "Vertical pills", with tab panels.
export const VerticalPills: Story = { args: { variant: 'vertical-pills', items: withPanels } };

// Figma Mobile=True: Default, Pills and Border bottom become a Select; Button and Button group stack.
const mobile = { viewport: { value: 'mobile2', isRotated: false } };
export const DefaultMobile: Story = { args: { mobile: true }, globals: mobile };
export const PillsMobile: Story = { args: { variant: 'pills', mobile: true }, globals: mobile };
export const BorderBottomMobile: Story = { args: { variant: 'underline', mobile: true }, globals: mobile };
export const ButtonMobile: Story = { args: { variant: 'button', value: 'home', mobile: true }, globals: mobile };
export const ButtonGroupMobile: Story = { args: { variant: 'segmented', value: 'home', mobile: true }, globals: mobile };

// Interaction (mobile): the Select picks the tab and its panel.
export const MobileSelect: Story = {
  args: { variant: 'underline', items: withPanels, mobile: true, onValueChange: fn() },
  globals: mobile,
  play: async ({ canvas, userEvent, args }) => {
    const select = canvas.getByRole('combobox', { name: 'Tabs' });
    await expect(select).toHaveValue('settings');
    await expect(canvas.queryByRole('tablist')).toBeNull();
    await userEvent.selectOptions(select, 'downloads');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('downloads');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Content of the Downloads tab.');
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-xs text-body-subtle">variant="{variant}"</span>
          <TabsDemo {...args} variant={variant} label={`${variant} tabs`} />
        </div>
      ))}
    </div>
  ),
};

// Interaction: clicking a tab selects it and shows its panel; disabled tabs cannot be selected.
export const ClickToSelect: Story = {
  args: { variant: 'underline', items: testPanels, value: 'profile', onValueChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const profile = canvas.getByRole('tab', { name: 'Profile' });
    const settings = canvas.getByRole('tab', { name: 'Settings' });
    await expect(profile).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Content of the Profile tab.');

    await userEvent.click(settings);
    await expect(args.onValueChange).toHaveBeenLastCalledWith('settings');
    await expect(settings).toHaveAttribute('aria-selected', 'true');
    await expect(settings).toHaveAttribute('tabindex', '0');
    await expect(profile).toHaveAttribute('aria-selected', 'false');
    await expect(profile).toHaveAttribute('tabindex', '-1');
    const panel = canvas.getByRole('tabpanel');
    await expect(panel).toHaveTextContent('Content of the Settings tab.');
    await expect(panel).toHaveAttribute('aria-labelledby', settings.id);
    await expect(settings).toHaveAttribute('aria-controls', panel.id);

    const disabled = canvas.getByRole('tab', { name: 'Disabled' });
    await expect(disabled).toBeDisabled();
    await expect(settings).toHaveAttribute('aria-selected', 'true');
  },
};

// Interaction: horizontal roving focus — ArrowRight/ArrowLeft wrap and skip disabled tabs, Home/End jump.
export const KeyboardHorizontal: Story = {
  args: { items: testItems, value: 'profile', onValueChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const tab = (name: string) => canvas.getByRole('tab', { name });
    await expect(canvas.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    // Text variant without content renders no panels and no aria-controls.
    await expect(canvas.queryByRole('tabpanel')).not.toBeInTheDocument();
    await expect(tab('Profile')).not.toHaveAttribute('aria-controls');

    await userEvent.tab();
    await expect(tab('Profile')).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Dashboard')).toHaveFocus();
    await expect(tab('Dashboard')).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('dashboard');

    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Settings')).toHaveFocus();

    // Wraps past the disabled tab back to the first one.
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Profile')).toHaveFocus();
    await expect(tab('Profile')).toHaveAttribute('aria-selected', 'true');

    // Wraps backwards to the last enabled tab.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(tab('Settings')).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('settings');

    await userEvent.keyboard('{Home}');
    await expect(tab('Profile')).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('profile');

    await userEvent.keyboard('{End}');
    await expect(tab('Settings')).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('settings');

    // Vertical keys and other keys are ignored in a horizontal list.
    const calls = (args.onValueChange as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.keyboard('{ArrowDown}{ArrowUp}a');
    await expect(args.onValueChange).toHaveBeenCalledTimes(calls);
    await expect(tab('Settings')).toHaveFocus();
  },
};

// Interaction: vertical roving focus uses ArrowUp/ArrowDown; ArrowLeft/ArrowRight are ignored.
export const KeyboardVertical: Story = {
  args: { variant: 'vertical-pills', items: testPanels, value: 'profile', onValueChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const tab = (name: string) => canvas.getByRole('tab', { name });
    await expect(canvas.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');

    await userEvent.click(tab('Dashboard'));
    await expect(tab('Dashboard')).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Content of the Dashboard tab.');

    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Dashboard')).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{ArrowDown}');
    await expect(tab('Settings')).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Content of the Settings tab.');

    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(tab('Profile')).toHaveFocus();
    await expect(tab('Profile')).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('profile');

    await userEvent.keyboard('{ArrowUp}');
    await expect(tab('Settings')).toHaveFocus();
  },
};

// Interaction: every variant is selectable by click.
export const AllVariantsInteractive: Story = {
  args: { items: testItems, value: 'profile', onValueChange: fn() },
  render: (args) => (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <TabsDemo key={variant} {...args} variant={variant} label={`${variant} tabs`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, userEvent, args }) => {
    for (const variant of variants) {
      const list = within(canvasElement).getByRole('tablist', { name: `${variant} tabs` });
      const dashboard = within(list).getByRole('tab', { name: 'Dashboard' });
      await userEvent.click(dashboard);
      await expect(dashboard).toHaveAttribute('aria-selected', 'true');
      await expect(within(list).getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'false');
    }
    await expect(args.onValueChange).toHaveBeenCalledTimes(variants.length);
  },
};
