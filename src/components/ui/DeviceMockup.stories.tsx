import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { DeviceMockup } from './DeviceMockup';

// AD Design Kit Device mockup — mirrors the Figma "Mockups" set (node 1149:41354).
const phoneScreen = <img src="https://picsum.photos/seed/appscreen/448/896" alt="" />;
const wideScreen = <img src="https://picsum.photos/seed/dashboard/1600/1000" alt="" />;

const meta = {
  title: 'Components/DeviceMockup',
  component: DeviceMockup,
  parameters: { design: figmaDesign('DeviceMockup'), layout: 'padded' },
  args: { device: 'iphone', label: 'App home screen', children: phoneScreen },
  argTypes: {
    device: { control: 'select', options: ['iphone', 'android', 'tablet', 'laptop', 'imac', 'watch'] },
    children: { control: false },
  },
} satisfies Meta<typeof DeviceMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IPhone: Story = {};
export const Android: Story = { args: { device: 'android' } };
export const Tablet: Story = { args: { device: 'tablet', label: 'Dashboard on tablet', children: wideScreen } };
export const Laptop: Story = { args: { device: 'laptop', label: 'Dashboard on laptop', children: wideScreen } };
export const IMac: Story = { args: { device: 'imac', label: 'Dashboard on iMac', children: wideScreen } };
export const Watch: Story = { args: { device: 'watch', label: 'Activity rings on watch' } };

// Any content works in the screen slot, not only images.
export const CustomContent: Story = {
  args: {
    device: 'iphone',
    label: 'Welcome screen',
    children: (
      <div className="flex h-full flex-col justify-end gap-2 bg-neutral-secondary-medium p-6">
        <span className="text-lg font-semibold text-heading">Welcome back</span>
        <span className="text-sm text-body">Your projects are in sync.</span>
      </div>
    ),
  },
};

export const Handhelds: Story = {
  render: (args) => (
    <div className="grid items-end gap-10 md:grid-cols-3">
      {(['iphone', 'android', 'watch'] as const).map((device) => (
        <DeviceMockup key={device} {...args} device={device} label={`App home screen on ${device}`} />
      ))}
    </div>
  ),
};

/** Figma "Android & pen": the phone with a stylus leaning beside it. */
export const AndroidAndPen: Story = { args: { device: 'android-pen', label: 'App home screen on Android with stylus' } };
/** Figma "Stylus pen": the pen on its own (no screen slot). */
export const StylusPen: Story = { args: { device: 'stylus', label: 'Stylus pen', children: null } };
