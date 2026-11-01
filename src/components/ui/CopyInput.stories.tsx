import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn, waitFor } from 'storybook/test';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { CopyInput } from './CopyInput';
import { Dropdown, DropdownItem } from './Dropdown';
import { HelperText, Input, InputGroup, Label } from './Input';
import { Select } from './Select';
import { AngleDownIcon, ClipboardIcon, PhoneIcon, QuestionCircleIcon } from '../icons';

// AD Design Kit Copy to clipboard — mirrors the Figma "Copy to clipboard form" set (node 1149:46768).
const meta = {
  title: 'Components/CopyInput',
  parameters: { design: figmaDesign('CopyInput') },
  component: CopyInput,
  args: { value: 'npm install ad-design-kit', variant: 'joined', 'aria-label': 'Install command' },
  argTypes: {
    variant: { control: 'select', options: ['icon', 'button', 'joined', 'inner', 'large'] },
  },
  decorators: [
    (Story) => (
      <div className="w-max min-w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CopyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Joined: Story = {};
export const InnerButton: Story = { args: { variant: 'inner' } };
export const IconButton: Story = { args: { variant: 'icon' } };
export const LongValue: Story = { args: { value: 'https://ad-design-kit.dev/share/8f3a2c1d-77b4-4e0e-9c52-1a2b3c4d5e6f', 'aria-label': 'Share link' } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div>
      <Label htmlFor="copy-key">API key</Label>
      <CopyInput {...args} id="copy-key" value="sk_live_51Hx…9Qz" aria-label={undefined} />
      <HelperText>Keep this secret. It will not be shown again.</HelperText>
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['icon', 'button', 'joined', 'inner'] as const).map((variant) => (
        <CopyInput key={variant} {...args} variant={variant} aria-label={`Install command (${variant})`} />
      ))}
    </div>
  ),
};

// ---- Figma Type: each as in Figma, a Label (Required & icon) + the field + Helper ---------------------------------------

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="w-full">
      <Label htmlFor={id} required icon={<QuestionCircleIcon />}>{label}</Label>
      {children}
      <HelperText>Paste it into your terminal.</HelperText>
    </div>
  );
}
function MenuButton({ label, children, items }: { label: string; children: ReactNode; items: string[] }) {
  return (
    <Dropdown label={label} trigger={<Button color="secondary" className="shrink-0" rightIcon={<AngleDownIcon />}>{children}</Button>}>
      {items.map((i) => <DropdownItem key={i} onSelect={() => {}}>{i}</DropdownItem>)}
    </Dropdown>
  );
}
const copy = (text: string) => () => void navigator.clipboard?.writeText(text).catch(() => {});
const width = (w: string) => [(Story: () => ReactNode) => <div className={w}><Story /></div>];
const code = `'use client';

import { Carousel } from 'ad-design-kit-react';

function Component() {
  return (
    <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
      <Carousel />
    </div>
  );
}`;

export const FigmaDefault: Story = {
  name: 'Default',
  args: { variant: 'icon', value: 'npm i ad-design-kit', 'aria-label': undefined, id: 'copy-default' },
  render: (args) => <Field id="copy-default" label="Install command"><CopyInput {...args} /></Field>,
};
export const DefaultWithButton: Story = {
  args: { variant: 'button', value: 'npm i ad-design-kit', 'aria-label': undefined, id: 'copy-button' },
  render: (args) => <Field id="copy-button" label="Install command"><CopyInput {...args} /></Field>,
};
export const FigmaInnerButton: Story = {
  name: 'Inner button (with label)',
  args: { variant: 'inner', value: 'npm i ad-design-kit', 'aria-label': undefined, id: 'copy-inner' },
  render: (args) => <Field id="copy-inner" label="Install command"><CopyInput {...args} /></Field>,
  decorators: width('w-96 max-w-full'),
};
export const LargeInput: Story = {
  args: { variant: 'large', value: code, 'aria-label': undefined, id: 'copy-large' },
  render: (args) => <Field id="copy-large" label="Usage"><CopyInput {...args} /></Field>,
};

export const Inline: Story = {
  args: { variant: 'button', value: 'npm i ad-design-kit', 'aria-label': undefined, id: 'copy-inline' },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Label htmlFor="copy-inline" className="mb-0 shrink-0">Install</Label>
      <CopyInput {...args} className="flex-1" />
    </div>
  ),
  decorators: width('w-md max-w-full'),
};

export const WithSpacedButtons: Story = {
  render: () => (
    <Field id="copy-url" label="Share link">
      <div className="flex gap-4">
        <MenuButton label="Link type" items={['URL', 'Embed']}>URL</MenuButton>
        <Input id="copy-url" defaultValue="https://addesignkit.com" className="min-w-0 flex-1" />
        <Button className="shrink-0" onClick={copy('https://addesignkit.com')}>Copy</Button>
      </div>
    </Field>
  ),
  decorators: width('w-md max-w-full'),
};

