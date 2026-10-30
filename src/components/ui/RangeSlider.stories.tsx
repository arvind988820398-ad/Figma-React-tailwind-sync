import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn } from 'storybook/test';
import { useState, type ComponentProps } from 'react';
import { RangeSlider } from './RangeSlider';

// AD Design Kit Range slider — mirrors the Figma "Range Slider examples" (node 1149:54340), bar 1149:54365, thumb 1149:54373.
const meta = {
  title: 'Components/RangeSlider',
  parameters: { design: figmaDesign('RangeSlider') },
  component: RangeSlider,
  args: { value: 40, onChange: () => {}, label: 'Volume', min: 0, max: 100, step: 1, showMinMax: false, disabled: false },
  render: (args) => <SingleDemo {...args} />,
  decorators: [
    (Story) => (
      <div className="w-80 pt-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

type SliderArgs = ComponentProps<typeof RangeSlider>;

// Figma Type "Default": one value. The generic needs an explicit <number> once value/label are narrowed.
function SingleDemo({ value: initial, onChange: _onChange, label, ...args }: SliderArgs) {
  const [value, setValue] = useState(Array.isArray(initial) ? initial[0] : initial);
  return <RangeSlider<number> {...args} label={Array.isArray(label) ? label[0] : label} value={value} onChange={setValue} />;
}

// Figma Type "Range": [low, high] with two thumbs.
function RangeDemo({ value: initial, onChange: _onChange, label, ...args }: SliderArgs) {
  const [value, setValue] = useState<[number, number]>(Array.isArray(initial) ? initial : [initial, args.max ?? 100]);
  return <RangeSlider<[number, number]> {...args} label={Array.isArray(label) ? label : [`Minimum ${label}`, `Maximum ${label}`]} value={value} onChange={setValue} />;
}

export const Default: Story = {};
export const WithMinMax: Story = { args: { showMinMax: true, formatValue: (n) => `${n}%` } };
export const Stepped: Story = { args: { value: 250, min: 0, max: 1000, step: 50, showMinMax: true, label: 'Budget', formatValue: (n) => `$${n}` } };
export const Disabled: Story = { args: { value: 60, disabled: true } };

export const Range: Story = {
  args: { value: [200, 800], label: ['Minimum price', 'Maximum price'], min: 0, max: 1000, step: 10, showMinMax: true, formatValue: (n) => `$${n}` },
  render: (args) => <RangeDemo {...args} />,
};

export const RangeDisabled: Story = {
  args: { value: [20, 70], label: ['Minimum', 'Maximum'], disabled: true },
  render: (args) => <RangeDemo {...args} />,
};

// ---- Interaction tests ----------------------------------------------------------------------------------------------

// Like SingleDemo / RangeDemo, but also forwards every change to args.onChange so tests can assert the emitted values.
function SingleSpyDemo({ value: initial, onChange, label, ...args }: SliderArgs) {
  const [value, setValue] = useState(Array.isArray(initial) ? initial[0] : initial);
  return (
    <RangeSlider<number>
      {...args}
      label={Array.isArray(label) ? label[0] : label}
      value={value}
      onChange={(n) => {
        setValue(n);
        onChange(n);
      }}
    />
  );
}

function RangeSpyDemo({ value: initial, onChange, label, ...args }: SliderArgs) {
  const [value, setValue] = useState<[number, number]>(Array.isArray(initial) ? initial : [initial, args.max ?? 100]);
  return (
    <RangeSlider<[number, number]>
      {...args}
      label={Array.isArray(label) ? label : [`Minimum ${label}`, `Maximum ${label}`]}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

const VolumeLow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4z" strokeLinejoin="round" />
  </svg>
);
const VolumeHigh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Clicks the track at `ratio` (0–1) of its width, optionally drags to `dragTo`, then releases. */
async function pointOnTrack(user: { pointer(input: unknown): Promise<void> }, track: HTMLElement, ratio: number, dragTo?: number) {
  const r = track.getBoundingClientRect();
  const at = (x: number) => ({ clientX: r.left + r.width * x, clientY: r.top + r.height / 2 });
  const steps: unknown[] = [{ keys: '[MouseLeft>]', target: track, coords: at(ratio) }];
  if (dragTo !== undefined) steps.push({ target: track, coords: at(dragTo) });
  steps.push({ keys: '[/MouseLeft]', target: track, coords: at(dragTo ?? ratio) });
  await user.pointer(steps);
}

export const KeyboardSingle: Story = {
  args: { value: 40, onChange: fn(), showMinMax: true, formatValue: (n) => `${n}%`, startIcon: <VolumeLow />, endIcon: <VolumeHigh /> },
  render: (args) => <SingleSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const thumb = canvas.getByRole('slider', { name: 'Volume' });
    await expect(canvas.getByText('0%')).toBeVisible();
    await expect(canvas.getByText('100%')).toBeVisible();

    await userEvent.tab();
    await expect(thumb).toHaveFocus();

    const press = async (key: string, now: number) => {
      await userEvent.keyboard(key);
      await expect(thumb).toHaveAttribute('aria-valuenow', String(now));
      await expect(thumb).toHaveAttribute('aria-valuetext', `${now}%`);
    };
    await press('{ArrowRight}', 41);
    await press('{ArrowUp}', 42);
    await press('{ArrowLeft}', 41);
    await press('{ArrowDown}', 40);
    await press('{PageUp}', 50);
    await press('{PageDown}', 40);
    await press('{Home}', 0);
    await press('{ArrowLeft}', 0); // clamped at min
    await press('{End}', 100);
    await press('{ArrowRight}', 100); // clamped at max
    await expect(args.onChange).toHaveBeenLastCalledWith(100);

    // Keys a slider does not handle leave the value alone and emit nothing.
    const calls = (args.onChange as ReturnType<typeof fn>).mock.calls.length;
    await press('a', 100);
    await press('{Tab}', 100);
    await expect(args.onChange).toHaveBeenCalledTimes(calls);
  },
};

export const SteppedKeyboard: Story = {
  args: { value: 250, onChange: fn(), min: 0, max: 1000, step: 50, label: 'Budget', formatValue: (n) => `$${n}` },
  render: (args) => <SingleSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const thumb = canvas.getByRole('slider', { name: 'Budget' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '300');
    // PageUp jumps 10% of the range (100), not one step.
    await userEvent.keyboard('{PageUp}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '400');
    await expect(thumb).toHaveAttribute('aria-valuetext', '$400');
    await expect(args.onChange).toHaveBeenLastCalledWith(400);
  },
};

export const PointerSingle: Story = {
  args: { value: 40, onChange: fn() },
  render: (args) => <SingleSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const thumb = canvas.getByRole('slider', { name: 'Volume' });
    const track = thumb.parentElement!;

    // Press on the track at 75%: the value jumps there.
    await pointOnTrack(userEvent, track, 0.75);
    await expect(thumb).toHaveAttribute('aria-valuenow', '75');

    // Press at 20% and drag to 60%: the value follows the pointer.
    await pointOnTrack(userEvent, track, 0.2, 0.6);
    await expect(thumb).toHaveAttribute('aria-valuenow', '60');
    await expect(args.onChange).toHaveBeenCalledWith(20);
    await expect(args.onChange).toHaveBeenLastCalledWith(60);
  },
};

export const KeyboardRange: Story = {
  args: { value: [200, 800], onChange: fn(), label: ['Minimum price', 'Maximum price'], min: 0, max: 1000, step: 10, formatValue: (n) => `$${n}` },
  render: (args) => <RangeSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const low = canvas.getByRole('slider', { name: 'Minimum price' });
    const high = canvas.getByRole('slider', { name: 'Maximum price' });
    await expect(low).toHaveAttribute('aria-valuemax', '800');
    await expect(high).toHaveAttribute('aria-valuemin', '200');

    await userEvent.tab();
    await expect(low).toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    await expect(low).toHaveAttribute('aria-valuenow', '300');
    await expect(args.onChange).toHaveBeenLastCalledWith([300, 800]);
    await expect(high).toHaveAttribute('aria-valuemin', '300');

    await userEvent.tab();
    await expect(high).toHaveFocus();
    await userEvent.keyboard('{PageDown}{ArrowDown}');
    await expect(high).toHaveAttribute('aria-valuenow', '690');
    await expect(low).toHaveAttribute('aria-valuemax', '690');

    // The thumbs cannot cross: Home on the high thumb stops at the low value, End on the low thumb at the high value.
    await userEvent.keyboard('{Home}');
    await expect(high).toHaveAttribute('aria-valuenow', '300');
    await expect(args.onChange).toHaveBeenLastCalledWith([300, 300]);
    await userEvent.keyboard('{End}');
    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{End}');
    await expect(low).toHaveAttribute('aria-valuenow', '1000');
    await expect(args.onChange).toHaveBeenLastCalledWith([1000, 1000]);
  },
};

export const PointerRange: Story = {
  args: { value: [200, 800], onChange: fn(), label: ['Minimum price', 'Maximum price'], min: 0, max: 1000, step: 10 },
  render: (args) => <RangeSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const low = canvas.getByRole('slider', { name: 'Minimum price' });
    const high = canvas.getByRole('slider', { name: 'Maximum price' });
    const track = low.parentElement!;

    // A press nearer the high thumb moves the high thumb…
    await pointOnTrack(userEvent, track, 0.9);
    await expect(high).toHaveAttribute('aria-valuenow', '900');
    await expect(low).toHaveAttribute('aria-valuenow', '200');
    // …and one nearer the low thumb moves the low thumb.
    await pointOnTrack(userEvent, track, 0.1);
    await expect(low).toHaveAttribute('aria-valuenow', '100');
    await expect(args.onChange).toHaveBeenLastCalledWith([100, 900]);
  },
};

export const DisabledIgnoresInput: Story = {
  args: { value: [20, 70], onChange: fn(), label: ['Minimum', 'Maximum'], disabled: true },
  render: (args) => <RangeSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const low = canvas.getByRole('slider', { name: 'Minimum' });
    await expect(low).toHaveAttribute('aria-disabled', 'true');
    await expect(low).toHaveAttribute('tabindex', '-1');

    await pointOnTrack(userEvent, low.parentElement!, 0.9);
    low.focus();
    await userEvent.keyboard('{ArrowRight}{End}');
    await expect(low).toHaveAttribute('aria-valuenow', '20');
    await expect(canvas.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '70');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
