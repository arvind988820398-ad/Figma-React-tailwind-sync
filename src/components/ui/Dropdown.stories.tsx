import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ReactNode } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';
import {
  AdjustmentsHorizontalIcon,
  AdjustmentsVerticalIcon,
  AngleDownIcon,
  AngleRightIcon,
  ArchiveIcon,
  ArrowRightToBracketIcon,
  BellIcon,
  CalendarMonthIcon,
  CartIcon,
  CogIcon,
  CommandIcon,
  EnvelopeIcon,
  EyeIcon,
  FileInvoiceIcon,
  FilePdfIcon,
  FolderIcon,
  FontColorIcon,
  FontFamilyIcon,
  GlobeIcon,
  InboxFullIcon,
  LetterBoldIcon,
  LetterItalicIcon,
  LetterUnderlineIcon,
  LinkIcon,
  ListIcon,
  LockIcon,
  MessagesIcon,
  MoonIcon,
  OrderedListIcon,
  PlusIcon,
  QuestionCircleIcon,
  RocketIcon,
  SearchIcon,
  TextSizeIcon,
  TextSlashIcon,
  TrashBinIcon,
  UserAddIcon,
  UserCircleIcon,
  UserHeadsetIcon,
  UserIcon,
} from '../icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import {
  Dropdown,
  DropdownCheckboxItem,
  DropdownHeader,
  DropdownItem,
  DropdownRadioItem,
  DropdownSeparator,
  type DropdownProps,
} from './Dropdown';
import { IconShape } from './IconShape';
import { Input } from './Input';
import { NumberInput } from './NumberInput';

