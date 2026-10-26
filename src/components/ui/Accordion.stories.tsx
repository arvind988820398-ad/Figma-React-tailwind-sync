import type { Meta, StoryObj } from '@storybook/react-vite';
import { CogIcon, MailIcon } from '../icons';
import { Accordion, type AccordionItem } from './Accordion';
import { IconShape } from './IconShape';

// AuxoKit Accordion — mirrors the Figma "Accordion" set (node 1146:19028).
const faq: AccordionItem[] = [
  {
    value: 'what',
    title: 'What is AuxoKit?',
    content: (
      <p>
        An open-source design system with Figma components and matching React + Tailwind code. <a href="#">Read the docs</a>.
      </p>
    ),
  },
  { value: 'figma', title: 'Is there a Figma file?', content: <p>Yes. Every component here maps to a Figma component set with the same variants.</p> },
  { value: 'sync', title: 'How does it stay in sync?', content: <p>Tokens are exported from Figma variables and compiled to Tailwind utilities with the same names.</p> },
];

const meta = {
  title: 'AuxoKit/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-full max-w-2xl"><Story /></div>],
  args: { items: faq, variant: 'default', multiple: false, defaultValue: ['what'] },
  argTypes: { variant: { control: 'select', options: ['default', 'flush', 'cards', 'nested', 'subheader'] } },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Flush: Story = { args: { variant: 'flush' } };

// Figma "Separate Cards".
export const Cards: Story = { args: { variant: 'cards' } };

// Figma "Multi-level": child items inside a panel.
export const Nested: Story = {
  args: {
    variant: 'nested',
    defaultValue: ['tokens'],
    items: [
      {
        value: 'tokens',
        title: 'Design tokens',
        content: <p>Colors, radius, typography and shadows.</p>,
        items: [
          { value: 'colors', title: 'Colors', content: <p>Semantic bg, text and border tokens per theme.</p> },
          { value: 'radius', title: 'Radius', content: <p>Themed scale from rounded-xxs to rounded-xl.</p> },
        ],
      },
      faq[1],
    ],
  },
};

// Figma "With sub-header": leading IconShape and a sub line.
export const SubHeader: Story = {
  args: {
    variant: 'subheader',
    defaultValue: [],
    items: [
      { value: 'account', title: 'Account', subtitle: 'Name, email and password', icon: <IconShape size="sm" color="brand"><MailIcon /></IconShape>, content: <p>Manage your account details.</p> },
      { value: 'settings', title: 'Settings', subtitle: 'Preferences and integrations', icon: <IconShape size="sm" color="success"><CogIcon /></IconShape>, content: <p>Manage your workspace settings.</p> },
    ],
  },
};

// Several panels open at once.
export const Multiple: Story = { args: { multiple: true, defaultValue: ['what', 'figma'] } };

export const AllClosed: Story = { args: { defaultValue: [] } };
