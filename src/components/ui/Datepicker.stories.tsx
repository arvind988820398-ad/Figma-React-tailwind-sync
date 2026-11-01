import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { Calendar, Datepicker, type DatepickerProps, type DateRange } from './Datepicker';
import { HelperText, Label } from './Input';
import { QuestionCircleIcon } from '../icons';

// AD Design Kit Datepicker — mirrors the Figma "Datepicker (ready to use examples)" (node 1149:51284):
// Type = Default (one field) and Range (From and To fields), each shown closed and open as in Figma (June 2025).
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
      <div className="flex min-h-112 w-80 flex-col gap-2.5">
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
      <Datepicker {...args} id="sb-range" mode="range" value={value} onChange={setValue} labels={{ start: 'Check-in', end: 'Check-out' }} />
      <HelperText>Two months; pick a start and an end date.</HelperText>
    </>
  );
}

// The Figma examples: a required Label with an info icon, the en-GB date format and June 2025.
const hint = <QuestionCircleIcon className="size-3.5" />;
const june10 = new Date(2025, 5, 10);

function FigmaDefaultDemo(args: DemoArgs & { initial?: Date | null }) {
  const [value, setValue] = useState<Date | null>(args.initial ?? null);
  return (
    <div>
      <Label htmlFor="sb-dob" required hint={hint} className="justify-start">Date of birth</Label>
      <Datepicker {...args} id="sb-dob" locale="en-GB" value={value} onChange={setValue} />
    </div>
  );
}

function FigmaRangeDemo(args: DemoArgs & { initial?: DateRange }) {
  const [value, setValue] = useState<DateRange>(args.initial ?? { start: null, end: null });
  return (
    <Datepicker
      {...args}
      id="sb-from-to"
      mode="range"
      locale="en-GB"
      placeholder="Select date"
      endPlaceholder="12 Jan 2025"
      labels={{ start: 'From', end: 'To', required: true, hint }}
      value={value}
      onChange={setValue}
    />
  );
}

const openPicker: Story['play'] = async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getAllByRole('combobox')[0]);
  await expect(canvas.getByRole('dialog', { name: 'Choose date' })).toBeVisible();
};

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

// Type = Default
export const Default: Story = { render: (args) => <FigmaDefaultDemo {...args} /> };
export const DefaultOpen: Story = { render: (args) => <FigmaDefaultDemo {...args} initial={june10} />, play: openPicker };

// Type = Range: From and To fields share one two-month calendar.
export const Range: Story = { decorators: [(Story) => <div className="w-96"><Story /></div>], render: (args) => <FigmaRangeDemo {...args} /> };
export const RangeOpen: Story = {
  decorators: [(Story) => <div className="min-h-112 w-96"><Story /></div>],
  render: (args) => <FigmaRangeDemo {...args} initial={{ start: new Date(2025, 5, 26), end: new Date(2025, 6, 4) }} />,
  play: openPicker,
};

export const Single: Story = { render: (args) => <SingleDemo {...args} /> };

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


