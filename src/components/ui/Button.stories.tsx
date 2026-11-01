import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { ArrowLeftIcon, ArrowRightIcon, HeartIcon } from '../icons';
import { Button, type ButtonColor, type ButtonSize } from './Button';

// Figma "Logo inside" example: the HTML5 logo from the Logos page (brand colours are part of the logo, not tokens).
const logoFill = { red: '#E44D26', orange: '#F16529', gray: '#EBEBEB', black: '#000', white: '#FFF' }; // ad-design-kit-lint-ignore: HTML5 brand colours
function Html5Logo() {
  return (
    <svg viewBox="9 4 30 40" aria-hidden>
      <path d="M38.17 11.86 35.59 40.78 23.98 44l-11.57-3.21-2.58-28.93z" fill={logoFill.red} />
      <path d="M24 41.54 33.38 38.94 35.58 14.23H24z" fill={logoFill.orange} />
      <path d="M24 21.32h-5.02l.32 3.63H24v3.55h-7.94l-.96-10.73H24zM16.22 30.28h3.56l.25 2.83 3.95 1.06.02-.01v3.69l-.02.01-7.27-2.02z" fill={logoFill.gray} />
      <path d="M14.27 4h-1.8v5.39h1.8V7.59h1.65v1.8h1.8V4h-1.8v1.78h-1.65zM18.51 5.79h1.59v3.6h1.8v-3.6h1.59V4h-4.98zM24.27 4h1.88l1.16 1.9L28.47 4h1.88v5.39h-1.8V6.72l-1.24 1.92h-.03l-1.24-1.92v2.67h-1.76zM33.05 4h-1.8v5.39h4.33V7.61h-2.53z" fill={logoFill.black} />
      <path d="M23.99 21.32v-3.55h8.89l-.32 3.55zM28.36 28.5h-4.37v-3.55h8.25l-.09.95-.89 9.94-7.27 2.02v-3.69l3.96-1.07z" fill={logoFill.white} />
    </svg>
  );
}

// AD Design Kit Button — mirrors the Figma "Button" set (node 1146:24616).
const meta = {
  title: 'Components/Button',
  parameters: { design: figmaDesign('Button') },
  component: Button,
  args: { children: 'Button', color: 'brand', size: 'base', disabled: false },
  argTypes: {
    color: {
      control: 'select',
      options: ['brand', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'base', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {};
export const Secondary: Story = { args: { color: 'secondary' } };
export const Tertiary: Story = { args: { color: 'tertiary' } };
export const Ghost: Story = { args: { color: 'ghost' } };
export const Disabled: Story = { args: { disabled: true } };

// Figma only defines Outline=True for Success, Danger and Warning.
export const OutlineDanger: Story = { args: { color: 'danger', outline: true, children: 'Delete' } };

// Figma "Show left icon" + "Show right icon": arrow-left and arrow-right around the label.
export const WithIcons: Story = { args: { children: 'Button text', leftIcon: <ArrowLeftIcon />, rightIcon: <ArrowRightIcon /> } };

// Figma "Icon only = True": the heart icon in a square button.
export const IconOnly: Story = { args: { iconOnly: true, 'aria-label': 'Like', children: <HeartIcon /> } };

// Figma "Logo inside = True": a brand logo in a square Secondary, Tertiary or Ghost button.
export const LogoInside: Story = { args: { color: 'secondary', logo: <Html5Logo />, 'aria-label': 'HTML5' } };

const colors: ButtonColor[] = ['brand', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'];
const sizes: ButtonSize[] = ['xs', 'sm', 'base', 'lg', 'xl'];
const withLogo: ButtonColor[] = ['secondary', 'tertiary', 'ghost'];

// The whole Figma set: per color, the Initial and Disabled rows of text buttons (arrow icons), icon-only buttons and,
// for Secondary, Tertiary and Ghost, logo buttons; then the Outline rows. Hover and Focus are CSS states: hover or tab
// through the canvas to see them.
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const row = (color: ButtonColor, disabled: boolean, outline = false) => (
      <div className="flex flex-wrap items-center gap-3">
        {sizes.map((size) => {
          const variant = outline ? ({ color: color as 'success', outline: true } as const) : { color };
          return (
            <Button key={size} {...variant} size={size} disabled={disabled} leftIcon={<ArrowLeftIcon />} rightIcon={<ArrowRightIcon />}>
              Button text
            </Button>
          );
        })}
        {sizes.map((size) => {
          const variant = outline ? ({ color: color as 'success', outline: true } as const) : { color };
          return (
            <Button key={`i-${size}`} {...variant} size={size} disabled={disabled} iconOnly aria-label={`Like (${size})`}>
              <HeartIcon />
            </Button>
          );
        })}
        {!outline && withLogo.includes(color) &&
          sizes.map((size) => <Button key={`l-${size}`} color={color} size={size} disabled={disabled} logo={<Html5Logo />} aria-label={`HTML5 (${size})`} />)}
      </div>
    );
    return (
      <div className="flex flex-col gap-8">
        {colors.map((color) => (
          <section key={color} className="flex flex-col gap-3">
            <p className="text-sm font-medium text-heading">{color}</p>
            {row(color, false)}
            {row(color, true)}
          </section>
        ))}
        {(['success', 'danger', 'warning'] as const).map((color) => (
          <section key={`o-${color}`} className="flex flex-col gap-3">
            <p className="text-sm font-medium text-heading">{color} outline</p>
            {row(color, false, true)}
            {row(color, true, true)}
          </section>
        ))}
      </div>
    );
  },
};

export const AllColors: Story = {
  // `outline` is only valid with success | danger | warning, so it is dropped before spreading.
  render: ({ outline: _outline, color: _color, ...args }) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['brand', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'] as const).map((color) => (
        <Button key={color} {...args} color={color}>
          {color}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['xs', 'sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

// Proves the preview loaded the real token CSS: a toVisible check would also pass unstyled.
// Brand uses `bg-brand` → --adk-bg-brand → brand-700 #1447e6 and `rounded-base` (12px) in Modern light.
export const CssCheck: Story = {
  tags: ['ai-generated'],
  args: { children: 'Submit' },
  globals: { theme: 'modern', scheme: 'light' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /submit/i });
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(20, 71, 230)'); // ad-design-kit-lint-ignore: asserts the resolved bg-brand value
    await expect(getComputedStyle(button).borderTopLeftRadius).toBe('12px');
  },
};
