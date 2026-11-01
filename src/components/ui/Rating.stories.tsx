import { useState } from 'react';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Rating, RatingInput } from './Rating';
import { Badge } from './Badge';

// AD Design Kit Rating — one story per Figma "Rating" Type (node 1149:82444), with Figma's content.
const meta = {
  title: 'Components/Rating',
  parameters: { design: figmaDesign('Rating') },
  component: Rating,
  args: { value: 5, max: 5 },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 5, step: 0.5 } },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Default": five stars and the score.
export const Default: Story = { args: { label: '5.0' } };

// Figma "With badge": the score in a Brand badge after the stars.
export const WithBadge: Story = {
  args: { badge: <Badge color="brand" size="sm">4.8 out of 5</Badge> },
};

// Partly filled and empty states.
export const Partial: Story = { args: { value: 3, label: '3.0' } };
export const Empty: Story = { args: { value: 0, label: 'No reviews yet' } };

function RatingInputDemo() {
  const [value, setValue] = useState<number | null>(null);
  return <RatingInput label="How likely are you to recommend us?" min={0} max={5} startLabel="Not likely" endLabel="Very likely" value={value} onChange={setValue} />;
}

// Figma "Radio input": a joined 0–5 scale between "Not likely" and "Very likely".
export const Input: Story = {
  render: () => <RatingInputDemo />,
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'How likely are you to recommend us?' });
    await expect(within(group).getAllByRole('radio')).toHaveLength(6);
    await userEvent.click(within(group).getByText('4'));
    await expect(within(group).getByRole('radio', { name: '4' })).toBeChecked();
  },
};
