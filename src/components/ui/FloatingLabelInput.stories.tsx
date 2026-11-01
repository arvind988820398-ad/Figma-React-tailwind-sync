import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn } from 'storybook/test';
import { useEffect, useRef } from 'react';
import { FloatingLabelInput, type FloatingLabelInputProps, type FloatingLabelVariant } from './FloatingLabelInput';
import { UserIcon } from '../icons';

// AD Design Kit Floating label input — one set of stories per Figma "Floating label" Type (node 1149:50454):
// every State (Initial, Focus, Filled, Disabled, Read only, Success, Danger) and every Size, with the Figma texts,
// the leading user icon and the trailing clear button.
const meta = {
  title: 'Components/FloatingLabelInput',
  parameters: { design: figmaDesign('FloatingLabelInput') },
  component: FloatingLabelInput,
  args: { label: 'Placeholder text', variant: 'outlined', size: 'base', icon: <UserIcon />, clearable: true, disabled: false },
  argTypes: {
    variant: { control: 'select', options: ['underline', 'filled', 'outlined'] },
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
    icon: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingLabelInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const states: { name: string; props: Partial<FloatingLabelInputProps> }[] = [
  { name: 'Initial', props: {} },
  { name: 'Filled', props: { defaultValue: 'name@company.com' } },
  { name: 'Disabled', props: { defaultValue: 'name@company.com', disabled: true } },
  { name: 'Read only', props: { defaultValue: 'name@company.com', readOnly: true } },
  { name: 'Success', props: { defaultValue: 'Write some text here', status: 'success' } },
  { name: 'Danger', props: { defaultValue: 'Write some text here', status: 'danger' } },
];

function StateGrid({ variant, ...args }: FloatingLabelInputProps & { variant: FloatingLabelVariant }) {
  return (
    <div className="flex flex-col gap-6">
      {states.map((s) => (
        <FloatingLabelInput key={s.name} {...args} {...s.props} variant={variant} label={`${s.name}: Placeholder text`} />
      ))}
    </div>
  );
}

function SizeGrid({ variant, ...args }: FloatingLabelInputProps & { variant: FloatingLabelVariant }) {
  return (
    <div className="flex flex-col gap-6">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <FloatingLabelInput key={size} {...args} variant={variant} size={size} defaultValue="name@company.com" label={`Size ${size}`} />
      ))}
    </div>
  );
}

// Figma State = Focus is a CSS state: the Focus stories focus the field so the label floats in brand colour.
const focusField: Story['play'] = async ({ canvas, userEvent }) => {
  const field = canvas.getByRole('textbox');
  await userEvent.click(field);
  await userEvent.keyboard('Write some text he');
  await expect(field).toHaveFocus();
};

// Type = Default
export const Default: Story = { args: { variant: 'underline' } };
export const DefaultFocus: Story = { args: { variant: 'underline' }, play: focusField };
export const DefaultStates: Story = { args: { variant: 'underline' }, render: (args) => <StateGrid {...args} variant="underline" /> };
export const DefaultSizes: Story = { args: { variant: 'underline' }, render: (args) => <SizeGrid {...args} variant="underline" /> };

// Type = With background
export const WithBackground: Story = { args: { variant: 'filled' } };
export const WithBackgroundFocus: Story = { args: { variant: 'filled' }, play: focusField };
export const WithBackgroundStates: Story = { args: { variant: 'filled' }, render: (args) => <StateGrid {...args} variant="filled" /> };
export const WithBackgroundSizes: Story = { args: { variant: 'filled' }, render: (args) => <SizeGrid {...args} variant="filled" /> };

// Type = Bordered
export const Bordered: Story = {};
export const BorderedFocus: Story = { play: focusField };
export const BorderedStates: Story = { render: (args) => <StateGrid {...args} variant="outlined" /> };
export const BorderedSizes: Story = { render: (args) => <SizeGrid {...args} variant="outlined" /> };

// Code-ahead: no icon and no clear button.
export const Plain: Story = { args: { icon: undefined, clearable: false, label: 'Email' } };

// Interaction: the clear button empties the field, reports the change and returns focus.
export const ClearValue: Story = {
  args: { defaultValue: 'name@company.com', onChange: fn(), onClear: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('textbox', { name: 'Placeholder text' });
    await expect(field).toHaveValue('name@company.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
    await expect(args.onChange).toHaveBeenCalled();
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};

function RefDemo(args: FloatingLabelInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.setAttribute('data-ref', 'input'), []);
  return <FloatingLabelInput {...args} ref={ref} />;
}

// The forwarded ref points at the native input.
export const ForwardedRef: Story = {
  render: (args) => <RefDemo {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Placeholder text' })).toHaveAttribute('data-ref', 'input');
  },
};