// AD Design Kit Dropdown — mirrors the Figma "Dropdown menu" set (node 1149:39895), item 1149:39651, header 1149:39866.
const meta = {
  title: 'Components/Dropdown',
  parameters: { design: figmaDesign('Dropdown') },
  component: Dropdown,
  // Leave room below the trigger for the open menu.
  decorators: [(Story) => <div className="flex min-h-72 items-start"><Story /></div>],
  args: {
    label: 'Actions',
    align: 'start',
    trigger: <Button>Dropdown</Button>,
    children: (
      <>
        <DropdownItem icon={<PlusIcon />}>New project</DropdownItem>
        <DropdownItem icon={<EnvelopeIcon />}>Invite people</DropdownItem>
        <DropdownItem icon={<CogIcon />}>Settings</DropdownItem>
        <DropdownItem disabled>Disabled item</DropdownItem>
      </>
    ),
  },
  argTypes: { align: { control: 'select', options: ['start', 'end'] } },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Figma Type variants ──────────────────────────────────────────────────────────────────────────────────────────────
// One story per Figma "Dropdown menu" Type with Figma's content, shown open (`defaultOpen`). Each story reserves room
// below the trigger for its menu.

const trigger = (text = 'Dropdown button') => <Button rightIcon={<AngleDownIcon />}>{text}</Button>;
const room = (minH: string) => [(Story: () => ReactNode) => <div className={minH}>{Story()}</div>];

// Figma Type "Default": icon rows, the last one destructive.
export const Default: Story = {
  decorators: room('min-h-80'),
  args: {
    defaultOpen: true,
    label: 'Account menu',
    trigger: trigger(),
    children: (
      <>
        <DropdownItem icon={<UserIcon />}>Account</DropdownItem>
        <DropdownItem icon={<AdjustmentsHorizontalIcon />}>Settings</DropdownItem>
        <DropdownItem icon={<LockIcon />}>Privacy</DropdownItem>
        <DropdownItem icon={<BellIcon />}>Notifications</DropdownItem>
        <DropdownItem icon={<QuestionCircleIcon />}>Help center</DropdownItem>
        <DropdownItem icon={<ArrowRightToBracketIcon />} color="danger">Sign out</DropdownItem>
      </>
    ),
  },
};

// Figma Type "User profile": avatar header with a plan Badge, a Dark mode toggle row and a separator.
function UserProfileMenu(args: DropdownProps) {
  const [dark, setDark] = useState(false);
  return (
    <Dropdown
      {...args}
      className="w-72"
      header={<DropdownHeader avatar={<Avatar name="Jese Leos" />} name="Jese Leos" email="name@addesignkit.com" trailing={<Badge color="brand">Basic</Badge>} />}
    >
      <DropdownItem icon={<UserIcon />}>Account</DropdownItem>
      <DropdownItem icon={<AdjustmentsHorizontalIcon />}>Settings</DropdownItem>
      <DropdownItem icon={<LockIcon />}>Privacy</DropdownItem>
      <DropdownItem icon={<BellIcon />}>Notifications</DropdownItem>
      <DropdownItem icon={<QuestionCircleIcon />}>Help center</DropdownItem>
      <DropdownCheckboxItem icon={<MoonIcon />} indicator="toggle" indicatorPosition="end" checked={dark} onCheckedChange={setDark}>
        Dark mode
      </DropdownCheckboxItem>
      <DropdownSeparator />
      <DropdownItem icon={<RocketIcon />}>Upgrade to PRO</DropdownItem>
      <DropdownItem icon={<ArrowRightToBracketIcon />} color="danger">Sign out</DropdownItem>
    </Dropdown>
  );
}
export const UserProfile: Story = {
  decorators: room('min-h-112'),
  args: { defaultOpen: true, label: 'Account', trigger: <Button color="ghost"><Avatar name="Jese Leos" size="sm" /> Jese Leos</Button> },
  render: (args) => <UserProfileMenu {...args} />,
};

// Figma Type "with separator": text formatting with shortcut Badges, groups and submenu chevrons.
const shortcut = (key: string) => <Badge color="white" leading={<CommandIcon />}>{key}</Badge>;
export const WithSeparator: Story = {
  decorators: room('min-h-120'),
  args: {
    defaultOpen: true,
    label: 'Format',
    className: 'w-56',
    trigger: trigger('Format'),
    children: (
      <>
        <DropdownItem icon={<LetterBoldIcon />} trailing={shortcut('B')}>Bold</DropdownItem>
        <DropdownItem icon={<LetterItalicIcon />} trailing={shortcut('I')}>Italic</DropdownItem>
        <DropdownItem icon={<LetterUnderlineIcon />} trailing={shortcut('U')}>Underline</DropdownItem>
        <DropdownItem icon={<TextSlashIcon />} trailing={shortcut('X')}>Strikethrough</DropdownItem>
        <DropdownItem icon={<LinkIcon />} trailing={shortcut('K')}>Create link</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<OrderedListIcon />} trailing={shortcut('8')}>Ordered list</DropdownItem>
        <DropdownItem icon={<ListIcon />} trailing={shortcut('7')}>Unordered list</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<FontFamilyIcon />} trailing={<AngleRightIcon />}>Font family</DropdownItem>
        <DropdownItem icon={<TextSizeIcon />} trailing={<AngleRightIcon />}>Font size</DropdownItem>
        <DropdownItem icon={<FontColorIcon />} trailing={<AngleRightIcon />}>Font color</DropdownItem>
      </>
    ),
  },
};

// Figma Type "With radio input": one choice applied in place, with a count on each row.
const segments: [string, number][] = [['Individual', 456], ['Company', 53], ['Enterprise', 34], ['Non-profit', 70], ['Government', 103]];
function RadioMenu(args: DropdownProps) {
  const [value, setValue] = useState('Enterprise');
  return (
    <Dropdown {...args}>
      {segments.map(([name, count]) => (
        <DropdownRadioItem key={name} checked={value === name} onSelect={() => setValue(name)} trailing={`(${count})`}>
          {name}
        </DropdownRadioItem>
      ))}
    </Dropdown>
  );
}
export const WithRadioInput: Story = {
  decorators: room('min-h-64'),
  args: { defaultOpen: true, label: 'Customer type', trigger: trigger('Customer type') },
  render: (args) => <RadioMenu {...args} />,
};

