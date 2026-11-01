import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { FileChartBarIcon } from '../icons';
import { Badge } from './Badge';
import { buttonVariants } from './Button';
import { DeviceMockup } from './DeviceMockup';

// AD Design Kit Device mockup — mirrors the Figma "Mockups" set (node 1149:41354), one story per Figma Type in the
// set's order. Figma fills the screens with a sales dashboard; the stories rebuild it from tokens and components.

// Donut of four chart-colour segments (each value is a share of 100) with the total in the middle.
function SalesDonut({ className }: { className?: string }) {
  const segments = [
    { value: 32, className: 'stroke-brand' },
    { value: 30, className: 'stroke-cyan' },
    { value: 18, className: 'stroke-orange' },
    { value: 20, className: 'stroke-pink' },
  ];
  let offset = 25;
  return (
    <div className={`relative mx-auto aspect-square ${className ?? ''}`}>
      <svg viewBox="0 0 42 42" className="size-full" aria-hidden>
        {segments.map((s) => {
          const circle = (
            <circle key={s.className} cx="21" cy="21" r="15.9155" className={`fill-none ${s.className}`} strokeWidth="4" strokeDasharray={`${s.value} ${100 - s.value}`} strokeDashoffset={offset} />
          );
          offset -= s.value;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-heading">$65.4k</span>
        <span className="text-xs text-body-subtle">Total sales</span>
      </div>
    </div>
  );
}

const stats = [
  { label: 'Users', value: '232.7k', change: '+2%' },
  { label: 'Customers', value: '238', change: '+4.56%' },
  { label: 'Revenue', value: '$4268', change: '+1.45%' },
];

// Figma phone screen: the donut, "This month stats" and a "View full report" button.
const phoneScreen = (
  <div className="flex h-full flex-col gap-4 bg-neutral-primary-soft p-4 pt-8">
    <SalesDonut className="w-2/3" />
    <p className="text-center text-sm font-semibold text-heading">This month stats</p>
    <ul className="flex flex-col gap-3">
      {stats.map((s) => (
        <li key={s.label} className="flex flex-col border-b border-default pb-2">
          <span className="text-xs text-body">{s.label}</span>
          <span className="text-lg font-bold text-heading">{s.value}</span>
          <span className="text-xs text-fg-success">{s.change} compared to last month</span>
        </li>
      ))}
    </ul>
    {/* The screen is a picture (role="img"), so the button is drawn with buttonVariants, not a focusable Button. */}
    <span className={buttonVariants({ size: 'xs', className: 'self-center' })}>
      <FileChartBarIcon /> View full report
    </span>
  </div>
);

// Figma tablet, laptop and iMac screen: the "Analytics" dashboard.
const wideScreen = (
  <div className="flex h-full flex-col gap-4 bg-neutral-primary-soft p-4">
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-heading">Analytics</span>
      <Badge color="success" size="sm">+1.4%</Badge>
    </div>
    <div className="grid flex-1 grid-cols-3 gap-4">
      {['Visits', 'Revenue', 'Customers'].map((label) => (
        <div key={label} className="flex flex-col gap-1 rounded-base border border-default p-3">
          <span className="text-xs text-body">{label}</span>
          <span className="text-lg font-bold text-heading">163.4k</span>
          <div className="mt-auto h-1.5 rounded-full bg-brand-soft" />
        </div>
      ))}
    </div>
    <SalesDonut className="w-1/4" />
  </div>
);

const watchScreen = (
  <div className="flex h-full items-center justify-center bg-neutral-primary-soft p-3">
    <SalesDonut className="w-full" />
  </div>
);

const meta = {
  title: 'Components/DeviceMockup',
  component: DeviceMockup,
  parameters: { design: figmaDesign('DeviceMockup'), layout: 'padded' },
  args: { device: 'iphone', label: 'Sales dashboard on iPhone', children: phoneScreen },
  argTypes: {
    device: { control: 'select', options: ['stylus', 'android', 'android-pen', 'iphone', 'tablet', 'imac', 'laptop', 'watch'] },
    children: { control: false },
  },
} satisfies Meta<typeof DeviceMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "Stylus pen": the pen on its own (no screen slot). */
export const StylusPen: Story = { args: { device: 'stylus', label: 'Stylus pen', children: null } };
export const Android: Story = { args: { device: 'android', label: 'Sales dashboard on Android' } };
/** Figma "Android & pen": the phone with a stylus leaning beside it. */
export const AndroidAndPen: Story = { args: { device: 'android-pen', label: 'Sales dashboard on Android with stylus' } };
export const IPhone: Story = {};
export const Tablet: Story = { args: { device: 'tablet', label: 'Analytics dashboard on tablet', children: wideScreen } };
export const IMac: Story = { args: { device: 'imac', label: 'Analytics dashboard on iMac', children: wideScreen } };
export const Laptop: Story = { args: { device: 'laptop', label: 'Analytics dashboard on laptop', children: wideScreen } };
export const Watch: Story = { args: { device: 'watch', label: 'Total sales on watch', children: watchScreen } };

// Any content works in the screen slot, including images.
export const CustomContent: Story = {
  args: { device: 'iphone', label: 'Photo on iPhone', children: <img src="https://picsum.photos/seed/appscreen/448/896" alt="" /> },
};

// The phones and the watch side by side, as Figma lays them out.
export const Handhelds: Story = {
  render: (args) => (
    <div className="grid items-end gap-10 md:grid-cols-3">
      <DeviceMockup {...args} device="android" label="Sales dashboard on Android" />
      <DeviceMockup {...args} device="iphone" label="Sales dashboard on iPhone" />
      <DeviceMockup {...args} device="watch" label="Total sales on watch">{watchScreen}</DeviceMockup>
    </div>
  ),
};
