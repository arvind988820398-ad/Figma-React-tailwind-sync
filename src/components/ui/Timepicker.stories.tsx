import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { expect } from 'storybook/test';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { HelperText, Label } from './Input';
import { Select } from './Select';
import { TimeInput, TimeSlots, type TimeInputProps, type TimeSlotsProps } from './Timepicker';
import { AngleDownIcon, QuestionCircleIcon } from '../icons';

// AD Design Kit Timepicker — one story per Figma "Timepicker form" Type (node 1149:52636), with the Figma labels,
// icons and values: Default, With Dropdown, With button, Inline, With select, Range.
const meta = {
  title: 'Components/Timepicker',
  parameters: { design: figmaDesign('Timepicker') },
  component: TimeInput,
  args: { 'aria-label': 'Start time', defaultValue: '09:30', size: 'base', disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
    addon: { control: 'select', options: ['start', 'end'] },
  },
} satisfies Meta<typeof TimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const hint = <QuestionCircleIcon className="size-3.5" />;
const durations = ['15 minutes', '30 minutes', '1 hour', '2 hours'];

// Figma required Label with the info icon.
function TimeLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <Label htmlFor={htmlFor} required hint={hint} className="justify-start">
      {children}
    </Label>
  );
}

function DurationMenu({ trigger }: { trigger: Parameters<typeof Dropdown>[0]['trigger'] }) {
  return (
    <Dropdown label="Duration" trigger={trigger}>
      {durations.map((d) => (
        <DropdownItem key={d}>{d}</DropdownItem>
      ))}
    </Dropdown>
  );
}

// Type = Default: required Label, the field with the clock, helper text.
export const Default: Story = {
  render: (args) => (
    <div>
      <TimeLabel htmlFor="tp-default">Choose a time</TimeLabel>
      <TimeInput {...args} id="tp-default" aria-label={undefined} defaultValue="22:45" className="w-36" />
      <HelperText>Helper text</HelperText>
    </div>
  ),
};

// Type = With Dropdown: the field (angle-down) joined to a Secondary "Duration" menu button.
export const WithDropdown: Story = {
  render: (args) => (
    <div>
      <TimeLabel htmlFor="tp-dropdown">Choose a time</TimeLabel>
      <div className="flex">
        <TimeInput {...args} id="tp-dropdown" aria-label={undefined} defaultValue="22:45" icon={<AngleDownIcon />} className="w-36 [&_input]:rounded-e-none" />
        <DurationMenu trigger={<Button color="secondary" rightIcon={<AngleDownIcon />} className="-ms-px rounded-s-none">Duration</Button>} />
      </div>
      <HelperText>Helper text</HelperText>
    </div>
  ),
};

// Type = With button: the field (angle-down) with a Brand "Duration" menu button below it.
export const WithButton: Story = {
  render: (args) => (
    <div>
      <TimeLabel htmlFor="tp-button">Choose a time</TimeLabel>
      <div className="flex w-36 flex-col gap-2">
        <TimeInput {...args} id="tp-button" aria-label={undefined} defaultValue="22:45" icon={<AngleDownIcon />} />
        <DurationMenu trigger={<Button rightIcon={<AngleDownIcon />}>Duration</Button>} />
      </div>
      <HelperText>Helper text</HelperText>
    </div>
  ),
};

// Type = Inline: the Label beside a small field with the clock in a right add-on.
export const Inline: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Label htmlFor="tp-inline" className="mb-0">Choose a time</Label>
      <TimeInput {...args} id="tp-inline" aria-label={undefined} size="sm" addon="end" defaultValue="22:45" className="w-36" />
    </div>
  ),
};

// Type = With select: the field joined to a time-zone Select.
export const WithSelect: Story = {
  render: (args) => (
    <div className="w-96">
      <TimeLabel htmlFor="tp-select">Choose a time</TimeLabel>
      <div className="flex">
        <TimeInput {...args} id="tp-select" aria-label={undefined} defaultValue="22:45" className="w-36 shrink-0 [&_input]:rounded-e-none" />
        <Select aria-label="Time zone" defaultValue="est" className="-ms-px min-w-0 flex-1 rounded-s-none">
          <option value="est">EST - GMT-5 (New York)</option>
          <option value="cet">CET - GMT+1 (Paris)</option>
          <option value="ist">IST - GMT+5:30 (Mumbai)</option>
        </Select>
      </div>
      <HelperText>Pick the time zone the event happens in.</HelperText>
    </div>
  ),
};