// Figma Type "With toggle": settings that apply immediately, each with a description.
const toggles: [string, string][] = [
  ['Enable notifications', 'Never miss out on important events, launches and webinars.'],
  ['Enable 2FA authentication', 'Add an extra layer of security to your account and stay safe.'],
  ['Remember me on this device', 'Stay logged in without needing to enter your password again.'],
  ['Require password for every login', 'Always require your password for each login to ensure maximum security'],
  ['Subscribe to our newsletter', 'Stay informed about our latest news and promotions.'],
];
function ToggleMenu(args: DropdownProps) {
  const [on, setOn] = useState<Record<string, boolean>>({ 'Remember me on this device': true });
  return (
    <Dropdown {...args} className="w-80">
      {toggles.map(([name, text]) => (
        <DropdownCheckboxItem key={name} indicator="toggle" description={text} checked={!!on[name]} onCheckedChange={(v) => setOn((o) => ({ ...o, [name]: v }))}>
          {name}
        </DropdownCheckboxItem>
      ))}
    </Dropdown>
  );
}
export const WithToggle: Story = {
  decorators: room('min-h-112'),
  args: { defaultOpen: true, label: 'Security settings', trigger: trigger('Settings') },
  render: (args) => <ToggleMenu {...args} />,
};

// Figma Type "Checkbox": checkbox rows with a helper line; toggling keeps the menu open.
function CheckboxMenu(args: DropdownProps) {
  const [checked, setChecked] = useState([false, false, false]);
  return (
    <Dropdown {...args} className="w-72">
      {checked.map((c, i) => (
        <DropdownCheckboxItem
          key={i}
          description="Save my credentials for easier sign-in"
          checked={c}
          onCheckedChange={(v) => setChecked((all) => all.map((x, j) => (j === i ? v : x)))}
        >
          Remember me
        </DropdownCheckboxItem>
      ))}
    </Dropdown>
  );
}
export const Checkbox: Story = {
  decorators: room('min-h-64'),
  args: { defaultOpen: true, label: 'Sign-in options', trigger: trigger('Options') },
  render: (args) => <CheckboxMenu {...args} />,
};

// Figma Type "Users": search field, people with checkboxes at the end, and a destructive action.
const people = ['Bonnie Green', 'Jese Leos', 'Roberta Casas', 'Karen Nelson', 'Joseph McFall', 'Helene Engels', 'Thomas Lean', 'Robert Brown', 'Lana Byrd', 'Leslie Livingston'];
function UsersMenu({ scroll, ...args }: DropdownProps & { scroll?: boolean }) {
  const [selected, setSelected] = useState<string[]>(scroll ? ['Robert Brown', 'Karen Nelson', 'Roberta Casas'] : ['Joseph McFall', 'Thomas Lean']);
  const search = <Input size="sm" aria-label="Search for user" placeholder="Search for user" leftIcon={<SearchIcon />} />;
  const rows = (scroll ? [...people].reverse() : people).map((name) => (
    <DropdownCheckboxItem
      key={name}
      icon={<Avatar name={name} size="xs" />}
      indicatorPosition="end"
      checked={selected.includes(name)}
      onCheckedChange={(v) => setSelected((s) => (v ? [...s, name] : s.filter((n) => n !== name)))}
    >
      {name}
    </DropdownCheckboxItem>
  ));
  if (scroll) {
    return (
      <Dropdown
        {...args}
        className="w-52 gap-0 p-0"
        menuClassName="max-h-72 overflow-y-auto p-2"
        header={<div className="border-b border-default-medium p-2">{search}</div>}
        footer={<div className="p-2"><Button size="sm" className="w-full" leftIcon={<UserAddIcon />}>Add users</Button></div>}
      >
        {rows}
      </Dropdown>
    );
  }
  return (
    <Dropdown
      {...args}
      className="w-60"
      header={search}
      footer={<Button size="sm" color="danger" className="w-full" leftIcon={<TrashBinIcon />}>Delete user</Button>}
    >
      {rows}
    </Dropdown>
  );
}
export const Users: Story = {
  decorators: room('min-h-128'),
  args: { defaultOpen: true, label: 'Users', trigger: trigger('Users') },
  render: (args) => <UsersMenu {...args} />,
};

