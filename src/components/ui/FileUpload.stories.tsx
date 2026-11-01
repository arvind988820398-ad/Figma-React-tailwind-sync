import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn, waitFor } from 'storybook/test';
import type { ComponentProps } from 'react';
import { FileDropzone, FileInput } from './FileUpload';
import { IconShape } from './IconShape';
import { HelperText, Label } from './Input';
import { DesktopPcIcon, FolderOpenIcon, LinkIcon } from '../icons';

// AD Design Kit File upload — mirrors the Figma "File upload input" examples (node 1149:48972) and dropzone (1149:48981).
// FileInput = Figma "Default"; FileDropzone = Figma "Advanced" / "With CTAs".
const meta = {
  title: 'Components/FileUpload',
  parameters: { design: figmaDesign('FileUpload') },
  component: FileInput,
  args: { onFiles: () => {}, multiple: false, disabled: false },
  decorators: [
    (Story, { parameters }) => (
      <div className={parameters.wide ? 'w-full max-w-5xl' : 'w-full max-w-xl'}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Multiple: Story = { args: { multiple: true, accept: 'image/*' } };
export const Disabled: Story = { args: { disabled: true } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor="file-avatar">Upload avatar</Label>
      <FileInput {...args} id="file-avatar" aria-describedby="file-avatar-help" />
      <HelperText id="file-avatar-help">SVG, PNG, JPG or GIF (max. 800×400px).</HelperText>
    </div>
  ),
};

// ---- Figma "File upload input": Type Advanced / With cta's × State Initial, Hover (CSS), Disabled, Success, Danger ------

// Figma "With cta's" sources: white circle IconShapes with a caption.
const sources = (
  <>
    {[
      { icon: <DesktopPcIcon />, label: 'Browse' },
      { icon: <FolderOpenIcon />, label: 'Library' },
      { icon: <LinkIcon />, label: 'Link' },
    ].map((s) => (
      <span key={s.label} className="flex flex-col items-center gap-1.5 text-xs font-medium">
        <IconShape size="base" color="white" shape="circle">{s.icon}</IconShape>
        {s.label}
      </span>
    ))}
  </>
);
const hint = 'Max. File Size: 30MB';
type ZoneProps = Partial<ComponentProps<typeof FileDropzone>>;
const zone = (onFiles: (f: File[]) => void, props: ZoneProps) =>
  props.variant === 'ctas' ? <FileDropzone onFiles={onFiles} actions={sources} {...props} /> : <FileDropzone onFiles={onFiles} hint={hint} {...props} />;

export const Dropzone: Story = { render: ({ onFiles }) => zone(onFiles, {}) };
export const DropzoneWithCtas: Story = { render: ({ onFiles }) => zone(onFiles, { variant: 'ctas' }) };
export const DropzoneDisabled: Story = { render: ({ onFiles }) => zone(onFiles, { disabled: true }) };

export const DropzoneStates: Story = {
  parameters: { wide: true },
  render: ({ onFiles }) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {(['advanced', 'ctas'] as const).flatMap((variant) =>
        [{}, { disabled: true }, { status: 'success' as const }, { status: 'danger' as const }].map((p, i) => (
          <div key={`${variant}-${i}`}>{zone(onFiles, { variant, ...p })}</div>
        )),
      )}
    </div>
  ),
};

// ---- Interaction tests ----------------------------------------------------------------------------------------------

const png = (name: string) => new File(['(png bytes)'], name, { type: 'image/png' });

/** Fires a native drag event carrying `files`, the way a browser does when files are dragged over/onto the dropzone. */
function drag(target: Element, type: 'dragover' | 'dragleave' | 'drop', files: File[] = []) {
  const dataTransfer = new DataTransfer();
  files.forEach((f) => dataTransfer.items.add(f));
  target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
}

export const UploadSingleFile: Story = {
  args: { onFiles: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByText('No file chosen')).toBeVisible();
    const file = png('avatar.png');
    await userEvent.upload(canvas.getByLabelText(/choose file/i), file);
    await expect(args.onFiles).toHaveBeenCalledWith([file]);
    await expect(canvas.getByText('avatar.png')).toBeVisible();
    await expect(canvas.queryByText('No file chosen')).not.toBeInTheDocument();
  },
};

export const UploadMultipleFiles: Story = {
  args: { onFiles: fn(), multiple: true, accept: 'image/*' },
  play: async ({ canvas, userEvent, args }) => {
    const files = [png('cover.png'), png('thumbnail.png')];
    await userEvent.upload(canvas.getByLabelText(/choose file/i), files);
    await expect(args.onFiles).toHaveBeenCalledWith(files);
    await expect(canvas.getByText('cover.png, thumbnail.png')).toBeVisible();
  },
};

export const UploadWhenDisabled: Story = {
  args: { onFiles: fn(), disabled: true },
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByLabelText(/choose file/i);
    await expect(input).toBeDisabled();
    await userEvent.upload(input, png('avatar.png'));
    await expect(args.onFiles).not.toHaveBeenCalled();
    await expect(canvas.getByText('No file chosen')).toBeVisible();
  },
};

export const DropzoneUpload: Story = {
  args: { onFiles: fn(), multiple: true },
  render: ({ onFiles, multiple }) => <FileDropzone onFiles={onFiles} multiple={multiple} hint="SVG, PNG, JPG or GIF (max. 800×400px)" />,
  play: async ({ canvas, userEvent, args }) => {
    const files = [png('hero.png'), png('logo.png')];
    await userEvent.upload(canvas.getByLabelText(/click to upload/i), files);
    await expect(args.onFiles).toHaveBeenCalledWith(files);
  },
};

export const DropzoneDragAndDrop: Story = {
  args: { onFiles: fn() },
  render: ({ onFiles }) => <FileDropzone onFiles={onFiles} hint="SVG, PNG, JPG or GIF (max. 800×400px)" />,
  play: async ({ canvas, args }) => {
    const zone = canvas.getByText('Click to upload or drag and drop').closest('label')!;
    await waitFor(() => expect(zone).not.toHaveClass('bg-neutral-tertiary'));

    // Dragging files over highlights the zone; leaving removes the highlight.
    drag(zone, 'dragover');
    await waitFor(() => expect(zone).toHaveClass('bg-neutral-tertiary'));
    drag(zone, 'dragleave');
    await waitFor(() => expect(zone).not.toHaveClass('bg-neutral-tertiary'));

    // Dropping hands over the files and clears the highlight.
    const file = png('dropped.png');
    drag(zone, 'dragover');
    await waitFor(() => expect(zone).toHaveClass('bg-neutral-tertiary'));
    drag(zone, 'drop', [file]);
    await waitFor(() => expect(zone).not.toHaveClass('bg-neutral-tertiary'));
    await waitFor(() => expect(args.onFiles).toHaveBeenCalledTimes(1));
    const [[received]] = (args.onFiles as ReturnType<typeof fn>).mock.calls as [File[]][];
    await expect(received.map((f) => f.name)).toEqual(['dropped.png']);
  },
};

export const DropzoneDisabledIgnoresDrop: Story = {
  args: { onFiles: fn() },
  render: ({ onFiles }) => <FileDropzone onFiles={onFiles} disabled hint="Uploads are paused" />,
  play: async ({ canvas, args }) => {
    const zone = canvas.getByText('Click to upload or drag and drop').closest('label')!;
    await expect(canvas.getByLabelText(/click to upload/i)).toBeDisabled();
    drag(zone, 'dragover');
    await waitFor(() => expect(zone).not.toHaveClass('bg-neutral-tertiary'));
    drag(zone, 'drop', [png('blocked.png')]);
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};
