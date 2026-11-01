import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Jumbotron } from './Jumbotron';
import { Alert } from './Alert';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Input, Label } from './Input';
import { Navbar } from './Navbar';
import { SkeletonLine } from './Skeleton';
import { AdDesignKitIcon, AngleRightIcon, ArrowRightIcon, ChartMixedDollarIcon, EnvelopeIcon, FileLinesIcon, LockIcon, YoutubeIcon } from '../icons';

// AD Design Kit Jumbotron (hero) — mirrors the Figma "Jumbotron" set (node 1149:67227): one story per Figma Type at
// Desktop, plus Tablet and Mobile stories for each type (Figma Breakpoint).
const lead = 'Here at AD Design Kit we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.';
const ctas = (
  <>
    <Button size="lg" rightIcon={<ArrowRightIcon />}>Get started</Button>
    <Button size="lg" color="secondary">Learn more</Button>
  </>
);

const meta = {
  title: 'Components/Jumbotron',
  component: Jumbotron,
  parameters: { design: figmaDesign('Jumbotron'), layout: 'fullscreen' },
  args: { variant: 'centered', surface: 'primary', title: 'We invest in the world’s potential', lead, actions: ctas },
  argTypes: {
    variant: { control: 'select', options: ['centered', 'split', 'image'] },
    surface: { control: 'select', options: ['primary', 'secondary', 'gradient'] },
  },
} satisfies Meta<typeof Jumbotron>;

export default meta;
type Story = StoryObj<typeof meta>;

const mobile = { viewport: { value: 'mobile1', isRotated: false } };
const tablet = { viewport: { value: 'tablet', isRotated: false } };

// Figma "Heading + CTA": centred heading, lead and Brand lg + Secondary lg buttons.
export const Centered: Story = {};

// Figma "Bg-image": photo with the dark overlay, white title, Brand lg + Tertiary lg buttons.
export const BackgroundImage: Story = {
  args: {
    variant: 'image',
    backgroundImage: 'https://picsum.photos/seed/conference/1600/900',
    actions: (
      <>
        <Button size="lg" rightIcon={<ArrowRightIcon />}>Get started</Button>
        <Button size="lg" color="tertiary">Learn more</Button>
      </>
    ),
  },
};

// Figma "Text + Illustration": text on the left, a video thumbnail with a play logo on the right.
export const Split: Story = {
  args: {
    variant: 'split',
    media: (
      <a href="#video" className="relative block" aria-label="Play the AD Design Kit video">
        <img src="https://picsum.photos/id/1018/1152/640" alt="" className="aspect-video w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <YoutubeIcon className="size-20 text-fg-danger" />
        </span>
      </a>
    ),
  },
};

function SignInCard() {
  return (
    <Card className="w-full lg:max-w-md">
      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <p className="text-xl font-semibold text-heading">Sign in to our platform</p>
        <div>
          <Label htmlFor="jumbo-email" required>Your email</Label>
          <Input id="jumbo-email" type="email" placeholder="Enter your email" leftIcon={<EnvelopeIcon />} />
        </div>
        <div>
          <Label htmlFor="jumbo-password" required>Your password</Label>
          <Input id="jumbo-password" type="password" defaultValue="password12" leftIcon={<LockIcon />} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Checkbox id="jumbo-remember" label="Remember me" />
          <a href="#lost" className="text-sm font-medium text-fg-brand hover:underline">Lost Password?</a>
        </div>
        <Button type="submit" className="w-full">Sign in</Button>
        <p className="text-sm font-medium text-body">
          Not registered? <a href="#register" className="text-fg-brand underline">Create account</a>
        </p>
      </form>
    </Card>
  );
}

// Figma "Link + Forms": secondary surface, a "Read more" link instead of buttons and a sign-in Card.
export const LinkAndForm: Story = {
  args: {
    variant: 'split',
    surface: 'secondary',
    actions: (
      <a href="#about" className="inline-flex items-center gap-2 text-lg font-medium text-fg-brand hover:underline">
        Read more about our app <ArrowRightIcon className="size-6" />
      </a>
    ),
    media: <SignInCard />,
  },
};

// Figma "Bg gradient": brand gradient, an Alert pill eyebrow and an email field with an inner Sign up button.
export const Gradient: Story = {
  args: {
    surface: 'gradient',
    eyebrow: (
      <Alert variant="pill" color="info" badge="New">
        <span className="inline-flex items-center gap-0.5">
          Added new jumbotron component <AngleRightIcon className="size-4" />
        </span>
      </Alert>
    ),
    actions: (
      <form className="w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
        <Input
          type="email"
          aria-label="Email address"
          placeholder="Enter your email here"
          leftIcon={<EnvelopeIcon />}
          endAction={<Button size="xs" type="submit">Sign up</Button>}
        />
      </form>
    ),
  },
};

// Figma "With navbar": the Navbar directly above a Heading + CTA section.
export const WithNavbar: Story = {
  render: (args) => (
    <>
      <Navbar
        logo={
          <span className="flex items-center gap-2 text-2xl font-semibold text-heading">
            <AdDesignKitIcon className="size-7 text-fg-brand" /> AD Design Kit
          </span>
        }
        links={['Company', 'Marketplace', 'Features', 'Products', 'Team', 'Contact'].map((label) => ({ label, href: '#' }))}
        actions={
          <>
            <Button size="sm" color="secondary">Login</Button>
            <Button size="sm">Upgrade to PRO</Button>
          </>
        }
      />
      <Jumbotron {...args} />
    </>
  ),
};

