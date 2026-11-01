import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Alert, type AlertColor, type AlertProps } from './Alert';
import { Button, type ButtonColor } from './Button';
import { AngleRightIcon, BookOpenIcon, InfoCircleIcon } from '../icons';

// AD Design Kit Alert — one story per Figma "Alert" Type (node 1146:15151), each showing the five Figma colors
// in Figma's order: Success, Danger, Warning, Info, Default (= neutral).
const colors = ['success', 'danger', 'warning', 'info', 'neutral'] as const satisfies readonly AlertColor[];
// Figma Complex: the "Learn more" button takes the alert's color (Info → Brand, Default → Dark).
const buttonColor: Record<AlertColor, ButtonColor> = { success: 'success', danger: 'danger', warning: 'warning', info: 'brand', neutral: 'dark' };

const message = 'Great job! You’ve acknowledged this significant alert message.';
const longMessage = `${message} We’re adding extra text to illustrate how longer notifications are displayed. By doing this, you can see how text wrapping and spacing are managed.`;

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: { design: figmaDesign('Alert'), layout: 'padded' },
  args: { variant: 'default', icon: <InfoCircleIcon />, onDismiss: fn(), children: message },
  argTypes: {
    color: { control: 'select', options: colors },
    variant: { control: 'select', options: ['default', 'complex', 'pill', 'border-top'] }, // ad-design-kit-lint-ignore: Alert prop values, not classes
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const allColors = (props: (color: AlertColor) => Partial<AlertProps> = () => ({})) =>
  function AllColors(args: AlertProps) {
    return (
      <div className="flex max-w-3xl flex-col items-start gap-4">
        {colors.map((color) => (
          <Alert key={color} {...args} color={color} {...props(color)} className={args.variant === 'pill' ? undefined : 'w-full'} />
        ))}
      </div>
    );
  };

// Figma "Default": icon, one line of text and the dismiss button.
export const Default: Story = { render: allColors() };

// Figma "Complex": title row (icon, title, dismiss), longer text and a "Learn more" button in the alert's color.
export const Complex: Story = {
  args: { variant: 'complex', title: 'Alert heading', children: longMessage },
  render: allColors((color) => ({
    actions: <Button size="xs" color={buttonColor[color]} leftIcon={<BookOpenIcon />}>Learn more</Button>,
  })),
};

// Figma "Small": a pill with a "New" badge, the text and an arrow; used as a Jumbotron eyebrow.
export const Pill: Story = {
  args: {
    variant: 'pill',
    badge: 'New',
    icon: undefined,
    onDismiss: undefined,
    children: (
      <span className="inline-flex items-center gap-0.5">
        {message} <AngleRightIcon className="size-4" />
      </span>
    ),
  },
  render: allColors(),
};

// Figma "Border top": square corners and a 4px top border.
export const BorderTop: Story = { args: { variant: 'border-top' }, render: allColors() }; // ad-design-kit-lint-ignore: Alert prop value, not a class

// Interaction: the dismiss button calls onDismiss; danger alerts are announced as alerts.
export const Dismiss: Story = {
  args: { color: 'danger' },
  play: async ({ canvas, userEvent, args }) => {
    const alert = canvas.getByRole('alert');
    await userEvent.click(within(alert).getByRole('button', { name: 'Dismiss' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};
