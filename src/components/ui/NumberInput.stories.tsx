import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn } from 'storybook/test';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { HelperText, Input, InputGroup, Label } from './Input';
import { NumberInput } from './NumberInput';
import { RangeSlider } from './RangeSlider';
import { Select } from './Select';
import { AngleDownIcon, BedIcon, BitcoinIcon, CalendarMonthIcon, CashIcon, QuestionCircleIcon, RefreshIcon, SortHorizontalIcon, UsersGroupIcon, VisaIcon } from '../icons';

// AD Design Kit Number input — mirrors the Figma "Number form" set (node 1149:46630).
const meta = {
  title: 'Components/NumberInput',
  parameters: { design: figmaDesign('NumberInput') },
  component: NumberInput,
  args: { value: 2, onChange: () => {}, min: 0, max: 10, step: 1, variant: 'buttons', size: 'base', disabled: false, 'aria-label': 'Quantity' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'buttons', 'spaced', 'ghost'] },
    size: { control: 'select', options: ['sm', 'base'] },
  },
  render: (args) => <NumberDemo {...args} />,
  decorators: [
    (Story) => (
      <div className="w-max min-w-48 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function NumberDemo(args: ComponentProps<typeof NumberInput>) {
  const [value, setValue] = useState(args.value);
  return <NumberInput {...args} value={value} onChange={setValue} />;
}

export const Buttons: Story = {};
export const SpacedButtons: Story = { args: { variant: 'spaced' } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithStep: Story = { args: { value: 50, min: 0, max: 500, step: 25, 'aria-label': 'Budget' } };

// ---- Figma Type: each as in Figma, a Label (Required & icon) + the field + Helper ---------------------------------------

const lastUpdate = 'Last update: 20:45 AM, November 20, 2023';
function Field({ id, label, helper = lastUpdate, children }: { id: string; label: string; helper?: ReactNode; children: ReactNode }) {
  return (
    <div className="w-full">
      <Label htmlFor={id} required icon={<QuestionCircleIcon />}>{label}</Label>
      {children}
      {helper && <HelperText>{helper}</HelperText>}
    </div>
  );
}
function MenuButton({ label, children, items, size, color = 'secondary', leftIcon }: { label: string; children: ReactNode; items: string[]; size?: 'xs' | 'base'; color?: 'secondary' | 'tertiary'; leftIcon?: ReactNode }) {
  return (
    <Dropdown label={label} trigger={<Button color={color} size={size} className="shrink-0" leftIcon={leftIcon} rightIcon={<AngleDownIcon />}>{children}</Button>}>
      {items.map((i) => <DropdownItem key={i} onSelect={() => {}}>{i}</DropdownItem>)}
    </Dropdown>
  );
}
const usd = <MenuButton label="Currency" items={['USD', 'EUR', 'GBP']}><span aria-hidden>🇺🇸</span> USD</MenuButton>;
const sell = <MenuButton label="Order type" items={['Sell', 'Buy']}>Sell</MenuButton>;
const width = (w: string) => [(Story: () => ReactNode) => <div className={w}><Story /></div>];

export const Default: Story = {
  args: { variant: 'default', value: NaN, min: 0, max: Infinity, leftIcon: <CashIcon />, placeholder: 'Enter the amount', 'aria-label': undefined, id: 'num-default' },
  render: (args) => <Field id="num-default" label="Amount"><NumberDemo {...args} /></Field>,
  decorators: width('w-96 max-w-full'),
};

export const InnerButton: Story = {
  render: () => (
    <Field id="num-inner" label="Amount">
      <Input id="num-inner" type="number" inputMode="decimal" placeholder="Enter amount" leftIcon={<CashIcon />}
        endAction={<MenuButton label="Currency" items={['USD', 'EUR', 'GBP']} size="xs" color="tertiary">USD</MenuButton>} />
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const WithButtons: Story = {
  args: { value: 999, min: 0, max: 999, 'aria-label': undefined, id: 'num-qty' },
  render: (args) => <Field id="num-qty" label="Quantity" helper="Max 999"><NumberDemo {...args} /></Field>,
  decorators: width('w-36'),
};

export const StackedPlaceholder: Story = {
  args: { value: 3, min: 0, max: 999, stackedLabel: 'Bedrooms', leftIcon: <BedIcon />, 'aria-label': undefined, id: 'num-beds' },
  render: (args) => <Field id="num-beds" label="Quantity" helper="Max 999"><NumberDemo {...args} /></Field>,
  decorators: width('w-48'),
};

export const StackedFull: Story = {
  render: (args) => (
    <Field id="num-acc-beds" label="Accommodation details" helper="Fill in the dates and specifics of your stay.">
      <div className="flex flex-col gap-2">
        <NumberDemo {...args} id="num-acc-beds" value={3} min={0} max={10} stackedLabel="Bedrooms" leftIcon={<BedIcon />} aria-label={undefined} />
        <NumberDemo {...args} value={2} min={1} max={30} stackedLabel="Night stays" leftIcon={<CalendarMonthIcon />} aria-label="Night stays" />
        <NumberDemo {...args} value={6} min={1} max={12} stackedLabel="Guests" leftIcon={<UsersGroupIcon />} aria-label="Guests" />
      </div>
    </Field>
  ),
  decorators: width('w-60'),
};

export const ThreeButtons: Story = {
  render: () => (
    <Field id="num-three" label="Amount">
      <InputGroup>
        {sell}
        <Input id="num-three" type="number" inputMode="decimal" placeholder="Enter amount" leftIcon={<CashIcon />} />
        {usd}
      </InputGroup>
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const WithSpacedButtons: Story = {
  render: () => (
    <Field id="num-rooms" label="Number of rooms">
      <div className="flex gap-4">
        <MenuButton label="Room type" items={['Bedrooms', 'Bathrooms']} leftIcon={<BedIcon />}>Bedrooms</MenuButton>
        <Input id="num-rooms" type="number" inputMode="numeric" defaultValue={4} className="w-14 shrink-0" />
        <Button className="shrink-0">Show all</Button>
      </div>
    </Field>
  ),
  decorators: width('w-80'),
};

export const Inline: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Label htmlFor="num-inline" className="mb-0 shrink-0">Amount</Label>
      <InputGroup>
        {sell}
        <Input id="num-inline" type="number" inputMode="decimal" placeholder="Enter amount" leftIcon={<CashIcon />} />
        {usd}
      </InputGroup>
    </div>
  ),
  decorators: width('w-lg max-w-full'),
};

function ProgressDemo() {
  const [amount, setAmount] = useState(1000);
  return (
    <Field id="num-progress" label="Amount" helper={null}>
      <div className="flex flex-col gap-4">
        <InputGroup>
          {sell}
          <Input id="num-progress" type="number" inputMode="decimal" leftIcon={<CashIcon />} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          {usd}
        </InputGroup>
        <RangeSlider value={amount} onChange={setAmount} min={0} max={10000} step={100} label="Amount" marks={[0, 500, 1000, 5000, 10000]} formatValue={(n) => (n ? `$${n}` : '0')} />
      </div>
    </Field>
  );
}
export const WithProgressBar: Story = { render: () => <ProgressDemo />, decorators: width('w-96 max-w-full') };

export const StackedInputs: Story = {
  render: () => (
    <Field id="num-card" label="Card details">
      <div className="flex flex-col gap-2.5">
        <Input id="num-card" inputMode="numeric" autoComplete="cc-number" placeholder="1234-5678-1234-5678" rightIcon={<VisaIcon />} />
        <div className="flex gap-2.5">
          <Input aria-label="Expiry date" autoComplete="cc-exp" placeholder="12/25" leftIcon={<CalendarMonthIcon />} className="min-w-0 flex-1" />
          <Input aria-label="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="CVV" className="w-20 shrink-0" />
        </div>
      </div>
    </Field>
  ),
  decorators: width('w-64'),
};

export const Range: Story = {
  render: () => (
    <div>
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <Label htmlFor="num-sell" required icon={<QuestionCircleIcon />}>Sell</Label>
          <InputGroup>
            <Select id="num-sell" leftIcon={<CashIcon />} defaultValue="$500">{['$500', '$1000', '$5000'].map((v) => <option key={v}>{v}</option>)}</Select>
            {usd}
          </InputGroup>
        </div>
        <span className="mb-3 text-body [&_svg]:size-4" aria-hidden><SortHorizontalIcon /></span>
        <div className="min-w-0 flex-1">
          <Label htmlFor="num-buy" required icon={<QuestionCircleIcon />}>Buy</Label>
          <InputGroup>
            <Select id="num-buy" leftIcon={<CashIcon />} defaultValue="$500">{['$500', '$1000', '$5000'].map((v) => <option key={v}>{v}</option>)}</Select>
            <MenuButton label="Coin" items={['Bitcoin', 'Ethereum']} leftIcon={<BitcoinIcon />}>Bitcoin</MenuButton>
          </InputGroup>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2.5">
        <HelperText className="mt-0">{lastUpdate}</HelperText>
        <button type="button" className="inline-flex shrink-0 items-center gap-1 rounded-xs text-xs font-medium text-fg-brand hover:underline focus-visible:shadow-focus-brand focus-visible:outline-none">
          <RefreshIcon className="size-3" /> Refresh
        </button>
      </div>
    </div>
  ),
  decorators: width('w-xl max-w-full'),
};

export const GhostInput: Story = {
  args: { variant: 'ghost', value: 99, min: 0, max: 999, 'aria-label': undefined, id: 'num-ghost' },
  render: (args) => <Field id="num-ghost" label="Quantity" helper="Max 999"><NumberDemo {...args} /></Field>,
  decorators: width('w-32'),
};

export const OneButton: Story = {
  render: () => (
    <Field id="num-one" label="Amount">
      <InputGroup>
        <Input id="num-one" type="number" inputMode="decimal" placeholder="Enter amount" leftIcon={<CashIcon />} />
        {usd}
      </InputGroup>
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor="num-guests">Guests</Label>
      <NumberDemo {...args} id="num-guests" min={1} max={8} aria-label={undefined} />
      <HelperText>Between 1 and 8 guests.</HelperText>
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['default', 'buttons', 'spaced', 'ghost'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-body-subtle">{variant}</span>
          <NumberDemo {...args} variant={variant} aria-label={`Quantity (${variant})`} />
        </div>
      ))}
    </div>
  ),
};

// ---- Interaction tests ----------------------------------------------------------------------------------------------

// Like NumberDemo, but also forwards every change to args.onChange so tests can assert the emitted values.
function NumberSpyDemo({ onChange, ...args }: ComponentProps<typeof NumberInput>) {
  const [value, setValue] = useState(args.value);
  return (
    <NumberInput
      {...args}
      value={value}
      onChange={(n) => {
        setValue(n);
        onChange(n);
      }}
    />
  );
}

export const StepWithButtons: Story = {
  args: { value: 8, onChange: fn() },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });
    const inc = canvas.getByRole('button', { name: 'Increase' });
    const dec = canvas.getByRole('button', { name: 'Decrease' });

    await userEvent.click(inc);
    await expect(field).toHaveValue(9);
    await userEvent.click(inc);
    await expect(field).toHaveValue(10);
    await expect(args.onChange).toHaveBeenLastCalledWith(10);
    // At max the + button is disabled.
    await expect(inc).toBeDisabled();
    await userEvent.click(dec);
    await expect(field).toHaveValue(9);
    await expect(inc).toBeEnabled();
    await expect(args.onChange).toHaveBeenCalledTimes(3);
  },
};