function BentoCard({ title, text, className, children }: { title: string; text: string; className?: string; children: ReactNode }) {
  return (
    <div className={`flex h-120 flex-col gap-8 overflow-hidden rounded-base border border-default bg-neutral-secondary pt-8 ${className ?? ''}`}>
      <div className="flex flex-col gap-2 px-8">
        <p className="text-xl font-medium text-heading">{title}</p>
        <p className="text-sm text-body">{text}</p>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

const panel = 'rounded-xl border border-default bg-neutral-primary-soft shadow-lg';

// Figma "Bento cards": a 2 × 2 grid of feature cards, each with a product mock-up.
export const BentoCards: Story = {
  render: () => (
    <section className="bg-neutral-primary py-8 md:py-16 lg:py-24">
      <div className="mx-auto grid max-w-screen-xl gap-8 px-4 lg:grid-cols-5">
        <BentoCard title="Automation" text="Streamline workflows with advanced automation tools." className="lg:col-span-3">
          <div className={`absolute start-1/4 end-0 top-0 bottom-0 flex gap-8 rounded-e-none p-8 ${panel}`}>
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-center gap-3">
                <Avatar src="https://i.pravatar.cc/96?img=12" name="Task owner" />
                <p className="text-xl font-medium text-heading">Task Scheduler</p>
              </div>
              <SkeletonLine className="h-3 w-1/2" />
              <SkeletonLine tone="secondary" className="h-3 w-4/5" />
              <SkeletonLine tone="secondary" className="h-3 w-3/4" />
              <SkeletonLine tone="secondary" className="h-3 w-4/5" />
            </div>
            <div className="hidden w-1/3 rounded-base bg-neutral-secondary sm:block" />
          </div>
        </BentoCard>
        <BentoCard title="Analytics" text="Gain insights with real-time data analytics." className="lg:col-span-2">
          <div className={`absolute inset-x-1/6 top-0 bottom-0 flex flex-col gap-6 p-6 ${panel}`}>
            <SkeletonLine className="h-3 w-1/2" />
            <div className="flex-1 rounded-base bg-neutral-secondary" />
          </div>
          <span className={`absolute end-0 top-1/4 flex items-center gap-2 px-6 py-4 text-base font-medium text-heading ${panel}`}>
            <FileLinesIcon className="size-5" /> Reports
          </span>
          <span className={`absolute start-0 bottom-1/6 flex items-center gap-2 px-6 py-4 text-base font-medium text-heading ${panel}`}>
            <ChartMixedDollarIcon className="size-5" /> Dashboard
          </span>
        </BentoCard>
        <BentoCard title="Security" text="Protect your data with top-notch security features." className="lg:col-span-2">
          <div className={`absolute inset-x-8 top-6 bottom-0 flex flex-col gap-4 p-6 ${panel}`}>
            <p className="text-xl font-medium text-heading">Encryption</p>
            <div className="h-20 rounded-base bg-neutral-secondary" />
            <div className="h-20 rounded-base bg-neutral-secondary" />
          </div>
        </BentoCard>
        <BentoCard title="Collaboration" text="Enhance teamwork with powerful collaboration tools." className="lg:col-span-3">
          <div className={`absolute start-0 end-1/4 top-6 bottom-0 flex flex-col gap-12 p-6 ${panel}`}>
            <div className="flex items-center gap-4">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-3 w-20" />
              <Button size="sm" color="secondary" className="ms-auto">Sign in</Button>
            </div>
            <div className="flex-1 rounded-base bg-neutral-secondary" />
          </div>
        </BentoCard>
      </div>
    </section>
  ),
};

export const TitleOnly: Story = { args: { lead: undefined, actions: undefined } };

// Figma Breakpoint = Tablet and Mobile for every type.
export const CenteredTablet: Story = { ...Centered, globals: tablet };
export const CenteredMobile: Story = { ...Centered, globals: mobile };
export const BackgroundImageTablet: Story = { ...BackgroundImage, globals: tablet };
export const BackgroundImageMobile: Story = { ...BackgroundImage, globals: mobile };
export const SplitTablet: Story = { ...Split, globals: tablet };
export const SplitMobile: Story = { ...Split, globals: mobile };
export const LinkAndFormTablet: Story = { ...LinkAndForm, globals: tablet };
export const LinkAndFormMobile: Story = { ...LinkAndForm, globals: mobile };
export const GradientTablet: Story = { ...Gradient, globals: tablet };
export const GradientMobile: Story = { ...Gradient, globals: mobile };
export const WithNavbarTablet: Story = { ...WithNavbar, globals: tablet };
export const WithNavbarMobile: Story = { ...WithNavbar, globals: mobile };
export const BentoCardsTablet: Story = { ...BentoCards, globals: tablet };
export const BentoCardsMobile: Story = { ...BentoCards, globals: mobile };
