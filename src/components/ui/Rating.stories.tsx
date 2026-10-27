import { useState } from 'react';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating, RatingInput } from './Rating';
import { Badge } from './Badge';

// AuxoKit Rating — mirrors the Figma "Rating" set (node 1149:82444).
const meta = {
  title: 'Components/Rating',
  parameters: { design: figmaDesign('Rating') },
  component: Rating,
  args: { value: 4, max: 5 },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 5, step: 0.5 } },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabel: Story = { args: { label: '4.95 out of 5' } };

// Figma "With badge": a score badge before the stars.
export const WithBadge: Story = {
  args: { value: 4.5, badge: <Badge color="brand" size="sm">4.95</Badge>, label: '73 reviews' },
};

export const Empty: Story = { args: { value: 0, label: 'No reviews yet' } };
export const TenStars: Story = { args: { value: 7, max: 10 } };

function RatingInputDemo() {
  const [value, setValue] = useState<number | null>(null);
  return <RatingInput label="Rate your experience" value={value} onChange={setValue} />;
}

// Figma "Radio input": 1–N circles as a radio group (RatingInput).
export const Input: Story = {
  render: () => <RatingInputDemo />,
};