export const ThreeButtons: Story = {
  render: () => (
    <Field id="copy-phone" label="Contact">
      <InputGroup>
        <MenuButton label="Field" items={['Phone number', 'Email']}>Phone number</MenuButton>
        <Input id="copy-phone" defaultValue="123-456-7890" leftIcon={<PhoneIcon />} />
        <MenuButton label="Copy as" items={['Copy', 'Copy with country code']}>Copy</MenuButton>
      </InputGroup>
    </Field>
  ),
  decorators: width('w-md max-w-full'),
};

export const SelectAndButton: Story = {
  render: () => (
    <Field id="copy-select" label="Phone number">
      <InputGroup>
        <Select id="copy-select" leftIcon={<PhoneIcon />} defaultValue="123-456-7890">
          {['123-456-7890', '456-789-0123'].map((n) => <option key={n}>{n}</option>)}
        </Select>
        <Button color="secondary" iconOnly aria-label="Copy to clipboard" className="shrink-0 text-body" onClick={copy('123-456-7890')}><ClipboardIcon /></Button>
      </InputGroup>
    </Field>
  ),
};

export const AddOn: Story = {
  render: () => (
    <Field id="copy-addon" label="Website">
      <InputGroup>
        <Input id="copy-addon" addonText="URL" defaultValue="https://addesignkit.com" />
        <Button iconOnly aria-label="Copy to clipboard" className="shrink-0" onClick={copy('https://addesignkit.com')}><ClipboardIcon /></Button>
      </InputGroup>
    </Field>
  ),
  decorators: width('w-96 max-w-full'),
};

export const TwoButtons: Story = {
  render: () => (
    <Field id="copy-key" label="License key">
      <InputGroup>
        <Button className="shrink-0">Generate</Button>
        <Input id="copy-key" defaultValue="12345678-ABCD-EFGH-IJKL-987654" />
        <Button color="secondary" iconOnly aria-label="Copy to clipboard" className="shrink-0 text-body" onClick={copy('12345678-ABCD-EFGH-IJKL-987654')}><ClipboardIcon /></Button>
      </InputGroup>
    </Field>
  ),
  decorators: width('w-md max-w-full'),
};

// ---- Interaction tests ----------------------------------------------------------------------------------------------

/** Replaces navigator.clipboard for the duration of `run` (headless Chromium may not grant clipboard access). */
async function withClipboard(writeText: ReturnType<typeof fn>, run: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  try {
    await run();
  } finally {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
}

export const CopyJoined: Story = {
  play: async ({ canvas, userEvent, args, canvasElement }) => {
    const writeText = fn().mockResolvedValue(undefined);
    await withClipboard(writeText, async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
      await expect(writeText).toHaveBeenCalledWith(args.value);
      await expect(await canvas.findByRole('button', { name: 'Copied' })).toBeVisible();
      await expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('Copied to clipboard');
      // The confirmation resets after two seconds.
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Copy' })).toBeVisible(), { timeout: 3000 });
      await expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('');
    });
  },
};

export const CopyInner: Story = {
  args: { variant: 'inner' },
  play: async ({ canvas, userEvent, args, canvasElement }) => {
    const writeText = fn().mockResolvedValue(undefined);
    await withClipboard(writeText, async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
      await expect(writeText).toHaveBeenCalledWith(args.value);
      await expect(await canvas.findByRole('button', { name: 'Copied' })).toBeVisible();
      await expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('Copied to clipboard');
    });
  },
};

export const CopyIcon: Story = {
  args: { variant: 'icon' },
  play: async ({ canvas, userEvent, args, canvasElement }) => {
    const writeText = fn().mockResolvedValue(undefined);
    await withClipboard(writeText, async () => {
      // Keyboard users reach the icon button after the field and activate it with Enter.
      await userEvent.tab();
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Copy to clipboard' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(writeText).toHaveBeenCalledWith(args.value);
      await expect(await canvas.findByRole('button', { name: 'Copied' })).toBeVisible();
      await expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('Copied to clipboard');
    });
  },
};

export const CopyBlockedFallsBackToSelection: Story = {
  play: async ({ canvas, userEvent, args, canvasElement }) => {
    const writeText = fn().mockRejectedValue(new DOMException('Write permission denied.', 'NotAllowedError'));
    await withClipboard(writeText, async () => {
      const field = canvas.getByRole('textbox', { name: 'Install command' });
      await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
      await expect(writeText).toHaveBeenCalledWith(args.value);
      // The field takes focus with its text selected so the user can copy manually; no "Copied" is announced.
      await waitFor(() => expect(field).toHaveFocus());
      const input = field as HTMLInputElement;
      await expect(input.value.slice(input.selectionStart ?? 0, input.selectionEnd ?? 0)).toBe(args.value);
      await expect(canvas.getByRole('button', { name: 'Copy' })).toBeVisible();
      await expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('');
    });
  },
};