export const StepWithKeyboard: Story = {
  args: { value: 1, onChange: fn(), variant: 'spaced' },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });
    const dec = canvas.getByRole('button', { name: 'Decrease' });

    // Tab order: −, field, +. Enter and Space activate the buttons.
    await userEvent.tab();
    await expect(dec).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveValue(0);
    await expect(dec).toBeDisabled();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Increase' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveValue(2);
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};

export const TypeAValue: Story = {
  args: { value: 2, onChange: fn(), variant: 'ghost', step: 1 },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });

    // Clearing the field emits nothing, and the field really is empty so a new number can be typed.
    await userEvent.clear(field);
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(field).toHaveValue(null);
    await userEvent.type(field, '7');
    await expect(field).toHaveValue(7);
    await expect(args.onChange).toHaveBeenLastCalledWith(7);

    // Select the current value and type over it.
    await userEvent.keyboard('{Control>}a{/Control}3');
    await expect(field).toHaveValue(3);
    await expect(args.onChange).toHaveBeenLastCalledWith(3);

    // Out-of-range text stays as typed until the field loses focus, then it is clamped to max.
    await userEvent.keyboard('{Control>}a{/Control}42');
    await expect(args.onChange).toHaveBeenLastCalledWith(4); // the in-range "4" while typing; "42" is held as a draft
    await expect(field).toHaveValue(42);
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith(10);
    await expect(field).toHaveValue(10);
    await expect(canvas.getByRole('button', { name: 'Increase' })).toBeDisabled();

    // Leaving the field empty restores the last valid value.
    await userEvent.clear(field);
    await userEvent.tab();
    await expect(field).toHaveValue(10);
  },
};

export const DisabledButtons: Story = {
  args: { value: 5, onChange: fn(), disabled: true },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('spinbutton', { name: 'Quantity' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Increase' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    await userEvent.tab();
    await expect(document.body).toHaveFocus(); // nothing in the disabled control is focusable
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