// Figma Type "With scroll": no panel padding; the search and the action stay put while the list scrolls.
export const WithScroll: Story = {
  decorators: room('min-h-112'),
  args: { defaultOpen: true, label: 'Users', trigger: trigger('Users') },
  render: (args) => <UsersMenu {...args} scroll />,
};

// Figma Type "Heading & Button": a heading, folder rows and a create-new button.
export const HeadingAndButton: Story = {
  decorators: room('min-h-80'),
  args: {
    defaultOpen: true,
    label: 'Save to collection',
    className: 'w-72',
    trigger: trigger('Save'),
    header: <p className="px-2.5 pt-2 text-sm font-semibold leading-5 text-heading">Save to collection</p>,
    footer: <Button size="xs" color="secondary" className="w-full" leftIcon={<PlusIcon />}>Create new collection</Button>,
    children: (
      <>
        {['Modern UI elements', 'Top navbars collection', 'Premium Button Styles', 'E-commerce design gems', 'UI animations'].map((name) => (
          <DropdownItem key={name} icon={<FolderIcon />}>{name}</DropdownItem>
        ))}
      </>
    ),
  },
};

// Figma Type "User selection": people with their last activity; the current one has a Default badge.
const accounts: [string, string][] = [
  ['Joseph McFall', 'Last active 3 hrs ago'],
  ['Leslie Livingston', 'Last active last week'],
  ['Michael Gough', 'Last active 1 min ago'],
  ['Roberta Casas', 'Last active 1 month ago'],
];
export const UserSelection: Story = {
  decorators: room('min-h-64'),
  args: {
    defaultOpen: true,
    label: 'Switch account',
    className: 'w-72',
    trigger: trigger('Switch account'),
    children: (
      <>
        {accounts.map(([name, active]) => (
          <DropdownItem
            key={name}
            icon={<Avatar name={name} size="sm" />}
            description={active}
            trailing={name === 'Michael Gough' ? <Badge color="brand">Default</Badge> : undefined}
          >
            {name}
          </DropdownItem>
        ))}
      </>
    ),
  },
};

// Figma Type "Text & illustration": an empty state in a dialog panel.
export const TextAndIllustration: Story = {
  decorators: room('min-h-72'),
  args: {
    defaultOpen: true,
    panel: true,
    label: 'Notifications',
    className: 'w-80',
    trigger: <Button color="secondary" leftIcon={<BellIcon />}>Notifications</Button>,
    children: (
      <div className="flex flex-col items-center gap-2.5 rounded bg-neutral-secondary-strong p-4 text-center">
        <IconShape size="2xl" color="brand" shape="circle"><BellIcon /></IconShape>
        <p className="text-base font-semibold leading-4 text-heading">No notifications yet</p>
        <p className="text-sm text-body">You’re all caught up! Check back later for updates or new alerts.</p>
      </div>
    ),
  },
};

// Figma Type "With forms": a date range filter in a dialog panel.
export const WithForms: Story = {
  decorators: room('min-h-36'),
  args: {
    defaultOpen: true,
    panel: true,
    label: 'Date range',
    className: 'w-80',
    trigger: trigger('Date range'),
    children: (
      <div className="flex items-center gap-1.5 text-sm text-body">
        <Input size="sm" aria-label="Start date" placeholder="Start date" leftIcon={<CalendarMonthIcon />} />
        to
        <Input size="sm" aria-label="End date" placeholder="End date" leftIcon={<CalendarMonthIcon />} />
      </div>
    ),
  },
};

// Figma Type "Grid": a 3-column launcher of boxed tiles.
const apps: [string, ReactNode][] = [
  ['Account', <UserCircleIcon key="i" />],
  ['Settings', <AdjustmentsVerticalIcon key="i" />],
  ['Inbox', <InboxFullIcon key="i" />],
  ['Calendar', <CalendarMonthIcon key="i" />],
  ['Chat', <MessagesIcon key="i" />],
  ['Sales', <CartIcon key="i" />],
  ['Products', <ArchiveIcon key="i" />],
  ['Invoices', <FileInvoiceIcon key="i" />],
  ['Support', <UserHeadsetIcon key="i" />],
];
export const Grid: Story = {
  decorators: room('min-h-72'),
  args: {
    defaultOpen: true,
    label: 'Apps',
    className: 'w-72',
    menuClassName: 'grid grid-cols-3',
    trigger: trigger('Apps'),
    children: (
      <>
        {apps.map(([name, icon]) => (
          <DropdownItem key={name} boxed icon={icon}>{name}</DropdownItem>
        ))}
      </>
    ),
  },
};