// Type = Range: Start and End fields, clock at the start and a clear button at the end.
export const Range: Story = {
  render: (args) => (
    <fieldset className="flex gap-4">
      <legend className="sr-only">Opening hours</legend>
      {(['Start time', 'End time'] as const).map((label, i) => (
        <div key={label} className="w-40">
          <TimeLabel htmlFor={`tp-range-${i}`}>{label}</TimeLabel>
          <TimeInput {...args} id={`tp-range-${i}`} aria-label={undefined} defaultValue={i === 0 ? '00:35' : '05:35'} clearable />
        </div>
      ))}
    </fieldset>
  ),
};

// Interaction: the clear button empties the field and keeps focus in it.
export const RangeClear: Story = {
  ...Range,
  play: async ({ canvas, userEvent }) => {
    const start = canvas.getByLabelText(/Start time/);
    await expect(start).toHaveValue('00:35');
    await userEvent.click(canvas.getAllByRole('button', { name: 'Clear time' })[0]);
    await expect(start).toHaveValue('');
    await expect(start).toHaveFocus();
  },
};

// Field options: add-ons, statuses and sizes.
const fieldWidth = [(Story: () => ReactNode) => <div className="w-48"><Story /></div>];
export const Field: Story = { decorators: fieldWidth };
export const AddonStart: Story = { decorators: fieldWidth, args: { addon: 'start', defaultValue: '13:00' } };
export const AddonEnd: Story = { decorators: fieldWidth, args: { addon: 'end', defaultValue: '17:30' } };
export const Success: Story = { decorators: fieldWidth, args: { status: 'success' } };
export const Danger: Story = { decorators: fieldWidth, args: { status: 'danger', addon: 'end', 'aria-label': 'End time' } };
export const Disabled: Story = { decorators: fieldWidth, args: { disabled: true } };

export const AllSizes: Story = {
  decorators: fieldWidth,
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2.5">
          <Label htmlFor={`sb-time-${size}`}>Size {size}</Label>
          <TimeInput {...args} id={`sb-time-${size}`} aria-label={undefined} size={size} />
        </div>
      ))}
    </div>
  ),
};

const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00'];

function TimeSlotsDemo(props: Omit<TimeSlotsProps, 'value' | 'onChange'>) {
  const [slot, setSlot] = useState<string | null>('10:00');
  return <TimeSlots {...props} value={slot} onChange={setSlot} />;
}

// The Figma "Timepicker dropdown menus" slot list. Taken slots are disabled.
export const Slots: Story = {
  render: () => <TimeSlotsDemo label="Available times" slots={slots} unavailable={['09:30', '13:30']} className="w-80" />,
};

export const SlotsWithTitle: Story = {
  render: () => (
    <TimeSlotsDemo label="Available times" title="Wednesday, March 12" slots={slots} unavailable={['09:30', '13:30']} columns={4} className="w-96" />
  ),
};


// Interaction: picking a free slot checks it; taken slots are disabled.
export const PickSlot: Story = {
  ...Slots,
  play: async ({ canvas, userEvent }) => {
    const slot = canvas.getByRole('radio', { name: '11:00' });
    await userEvent.click(slot);
    await expect(slot).toBeChecked();
    await expect(canvas.getByRole('radio', { name: '09:30' })).toBeDisabled();
  },
};

function RefDemo(args: TimeInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.setAttribute('data-ref', 'input'), []);
  return <TimeInput {...args} ref={ref} />;
}

// The forwarded ref points at the native time input.
export const ForwardedRef: Story = {
  decorators: fieldWidth,
  render: (args) => <RefDemo {...args} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('input[type="time"]')).toHaveAttribute('data-ref', 'input');
  },
};
