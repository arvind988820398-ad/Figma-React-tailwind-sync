import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Spinner, type SpinnerSize } from './Spinner';
import { Button } from './Button';
import { Badge } from './Badge';

// AD Design Kit Spinner — mirrors the Figma "Spinner" set (node 1149:83311).
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const satisfies readonly SpinnerSize[];

const meta = {
  title: 'Components/Spinner',
  parameters: { design: figmaDesign('Spinner') },
  component: Spinner,
  args: { size: 'sm', track: true, label: 'Loading…' },
  argTypes: {
    size: { control: 'select', options: sizes },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoTrack: Story = { args: { track: false } };
export const Large: Story = { args: { size: 'lg' } };

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      {sizes.map((size) => (
        <Spinner key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const TrackAndNoTrack: Story = {
  render: ({ track: _track, ...args }) => (
    <div className="flex flex-col gap-4">
      {[true, false].map((track) => (
        <div key={String(track)} className="flex items-center gap-6">
          {sizes.map((size) => (
            <Spinner key={size} {...args} size={size} track={track} />
          ))}
        </div>
      ))}
    </div>
  ),
};

// Inline usage: loading button and syncing badge.
export const Inline: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button disabled leftIcon={<Spinner size="xs" label="Saving" />}>
        Saving…
      </Button>
      <Badge color="brand" leading={<Spinner size="xs" label="Syncing" />}>
        Syncing
      </Badge>
    </div>
  ),
};
