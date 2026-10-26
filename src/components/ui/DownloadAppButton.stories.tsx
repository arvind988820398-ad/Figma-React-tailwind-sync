import type { Meta, StoryObj } from '@storybook/react-vite';
import { DownloadAppButton } from './DownloadAppButton';

// AuxoKit Download app button — mirrors the Figma "Download App Button" set (node 1146:24595). Device → store, Type → tone.
const meta = {
  title: 'AuxoKit/DownloadAppButton',
  component: DownloadAppButton,
  args: { store: 'app-store', tone: 'dark', href: '#' },
  argTypes: {
    store: { control: 'select', options: ['app-store', 'google-play'] },
    tone: { control: 'select', options: ['light', 'dark'] },
  },
} satisfies Meta<typeof DownloadAppButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AppStore: Story = {};
export const GooglePlay: Story = { args: { store: 'google-play' } };
export const LightTone: Story = { args: { tone: 'light' } };

// Both stores side by side, as in a footer or hero.
export const StorePair: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <DownloadAppButton {...args} store="app-store" />
      <DownloadAppButton {...args} store="google-play" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-3">
      {(['dark', 'light'] as const).map((tone) =>
        (['app-store', 'google-play'] as const).map((store) => <DownloadAppButton key={`${tone}-${store}`} {...args} tone={tone} store={store} />),
      )}
    </div>
  ),
};
