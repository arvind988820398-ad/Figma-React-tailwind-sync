import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { CheckIcon, CogIcon, MailIcon, PlusIcon } from '../icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { IconShape } from './IconShape';
import { List, ListItem } from './List';

// AuxoKit List — mirrors the Figma "List" set (node 1149:70444).
const meta = {
  title: 'Components/List',
  parameters: { design: figmaDesign('List') },
  component: List,
  args: { variant: 'default' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'divider', 'cta'] },
    children: { control: false },
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <List {...args} className="w-80">
      <ListItem icon={<CheckIcon />}>At least 10 characters</ListItem>
      <ListItem icon={<CheckIcon />}>At least one uppercase letter</ListItem>
      <ListItem icon={<CheckIcon />}>At least one special character</ListItem>
    </List>
  ),
};

export const LinkAndDisabled: Story = {
  render: (args) => (
    <List {...args} className="w-80">
      <ListItem icon={<CheckIcon />}>At least 10 characters</ListItem>
      <ListItem icon={<CheckIcon />} href="#list">
        At least one uppercase letter (link)
      </ListItem>
      <ListItem icon={<CheckIcon />} disabled>
        At least one special character (disabled)
      </ListItem>
    </List>
  ),
};

export const Divider: Story = {
  args: { variant: 'divider' },
  render: (args) => (
    <List {...args} className="w-80">
      <ListItem media={<Avatar name="Ada Lovelace" size="base" />} description="ada@auxokit.dev" trailing="$320">
        Ada Lovelace
      </ListItem>
      <ListItem
        media={<Avatar name="Grace Hopper" size="base" />}
        description="grace@auxokit.dev"
        trailing={
          <Badge color="success" size="sm">
            Paid
          </Badge>
        }
      >
        Grace Hopper
      </ListItem>
      <ListItem
        media={<Avatar name="Alan Turing" size="base" />}
        description="alan@auxokit.dev"
        trailing={
          <Button size="xs" color="secondary">
            View
          </Button>
        }
      >
        Alan Turing
      </ListItem>
    </List>
  ),
};

export const DividerWithIconShapes: Story = {
  args: { variant: 'divider' },
  render: (args) => (
    <List {...args} className="w-80">
      <ListItem
        media={
          <IconShape size="sm" color="success">
            <PlusIcon />
          </IconShape>
        }
        description="Today, 10:24"
        trailing="+$2,300"
      >
        Payment from Bonnie Green
      </ListItem>
      <ListItem
        media={
          <IconShape size="sm" color="danger">
            <MailIcon />
          </IconShape>
        }
        description="Yesterday"
        trailing="-$120"
      >
        Refund to Thomas Lean
      </ListItem>
    </List>
  ),
};

// Figma "Card" type: a Card wrapping a divider list.
export const InsideCard: Story = {
  args: { variant: 'divider' },
  render: (args) => (
    <Card className="w-80">
      <List {...args}>
        <ListItem media={<Avatar name="Ada Lovelace" size="base" />} description="ada@auxokit.dev" trailing="$320">
          Ada Lovelace
        </ListItem>
        <ListItem media={<Avatar name="Grace Hopper" size="base" />} description="grace@auxokit.dev" trailing="$180">
          Grace Hopper
        </ListItem>
      </List>
    </Card>
  ),
};

export const Cta: Story = {
  args: { variant: 'cta' },
  render: (args) => (
    <List {...args} className="w-80">
      <ListItem
        cta
        href="#list"
        media={
          <IconShape size="sm" color="brand">
            <CogIcon />
          </IconShape>
        }
        description="Theme, fonts and dark mode"
      >
        Appearance
      </ListItem>
      <ListItem
        cta
        href="#list"
        media={
          <IconShape size="sm" color="brand">
            <MailIcon />
          </IconShape>
        }
        description="Email and push"
      >
        Notifications
      </ListItem>
    </List>
  ),
};
