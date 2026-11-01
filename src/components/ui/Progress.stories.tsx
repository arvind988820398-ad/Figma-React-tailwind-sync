import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Progress, type ProgressColor, type ProgressProps } from './Progress';

// AD Design Kit Progress — one story per Figma "Progress Bars" Type (node 1149:82279), each in the six Figma colors
// (Primary = brand, Gray, Dark, Success, Danger, Warning); the bar itself is the "Bars" set (1149:82364).
const colors = ['brand', 'gray', 'dark', 'success', 'danger', 'warning'] as const satisfies readonly ProgressColor[];
const names: Record<ProgressColor, string> = { brand: 'Primary', gray: 'Gray', dark: 'Dark', success: 'Success', danger: 'Danger', warning: 'Warning' };

const meta = {
  title: 'Components/Progress',
  parameters: { design: figmaDesign('Progress') },
  component: Progress,
  args: { value: 50, color: 'brand', size: 'base', labelPosition: 'top', showValue: true },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    color: { control: 'select', options: colors },
    size: { control: 'select', options: ['base', 'lg'] },
    labelPosition: { control: 'select', options: ['top', 'side', 'bottom'] },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

function AllColors(args: ProgressProps) {
  return (
    <div className={args.labelPosition === 'side' ? 'flex w-md max-w-full flex-col gap-8' : 'flex w-88 max-w-full flex-col gap-8'}>
      {colors.map((color) => (
        <Progress key={color} {...args} color={color} label={names[color]} />
      ))}
    </div>
  );
}

// Figma "Top label": label and value above the bar.
export const TopLabel: Story = { render: AllColors };

// Figma "Side label": label left of the bar, value right of it.
export const SideLabel: Story = { args: { labelPosition: 'side' }, render: AllColors };

// Figma "Bottom label": label and value under the bar.
export const BottomLabel: Story = { args: { labelPosition: 'bottom' }, render: AllColors };

// Value only, as in the Toast "With progress bar": the percentage right of the bar.
export const ValueOnly: Story = {
  args: { labelPosition: 'side', value: 75, 'aria-label': 'Upload progress' },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Upload progress' });
    await expect(bar).toHaveAttribute('aria-valuenow', '75');
    await expect(bar.compareDocumentPosition(canvas.getByText('75%')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

// The "Bars" part in its large size, without text.
export const Large: Story = { args: { size: 'lg', showValue: false, 'aria-label': 'Storage used', value: 72 }, decorators: [(Story) => <div className="w-88">{Story()}</div>] };
