import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect } from 'storybook/test';
import {
  AdjustmentsVerticalIcon,
  BookIcon,
  BookOpenIcon,
  BookOpenReaderIcon,
  DnaIcon,
  FileLinesIcon,
  GridIcon,
  QuestionCircleIcon,
  RefreshIcon,
  ShareNodesIcon,
  UsersGroupIcon,
} from '../icons';
import { Accordion, type AccordionItem } from './Accordion';
import { IconShape } from './IconShape';

// AD Design Kit Accordion — one story per Figma Style (node 1146:19028), Desktop and Mobile breakpoints.
// Figma Icon=True: every question has a question-circle icon; the first answer is the Figma copy.
const release = (
  <>
    <p>
      Generally, it is accepted to use AD Design Kit in open-source projects, as long as it is not a UI library, a theme, a template, a
      page-builder that would be considered as an alternative to AD Design Kit itself.
    </p>
    <p>With that being said, feel free to use this design kit for your open-source projects.</p>
    <p>
      Find out more information by <a href="#accordion">reading the release</a>.
    </p>
  </>
);

const q = (value: string, title: string, content: ReactNode = <p>Yes. See the documentation for details on {title.toLowerCase().replace(/\?$/, '')}.</p>): AccordionItem => ({
  value,
  title,
  icon: <QuestionCircleIcon />,
  content,
});

const openSource = q('open-source', 'Can I use AD Design Kit in open-source projects?', release);
const contribute = q('contribute', 'Can I contribute to the AD Design Kit project?', <p>Yes. Open an issue or a pull request on GitHub; designers can suggest changes in Figma.</p>);
const features = q('features', 'What are the main features of AD Design Kit?', <p>Figma components and React + Tailwind code with the same tokens, variants and themes.</p>);
const frameworks = q('frameworks', 'Is AD Design Kit compatible with popular frontend frameworks?', <p>The components are React; the tokens are plain Tailwind CSS v4 classes that work anywhere.</p>);
const prebuilt = q('prebuilt', 'Does AD Design Kit offer pre-built components?', <p>Yes: 56 React components covering all 58 Figma component sets.</p>);
const free = q('free', 'Is AD Design Kit free to use, or does it have premium features?', <p>It is free; there are no premium features.</p>);
const support = q('support', 'How can I get technical support for AD Design Kit?', <p>Open an issue on GitHub with a link to the story or Figma frame.</p>);
const docs = q('docs', 'Where can I find AD Design Kit documentation and guides?', <p>In Storybook: every component has a docs page with its Figma variants, props and usage guidelines.</p>);
const commercial = q('commercial', 'Is AD Design Kit suitable for commercial projects?', <p>Yes, including client work and SaaS products.</p>);
const issues = q('issues', 'How can I get support if I encounter issues with AD Design Kit?', <p>Check the docs first, then open an issue on GitHub.</p>);
const downloads = q('downloads', 'Where can I access my download files?', <p>From the GitHub repository and the Figma community file.</p>);
const differ = q('differ', 'How does AD Design Kit differ from other UI libraries?', <p>Figma and code share one set of token names and variants, and stay in sync automatically.</p>);

const faq = [openSource, contribute, features, frameworks, prebuilt, free, support, docs, commercial, issues];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: { design: figmaDesign('Accordion'), layout: 'padded' },
  decorators: [(Story) => <div className="w-full max-w-2xl"><Story /></div>],
  args: { items: faq, variant: 'default', multiple: false, defaultValue: ['open-source'] },
  argTypes: { variant: { control: 'select', options: ['default', 'flush', 'cards', 'nested', 'subheader'] } },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const mobile = { viewport: { value: 'mobile1', isRotated: false } };

// Figma "Default": bordered group, the first question open.
export const Default: Story = {};

// Figma "Flush": no outer border, rows divided by a bottom border.
export const Flush: Story = {
  args: { variant: 'flush', items: [openSource, downloads, frameworks, features, prebuilt, commercial, support, issues] },
};

// Figma "Separate Cards": each question its own card, the third one open.
export const Cards: Story = { args: { variant: 'cards', items: [contribute, features, openSource, ...faq.slice(3)] } };

// Figma "Multi-level": an open question lists two sub-questions (chevron first, indented); the second is open.
const install: AccordionItem = {
  value: 'install',
  title: 'Is AD Design Kit compatible with popular frontend frameworks?',
  icon: <QuestionCircleIcon />,
  content: null,
  items: [
    { value: 'nextjs', title: 'How to install AD Design Kit for my Next.js project?', content: <p>Install the package, import the token CSS in your root layout and copy the components you need.</p> },
    { value: 'react', title: 'How to install AD Design Kit for my React project?', content: release },
  ],
};
export const Nested: Story = {
  args: { variant: 'nested', defaultValue: ['install', 'react'], items: [differ, features, prebuilt, commercial, support, install, docs, free, issues] },
};

