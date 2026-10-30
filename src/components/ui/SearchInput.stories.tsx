import type { Meta, StoryObj } from '@storybook/react-vite';
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
