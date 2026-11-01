import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { figmaUsers } from '../../assets/avatars';
import coinbase from '../../assets/logos/coinbase.svg';
import fortmatic from '../../assets/logos/fortmatic.svg';
import metaMask from '../../assets/logos/meta-mask.svg';
import operaWallet from '../../assets/logos/opera-wallet.svg';
import walletConnect from '../../assets/logos/wallet-connect.svg';
import {
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BookmarkIcon,
  CartIcon,
  CheckCircleIcon,
  DotsHorizontalIcon,
  DownloadIcon,
  EnvelopeIcon,
  FireIcon,
  HeadphonesIcon,
  HomeIcon,
  LockIcon,
  NewspaperIcon,
  QuestionCircleIcon,
  UserAddIcon,
  UserCircleIcon,
} from '../icons';
import { Avatar, AvatarGroupLabel } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardText, CardTitle } from './Card';
import { Checkbox } from './Checkbox';
import { DownloadAppButton } from './DownloadAppButton';
import { Input, Label } from './Input';
import { List, ListItem } from './List';
import { Rating } from './Rating';
import { Select } from './Select';
import { Tabs } from './Tabs';

// AD Design Kit Card — one story per Figma Type (node 1149:34153) with the Figma content, plus the Mobile Version
// variants (Split, CTA card, With nav tabs, Testimonial card) at 375px.
const meta = {
  title: 'Components/Card',
  parameters: { design: figmaDesign('Card') },
  component: Card,
  args: { padding: 'base', className: 'w-96' },
  argTypes: { padding: { control: 'select', options: ['base', 'roomy', 'none'] } },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const mobile = { viewport: { value: 'mobile1', isRotated: false } };
const headline = 'Streamlining your design process with AD Design Kit.';
const blurb = 'In today’s fast-paced digital landscape, fostering seamless collaboration among Developers and IT Operations.';

// The Figma image slot ("Put your image here"): bg-neutral-tertiary with a decorative newspaper glyph.
function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-neutral-tertiary text-body-subtle ${className ?? ''}`}>
      <NewspaperIcon className="size-20" />
    </div>
  );
}

function Heading({ title, text, className }: { title: ReactNode; text?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <CardTitle>{title}</CardTitle>
      {text && <CardText>{text}</CardText>}
    </div>
  );
}

// Figma "Default": title, text and a Brand base button (p-7).
export const Default: Story = {
  args: {
    padding: 'roomy',
    children: (
      <>
        <Heading title={headline} text={blurb} />
        <div>
          <Button rightIcon={<ArrowRightIcon />}>Read more</Button>
        </div>
      </>
    ),
  },
};

// Figma "With Image": a rounded image inside the padding, then the text and a Secondary button.
export const WithImage: Story = {
  args: {
    children: (
      <>
        <ImagePlaceholder className="h-48 rounded-base" />
        <Heading title={headline} text={blurb} />
        <div>
          <Button color="secondary" rightIcon={<ArrowRightIcon />}>Read more</Button>
        </div>
      </>
    ),
  },
};

// Figma "Split": image beside the text from sm; on mobile (Mobile Version) the image stacks on top.
const split = (
  <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
    <ImagePlaceholder className="h-48 shrink-0 rounded-sm sm:h-auto sm:w-48" />
    <div className="flex flex-col gap-6">
      <Heading title={headline} text={blurb} />
      <div>
        <Button color="secondary" rightIcon={<ArrowRightIcon />}>Read more</Button>
      </div>
    </div>
  </div>
);
export const Split: Story = { args: { className: 'w-full max-w-160', children: split } };
export const SplitMobile: Story = { ...Split, globals: mobile };

// Figma "Centered with full image": full-bleed image, a Trending badge, centred title, Brand button and a bookmark.
export const CenteredWithFullImage: Story = {
  args: {
    padding: 'none',
    className: 'w-96 shadow',
    media: <ImagePlaceholder className="h-48" />,
    children: (
      <div className="flex flex-col items-center gap-6 p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Badge color="brand" size="sm" leading={<FireIcon />}>Trending</Badge>
          <CardTitle>{headline}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button rightIcon={<ArrowRightIcon />}>Read more</Button>
          <Button color="ghost" iconOnly aria-label="Bookmark">
            <BookmarkIcon />
          </Button>
        </div>
      </div>
    ),
  },
};

// Figma "User profile": 2xl avatar, name with a PRO badge, role, two actions and a menu button.
const leslie = figmaUsers[8];
export const UserProfile: Story = {
  args: {
    className: 'relative w-72',
    children: (
      <>
        <Button color="ghost" iconOnly aria-label="Profile options" className="absolute end-3 top-3">
          <DotsHorizontalIcon />
        </Button>
        <div className="flex flex-col items-center gap-6 text-center">
          <Avatar name="Bonnie Green" src={leslie.src} size="2xl" />
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-semibold leading-8 text-heading">Bonnie Green</h3>
              <Badge color="brand" size="sm">PRO</Badge>
            </div>
            <p className="text-base text-body">Visual Designer</p>
          </div>
          <div className="flex items-center gap-3">
            <Button leftIcon={<UserAddIcon />}>Add friend</Button>
            <Button color="secondary">Message</Button>
          </div>
        </div>
      </>
    ),
  },
};

// Figma "Login form": title, email and password fields, remember me with a lost-password link, Brand full-width button.
export const LoginForm: Story = {
  args: {
    children: (
      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <h3 className="text-xl font-semibold leading-7 text-heading">Sign in to our platform</h3>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="card-email" required>Your email</Label>
            <Input id="card-email" type="email" placeholder="Enter your email" leftIcon={<EnvelopeIcon />} />
          </div>
          <div>
            <Label htmlFor="card-password" required>Your password</Label>
            <Input id="card-password" type="password" placeholder="••••••••••" leftIcon={<LockIcon />} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <Checkbox label="Remember me" />
          <a href="#card" className="text-sm font-medium text-fg-brand hover:underline">Lost Password?</a>
        </div>
        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full">Sign in</Button>
          <p className="text-sm font-medium text-body">
            Not registered? <a href="#card" className="text-fg-brand underline hover:no-underline">Create account</a>
          </p>
        </div>
      </form>
    ),
  },
};

// Figma "E-commerce": image, rating with a score badge, product name, price and Add to cart.
export const ECommerce: Story = {
  args: {
    children: (
      <>
        <ImagePlaceholder className="h-48 rounded-sm" />
        <div className="flex flex-col gap-4">
          <Rating value={5} badge={<Badge color="brand" size="sm">4.8 out of 5</Badge>} />
          <h3 className="text-xl font-semibold leading-7 text-heading">Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport</h3>
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-3xl font-extrabold leading-none text-heading">$599</span>
          <Button leftIcon={<CartIcon />}>Add to cart</Button>
        </div>
      </>
    ),
  },
};

// Figma "CTA card": centred title and text with the two dark Download App Buttons.
export const CtaCard: Story = {
  args: {
    className: 'w-full max-w-160',
    children: (
      <div className="flex flex-col items-center gap-6 text-center">
        <Heading
          title="Work fast from everywhere"
          text={
            <>
              Stay up to date and move work forward with AD Design Kit on iOS & Android.<span className="max-sm:hidden"> Download the app today.</span>
            </>
          }
        />
        <div className="flex flex-wrap justify-center gap-3">
          <DownloadAppButton store="app-store" href="#card" />
          <DownloadAppButton store="google-play" href="#card" />
        </div>
      </div>
    ),
  },
};
export const CtaCardMobile: Story = { ...CtaCard, globals: mobile };

// Figma "With nav tabs": Button tabs (Select on mobile) over a grid of stats.
const stats = [
  ['73M+', 'Developers'],
  ['100M+', 'Public repositories'],
  ['1000s', 'Open source projects'],
  ['1B+', 'Contributors'],
  ['90+', 'Fortune 100 companies'],
  ['4M+', 'Organizations'],
];
const navTabs = [
  { value: 'stats', label: 'Stats', icon: <HomeIcon /> },
  { value: 'settings', label: 'Settings', icon: <AdjustmentsHorizontalIcon /> },
  { value: 'account', label: 'My account', icon: <UserCircleIcon /> },
  { value: 'downloads', label: 'Downloads', icon: <DownloadIcon /> },
  { value: 'support', label: 'Support', icon: <HeadphonesIcon /> },
];
function NavTabsCard() {
  const [tab, setTab] = useState('stats');
  return (
    <Card className="w-full max-w-3xl">
      <div className="flex flex-col gap-6 sm:gap-8">
        <Tabs items={navTabs} value={tab} onValueChange={setTab} variant="button" label="Card sections" className="flex w-full justify-between max-sm:hidden" />
        <Select aria-label="Card sections" value={tab} onChange={(e) => setTab(e.target.value)} className="sm:hidden">
          {navTabs.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {stats.map(([value, label]) => (
            <div key={label} className="flex flex-col-reverse items-center gap-1 text-center">
              <dt className="text-base text-body">{label}</dt>
              <dd className="text-2xl font-bold leading-6 text-heading">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
export const WithNavTabs: Story = { render: () => <NavTabsCard /> };
export const WithNavTabsMobile: Story = { ...WithNavTabs, globals: mobile };

// Figma "With full width tabs": a text tab bar on a tinted strip, then the panel with a Learn more link.
const fullTabs = [
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Services' },
  { value: 'facts', label: 'Facts' },
];
function FullWidthTabsCard() {
  const [tab, setTab] = useState('services');
  return (
    <Card padding="none" className="w-full max-w-3xl">
      <div>
        <div className="border-b border-default bg-neutral-secondary-medium px-6 py-3.5">
          <Tabs items={fullTabs} value={tab} onValueChange={setTab} label="Company" />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold leading-9 text-heading">Powering innovation at 200k+ companies</h3>
            <CardText>
              In today’s fast-paced digital landscape, fostering seamless collaboration among Developers, IT Operations, and business teams is
              critical to driving innovation and achieving success by empowering these groups to work together.
            </CardText>
          </div>
          <a href="#card" className="inline-flex items-center gap-1 text-base font-medium text-fg-brand hover:underline">
            Learn more <ArrowRightIcon className="size-4" />
          </a>
        </div>
      </div>
    </Card>
  );
}
export const WithFullWidthTabs: Story = {
  render: () => <FullWidthTabsCard />,
  play: async ({ canvas, userEvent }) => {
    const facts = canvas.getByRole('tab', { name: 'Facts' });
    await userEvent.click(facts);
    await expect(facts).toHaveAttribute('aria-selected', 'true');
  },
};

// Figma "Pricing card": plan, price, the feature checklist (List Default, not included = Disabled) and Add to cart.
export const PricingCard: Story = {
  args: {
    children: (
      <>
        <h3 className="text-xl font-medium leading-7 text-body">Standard plan</h3>
        <p className="flex items-baseline gap-2.5">
          <span className="text-5xl font-bold leading-none text-heading">$49</span>
          <span className="text-base font-medium text-body">/month</span>
        </p>
        <List>
          {['2 team members', '20GB Cloud storage', 'Integration help', 'Sketch Files'].map((t) => (
            <ListItem key={t} icon={<CheckCircleIcon />}>{t}</ListItem>
          ))}
          {['API Access', 'Complete documentation', '24×7 phone & email support'].map((t) => (
            <ListItem key={t} icon={<CheckCircleIcon />} disabled>{t}</ListItem>
          ))}
        </List>
        <Button leftIcon={<CartIcon />} className="w-full">Add to cart</Button>
      </>
    ),
  },
};

// Figma "Grid card" (desktop) and "Testimonial card" (Mobile Version): four testimonials, 2×2 with dividers, stacked on mobile.
const testimonials = [
  { title: 'Best for a SaaS application', quote: 'Designing with Figma components that can be easily translated to the utility classes of Tailwind CSS is a huge timesaver!', user: figmaUsers[0], role: 'CEO AD Design Kit LLC' },
  { title: 'Solid foundation for any project', quote: 'If you care for your time, I hands down would go with this.', user: figmaUsers[4], role: 'Graphic Designer' },
  { title: 'Mindblowing workflow', quote: 'You have many examples that can be used to create a fast prototype for your team.', user: figmaUsers[7], role: 'Web designer' },
  { title: 'Efficient Collaborating', quote: 'Aesthetically, the well designed components are beautiful and will undoubtedly level up your next application.', user: figmaUsers[11], role: 'React Developer' },
];
export const GridCard: Story = {
  args: {
    padding: 'roomy',
    className: 'w-full max-w-3xl',
    children: (
      <div className="grid divide-y divide-default sm:grid-cols-2 sm:divide-y-0">
        {testimonials.map((t, i) => (
          <figure
            key={t.title}
            className={[
              'flex flex-col items-center gap-4 py-5 text-center first:pt-0 last:pb-0 sm:py-0',
              i % 2 === 0 ? 'sm:border-e sm:border-default sm:pe-6' : 'sm:ps-6',
              i < 2 ? 'sm:border-b sm:border-default sm:pb-6' : 'sm:pt-6',
            ].join(' ')}
          >
            <blockquote className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold leading-8 text-heading">{t.title}</h3>
              <p className="text-base text-body">{t.quote}"</p>
            </blockquote>
            <figcaption>
              <AvatarGroupLabel name={t.user.name} src={t.user.src} helper={t.role} />
            </figcaption>
          </figure>
        ))}
      </div>
    ),
  },
};
export const TestimonialCardMobile: Story = { ...GridCard, globals: mobile };

// Figma "Card with list": a title with View all and a List of customers (List Type "Card").
const customers = [
  { user: figmaUsers[1], description: 'Helper text here', value: '$599' },
  { user: figmaUsers[0], description: 'Helper text here', value: '$325' },
  { user: figmaUsers[2], description: 'name@example.com', value: '$127' },
  { user: figmaUsers[4], description: 'Helper text here', value: '$1,264' },
  { user: figmaUsers[7], description: 'Helper text here', value: '$688' },
  { user: figmaUsers[9], description: 'Helper text here', value: '$89' },
];
export const CardWithList: Story = {
  args: {
    children: (
      <>
        <div className="flex items-center justify-between gap-2.5">
          <h3 className="text-xl font-semibold leading-7 text-heading">Latest customers</h3>
          <a href="#card" className="text-base font-medium text-fg-brand hover:underline">View all</a>
        </div>
        <List variant="card">
          {customers.map((c) => (
            <ListItem key={c.user.name} media={<Avatar name={c.user.name} src={c.user.src} size="base" />} description={c.description} trailing={c.value}>
              {c.user.name}
            </ListItem>
          ))}
        </List>
      </>
    ),
  },
};

// Figma "Crypto": wallet rows (logo, name, a Popular badge) on tinted surfaces and a help link.
const wallets = [
  { name: 'MetaMask', logo: metaMask, popular: true },
  { name: 'Coinbase Wallet', logo: coinbase },
  { name: 'Opera Wallet', logo: operaWallet },
  { name: 'WalletConnect', logo: walletConnect },
  { name: 'Fortmatic', logo: fortmatic },
];
export const Crypto: Story = {
  args: {
    children: (
      <>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold leading-7 text-heading">Connect wallet</h3>
          <CardText>Connect with one of our available wallet providers or create a new one.</CardText>
        </div>
        <ul className="flex flex-col gap-2.5">
          {wallets.map((w) => (
            <li key={w.name}>
              <a href="#card" className="flex items-center gap-2 rounded-base bg-neutral-secondary-medium p-3 text-lg font-semibold leading-6 text-heading hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-brand focus-visible:outline-none">
                <img src={w.logo} alt="" className="size-6" />
                <span className="flex-1">{w.name}</span>
                {w.popular && <Badge color="white" size="sm">Popular</Badge>}
              </a>
            </li>
          ))}
        </ul>
        <a href="#card" className="inline-flex items-center gap-1.5 text-sm text-body hover:underline">
          <QuestionCircleIcon className="size-3.5" /> Why do I need to connect with my wallet?
        </a>
      </>
    ),
  },
};
