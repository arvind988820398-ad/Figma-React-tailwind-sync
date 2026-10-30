import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Skeleton, SkeletonLine, SkeletonMedia, type SkeletonType } from './Skeleton';

// AD Design Kit Skeleton — mirrors the Figma "Skeleton" set (node 1149:85600).
const types = ['text', 'simple-text', 'image', 'card', 'list', 'widget'] as const satisfies readonly SkeletonType[];

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: { design: figmaDesign('Skeleton'), layout: 'padded' },
  decorators: [(Story) => <div className="w-full max-w-md">{Story()}</div>],
  args: { type: 'text', label: 'Loading…' },
  argTypes: {
    type: { control: 'select', options: types },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const SimpleText: Story = { args: { type: 'simple-text' } };
export const ImageAndText: Story = { args: { type: 'image' } };
export const CardWithImage: Story = { args: { type: 'card' } };
export const List: Story = { args: { type: 'list' } };
export const Widget: Story = { args: { type: 'widget' } };

export const AllTypes: Story = {
  decorators: [(Story) => <div className="w-full max-w-4xl">{Story()}</div>],
  render: (args) => (
    <div className="grid gap-8 md:grid-cols-2">
      {types.map((type) => (
        <div key={type} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-body">type="{type}"</span>
          <Skeleton {...args} type={type} />
        </div>
      ))}
    </div>
  ),
};

// Build custom placeholders from the primitives.
export const Primitives: Story = {
  render: () => (
    <div role="status" aria-busy="true" className="flex animate-pulse items-center gap-4">
      <SkeletonMedia className="size-16" />
      <div className="flex flex-1 flex-col gap-3">
        <SkeletonLine className="h-2.5 w-1/2" />
        <SkeletonLine tone="secondary" className="w-full" />
        <SkeletonLine tone="secondary" className="w-2/3" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  ),
};
