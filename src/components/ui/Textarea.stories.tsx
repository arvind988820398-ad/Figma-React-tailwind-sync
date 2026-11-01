import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect } from 'storybook/test';
import { Button } from './Button';
import { HelperText, Input, Label } from './Input';
import { Textarea, TextareaToolButton } from './Textarea';
import { FaceGrinIcon, FileCirclePlusIcon, MapPinAltIcon, PaperClipIcon, PaperPlaneHorizontalIcon } from '../icons';

// AD Design Kit Textarea — one story per Figma "Textarea input" Type (node 1149:49679) and State
// (Initial, Focus, Filled), with the Figma texts and icons. Examples 1149:50131.
const filledText =
  'Standard glass, 3.8GHz 8-core 10th-generation Intel Core i7 processor, Turbo Boost up to 5.0GHz, 16GB 2666MHz DDR4 memory, ' +
  'Radeon Pro 5500 XT with 8GB of GDDR6 memory, 256GB SSD storage, Gigabit Ethernet, Magic Mouse 2, Magic Keyboard - US.';

const meta = {
  title: 'Components/Textarea',
  parameters: { design: figmaDesign('Textarea') },
  component: Textarea,
  args: { placeholder: 'Write text here ...', rows: 8, disabled: false, 'aria-label': 'Message' },
  argTypes: {
    status: { control: 'select', options: ['success', 'danger'] },
  },
  decorators: [
    (Story) => (
      <div className="w-lg max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma State is a CSS state: the Focus stories focus the field.
const focusField: Story['play'] = async ({ canvas }) => {
  const field = canvas.getAllByRole('textbox')[0];
  field.focus();
  await expect(field).toHaveFocus();
};

// Figma "Buttons inside" toolbar: Brand sm submit, then emoji, attach, location and file icons.
const toolbar = (
  <div className="flex items-center gap-4">
    <Button size="sm">Send message</Button>
    <div className="flex items-center gap-1">
      <TextareaToolButton label="Add emoji"><FaceGrinIcon /></TextareaToolButton>
      <TextareaToolButton label="Attach file"><PaperClipIcon /></TextareaToolButton>
      <TextareaToolButton label="Share location"><MapPinAltIcon /></TextareaToolButton>
      <TextareaToolButton label="Add file"><FileCirclePlusIcon /></TextareaToolButton>
    </div>
  </div>
);

// Type = Default
export const Default: Story = {};
export const DefaultFocus: Story = { play: focusField };
export const DefaultFilled: Story = { args: { defaultValue: filledText } };

// Type = Buttons inside: the toolbar row is joined under the text area.
export const ButtonsInside: Story = { args: { footer: toolbar } };
export const ButtonsInsideFocus: Story = { args: { footer: toolbar }, play: focusField };
export const ButtonsInsideFilled: Story = { args: { footer: toolbar, defaultValue: filledText } };

// Type = Buttons outside: the text area, then a Brand sm button 16px below.
export const ButtonsOutside: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Textarea {...args} />
      <Button size="sm">Send message</Button>
    </div>
  ),
};
export const ButtonsOutsideFocus: Story = { ...ButtonsOutside, play: focusField };
export const ButtonsOutsideFilled: Story = { ...ButtonsOutside, args: { defaultValue: filledText } };

// Type = Chatroom: emoji and file buttons, an Input sm and a brand send button on a soft bar.
export const Chatroom: Story = {
  render: () => (
    <form className="flex items-center gap-2 rounded-lg bg-neutral-secondary-soft p-2" onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-center gap-1">
        <TextareaToolButton label="Add emoji"><FaceGrinIcon /></TextareaToolButton>
        <TextareaToolButton label="Add file"><FileCirclePlusIcon /></TextareaToolButton>
      </div>
      <Input size="sm" aria-label="Message" placeholder="Write your message here" className="flex-1" />
      <TextareaToolButton label="Send message" type="submit" brand>
        <PaperPlaneHorizontalIcon />
      </TextareaToolButton>
    </form>
  ),
};

// Code-ahead states and field composition.
export const Success: Story = { args: { status: 'success', defaultValue: 'Looks good.', rows: 4 } };
export const Danger: Story = { args: { status: 'danger', defaultValue: 'Too short', rows: 4 } };
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled', rows: 4 } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div>
      <Label htmlFor="ta-notes">Notes</Label>
      <Textarea {...args} rows={4} id="ta-notes" placeholder="Anything we should know?" aria-label={undefined} />
      <HelperText>Optional. Visible to the whole team.</HelperText>
    </div>
  ),
};
