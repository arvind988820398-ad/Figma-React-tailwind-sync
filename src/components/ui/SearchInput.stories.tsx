import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps, type FormEvent, type ReactNode } from 'react';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { HelperText, Input, InputGroup, Label } from './Input';
import { SearchInput } from './SearchInput';
import { AngleDownIcon, GridIcon, QuestionCircleIcon, SearchIcon } from '../icons';

// AD Design Kit Search input — mirrors the Figma "Search form" set (node 1149:46581).
const meta = {
  title: 'Components/SearchInput',
  parameters: { design: figmaDesign('SearchInput') },
  component: SearchInput,
  args: { onSearch: () => {}, variant: 'default', size: 'base', placeholder: 'Search components', label: 'Search', buttonLabel: 'Search' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'button', 'joined', 'inner'] },
    size: { control: 'select', options: ['sm', 'base'] },
  },
  render: (args) => <SearchDemo {...args} />,
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Press Enter or the button; the last submitted query is announced below the field.
function SearchDemo(args: ComponentProps<typeof SearchInput>) {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="flex w-96 flex-col gap-3">
      <SearchInput {...args} onSearch={setLast} />
      <p className="text-sm text-body" aria-live="polite">
        {last === null ? 'Press Enter or the button to search.' : `Searched for “${last}”.`}
      </p>
    </div>
  );
}

export const Default: Story = {};
export const WithDefaultValue: Story = { args: { defaultValue: 'Button' } };
export const Small: Story = { args: { size: 'sm', variant: 'joined' } };

// ---- Figma Type: each as in Figma, a Label (Required & icon) + the form + Helper ---------------------------------------

function Field({ id, label, children, helper = 'Search the docs, components and examples.' }: { id: string; label: string; children: ReactNode; helper?: string }) {
  return (
    <div className="w-full">
      <Label htmlFor={id} required icon={<QuestionCircleIcon />}>{label}</Label>
      {children}
      <HelperText>{helper}</HelperText>
    </div>
  );
}

function MenuButton({ label, children, items, leftIcon }: { label: string; children: ReactNode; items: string[]; leftIcon?: ReactNode }) {
  return (
    <Dropdown label={label} trigger={<Button color="secondary" className="shrink-0" leftIcon={leftIcon} rightIcon={<AngleDownIcon />}>{children}</Button>}>
      {items.map((i) => <DropdownItem key={i} onSelect={() => {}}>{i}</DropdownItem>)}
    </Dropdown>
  );
}
const categories = <MenuButton label="Category" items={['All categories', 'Mockups', 'Logos', 'Templates']} leftIcon={<GridIcon />}>All categories</MenuButton>;
const noSubmit = (e: FormEvent) => e.preventDefault();

export const FigmaDefault: Story = {
  name: 'Default (with label)',
  render: (args) => <Field id="search-default" label="Search"><SearchInput {...args} id="search-default" /></Field>,
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
};
export const InnerButton: Story = {
  args: { variant: 'inner', placeholder: 'E.g. ad-design-kit, react, vue' },
  render: (args) => <Field id="search-inner" label="Search"><SearchInput {...args} id="search-inner" /></Field>,
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
};
export const WithButtonSpaced: Story = {
  name: 'With button (spaced)',
  args: { variant: 'button' },
  render: (args) => <Field id="search-spaced" label="Search"><SearchInput {...args} id="search-spaced" /></Field>,
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
};
export const WithButtonNoSpace: Story = {
  name: 'With button (no-space)',
  args: { variant: 'joined' },
  render: (args) => <Field id="search-joined" label="Search"><SearchInput {...args} id="search-joined" /></Field>,
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
};

export const WithButtons: Story = {
  render: () => (
    <Field id="search-cat" label="Search products">
      <form role="search" aria-label="Search products" onSubmit={noSubmit}>
        <InputGroup>
          {categories}
          <Input id="search-cat" type="search" placeholder="Search mockups, logos" />
          <Button type="submit" leftIcon={<SearchIcon />}>Search</Button>
        </InputGroup>
      </form>
    </Field>
  ),
  decorators: [(Story) => <div className="w-lg max-w-full"><Story /></div>],
};

export const WithSpacedButtons: Story = {
  render: () => (
    <Field id="search-cat-spaced" label="Search products">
      <form role="search" aria-label="Search products" onSubmit={noSubmit} className="flex gap-4">
        {categories}
        <Input id="search-cat-spaced" type="search" placeholder="Search mockups, logos" leftIcon={<SearchIcon />} className="min-w-0 flex-1" />
        <Button type="submit" className="shrink-0">Search</Button>
      </form>
    </Field>
  ),
  decorators: [(Story) => <div className="w-xl max-w-full"><Story /></div>],
};

export const ThreeButtons: Story = {
  render: () => (
    <Field id="search-domain" label="Search domains">
      <form role="search" aria-label="Search domains" onSubmit={noSubmit}>
        <InputGroup>
          <MenuButton label="Protocol" items={['http + https', 'https only']}>http + https</MenuButton>
          <Input id="search-domain" type="search" placeholder="Search for domain or URL" />
          <MenuButton label="Scope" items={['Subdomains', 'Exact domain']}>Subdomains</MenuButton>
          <Button type="submit" iconOnly aria-label="Search"><SearchIcon /></Button>
        </InputGroup>
      </form>
    </Field>
  ),
  decorators: [(Story) => <div className="w-xl max-w-full"><Story /></div>],
};

export const Inline: Story = {
  render: () => (
    <form role="search" aria-label="Search products" onSubmit={noSubmit} className="flex items-center gap-4">
      <Label htmlFor="search-inline" className="mb-0 shrink-0">Search</Label>
      <InputGroup>
        {categories}
        <Input id="search-inline" type="search" placeholder="Search mockups, logos" />
        <Button type="submit" leftIcon={<SearchIcon />}>Search</Button>
      </InputGroup>
    </form>
  ),
  decorators: [(Story) => <div className="w-xl max-w-full"><Story /></div>],
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-4">
      {(['default', 'button', 'joined', 'inner'] as const).map((variant) => (
        <SearchInput key={variant} {...args} variant={variant} label={`Search (${variant})`} />
      ))}
    </div>
  ),
};

// ---- Interaction tests -------------------------------------------------------------------------------------------
// Enter submits the trimmed query.
export const SubmitWithEnter: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('searchbox', { name: 'Search' });
    await expect(canvas.getByRole('search', { name: 'Search' })).toContainElement(field);
    await userEvent.type(field, '  button  {Enter}');
    await expect(field).toHaveValue('  button  ');
    await expect(canvas.getByText('Searched for “button”.')).toBeVisible();
  },
};

// The inner button submits; editing a default value then submitting sends the edited query.
export const SubmitWithInnerButton: Story = {
  args: { variant: 'inner', defaultValue: 'Badge', size: 'sm', buttonLabel: 'Go' },
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('searchbox', { name: 'Search' });
    await expect(field).toHaveValue('Badge');
    await userEvent.clear(field);
    await userEvent.type(field, 'Avatar');
    await userEvent.click(canvas.getByRole('button', { name: 'Go' }));
    await expect(canvas.getByText('Searched for “Avatar”.')).toBeVisible();
  },
};

// The joined button submits; an empty query is sent as an empty string.
export const SubmitWithJoinedButton: Story = {
  args: { variant: 'joined' },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
    await expect(canvas.getByText('Searched for “”.')).toBeVisible();
  },
};