// Figma "With sub-header": a white IconShape circle, a title and a one-line summary per section.
const section = (value: string, title: string, subtitle: string, icon: ReactNode, content: ReactNode = <p>{subtitle}</p>): AccordionItem => ({
  value,
  title,
  subtitle,
  icon: <IconShape size="base" color="white" shape="circle">{icon}</IconShape>,
  content,
});
const sections = [
  section('intro', 'Introduction to AD Design Kit', 'What is the AD Design Kit library?', <BookOpenIcon />, release),
  section('install', 'Installation and Setup', 'How can I install AD Design Kit in my project?', <ShareNodesIcon />),
  section('frameworks', 'Compatibility and Frameworks', 'Which frameworks are compatible with AD Design Kit?', <DnaIcon />),
  section('components', 'Component Library', 'What types of components are available in AD Design Kit?', <GridIcon />),
  section('customize', 'Customization Options', 'Can I customize AD Design Kit components?', <AdjustmentsVerticalIcon />),
  section('licensing', 'Licensing and Pricing', 'Is AD Design Kit free to use?', <FileLinesIcon />),
  section('a11y', 'Accessibility Support', 'Does AD Design Kit support accessibility standards?', <BookOpenReaderIcon />),
  section('docs', 'Documentation and Tutorials', 'Where can I find AD Design Kit’s official documentation?', <BookIcon />),
  section('updates', 'Updates and Maintenance', 'How frequently is AD Design Kit updated?', <RefreshIcon />),
  section('community', 'Community and Support', 'How can I get support if I encounter issues with AD Design Kit?', <UsersGroupIcon />),
];
export const SubHeader: Story = { args: { variant: 'subheader', defaultValue: ['intro'], items: sections } };

// Figma Breakpoint = Mobile: the same styles at 375px (rows px-4 py-3.5, panels p-4).
export const DefaultMobile: Story = { ...Default, globals: mobile };
export const FlushMobile: Story = { ...Flush, globals: mobile };
export const CardsMobile: Story = { ...Cards, globals: mobile };
export const NestedMobile: Story = { ...Nested, globals: mobile };
export const SubHeaderMobile: Story = { ...SubHeader, globals: mobile };

// Several panels open at once.
export const Multiple: Story = { args: { multiple: true, defaultValue: ['open-source', 'contribute'] } };

export const AllClosed: Story = { args: { defaultValue: [] } };

// Interaction: single mode — opening one item closes the other; clicking an open item collapses it.
export const SingleToggle: Story = {
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole('button', { name: openSource.title as string });
    const second = canvas.getByRole('button', { name: contribute.title as string });
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('region', { name: openSource.title as string })).toBeVisible();

    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    const panel = canvas.getByRole('region', { name: contribute.title as string });
    await expect(panel).toBeVisible();
    await expect(second).toHaveAttribute('aria-controls', panel.id);
    await expect(canvas.queryByRole('region', { name: openSource.title as string })).not.toBeInTheDocument();

    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryAllByRole('region')).toHaveLength(0);
  },
};

// Interaction: Enter and Space toggle a focused trigger.
export const KeyboardToggle: Story = {
  args: { defaultValue: [], items: [openSource, contribute, features] },
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole('button', { name: openSource.title as string });
    const third = canvas.getByRole('button', { name: features.title as string });
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    // The open panel's link is next in the tab order.
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'reading the release' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(third).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(third).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard(' ');
    await expect(third).toHaveAttribute('aria-expanded', 'false');
  },
};

// Interaction: multiple mode — items open independently and stay open.
export const MultipleToggle: Story = {
  args: { multiple: true, defaultValue: [], variant: 'cards', items: [openSource, contribute, features] },
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole('button', { name: openSource.title as string });
    const second = canvas.getByRole('button', { name: contribute.title as string });
    const third = canvas.getByRole('button', { name: features.title as string });
    await userEvent.click(first);
    await userEvent.click(third);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(third).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getAllByRole('region')).toHaveLength(2);

    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(third).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: features.title as string })).toBeVisible();
  },
};

// Interaction: flush variant toggles the same way.
export const FlushToggle: Story = {
  args: { variant: 'flush', defaultValue: [], items: [openSource, downloads] },
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole('button', { name: downloads.title as string });
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: downloads.title as string })).toHaveTextContent('From the GitHub repository');
  },
};

// Interaction: nested children toggle independently (always multiple) under the open parent.
export const NestedToggle: Story = {
  args: { variant: 'nested', defaultValue: ['install'], items: [differ, install] },
  play: async ({ canvas, userEvent }) => {
    const next = canvas.getByRole('button', { name: /Next\.js/ });
    const react = canvas.getByRole('button', { name: /React project/ });
    await expect(next).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(next);
    await userEvent.click(react);
    await expect(next).toHaveAttribute('aria-expanded', 'true');
    await expect(react).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: /Next\.js/ })).toHaveTextContent('import the token CSS');

    await userEvent.click(next);
    await expect(next).toHaveAttribute('aria-expanded', 'false');
    await expect(react).toHaveAttribute('aria-expanded', 'true');

    // Closing the parent hides the nested rows.
    await userEvent.click(canvas.getByRole('button', { name: install.title as string }));
    await expect(canvas.queryByRole('button', { name: /React project/ })).not.toBeInTheDocument();
  },
};

// Interaction: sub-header triggers include the subtitle in their accessible name.
export const SubHeaderToggle: Story = {
  args: { variant: 'subheader', defaultValue: [], items: sections.slice(0, 3) },
  play: async ({ canvas, userEvent }) => {
    const intro = canvas.getByRole('button', { name: /Introduction to AD Design Kit/ });
    await expect(intro).toHaveTextContent('What is the AD Design Kit library?');
    await userEvent.click(intro);
    await expect(intro).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: /Introduction/ })).toHaveTextContent('Generally, it is accepted');
  },
};
