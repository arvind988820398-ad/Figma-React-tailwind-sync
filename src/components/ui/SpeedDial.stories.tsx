import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn, waitFor, within } from 'storybook/test';
import { CheckIcon, CogIcon, EnvelopeIcon, PlusIcon } from '../icons';
import { SpeedDial, type SpeedDialDirection, type SpeedDialVariant } from './SpeedDial';

// AD Design Kit Speed dial — mirrors the Figma "Speed dial (ready to use examples)" set (node 1149:84847).
// Shown inline (not `fixed`) so the canvas can display it; pass `fixed` in an app.
const actions = [
  { label: 'Share', icon: <EnvelopeIcon /> },
  { label: 'Settings', icon: <CogIcon /> },
  { label: 'New', icon: <PlusIcon /> },
  { label: 'Copy', icon: <CheckIcon />, disabled: true },
];

const variants: SpeedDialVariant[] = ['default', 'rounded', 'menu', 'dropdown'];
const directions: SpeedDialDirection[] = ['top', 'bottom', 'left', 'right'];

const meta = {
  title: 'Components/SpeedDial',
  parameters: { design: figmaDesign('SpeedDial') },
  component: SpeedDial,
  // Tall, wide frame so the menu has room to open in any direction.
  decorators: [(Story) => <div className="flex h-96 w-96 items-center justify-center"><Story /></div>],
  args: { actions, variant: 'default', direction: 'top', fixed: false },
  argTypes: {
    variant: { control: 'select', options: variants },
    direction: { control: 'select', options: directions },
  },
} satisfies Meta<typeof SpeedDial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Rounded: Story = { args: { variant: 'rounded' } };

// Figma "Menu": icon + label inside each item.
export const Menu: Story = { args: { variant: 'menu' } };

// Figma "Article dropdown menu": a Dropdown-style list.
export const DropdownMenu: Story = { args: { variant: 'dropdown', direction: 'bottom' } };

export const Directions: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-6">
      {directions.map((direction) => (
        <div key={direction} className="flex h-40 w-40 flex-col items-center justify-center gap-2">
          <SpeedDial {...args} direction={direction} label={`Quick actions (${direction})`} />
          <span className="text-xs text-body-subtle">direction="{direction}"</span>
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex items-end gap-12">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <SpeedDial {...args} variant={variant} label={`Quick actions (${variant})`} />
          <span className="text-xs text-body-subtle">{variant}</span>
        </div>
      ))}
    </div>
  ),
};

// ── Interaction tests ────────────────────────────────────────────────────────────────────────────────────────────────

const withSpies = () => [
  { label: 'Share', icon: <EnvelopeIcon />, onSelect: fn() },
  { label: 'Settings', icon: <CogIcon />, onSelect: fn() },
  { label: 'New', icon: <PlusIcon /> },
  { label: 'Copy', icon: <CheckIcon />, onSelect: fn(), disabled: true },
];

// Opening shows icon-only actions named by aria-label with a tooltip; choosing one calls onSelect and closes.
export const SelectAction: Story = {
  args: { actions: withSpies() },
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Quick actions' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    const list = canvas.getByRole('list', { name: 'Quick actions' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(list).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    await expect(within(list).getByRole('button', { name: 'Copy' })).toBeDisabled();

    const share = within(list).getByRole('button', { name: 'Share' });
    await userEvent.hover(share);
    await waitFor(() => expect(share).toHaveAccessibleDescription('Share'));

    await userEvent.click(share);
    await expect(args.actions[0].onSelect).toHaveBeenCalledTimes(1);
    await expect(args.actions[1].onSelect).not.toHaveBeenCalled();
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // An action without onSelect still closes the dial.
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('button', { name: 'New' }));
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
};

// Escape closes and returns focus to the trigger (other keys don't); outside clicks close, inside clicks don't.
export const DismissBehaviour: Story = {
  args: { variant: 'rounded', direction: 'right' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Quick actions' });
    await expect(trigger).toHaveClass('rounded-full');

    await userEvent.click(trigger);
    const list = canvas.getByRole('list', { name: 'Quick actions' });
    await expect(within(list).getByRole('button', { name: 'Share' })).toHaveClass('rounded-full');
    // Menu-button pattern: opening moves focus to the first available action; arrows move, wrap and skip disabled ones.
    await expect(within(list).getByRole('button', { name: 'Copy' })).toBeDisabled();
    const enabled = within(list).getAllByRole('button').filter((b) => !(b as HTMLButtonElement).disabled);
    await expect(enabled[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(enabled[1]).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(enabled[enabled.length - 1]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(enabled[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(enabled[enabled.length - 1]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(enabled[0]).toHaveFocus();
    await userEvent.keyboard('a');
    await expect(list).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    // Pointer down on the dial's own padding stays inside.
    await userEvent.click(canvas.getByRole('list'));
    await expect(canvas.getByRole('list')).toBeInTheDocument();
    await userEvent.click(canvasElement.ownerDocument.body);
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // The trigger toggles.
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
};

// Menu variant: labels are visible text inside each item (no tooltip, no aria-label).
export const MenuSelect: Story = {
  args: { variant: 'menu', direction: 'left', actions: withSpies() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Quick actions' }));
    const list = canvas.getByRole('list', { name: 'Quick actions' });
    const settings = within(list).getByRole('button', { name: 'Settings' });
    await expect(settings).not.toHaveAttribute('aria-label');
    await expect(settings).toHaveTextContent('Settings');
    await expect(within(list).queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();

    await userEvent.click(settings);
    await expect(args.actions[1].onSelect).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
};

// Dropdown variant: a labelled list of text buttons; disabled items can't be chosen.
export const DropdownSelect: Story = {
  args: { variant: 'dropdown', direction: 'bottom', actions: withSpies(), label: 'Article actions' },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Article actions' }));
    const list = canvas.getByRole('list', { name: 'Article actions' });
    const copy = within(list).getByRole('button', { name: 'Copy' });
    await expect(copy).toBeDisabled();
    await expect(getComputedStyle(copy).pointerEvents).toBe('none');

    await userEvent.click(within(list).getByRole('button', { name: 'Share' }));
    await expect(args.actions[0].onSelect).toHaveBeenCalledTimes(1);
    await expect(args.actions[3].onSelect).not.toHaveBeenCalled();
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
};

// fixed pins the dial to the viewport's bottom-end corner.
export const Fixed: Story = {
  args: { fixed: true },
  play: async ({ canvas }) => {
    const root = canvas.getByRole('button', { name: 'Quick actions' }).parentElement;
    await expect(root).toHaveClass('fixed', 'end-6', 'bottom-6');
  },
};
