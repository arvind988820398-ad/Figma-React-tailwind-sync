import type { Meta, StoryObj } from '@storybook/react-vite';
import { KnowledgeGraph } from '../ad-design-kit/graph';

// The Guides → Graph docs page (Graph.mdx) is attached to this file. The Embed story shows the graph alone and fills
// its frame, for pages outside Storybook to show it live in an iframe:
// https://ad-design-kit-storybook.netlify.app/iframe.html?id=guides-graph--embed&viewMode=story
const meta = {
  title: 'Guides/Graph',
  component: KnowledgeGraph,
  // A view of the docs, not a component: no autodocs page, no test run.
  tags: ['!autodocs', '!test'],
  parameters: { layout: 'fullscreen', a11y: { test: 'off' } },
} satisfies Meta<typeof KnowledgeGraph>;
export default meta;

export const Embed: StoryObj<typeof meta> = {
  args: { embed: true },
  render: (args) => (
    // Fixed to the frame: the preview decorator pads every story, which would push the graph past the bottom edge.
    <div className="fixed inset-0 bg-neutral-primary p-3">
      <KnowledgeGraph {...args} />
    </div>
  ),
};
