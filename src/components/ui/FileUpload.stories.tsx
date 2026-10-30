import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { FileDropzone, FileInput } from './FileUpload';
import { HelperText, Label } from './Input';

// AD Design Kit File upload — mirrors the Figma "File upload input" examples (node 1149:48972) and dropzone (1149:48981).
// FileInput = Figma "Default"; FileDropzone = Figma "Advanced" / "With CTAs".
const meta = {
  title: 'Components/FileUpload',
  parameters: { design: figmaDesign('FileUpload') },
  component: FileInput,
  args: { onFiles: () => {}, multiple: false, disabled: false },
  decorators: [
    (Story) => (
      <div className="w-96">
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

export const Dropzone: Story = {
  render: ({ onFiles, accept, multiple, disabled }) => (
    <FileDropzone onFiles={onFiles} accept={accept} multiple={multiple} disabled={disabled} hint="SVG, PNG, JPG or GIF (max. 800×400px)" />
  ),
};

export const DropzoneWithCtas: Story = {
  render: ({ onFiles, accept, multiple, disabled }) => (
    <FileDropzone
      variant="ctas"
      onFiles={onFiles}
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      actions={
        <>
          <span className="text-sm font-medium text-fg-brand">Browse files</span>
          <span className="text-sm font-medium text-fg-brand">Import from URL</span>
        </>
      }
    />
  ),
};

export const DropzoneDisabled: Story = {
  render: ({ onFiles }) => <FileDropzone onFiles={onFiles} disabled hint="Uploads are paused" />,
};

export const DropzoneStatuses: Story = {
  render: ({ onFiles }) => (
    <div className="flex flex-col gap-4">
      <FileDropzone onFiles={onFiles} status="success" hint="3 files uploaded" />
      <FileDropzone onFiles={onFiles} status="danger" hint="File is larger than 5 MB" />
    </div>
  ),
};