// Figma Type "Language select": rows with a flag.
const languages: [string, string][] = [['English', '🇺🇸'], ['French', '🇫🇷'], ['Español', '🇪🇸'], ['Deutsch', '🇩🇪'], ['Italiano', '🇮🇹'], ['中文 (繁體)', '🇨🇳']];
export const LanguageSelect: Story = {
  decorators: room('min-h-80'),
  args: {
    defaultOpen: true,
    label: 'Language',
    trigger: trigger('English'),
    children: (
      <>
        {languages.map(([name, flag]) => (
          <DropdownItem key={name} icon={<span aria-hidden className="text-base leading-none">{flag}</span>} lang={name === 'English' ? 'en' : undefined}>
            {name}
          </DropdownItem>
        ))}
      </>
    ),
  },
};

// Figma Type "Menu": a CTA card, model rows with capability badges, and a Show all button.
const models = ['Gemini 2.0 Flash', 'Gpt-4o-mini', 'Claude 3 Haiku', 'DeepSeek v3 (Fireworks)', 'Claude 3.5 Sonnet', 'Mistral ai'];
const capabilities = (
  <span className="flex gap-1.5">
    <Badge iconOnly size="lg"><EyeIcon /></Badge>
    <Badge iconOnly size="lg"><FilePdfIcon /></Badge>
    <Badge iconOnly size="lg"><GlobeIcon /></Badge>
  </span>
);
export const Menu: Story = {
  decorators: room('min-h-136'),
  args: {
    defaultOpen: true,
    label: 'Models',
    className: 'w-80',
    trigger: trigger('Gpt-4o-mini'),
    header: (
      <div className="flex items-start justify-between gap-2.5 rounded border border-default-medium bg-neutral-secondary-soft p-3">
        <div className="flex flex-col items-start gap-1.5">
          <p className="text-base font-medium leading-6 text-heading">Unlock all models now</p>
          <Button size="xs" color="tertiary" leftIcon={<RocketIcon />}>Upgrade now</Button>
        </div>
        <div className="flex flex-col items-center rounded border border-default-medium bg-neutral-primary-medium p-3">
          <span className="text-base font-bold leading-4 text-heading">$19</span>
          <span className="text-xs text-body">monthly</span>
        </div>
      </div>
    ),
    footer: <Button size="xs" color="secondary" className="w-full" leftIcon={<EyeIcon />}>Show all</Button>,
    children: (
      <>
        {models.map((name, i) => (
          <div key={name} className="contents">
            {i > 0 && <DropdownSeparator />}
            <DropdownItem trailing={capabilities}>{name}</DropdownItem>
          </div>
        ))}
      </>
    ),
  },
};

// Figma Type "With number inputs": guest counters in a dialog panel.
const guests: [string, string | undefined, number][] = [['Adults', 'Age 13+', 2], ['Children', 'Ages 2–12', 4], ['Infants', 'Under 2', 2], ['Pets', undefined, 1]];
function GuestsPanel(args: DropdownProps) {
  const [counts, setCounts] = useState(guests.map(([, , n]) => n));
  return (
    <Dropdown {...args} panel className="w-72">
      {guests.map(([name, helper], i) => (
        <div key={name} className="flex items-center justify-between gap-4 rounded p-3">
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="font-medium text-heading">{name}</span>
            {helper && <span className="text-body">{helper}</span>}
          </div>
          <NumberInput
            variant="ghost"
            size="sm"
            min={0}
            aria-label={name}
            value={counts[i]}
            onChange={(v) => setCounts((c) => c.map((x, j) => (j === i ? v : x)))}
          />
        </div>
      ))}
    </Dropdown>
  );
}
export const WithNumberInputs: Story = {
  decorators: room('min-h-84'),
  args: { defaultOpen: true, label: 'Guests', trigger: trigger('Guests') },
  render: (args) => <GuestsPanel {...args} />,
};

