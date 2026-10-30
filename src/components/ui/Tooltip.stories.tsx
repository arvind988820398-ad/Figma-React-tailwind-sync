import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, waitFor } from 'storybook/test';
import { Tooltip, type TooltipPlacement } from './Tooltip';
import { Button } from './Button';
import { CogIcon } from '../icons';

// AD Design Kit Tooltip — mirrors the Figma "Tooltip" set (node 1149:93859).
const placements = ['top', 'right', 'bottom', 'left'] as const satisfies readonly TooltipPlacement[];

const meta = {
  title: 'Components/Tooltip',
  parameters: { design: figmaDesign('Tooltip') },
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

// ── Interaction tests ────────────────────────────────────────────────────────────────────────────────────────────────

// The bubble fades (transition-opacity), so visibility is awaited.
// Hover shows the bubble and links it with aria-describedby; leaving hides it again.
export const ShowOnHover: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Hover me' });
    const tooltip = canvas.getByRole('tooltip', { hidden: true });
    await waitFor(() => expect(tooltip).not.toBeVisible());
    await expect(trigger).not.toHaveAttribute('aria-describedby');

    await userEvent.hover(trigger);
    await waitFor(() => expect(tooltip).toBeVisible());
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    await expect(trigger).toHaveAccessibleDescription('Tooltip content');

    await userEvent.unhover(trigger);
    await waitFor(() => expect(tooltip).not.toBeVisible());
    await expect(trigger).not.toHaveAttribute('aria-describedby');
  },
};

// Keyboard: focus shows it, Escape dismisses it (other keys don't), and tabbing away hides it.
export const ShowOnFocus: Story = {
  args: OnIconButton.args,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Settings' });
    const tooltip = canvas.getByRole('tooltip', { hidden: true });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(tooltip).toBeVisible());
    await expect(trigger).toHaveAccessibleDescription('Settings');

    await userEvent.keyboard('{Shift}');
    await waitFor(() => expect(tooltip).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(tooltip).not.toBeVisible());
    await expect(trigger).toHaveFocus();

    // Refocus, then blur by tabbing away.
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await waitFor(() => expect(tooltip).toBeVisible());
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await waitFor(() => expect(tooltip).not.toBeVisible());
  },
};
