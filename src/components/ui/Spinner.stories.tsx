import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Spinner, type SpinnerProps, type SpinnerSize } from './Spinner';
import { Button } from './Button';
import { Badge } from './Badge';

// AD Design Kit Spinner — mirrors the Figma "Spinner" set (node 1149:83311): Size × Track.
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

const AllSizes = (args: SpinnerProps) => (
  <div className="flex flex-wrap items-center gap-6">
    {sizes.map((size) => (
      <Spinner key={size} {...args} size={size} />
    ))}
  </div>
);

// Figma Track = True: the five sizes (xs 12 · sm 24 · md 50 · lg 75 · xl 100) on a gray track.
export const WithTrack: Story = { render: AllSizes };

// Figma Track = False: the indicator arc only.
export const WithoutTrack: Story = { args: { track: false }, render: AllSizes };

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
