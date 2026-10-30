import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps } from 'react';
import { Autocomplete, type AutocompleteOption } from './Autocomplete';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { HelperText, Label } from './Input';
import { CogIcon, InfoIcon, PlusIcon } from '../icons';

// AD Design Kit Autocomplete — mirrors the Figma "Autocomplete input (ready to use examples)" (node 1149:53126).
const people: AutocompleteOption[] = [
  { value: 'ada', label: 'Ada Lovelace', description: 'ada@ad-design-kit.dev', icon: <Avatar name="Ada Lovelace" size="xs" />, group: 'People' },
  { value: 'grace', label: 'Grace Hopper', description: 'grace@ad-design-kit.dev', icon: <Avatar name="Grace Hopper" size="xs" />, group: 'People' },
  { value: 'alan', label: 'Alan Turing', description: 'alan@ad-design-kit.dev', icon: <Avatar name="Alan Turing" size="xs" />, group: 'People' },
  { value: 'design', label: 'Design system', icon: <CogIcon />, group: 'Projects' },
  { value: 'docs', label: 'Documentation', icon: <InfoIcon />, group: 'Projects' },
  { value: 'archived', label: 'Archived project', icon: <InfoIcon />, group: 'Projects', disabled: true },
];

const fruits: AutocompleteOption[] = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Peach', 'Pear'].map((f) => ({ value: f.toLowerCase(), label: f }));

const meta = {
  title: 'Components/Autocomplete',
  parameters: { design: figmaDesign('Autocomplete') },
  component: Autocomplete,
  args: { options: people, value: null, onChange: () => {}, size: 'base', placeholder: 'Search people or projects', emptyText: 'No results', 'aria-label': 'Assignee' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
  },
  render: (args) => <AutocompleteDemo {...args} />,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

// Arrow keys move the active option, Enter selects, Esc closes. Type "a" to see highlighted matches.
function AutocompleteDemo(args: ComponentProps<typeof Autocomplete>) {
  const [value, setValue] = useState(args.value);
  return <Autocomplete {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {};
export const WithSelection: Story = { args: { value: 'grace' } };
export const WithFooter: Story = {
  args: { footer: <Button size="xs" leftIcon={<PlusIcon />} className="w-full">Invite someone new</Button> },
};
export const SimpleOptions: Story = { args: { options: fruits, placeholder: 'Search fruit', 'aria-label': 'Fruit' } };
export const Small: Story = { args: { size: 'sm' } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor="ac-assign">Assign to</Label>
      <AutocompleteDemo {...args} id="ac-assign" aria-describedby="ac-assign-help" aria-label={undefined} />
      <HelperText id="ac-assign-help">The archived project is disabled.</HelperText>
    </div>
  ),
};

// ---- Interaction tests -------------------------------------------------------------------------------------------
// Focus opens the list with the first option active; arrows move (and wrap) over enabled options; typing filters and
// highlights; Enter picks; Esc closes; ArrowDown reopens.
export const KeyboardSelection: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Assignee' });
    const listId = input.getAttribute('aria-controls');
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(input);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('listbox')).toHaveAttribute('id', listId);
    await expect(input).toHaveAttribute('aria-activedescendant', `${listId}-ada`);

    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', `${listId}-grace`);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    // Wraps to the last enabled option (the archived project is skipped).
    await expect(input).toHaveAttribute('aria-activedescendant', `${listId}-docs`);

    await userEvent.type(input, 'gr');
    await expect(canvas.getAllByRole('option')).toHaveLength(1);
    await expect(canvas.getByRole('option', { name: /Grace Hopper/ }).querySelector('mark')).toHaveTextContent('Gr');
    await expect(input).toHaveAttribute('aria-activedescendant', `${listId}-grace`);
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Grace Hopper');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).not.toHaveAttribute('aria-activedescendant');

    // Reopen: the full list is back (query equals the selection) and Grace is marked selected.
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByRole('option')).toHaveLength(6);
    await expect(canvas.getByRole('option', { name: /Grace Hopper/ })).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    // Enter while closed does nothing.
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Grace Hopper');
  },
};

// Nothing matches: the empty text shows, arrows and Enter do nothing. Clearing the field clears the value.
export const NoResultsAndClear: Story = {
  args: { value: 'ada' },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Assignee' });
    await expect(input).toHaveValue('Ada Lovelace');
    await userEvent.type(input, 'zzz');
    await expect(canvas.getByText('No results')).toBeVisible();
    await expect(canvas.queryAllByRole('option')).toHaveLength(0);
    await expect(input).not.toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(input).toHaveValue('Ada Lovelacezzz');

    await userEvent.clear(input);
    await expect(canvas.getAllByRole('option')).toHaveLength(6);
    for (const option of canvas.getAllByRole('option')) await expect(option).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

// Pointer: hovering moves the active option, clicking picks; a disabled option can't be picked; blur closes.
export const PointerSelection: Story = {
  args: {
    footer: <Button size="xs" leftIcon={<PlusIcon />} className="w-full">Invite someone new</Button>,
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Assignee' });
    const listId = input.getAttribute('aria-controls');
    await userEvent.click(input);

    const archived = canvas.getByRole('option', { name: /Archived project/ });
    await expect(archived).toHaveAttribute('aria-disabled', 'true');
    await userEvent.hover(archived);
    await expect(input).toHaveAttribute('aria-activedescendant', `${listId}-ada`);
    await userEvent.click(archived);
    await expect(input).toHaveValue('');
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    await userEvent.hover(canvas.getByRole('option', { name: /Alan Turing/ }));
    await expect(input).toHaveAttribute('aria-activedescendant', `${listId}-alan`);

    // Pressing the footer keeps focus in the field (the list stays open).
    await userEvent.click(canvas.getByRole('button', { name: 'Invite someone new' }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(canvas.getByRole('option', { name: /Design system/ }));
    await expect(input).toHaveValue('Design system');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};