// ── Triggers and alignment ───────────────────────────────────────────────────────────────────────────────────────────

// Checkbox items for column visibility; toggling keeps the menu open.
function ColumnsDemo(args: DropdownProps) {
  const [cols, setCols] = useState({ name: true, status: true, revenue: false });
  return (
    <Dropdown {...args} label="Columns" trigger={<Button color="secondary">Columns</Button>}>
      {(Object.keys(cols) as (keyof typeof cols)[]).map((k) => (
        <DropdownCheckboxItem key={k} checked={cols[k]} onCheckedChange={(v) => setCols((c) => ({ ...c, [k]: v }))}>
          {k[0].toUpperCase() + k.slice(1)}
        </DropdownCheckboxItem>
      ))}
    </Dropdown>
  );
}
export const CheckboxItems: Story = { render: (args) => <ColumnsDemo {...args} /> };

export const IconTriggerAlignEnd: Story = {
  decorators: [(Story) => <div className="flex w-80 justify-end"><Story /></div>],
  args: {
    label: 'More',
    align: 'end',
    trigger: (
      <Button color="ghost" iconOnly aria-label="More actions">
        <CogIcon />
      </Button>
    ),
    children: (
      <>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Delete</DropdownItem>
      </>
    ),
  },
};

export const AvatarTrigger: Story = {
  args: {
    label: 'Account',
    // Named by the avatar (the person's name); aria-haspopup="menu" announces the menu.
    trigger: (
      <Button color="ghost" iconOnly className="rounded-full">
        <Avatar name="Grace Hopper" size="base" />
      </Button>
    ),
    header: <DropdownHeader name="Grace Hopper" email="grace@ad-design-kit.dev" avatar={<Avatar name="Grace Hopper" size="sm" />} />,
    children: (
      <>
        <DropdownItem>Profile</DropdownItem>
        <DropdownItem>Sign out</DropdownItem>
      </>
    ),
  },
};

// ── Interaction tests ────────────────────────────────────────────────────────────────────────────────────────────────

const onNewProject = fn();
const onSettings = fn();

