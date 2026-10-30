import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect } from 'storybook/test';
import { CogIcon, MailIcon } from '../icons';
import { Accordion, type AccordionItem } from './Accordion';
import { IconShape } from './IconShape';

// AD Design Kit Accordion — mirrors the Figma "Accordion" set (node 1146:19028).
const faq: AccordionItem[] = [
  {
    value: 'what',
    title: 'What is AD Design Kit?',
    content: (
      <p>
        An open-source design system with Figma components and matching React + Tailwind code. <a href="#" className="font-medium text-fg-brand underline hover:no-underline">Read the docs</a>.
      </p>
    ),
  },
  { value: 'figma', title: 'Is there a Figma file?', content: <p>Yes. Every component here maps to a Figma component set with the same variants.</p> },
  { value: 'sync', title: 'How does it stay in sync?', content: <p>Tokens are exported from Figma variables and compiled to Tailwind utilities with the same names.</p> },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: { design: figmaDesign('Accordion'), layout: 'padded' },
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

// Interaction: single mode — opening one item closes the other; clicking an open item collapses it.
export const SingleToggle: Story = {
  play: async ({ canvas, userEvent }) => {
    const what = canvas.getByRole('button', { name: 'What is AD Design Kit?' });
    const figma = canvas.getByRole('button', { name: 'Is there a Figma file?' });
    await expect(what).toHaveAttribute('aria-expanded', 'true');
    await expect(figma).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('region', { name: 'What is AD Design Kit?' })).toBeVisible();

    await userEvent.click(figma);
    await expect(figma).toHaveAttribute('aria-expanded', 'true');
    await expect(what).toHaveAttribute('aria-expanded', 'false');
    const panel = canvas.getByRole('region', { name: 'Is there a Figma file?' });
    await expect(panel).toBeVisible();
    await expect(figma).toHaveAttribute('aria-controls', panel.id);
    await expect(canvas.queryByRole('region', { name: 'What is AD Design Kit?' })).not.toBeInTheDocument();

    await userEvent.click(figma);
    await expect(figma).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryAllByRole('region')).toHaveLength(0);
  },
};

// Interaction: Enter and Space toggle a focused trigger.
export const KeyboardToggle: Story = {
  args: { defaultValue: [] },
  play: async ({ canvas, userEvent }) => {
    const what = canvas.getByRole('button', { name: 'What is AD Design Kit?' });
    const sync = canvas.getByRole('button', { name: 'How does it stay in sync?' });
    await userEvent.tab();
    await expect(what).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(what).toHaveAttribute('aria-expanded', 'true');
    // The open panel's link is next in the tab order.
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Read the docs' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(sync).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(sync).toHaveAttribute('aria-expanded', 'true');
    await expect(what).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    await expect(sync).toHaveAttribute('aria-expanded', 'false');
  },
};

// Interaction: multiple mode — items open independently and stay open.
export const MultipleToggle: Story = {
  args: { multiple: true, defaultValue: [], variant: 'cards' },
  play: async ({ canvas, userEvent }) => {
    const what = canvas.getByRole('button', { name: 'What is AD Design Kit?' });
    const figma = canvas.getByRole('button', { name: 'Is there a Figma file?' });
    const sync = canvas.getByRole('button', { name: 'How does it stay in sync?' });
    await userEvent.click(what);
    await userEvent.click(sync);
    await expect(what).toHaveAttribute('aria-expanded', 'true');
    await expect(sync).toHaveAttribute('aria-expanded', 'true');
    await expect(figma).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getAllByRole('region')).toHaveLength(2);

    await userEvent.click(what);
    await expect(what).toHaveAttribute('aria-expanded', 'false');
    await expect(sync).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: 'How does it stay in sync?' })).toBeVisible();
  },
};

// Interaction: flush variant toggles the same way.
export const FlushToggle: Story = {
  args: { variant: 'flush', defaultValue: [] },
  play: async ({ canvas, userEvent }) => {
    const sync = canvas.getByRole('button', { name: 'How does it stay in sync?' });
    await userEvent.click(sync);
    await expect(sync).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: 'How does it stay in sync?' })).toHaveTextContent('Tokens are exported from Figma variables');
  },
};

// Interaction: nested children toggle independently (always multiple) inside the open parent panel.
export const NestedToggle: Story = {
  args: { ...Nested.args },
  play: async ({ canvas, userEvent }) => {
    const colors = canvas.getByRole('button', { name: 'Colors' });
    const radius = canvas.getByRole('button', { name: 'Radius' });
    await expect(colors).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(colors);
    await userEvent.click(radius);
    await expect(colors).toHaveAttribute('aria-expanded', 'true');
    await expect(radius).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: 'Colors' })).toHaveTextContent('Semantic bg, text and border tokens per theme.');

    await userEvent.click(colors);
    await expect(colors).toHaveAttribute('aria-expanded', 'false');
    await expect(radius).toHaveAttribute('aria-expanded', 'true');

    // Closing the parent hides the nested rows.
    await userEvent.click(canvas.getByRole('button', { name: 'Design tokens' }));
    await expect(canvas.queryByRole('button', { name: 'Radius' })).not.toBeInTheDocument();
  },
};

// Interaction: sub-header triggers include the subtitle in their accessible name.
export const SubHeaderToggle: Story = {
  args: { ...SubHeader.args },
  play: async ({ canvas, userEvent }) => {
    const account = canvas.getByRole('button', { name: /Account/ });
    await expect(account).toHaveTextContent('Name, email and password');
    await userEvent.click(account);
    await expect(account).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Manage your account details.')).toBeVisible();
  },
};
