import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Label } from './Input';
import { TimeInput, TimeSlots, type TimeSlotsProps } from './Timepicker';

// AuxoKit Timepicker — mirrors the Figma "Timepicker form" (node 1149:52636).
const meta = {
  title: 'AuxoKit/Timepicker',
  component: TimeInput,
  args: { 'aria-label': 'Start time', defaultValue: '09:30', size: 'base', className: 'w-48', disabled: false },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
    addon: { control: 'select', options: ['start', 'end'] },
  },
} satisfies Meta<typeof TimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AddonStart: Story = { args: { addon: 'start', defaultValue: '13:00' } };
export const AddonEnd: Story = { args: { addon: 'end', defaultValue: '17:30' } };
export const Success: Story = { args: { status: 'success' } };
export const Danger: Story = { args: { status: 'danger', addon: 'end', 'aria-label': 'End time' } };
export const Disabled: Story = { args: { disabled: true } };

export const AllSizes: Story = {
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
