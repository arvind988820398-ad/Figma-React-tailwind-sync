import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Autocomplete, type AutocompleteOption, type AutocompleteProps } from './Autocomplete';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { IconShape } from './IconShape';
import { HelperText, Label } from './Input';
import {
  AngleDownIcon, BookIcon, CogIcon, FileLinesIcon, GridIcon, InfoCircleIcon, PlusIcon, QuestionCircleIcon, SearchIcon, TagIcon, UserAddIcon, UsersIcon,
} from '../icons';

// AD Design Kit Autocomplete — mirrors the Figma "Autocomplete input (ready to use examples)" (node 1149:53126):
// one story per Type (Default, User, Highlighted text, Advanced with save, Advanced, Categories), opened with the Figma
// query, plus code-ahead and interaction stories.
const people: AutocompleteOption[] = [
  { value: 'ada', label: 'Ada Lovelace', description: 'ada@ad-design-kit.dev', icon: <Avatar name="Ada Lovelace" size="xs" />, group: 'People' },
  { value: 'grace', label: 'Grace Hopper', description: 'grace@ad-design-kit.dev', icon: <Avatar name="Grace Hopper" size="xs" />, group: 'People' },
  { value: 'alan', label: 'Alan Turing', description: 'alan@ad-design-kit.dev', icon: <Avatar name="Alan Turing" size="xs" />, group: 'People' },
  { value: 'design', label: 'Design system', icon: <CogIcon />, group: 'Projects' },
  { value: 'docs', label: 'Documentation', icon: <InfoCircleIcon />, group: 'Projects' },
  { value: 'archived', label: 'Archived project', icon: <InfoCircleIcon />, group: 'Projects', disabled: true },
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

// ---- Figma types ---------------------------------------------------------------------------------------------------
const search = <SearchIcon />;
const grid = <GridIcon />;
const hint = <QuestionCircleIcon className="size-3.5" />;
const opt = (label: string, rest: Partial<AutocompleteOption> = {}): AutocompleteOption => ({ value: label.toLowerCase().replace(/\W+/g, '-'), label, ...rest });
const person = (name: string, rest: Partial<AutocompleteOption> = {}) => opt(name, { icon: <Avatar name={name} size="xs" />, ...rest });
const article = (label: string, description: string) => opt(label, { description, group: 'Articles', icon: <IconShape size="base" color="white" shape="circle"><BookIcon /></IconShape> });

const recent: AutocompleteOption[] = [
  ...['Customizing colors', 'AD Design Kit dropdown', 'Responsive design', 'Modern navbars', 'AD Design Kit dashboard'].map((l) => opt(l, { icon: search, group: 'Recent' })),
  ...['Responsive alert', 'Kanban board'].map((l) => opt(l, { icon: search, group: 'Popular' })),
];
const users: AutocompleteOption[] = ['Jese Leos', 'Jamie Wook', 'Jessica Blacker', 'Jay Kan', 'Jamie Waker', 'Jym Rey'].map((n) => person(n));
const gridOptions: AutocompleteOption[] = [
  ...['Grid Columns', 'Grid Column Start / End', 'Grid Template Rows', 'grid', 'Inline Grid'].map((l) => opt(l, { icon: grid, group: 'Recent' })),
  ...['Grid Template Columns', 'Grid Auto Rows'].map((l) => opt(l, { icon: grid, group: 'Layout' })),
];
const gridSearches: AutocompleteOption[] = ['Grid Columns', 'Grid Column Start / End', 'Grid Template Rows', 'grid', 'Inline Grid', 'Grid Template Columns', 'Grid Auto Rows'].map((l) => opt(l, { icon: search }));
const advanced: AutocompleteOption[] = [
  article('How do you build a navigation bar using AD Design Kit?', 'ad-design-kit, tailwind, figma, modern'),
  article('How does "use strict" do in AD Design Kit?', 'javascript, tailwind, ad-design-kit'),
  article('How to build modern buttons with AD Design Kit?', 'buttons, modern-design, ui'),
  ...['ad-design-kit-react-framework', 'ad-design-kit-ui', 'ad-design-kit'].map((l) => opt(l, { icon: search, group: 'Tags' })),
  person('Flowdan Mattew', { group: 'Users' }),
  person('Kattie Flowra', { group: 'Users' }),
];
const categories: AutocompleteOption[] = [
  person('Leslie Livingston', { group: 'Peoples' }),
  person('Jese Leos', { group: 'Peoples', meta: 'UI/UX Designer' }),
  person('Micheal Gough', { group: 'Peoples', meta: 'React Developer' }),
  person('Robert Brown', { group: 'Peoples', meta: 'SEO Specialist' }),
  ...[['ad-design-kit-ui', '2MB'], ['ad-design-kit-ux', '5.6MB'], ['Flowdan Mattew', '10MB'], ['Kattie Flowra', '34.6MB'], ['fb-official_video.mp4', '408MB']].map(([l, m]) =>
    opt(`${l}.file`, { label: l, meta: m, icon: <FileLinesIcon />, group: 'Articles' }),
  ),
  ...['ad-design-kit-react-framework', 'ad-design-kit-ui', 'ad-design-kit'].map((l) => opt(`${l}.tag`, { label: l, icon: <TagIcon />, group: 'Tags' })),
];

/** A Figma example: a required "Search" Label with the info icon, the field, and options that can be removed. */
function FigmaDemo({ label = 'Search', options, ...args }: Partial<AutocompleteProps> & { label?: string; options: AutocompleteOption[] }) {
  const [items, setItems] = useState(options);
  const [value, setValue] = useState<string | null>(null);
  return (
    <div>
      <Label htmlFor="ac-figma" required hint={hint} className="justify-start">{label}</Label>
      <Autocomplete
        {...args}
        id="ac-figma"
        options={items}
        value={value}
        onChange={setValue}
        onRemove={(o) => setItems((list) => list.filter((x) => x.value !== o.value))}
      />
    </div>
  );
}

/** Opens the menu and types the Figma query. */
const typeQuery = (query: string): Story['play'] => async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole('combobox'));
  if (query) await userEvent.keyboard(query);
  await expect(canvas.getByRole('listbox')).toBeVisible();
};

