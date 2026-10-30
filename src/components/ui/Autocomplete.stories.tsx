import type { Meta, StoryObj } from '@storybook/react-vite';
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
