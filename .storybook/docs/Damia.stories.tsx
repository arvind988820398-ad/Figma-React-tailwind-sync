import type { Meta, StoryObj } from '@storybook/react-vite';
import { DamiaApp } from '../../src/features/damia/DamiaApp';

// The Damia workspace (src/features/damia), live. Embed shows only the three panels (Sources, Conversations, Studio),
// for pages outside Storybook to show it in an iframe, e.g. the Damia case study:
// https://ad-design-kit-storybook.netlify.app/iframe.html?id=screens-damia--embed&viewMode=story
const meta = {
  title: 'Screens/Damia',
  component: DamiaApp,
  // A screen built from the kit, not a component: no autodocs page, no test run.
  tags: ['!autodocs', '!test'],
  parameters: { layout: 'fullscreen', a11y: { test: 'off' } },
  // The preview decorator pads every story; the workspace fills the frame instead.
  render: (args) => (
    <div className="fixed inset-0 overflow-hidden">
      <DamiaApp {...args} />
    </div>
  ),
} satisfies Meta<typeof DamiaApp>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Workspace: Story = { args: { embedded: false } };
export const Embed: Story = { args: { embedded: true } };
