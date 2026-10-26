import type { Meta, StoryObj } from '@storybook/react-vite';
import { Jumbotron } from './Jumbotron';
import { Alert } from './Alert';
import { Button } from './Button';
import { ArrowRightIcon } from '../icons';

// AuxoKit Jumbotron (hero) — mirrors the Figma "Jumbotron" set (node 1149:67227).
const meta = {
  title: 'AuxoKit/Jumbotron',
  component: Jumbotron,
  parameters: { layout: 'fullscreen' },
  args: {
    variant: 'centered',
    surface: 'primary',
    title: 'We invest in the world’s potential',
    lead: 'Here at AuxoKit we focus on markets where technology, innovation and capital can unlock long-term value.',
    actions: (
      <>
        <Button size="lg" rightIcon={<ArrowRightIcon />}>Get started</Button>
        <Button size="lg" color="secondary">Learn more</Button>
      </>
    ),
  },
  argTypes: {
    variant: { control: 'select', options: ['centered', 'split', 'image'] },
    surface: { control: 'select', options: ['primary', 'secondary'] },
  },
} satisfies Meta<typeof Jumbotron>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Heading + CTA".
export const Centered: Story = {};

// Figma "Bg gradient" uses an Alert pill as the eyebrow.
export const WithEyebrow: Story = {
  args: {
    eyebrow: (
      <Alert variant="pill" color="info">
        New · AuxoKit 2.0 is out
      </Alert>
    ),
  },
};

// Figma "Text + Illustration".
export const Split: Story = {
  args: {
    variant: 'split',
    surface: 'secondary',
    title: 'Design and code, one source of truth',
    lead: 'Tokens and components stay identical in Figma and React.',
    actions: <Button size="lg">Start building</Button>,
    media: <img src="https://picsum.photos/seed/studio/960/640" alt="Designer’s desk with a laptop and sketches" className="w-full" />,
  },
};

// Figma "Bg-image": dark overlay, white title, Tertiary secondary CTA.
export const BackgroundImage: Story = {
  args: {
    variant: 'image',
    backgroundImage: 'https://picsum.photos/seed/aurora/1600/900',
    title: 'Built for every theme',
    lead: 'Modern, Minimal, Enterprise, Playful and Mono — light and dark.',
    actions: (
      <>
        <Button size="lg">Get started</Button>
        <Button size="lg" color="tertiary">Watch demo</Button>
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: { lead: undefined, actions: undefined },
};
