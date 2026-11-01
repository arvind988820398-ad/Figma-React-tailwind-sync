import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { HelperText, Input, Label, type FieldSize } from './Input';
import { Progress } from './Progress';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CloseIcon, CreditCardIcon, QuestionCircleIcon, RefreshIcon, StarIcon, UserIcon } from '../icons';

// AD Design Kit Input field — mirrors the Figma "Input field" set (node 1149:46826), Label (1149:94727) and Helper (1149:94741).
// Every Figma type shows the "user" icon at the start and the "close" (clear) icon at the end.
const meta = {
  title: 'Components/Input',
  parameters: { design: figmaDesign('Input') },
  component: Input,
  args: { placeholder: 'Placeholder text', size: 'base', disabled: false, 'aria-label': 'Name', leftIcon: <UserIcon />, onClear: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;
const sizes: FieldSize[] = ['sm', 'base', 'lg', 'xl'];

// ---- Figma Type ------------------------------------------------------------------------------------------------------

export const Default: Story = {};
export const AddOnIcon: Story = { args: { leftIcon: undefined, addonIcon: <UserIcon /> } };
export const AddOnText: Story = { args: { leftIcon: undefined, addonText: 'https://' } };
export const InnerButton: Story = {
  args: {
    onClear: undefined,
    endAction: (
      <Button color="tertiary" size="xs" leftIcon={<ArrowLeftIcon />} rightIcon={<ArrowRightIcon />}>
        Button text
      </Button>
    ),
  },
};
export const StackedPlaceholder: Story = { args: { onClear: undefined, stackedLabel: 'Placeholder text', defaultValue: '99', placeholder: undefined } };

// Every type at the four Figma sizes, as the Figma set lays them out.
export const AllTypes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      {[
        { name: 'Default', props: {} },
        { name: 'Add-on icon', props: { leftIcon: undefined, addonIcon: <UserIcon /> } },
        { name: 'Add-on text', props: { leftIcon: undefined, addonText: 'https://' } },
        { name: 'Inner button', props: { onClear: undefined, endAction: <Button color="tertiary" size="xs" leftIcon={<ArrowLeftIcon />} rightIcon={<ArrowRightIcon />}>Button text</Button> } },
        { name: 'Stacked placeholder', props: { onClear: undefined, stackedLabel: 'Placeholder text', defaultValue: '99', placeholder: undefined } },
      ].map(({ name, props }) => (
        <div key={name} className="flex flex-col gap-3">
          <span className="text-xs font-medium text-body-subtle">{name}</span>
          {sizes.map((size) => (
            <Input key={size} {...args} {...props} size={size} aria-label={`${name} ${size}`} />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- Figma State (Focus/Typing is the CSS :focus state) ----------------------------------------------------------------

export const Filled: Story = { args: { defaultValue: 'name@company.com' } };
export const Disabled: Story = { args: { disabled: true, placeholder: 'name@company.com' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'name@company.com' } };
export const Success: Story = { args: { status: 'success', defaultValue: 'Write some text here' } };
export const Danger: Story = { args: { status: 'danger', defaultValue: 'Write some text here' } };

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} aria-label="Initial" />
      <Input {...args} aria-label="Filled" defaultValue="name@company.com" />
      <Input {...args} aria-label="Disabled" disabled placeholder="name@company.com" />
      <Input {...args} aria-label="Read-only" readOnly defaultValue="name@company.com" />
      <Input {...args} aria-label="Success" status="success" defaultValue="Write some text here" />
      <Input {...args} aria-label="Danger" status="danger" defaultValue="Write some text here" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <Input key={size} {...args} size={size} aria-label={`Size ${size}`} />
      ))}
    </div>
  ),
};

// ---- Label (Figma set 1149:94727) -------------------------------------------------------------------------------------

export const LabelTypes: Story = {
  parameters: { design: figmaDesign('Label') },
  render: () => (
    <div className="flex flex-col gap-4">
      <Label className="mb-0">First name</Label>
      <Label className="mb-0" required icon={<QuestionCircleIcon />}>First name</Label>
      <Label className="mb-0" required icon={<QuestionCircleIcon />} hint="Helper text">First name</Label>
    </div>
  ),
};

// ---- Helper (Figma set 1149:94741) ------------------------------------------------------------------------------------

const rules = [
  { text: 'At least 10 characters', ok: true },
  { text: 'At least a number', ok: false },
  { text: 'At least one lowercase letter', ok: true },
  { text: 'At least one uppercase letter', ok: false },
  { text: 'At least one symbol', ok: true },
];

export const HelperTypes: Story = {
  parameters: { design: figmaDesign('HelperText') },
  render: () => (
    <div className="flex flex-col gap-8">
      <HelperText className="mt-0">We'll never share your details.</HelperText>

      <div className="flex flex-wrap items-center gap-2">
        {['Roberta', 'Micheal', 'Neil', 'Lana'].map((name) => (
          <Badge key={name} color="white" size="sm" leading={<Avatar name={name} size="xs" />} rightIcon={<CloseIcon />}>
            {name}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <HelperText className="mt-0">Last update: 20:45 AM, November 20, 2023</HelperText>
        <button type="button" className="inline-flex shrink-0 items-center gap-1 rounded-xs text-xs font-medium text-fg-brand hover:underline focus-visible:shadow-focus-brand focus-visible:outline-none">
          <RefreshIcon className="size-3" /> Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <Progress value={75} color="warning" showValue={false} aria-label="Password strength" />
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-heading">Weak password. Must contain:</p>
          <ul className="flex flex-col gap-1.5">
            {rules.map((r) => (
              <li key={r.text} className={r.ok ? 'flex items-center gap-1.5 text-fg-success-strong' : 'flex items-center gap-1.5 text-body'}>
                {r.ok ? <CheckIcon className="size-3.5" aria-label="Met" /> : <CloseIcon className="size-3.5" aria-label="Not met" />}
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-body">
        <span className="inline-flex items-center gap-1.5">
          <StarIcon className="size-4" /> 1,456+ Reviews
        </span>
        <span className="h-4 border-s border-default" aria-hidden />
        <span className="inline-flex items-center gap-1.5">
          <CreditCardIcon className="size-4" /> No Credit Card Required
        </span>
      </div>
    </div>
  ),
};

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="in-name" required icon={<QuestionCircleIcon />}>Full name</Label>
        <Input {...args} id="in-name" placeholder="Bonnie Green" aria-label={undefined} />
        <HelperText>As it appears on your ID.</HelperText>
      </div>
      <div>
        <Label htmlFor="in-user">Username</Label>
        <Input {...args} id="in-user" status="success" defaultValue="bonnie" aria-label={undefined} />
        <HelperText status="success">Username is available.</HelperText>
      </div>
      <div>
        <Label htmlFor="in-mail">Email</Label>
        <Input {...args} id="in-mail" status="danger" defaultValue="bonnie@" aria-label={undefined} />
        <HelperText status="danger">Enter a valid email address.</HelperText>
      </div>
    </div>
  ),
};

// Interaction: the close icon is a real "Clear" button.
export const ClearButton: Story = {
  args: { defaultValue: 'name@company.com' },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};
