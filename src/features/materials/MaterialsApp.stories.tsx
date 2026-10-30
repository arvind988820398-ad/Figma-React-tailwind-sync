import type { Meta, StoryObj } from '@storybook/react-vite';
import { MaterialsApp } from './MaterialsApp';
import { SAMPLE_MATERIALS } from './types';

// Full application example built from AD Design Kit components (Figma "Material - powerplay", section 3073:26924).
// The shell is pinned to the Modern theme, so the Theme toolbar does not change it; the Scheme toolbar still does.
const meta = {
  title: 'Examples/Materials app',
  component: MaterialsApp,
  parameters: { layout: 'fullscreen' },
  args: { storageKey: null },
} satisfies Meta<typeof MaterialsApp>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty state: no materials yet (design frame 27:9879). */
export const EmptyState: Story = {};

/** Material list with sample data (design frame 27:9916). */
export const WithMaterials: Story = { args: { seed: SAMPLE_MATERIALS } };

/** The org-wide directory scope. */
export const MaterialDirectory: Story = { args: { seed: SAMPLE_MATERIALS, initialScope: 'directory' } };

/** The Indent module: material requests from site supervisors with approve / reject. */
export const Indents: Story = { args: { seed: SAMPLE_MATERIALS, initialModule: 'Indent' } };
