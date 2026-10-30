import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { Calendar, Datepicker, type DatepickerProps, type DateRange } from './Datepicker';
import { HelperText, Label } from './Input';

// AD Design Kit Datepicker — mirrors the Figma "Datepicker (ready to use examples)" (node 1149:51284).
// DatepickerProps is a discriminated union (single | range), which collapses `StoryObj<typeof meta>` to `never`.
// Stories are therefore typed by the props shared by both modes; the demos below own `mode`, `value` and `onChange`.
type DemoArgs = Omit<DatepickerProps, 'mode' | 'value' | 'onChange'>;

const meta = {
  title: 'Components/Datepicker',
  parameters: { design: figmaDesign('Datepicker') },
  component: Datepicker,
  args: { size: 'base', placeholder: 'Select date', weekStart: 0 },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    weekStart: { control: 'select', options: [0, 1] },
  },
  decorators: [
    // Room for the popup below the field.
    (Story) => (
      <div className="flex min-h-96 w-80 flex-col gap-2.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Datepicker>;

export default meta;
type Story = StoryObj<DemoArgs>;

function SingleDemo(args: DemoArgs) {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <>
      <Label htmlFor="sb-date">Due date</Label>
      <Datepicker {...args} id="sb-date" aria-describedby="sb-date-help" value={value} onChange={setValue} />
      <HelperText id="sb-date-help">Click the field; arrow keys move between days.</HelperText>
    </>
  );
}

function RangeDemo(args: DemoArgs) {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  return (
    <>
      <Label htmlFor="sb-range">Stay</Label>
      <Datepicker {...args} id="sb-range" mode="range" value={value} onChange={setValue} />
      <HelperText>Two months; pick a start and an end date.</HelperText>
    </>
  );
}

function InlineCalendarDemo(args: DemoArgs) {
  const [value, setValue] = useState<Date | null>(() => new Date());
  return (
    <div className="inline-flex self-start rounded-base border border-default-medium bg-neutral-primary-medium p-5 shadow-lg">
      <Calendar value={value} onChange={setValue} min={args.min} max={args.max} weekStart={args.weekStart} locale={args.locale} />
    </div>
  );
}

function InlineRangeCalendarDemo(args: DemoArgs) {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  return (
    <div className="inline-flex self-start rounded-base border border-default-medium bg-neutral-primary-medium p-5 shadow-lg">
      <Calendar mode="range" value={value} onChange={setValue} min={args.min} max={args.max} weekStart={args.weekStart} locale={args.locale} />
    </div>
  );
}

const today = new Date();
const inThirtyDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

export const Single: Story = { render: (args) => <SingleDemo {...args} /> };

export const Range: Story = {
  args: { placeholder: 'Check-in – check-out' },
  render: (args) => <RangeDemo {...args} />,
};

// Past dates and anything after 30 days from now are disabled.
export const MinMax: Story = {
  args: { min: today, max: inThirtyDays },
  render: (args) => <SingleDemo {...args} />,
};

export const MondayWeekStart: Story = {
  args: { weekStart: 1 },
  render: (args) => <SingleDemo {...args} />,
};

export const Large: Story = {
  args: { size: 'lg' },
  render: (args) => <SingleDemo {...args} />,
};

export const InlineCalendar: Story = {
  parameters: { layout: 'padded' },
  render: (args) => <InlineCalendarDemo {...args} />,
};

export const InlineRangeCalendar: Story = {
  parameters: { layout: 'padded' },
  render: (args) => <InlineRangeCalendarDemo {...args} />,
};
