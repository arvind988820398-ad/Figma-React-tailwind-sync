import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, type TooltipPlacement } from './Tooltip';
import { Button } from './Button';
import { CogIcon } from '../icons';

// AuxoKit Tooltip — mirrors the Figma "Tooltip" set (node 1149:93859).
const placements = ['top', 'right', 'bottom', 'left'] as const satisfies readonly TooltipPlacement[];

const meta = {
  title: 'AuxoKit/Tooltip',
  component: Tooltip,
  // Room for the bubble on every side; hover or focus the trigger to show it.
  decorators: [(Story) => <div className="p-16">{Story()}</div>],
  args: {
    content: 'Tooltip content',
    placement: 'top',
    children: <Button color="secondary">Hover me</Button>,
  },
  argTypes: {
    placement: { control: 'select', options: placements },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Bottom: Story = { args: { placement: 'bottom' } };

// Icon-only buttons need a tooltip and an aria-label.
export const OnIconButton: Story = {
  args: {
    content: 'Settings',
    children: (
      <Button color="ghost" iconOnly aria-label="Settings">
        <CogIcon />
      </Button>
    ),
  },
};

export const LongContent: Story = {
  args: { content: 'Tooltips wrap at max-w-xs, so longer hints stay readable without spanning the whole screen.' },
};

export const AllPlacements: Story = {
  render: ({ placement: _placement, children: _children, ...args }) => (
    <div className="flex flex-wrap items-center justify-center gap-10">
      {placements.map((placement) => (
        <Tooltip key={placement} {...args} content={`placement="${placement}"`} placement={placement}>
          <Button color="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};
