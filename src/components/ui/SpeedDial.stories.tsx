import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn, waitFor, within } from 'storybook/test';
import {
  ArchiveIcon,
  CheckIcon,
  CogIcon,
  DownloadIcon,
  EnvelopeIcon,
  FileCirclePlusIcon,
  FileCopyAltIcon,
  FloppyDiskAltIcon,
  MessagesIcon,
  NewspaperIcon,
  PlusIcon,
  PrinterIcon,
  ShareNodesIcon,
} from '../icons';
import { SpeedDial, type SpeedDialDirection, type SpeedDialVariant } from './SpeedDial';

// AD Design Kit Speed dial — mirrors the Figma "Speed dial (ready to use examples)" set (node 1149:84847).
// Shown inline (not `fixed`) and open (`defaultOpen`), as Figma draws the examples; pass `fixed` in an app.
// Figma's actions: Default and Rounded use the four icon actions, Menu adds Download, Article dropdown menu has post actions.
const actions = [
  { label: 'Share', icon: <ShareNodesIcon /> },
  { label: 'Print', icon: <PrinterIcon /> },
  { label: 'Save', icon: <FloppyDiskAltIcon /> },
  { label: 'Copy', icon: <FileCopyAltIcon /> },
];
const menuActions = [...actions, { label: 'Download', icon: <DownloadIcon /> }];
const articleActions = [
  { label: 'New post', icon: <FileCirclePlusIcon /> },
  { label: 'New topic', icon: <NewspaperIcon /> },
  { label: 'New message', icon: <MessagesIcon /> },
  { label: 'Archive post', icon: <ArchiveIcon /> },
];
const actionsFor: Record<SpeedDialVariant, typeof actions> = { default: actions, rounded: actions, menu: menuActions, dropdown: articleActions };

const variants: SpeedDialVariant[] = ['default', 'rounded', 'menu', 'dropdown'];
const directions: SpeedDialDirection[] = ['top', 'bottom', 'right', 'left'];

const meta = {
  title: 'Components/SpeedDial',
  parameters: { design: figmaDesign('SpeedDial') },
  component: SpeedDial,
  // Tall, wide frame so the menu has room to open in any direction.
  decorators: [(Story) => <div className="flex min-h-96 min-w-96 items-center justify-center"><Story /></div>],
  args: { actions, variant: 'default', direction: 'top', fixed: false, defaultOpen: true },
  argTypes: {
    variant: { control: 'select', options: variants },
    direction: { control: 'select', options: directions },
  },
} satisfies Meta<typeof SpeedDial>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma Type = Default: square icon actions; hover shows the label in a tooltip.
export const Default: Story = {};

// Figma Type = Rounded: round items.
export const Rounded: Story = { args: { variant: 'rounded' } };

// Figma Type = Menu: a compact menu with icon + label rows.
export const Menu: Story = { args: { variant: 'menu', actions: menuActions } };

// Figma Type = Article dropdown menu: the wider menu for post actions.
export const DropdownMenu: Story = { args: { variant: 'dropdown', actions: articleActions } };

// Figma Position: every type opening Top, Bottom, Right and Left, as in the set.
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-10">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-heading">{variant}</p>
          <div className="flex flex-wrap items-center gap-10">
            {directions.map((direction) => (
              <SpeedDial
                key={direction}
                {...args}
                variant={variant}
                direction={direction}
                actions={actionsFor[variant]}
                label={`Quick actions (${variant}, ${direction})`}
              />
            ))}
          </div>
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
  args: { actions: withSpies(), defaultOpen: false },
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
  args: { variant: 'rounded', direction: 'right', actions: withSpies(), defaultOpen: false },
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

// Menu variant: labels are visible text in each row (no tooltip, no aria-label).
export const MenuSelect: Story = {
  args: { variant: 'menu', direction: 'left', actions: withSpies(), defaultOpen: false },
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
  args: { variant: 'dropdown', direction: 'bottom', actions: withSpies(), label: 'Article actions', defaultOpen: false },
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
  args: { fixed: true, defaultOpen: false },
  play: async ({ canvas }) => {
    const root = canvas.getByRole('button', { name: 'Quick actions' }).parentElement;
    await expect(root).toHaveClass('fixed', 'end-6', 'bottom-6');
  },
};