const tall = [(Story: () => ReactNode) => <div className="min-h-128 w-80"><Story /></div>];
const wide = [(Story: () => ReactNode) => <div className="min-h-192 w-lg"><Story /></div>];

// Type = Default: recent searches, each with a remove button.
export const Default: Story = {
  decorators: tall,
  render: () => <FigmaDemo options={recent} placeholder="Quick search for anything" />,
  play: typeQuery(''),
};

// Type = User: avatars and a Brand xs "Add new user" footer.
export const User: Story = {
  decorators: tall,
  render: () => (
    <FigmaDemo
      label="Search for user"
      options={users}
      placeholder="Search people"
      footer={<Button size="xs" leftIcon={<UserAddIcon />} className="w-full">Add new user</Button>}
    />
  ),
  play: typeQuery('J'),
};

// Type = Highlighted text: the typed text is highlighted in every match.
export const HighlightedText: Story = {
  decorators: tall,
  render: () => <FigmaDemo options={gridOptions} />,
  play: typeQuery('Gri'),
};

// Type = Advanced with save: each option can be saved or removed.
export const AdvancedWithSave: Story = {
  decorators: tall,
  render: () => <FigmaDemo options={gridSearches} onSave={() => {}} />,
  play: typeQuery('Gri'),
};

// Type = Advanced: grouped articles with descriptions, tags and users, under filled group headings.
export const Advanced: Story = {
  decorators: wide,
  render: () => <FigmaDemo options={advanced} groupStyle="filled" onSave={() => {}} className="w-80" menuClassName="w-lg" />,
  play: typeQuery(''),
};

function CategoryButtons() {
  const [active, setActive] = useState('Files');
  return (
    <>
      {[
        { name: 'People', icon: <UsersIcon /> },
        { name: 'Files', icon: <FileLinesIcon /> },
        { name: 'Tags', icon: <TagIcon /> },
      ].map((c) => (
        <Button key={c.name} size="xs" color="secondary" leftIcon={c.icon} aria-pressed={active === c.name} onClick={() => setActive(c.name)}>
          {c.name}
        </Button>
      ))}
      <Button size="xs" color="secondary" rightIcon={<AngleDownIcon />}>More</Button>
    </>
  );
}

// Type = Categories: category buttons above grouped results with secondary text.
export const Categories: Story = {
  decorators: wide,
  render: () => (
    <FigmaDemo options={categories} groupStyle="filled" onSave={() => {}} header={<CategoryButtons />} className="w-80" menuClassName="w-lg" />
  ),
  play: typeQuery(''),
};

// ---- Code-ahead ----------------------------------------------------------------------------------------------------
export const PeopleAndProjects: Story = {};
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

// Keyboard twins of the item actions: Shift+Delete removes the active option, Ctrl+S saves it.
export const RemoveAndSaveKeyboard: Story = {
  decorators: tall,
  args: { onSave: fn() },
  render: (args) => <FigmaDemo options={recent} onSave={args.onSave} />,
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    await expect(canvas.getByRole('option', { name: 'Customizing colors' })).toBeVisible();
    await userEvent.keyboard('{Control>}s{/Control}');
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ label: 'Customizing colors' }));
    await userEvent.keyboard('{Shift>}{Delete}{/Shift}');
    await expect(canvas.queryByRole('option', { name: 'Customizing colors' })).toBeNull();
    await expect(canvas.getAllByRole('option')).toHaveLength(6);
  },
};

// Pointer twins of the item actions: the save and remove icons on each option, and clicks in the header keep the menu open.
export const RemoveAndSavePointer: Story = {
  decorators: tall,
  args: { onSave: fn() },
  render: (args) => <FigmaDemo options={recent} onSave={args.onSave} header={<Button size="xs" color="secondary">All</Button>} />,
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.click(canvas.getByRole('button', { name: 'All' }));
    await expect(canvas.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getAllByTitle('Save')[0]);
    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ label: 'Customizing colors' }));
    await userEvent.click(canvas.getAllByTitle('Remove')[0]);
    await expect(canvas.queryByRole('option', { name: 'Customizing colors' })).toBeNull();
  },
};