// ---- Interaction tests -------------------------------------------------------------------------------------------
const day = (d: Date, n = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fullLabel = (d: Date) => d.toLocaleDateString(undefined, { dateStyle: 'full' });
const medium = (d: Date) => d.toLocaleDateString(undefined, { dateStyle: 'medium' });
const monthLabel = (d: Date) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
const activeDay = (el: HTMLElement) => el.ownerDocument.activeElement?.getAttribute('data-day');
// The roving-tabindex day (the one Tab returns to), which tracks the keyboard position.
const rovingDay = (el: HTMLElement) => el.querySelector('[data-day][tabindex="0"]')?.getAttribute('data-day');

// Click opens the popup with today focused; arrows move between days; Enter picks one and closes the popup.
// Escape closes and returns focus to the field; ArrowDown reopens; Clear empties; Today picks today; clicking outside closes.
export const SingleKeyboardAndFooter: Story = {
  render: (args) => <SingleDemo {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const t = day(new Date());
    const input = canvas.getByRole('combobox', { name: 'Due date' });
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).not.toHaveAttribute('aria-controls');

    await userEvent.click(input);
    const dialog = canvas.getByRole('dialog', { name: 'Choose date' });
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveAttribute('aria-controls', dialog.id);
    await waitFor(() => expect(activeDay(canvasElement)).toBe(t.toDateString()));
    await expect(canvas.getByRole('gridcell', { name: fullLabel(t) })).toHaveAttribute('aria-current', 'date');

    await userEvent.keyboard('{ArrowRight}{ArrowDown}{ArrowLeft}');
    const picked = day(t, 7);
    await waitFor(() => expect(activeDay(canvasElement)).toBe(picked.toDateString()));
    await expect(canvas.getByRole('grid', { name: monthLabel(picked) })).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue(medium(picked));
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    // Reopen: the picked day is selected.
    await userEvent.click(input);
    await expect(canvas.getByRole('gridcell', { name: fullLabel(picked) })).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveFocus();

    await userEvent.keyboard('a');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
    await expect(canvas.getByRole('dialog')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Today' }));
    await expect(input).toHaveValue(medium(t));
    await expect(canvas.queryByRole('dialog')).toBeNull();

    // Enter opens; a pointer press outside the field closes.
    input.focus();
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByText(/arrow keys move between days/));
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

// With min = today: earlier days are disabled; the month buttons move the view.
export const MinMaxNavigation: Story = {
  args: { min: today, max: inThirtyDays },
  render: (args) => <SingleDemo {...args} />,
  play: async ({ canvas, userEvent }) => {
    const t = day(new Date());
    await userEvent.click(canvas.getByRole('combobox', { name: 'Due date' }));
    await expect(canvas.getByRole('gridcell', { name: fullLabel(t) })).toBeEnabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Previous month' }));
    const prev = new Date(t.getFullYear(), t.getMonth() - 1, 1);
    await expect(canvas.getByRole('grid', { name: monthLabel(prev) })).toBeVisible();
    for (const cell of canvas.getAllByRole('gridcell')) await expect(cell).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    const next = new Date(t.getFullYear(), t.getMonth() + 1, 1);
    await expect(canvas.getByRole('grid', { name: monthLabel(next) })).toBeVisible();
    // Anything after max (today + 30) is disabled.
    const afterMax = day(inThirtyDays, 1);
    if (afterMax.getMonth() === next.getMonth()) await expect(canvas.getByRole('gridcell', { name: fullLabel(afterMax) })).toBeDisabled();
  },
};

// Range: first click sets the start, second the end; a click before the start restarts; Apply closes; Clear empties.
export const RangeSelection: Story = {
  render: (args) => <RangeDemo {...args} />,
  play: async ({ canvas, userEvent }) => {
    const t = day(new Date());
    const start = new Date(t.getFullYear(), t.getMonth(), 10);
    const end = new Date(t.getFullYear(), t.getMonth() + 1, 5);
    const between = new Date(t.getFullYear(), t.getMonth(), 20);
    const earlier = new Date(t.getFullYear(), t.getMonth(), 3);
    const input = canvas.getByRole('combobox', { name: 'Check-in' });
    const endInput = canvas.getByRole('combobox', { name: 'Check-out' });

    await userEvent.click(input);
    await expect(endInput).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByRole('grid')).toHaveLength(2);

    await userEvent.click(canvas.getByRole('gridcell', { name: fullLabel(start) }));
    await expect(input).toHaveValue(medium(start));
    await userEvent.click(canvas.getByRole('gridcell', { name: fullLabel(end) }));
    await expect(endInput).toHaveValue(medium(end));
    await expect(canvas.getByRole('gridcell', { name: fullLabel(start) })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('gridcell', { name: fullLabel(end) })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('gridcell', { name: fullLabel(between) })).toHaveAttribute('aria-selected', 'false');
    // The popup stays open in range mode.
    await expect(canvas.getByRole('dialog')).toBeVisible();

    // A third click starts a new range; a click before the start restarts it; the same day twice is a one-day range.
    await userEvent.click(canvas.getByRole('gridcell', { name: fullLabel(between) }));
    await expect(input).toHaveValue(medium(between));
    await expect(endInput).toHaveValue('');
    await userEvent.click(canvas.getByRole('gridcell', { name: fullLabel(earlier) }));
    await expect(input).toHaveValue(medium(earlier));
    await userEvent.click(canvas.getByRole('gridcell', { name: fullLabel(earlier) }));
    await expect(endInput).toHaveValue(medium(earlier));

    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }));
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(input);
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
    await expect(endInput).toHaveValue('');
  },
};

// Click a day, then use the keyboard across months in the two-month calendar: moving past the second month (or before the first) shifts the view.
export const RangeCalendarKeyboard: Story = {
  parameters: { layout: 'padded' },
  render: (args) => <InlineRangeCalendarDemo {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const t = day(new Date());
    await userEvent.click(canvas.getByRole('gridcell', { name: fullLabel(t) }));
    await expect(activeDay(canvasElement)).toBe(t.toDateString());
    await expect(canvas.getByRole('gridcell', { name: fullLabel(t) })).toHaveAttribute('aria-selected', 'true');

    // One week per press; wait for focus to land before the next press.
    for (let w = 1; w <= 9; w++) {
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(rovingDay(canvasElement)).toBe(day(t, 7 * w).toDateString()));
    }
    // Nine weeks is always past the second month, so the view has moved on.
    await expect(canvas.getByRole('grid', { name: monthLabel(day(t, 63)) })).toBeVisible();
    await expect(canvas.queryByRole('grid', { name: monthLabel(t) })).toBeNull();

    for (let w = 8; w >= 0; w--) {
      await userEvent.keyboard('{ArrowUp}');
      await waitFor(() => expect(rovingDay(canvasElement)).toBe(day(t, 7 * w).toDateString()));
    }
    await expect(activeDay(canvasElement)).toBe(t.toDateString());
    await expect(canvas.getByRole('grid', { name: monthLabel(t) })).toBeVisible();
  },
};

// The inline single calendar: clicking a day selects it.
export const InlineCalendarSelect: Story = {
  parameters: { layout: 'padded' },
  args: { weekStart: 1 },
  render: (args) => <InlineCalendarDemo {...args} />,
  play: async ({ canvas, userEvent }) => {
    const t = day(new Date());
    const target = new Date(t.getFullYear(), t.getMonth(), t.getDate() === 15 ? 16 : 15);
    await expect(canvas.getAllByRole('columnheader')[0]).toHaveTextContent(new Date(2024, 0, 8).toLocaleDateString(undefined, { weekday: 'short' }));
    await userEvent.click(canvas.getByRole('gridcell', { name: fullLabel(target) }));
    await expect(canvas.getByRole('gridcell', { name: fullLabel(target) })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('gridcell', { name: fullLabel(t) })).toHaveAttribute('aria-selected', 'false');
  },
};

// Every field size (icon offset and padding differ per size).
export const AllSizes: Story = {
  render: (args) => (
    <>
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <Datepicker key={size} {...args} size={size} aria-label={`Date (${size})`} value={null} onChange={() => {}} />
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('combobox')).toHaveLength(4);
    await expect(canvas.getByRole('combobox', { name: 'Date (xl)' })).toHaveAttribute('placeholder', 'Select date');
  },
};