// Arrow keys wrap and skip the disabled item, Home/End jump, Escape closes and returns focus to the trigger.
export const KeyboardNavigation: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Dropdown' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('aria-controls');

    await userEvent.click(trigger);
    const menu = canvas.getByRole('menu', { name: 'Actions' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', menu.id);
    const [newProject, invite, settings, disabled] = within(menu).getAllByRole('menuitem');
    await expect(disabled).toBeDisabled();
    // Opening moves focus to the first enabled item.
    await waitFor(() => expect(newProject).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    await expect(invite).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(settings).toHaveFocus();
    // The disabled item is skipped and the list wraps to the top.
    await userEvent.keyboard('{ArrowDown}');
    await expect(newProject).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(settings).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(newProject).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(settings).toHaveFocus();
    // Unhandled keys do nothing.
    await userEvent.keyboard('a');
    await expect(settings).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};

// Clicking or pressing Enter on an item calls onSelect, closes the menu and returns focus to the trigger.
export const SelectItem: Story = {
  args: {
    children: (
      <>
        <DropdownItem icon={<PlusIcon />} onSelect={onNewProject}>New project</DropdownItem>
        <DropdownItem icon={<CogIcon />} onSelect={onSettings}>Settings</DropdownItem>
        <DropdownItem>No handler</DropdownItem>
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    onNewProject.mockClear();
    onSettings.mockClear();
    const trigger = canvas.getByRole('button', { name: 'Dropdown' });

    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Settings' }));
    await expect(onSettings).toHaveBeenCalledTimes(1);
    await expect(onNewProject).not.toHaveBeenCalled();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'New project' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(onNewProject).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();

    // An item without onSelect still closes the menu.
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'No handler' }));
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

// Clicking the trigger again or anywhere outside closes the menu; clicks inside it do not; Tab moves on and closes it.
export const DismissBehaviour: Story = {
  args: {
    label: 'Account',
    trigger: (
      <Button color="ghost">
        <Avatar name="Ada Lovelace" size="sm" />
        Ada Lovelace
      </Button>
    ),
    header: <DropdownHeader name="Ada Lovelace" email="ada@ad-design-kit.dev" />,
    children: (
      <>
        <DropdownItem>Dashboard</DropdownItem>
        <DropdownItem trailing={<Badge color="white" size="sm">3</Badge>}>Notifications</DropdownItem>
        <DropdownItem description="Billing and invoices">Plan</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Sign out</DropdownItem>
      </>
    ),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /Ada Lovelace/ });

    await userEvent.click(trigger);
    const menu = canvas.getByRole('menu', { name: 'Account' });
    await expect(canvas.getByText('ada@ad-design-kit.dev')).toBeVisible();
    await expect(within(menu).getByRole('separator')).toBeInTheDocument();
    await expect(within(menu).getByRole('menuitem', { name: /Plan/ })).toHaveTextContent('Billing and invoices');
    await expect(within(menu).getByRole('menuitem', { name: /Notifications/ })).toHaveTextContent('3');
    // Pointer down inside the panel (on the header) keeps it open.
    await userEvent.click(canvas.getByText('ada@ad-design-kit.dev'));
    await expect(canvas.getByRole('menu')).toBeVisible();
    // Trigger toggles.
    await userEvent.click(trigger);
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(canvas.getByRole('menu')).toBeVisible();
    await userEvent.click(canvasElement.ownerDocument.body);
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Dashboard' })).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

// Checkbox items toggle aria-checked and keep the menu open.
export const ToggleCheckboxItems: Story = {
  render: (args) => <ColumnsDemo {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
    const menu = canvas.getByRole('menu', { name: 'Columns' });
    const [name, , revenue] = within(menu).getAllByRole('menuitemcheckbox');
    await expect(name).toHaveAttribute('aria-checked', 'true');
    await expect(revenue).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(revenue);
    await expect(revenue).toHaveAttribute('aria-checked', 'true');
    await expect(menu).toBeVisible();
    await userEvent.click(name);
    await expect(name).toHaveAttribute('aria-checked', 'false');
    // Keyboard reaches checkbox items too.
    await userEvent.keyboard('{End}');
    await expect(revenue).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(revenue).toHaveAttribute('aria-checked', 'false');
    await expect(menu).toBeVisible();
  },
};

// align="end" anchors the open menu to the trigger's end edge; a header without an email shows only the name.
export const OpenAlignedEnd: Story = {
  ...IconTriggerAlignEnd,
  args: {
    ...IconTriggerAlignEnd.args,
    header: <DropdownHeader name="Grace Hopper" />,
    children: <DropdownItem>Edit</DropdownItem>,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'More actions' }));
    const panel = canvas.getByRole('menu', { name: 'More' }).parentElement!;
    await expect(panel).toHaveClass('end-0');
    await expect(panel).not.toHaveClass('start-0');
    await expect(within(panel).getByText('Grace Hopper')).toBeVisible();
    await expect(within(panel).queryByText(/@/)).not.toBeInTheDocument();
  },
};

// Destructive item: color="danger" (Figma Color = Danger). Red text and icon, danger-soft hover.
export const DangerItem: Story = {
  args: {
    label: 'Chat options',
    trigger: <Button color="secondary">Options</Button>,
    children: (
      <>
        <DropdownItem>Rename</DropdownItem>
        <DropdownItem color="danger">Delete</DropdownItem>
      </>
    ),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Options' }));
    const del = within(canvasElement).getByRole('menuitem', { name: 'Delete' });
    await expect(del).toHaveClass('text-fg-danger-strong');
    await expect(within(canvasElement).getByRole('menuitem', { name: 'Rename' })).not.toHaveClass('text-fg-danger-strong');
  },
};
