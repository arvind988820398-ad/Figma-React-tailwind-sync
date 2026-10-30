import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn, waitFor } from 'storybook/test';
import { CopyInput } from './CopyInput';
import { HelperText, Label } from './Input';

// AD Design Kit Copy to clipboard — mirrors the Figma "Copy to clipboard form" set (node 1149:46768).
const meta = {
  title: 'Components/CopyInput',
  parameters: { design: figmaDesign('CopyInput') },
  component: CopyInput,
  args: { value: 'npm install ad-design-kit', variant: 'joined', 'aria-label': 'Install command' },
  argTypes: {
    variant: { control: 'select', options: ['joined', 'inner', 'icon'] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
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
      {(['joined', 'inner', 'icon'] as const).map((variant) => (
        <CopyInput key={variant} {...args} variant={variant} aria-label={`Install command (${variant})`} />
      ))}
    </div>
  ),
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
