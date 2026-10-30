import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps } from 'react';
import { SearchInput } from './SearchInput';

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
export const WithButton: Story = { args: { variant: 'button' } };
export const Joined: Story = { args: { variant: 'joined' } };
export const InnerButton: Story = { args: { variant: 'inner' } };
export const Small: Story = { args: { size: 'sm', variant: 'joined' } };
export const WithDefaultValue: Story = { args: { defaultValue: 'Button' } };

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
