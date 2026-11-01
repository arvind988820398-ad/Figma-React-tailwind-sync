import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Badge, type BadgeColor, type BadgeProps } from './Badge';
import { Avatar } from './Avatar';
import { Spinner } from './Spinner';
import { ClockIcon } from '../icons';

// AD Design Kit Badge — one story per Figma "Badge" Type (node 1146:22250), each in the six Figma themes
// (Gray, White, Brand, Danger, Warning, Success) and both sizes (sm row, lg row). Every Figma badge has the close icon.
const colors = ['gray', 'white', 'brand', 'danger', 'warning', 'success'] as const satisfies readonly BadgeColor[];

const meta = {
  title: 'Components/Badge',
  parameters: { design: figmaDesign('Badge') },
  component: Badge,
  args: { children: 'Badge text', color: 'gray', size: 'sm', onRemove: fn() },
  argTypes: {
    color: { control: 'select', options: colors },
    size: { control: 'select', options: ['sm', 'lg'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const grid = (leading?: (size: 'sm' | 'lg') => BadgeProps['leading']) =>
  function Grid(args: BadgeProps) {
    return (
      <div className="flex flex-col gap-4">
        {(['sm', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            {colors.map((color) => (
              <Badge key={color} {...args} size={size} color={color} leading={leading?.(size) ?? args.leading} />
            ))}
          </div>
        ))}
      </div>
    );
  };

// Figma "Default": clock icon, text and the close icon.
export const Default: Story = { args: { leading: <ClockIcon /> }, render: grid() };

// Figma "With avatar": a 14px avatar before the text.
export const WithAvatar: Story = { render: grid(() => <Avatar name="Bonnie Green" size="xs" className="size-3.5" />) };

// Figma "With dot": a 6px dot in the text color.
export const WithDot: Story = { render: grid(() => <span className="size-1.5 rounded-full bg-current" />) };

// Figma "With loader": an xs Spinner.
export const WithLoader: Story = { render: grid(() => <Spinner size="xs" label="Loading" />) };

// Figma "With secondary text": a value after a divider.
export const WithSecondaryText: Story = { args: { leading: <ClockIcon />, secondary: 'Secondary text' }, render: grid() };

// Figma "Only icon": round icon-only badge with an aria-label.
export const OnlyIcon: Story = {
  args: { iconOnly: true, children: <ClockIcon />, 'aria-label': 'Pending', onRemove: undefined },
  render: grid(),
};

// Figma "Only text": round counter of 1–2 characters.
export const OnlyText: Story = { args: { circle: true, children: '1', onRemove: undefined }, render: grid() };

// Interaction: the close icon is a labelled remove button.
export const Remove: Story = {
  args: { color: 'brand', leading: <ClockIcon />, removeLabel: 'Remove Badge text' },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Badge text' }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};
