import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { CogIcon, InfoIcon, MailIcon } from '../icons';
import { Tabs, type TabsProps, type TabsVariant } from './Tabs';

// AD Design Kit Tabs — mirrors the Figma "Nav tabs" set (node 1149:80530).
const variants: TabsVariant[] = ['text', 'underline', 'pills', 'button', 'segmented', 'vertical-pills', 'vertical-list'];

const items = [
  { value: 'profile', label: 'Profile' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'settings', label: 'Settings' },
  { value: 'disabled', label: 'Disabled', disabled: true },
];

const withPanels = items.map((item) => ({
  ...item,
  content: (
    <div className="rounded-base border border-default bg-neutral-secondary-soft p-4 text-sm text-body">
      Content of the <span className="font-medium text-heading">{item.label}</span> tab.
    </div>
  ),
}));

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
  args: { items, value: 'profile', onValueChange: () => {}, variant: 'text', label: 'Tabs' },
  argTypes: { variant: { control: 'select', options: variants } },
  render: (args) => <TabsDemo {...args} />,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma "Border bottom", with tab panels.
export const Underline: Story = { args: { variant: 'underline', items: withPanels } };

export const Pills: Story = { args: { variant: 'pills' } };

// Figma "Button" and "Button group" (Tertiary items; selected = Tertiary Hover).
export const ButtonAndSegmented: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <TabsDemo {...args} variant="button" label="Button tabs" />
      <TabsDemo {...args} variant="segmented" label="Segmented tabs" />
    </div>
  ),
};

export const VerticalPills: Story = { args: { variant: 'vertical-pills', items: withPanels } };

// Figma "Vertical with list item".
export const VerticalList: Story = { args: { variant: 'vertical-list', items: withPanels } };

export const WithIcons: Story = {
  args: {
    variant: 'underline',
    items: [
      { value: 'profile', label: 'Profile', icon: <InfoIcon /> },
      { value: 'inbox', label: 'Inbox', icon: <MailIcon /> },
      { value: 'settings', label: 'Settings', icon: <CogIcon /> },
    ],
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
