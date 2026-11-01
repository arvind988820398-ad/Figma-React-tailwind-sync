import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Skeleton, SkeletonLine, SkeletonMedia, type SkeletonType } from './Skeleton';

// AD Design Kit Skeleton — one story per Figma "Skeleton" Type (node 1149:85600), at the Figma width.
const types = ['text', 'simple-text', 'image', 'card', 'list', 'widget'] as const satisfies readonly SkeletonType[];

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: { design: figmaDesign('Skeleton'), layout: 'padded' },
  args: { type: 'text', label: 'Loading…' },
  argTypes: {
    type: { control: 'select', options: types },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Text": centred two-line heading and an author row.
export const Text: Story = { args: { className: 'w-160 max-w-full' } };
// Figma "Simple text": paragraph rows.
export const SimpleText: Story = { args: { type: 'simple-text', className: 'w-160 max-w-full' } };
// Figma "Image + Text".
export const ImageAndText: Story = { args: { type: 'image', className: 'w-150 max-w-full' } };
// Figma "Card + Image".
export const CardWithImage: Story = { args: { type: 'card', className: 'w-96 max-w-full' } };
// Figma "List": five divided rows.
export const List: Story = { args: { type: 'list', className: 'w-75 max-w-full' } };
// Figma "Widget": title and a bar chart.
export const Widget: Story = { args: { type: 'widget', className: 'w-75 max-w-full' } };

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
