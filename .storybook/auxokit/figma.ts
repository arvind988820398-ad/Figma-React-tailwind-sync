// Per-story Figma links for @storybook/addon-designs, resolved from the generated registry data.
import type { Config } from '@storybook/addon-designs';
import { auxokitDocs } from '../generated/auxokit-docs';

/** `parameters.design` for a component's stories: its Figma component set, plus the page it lives on. */
export function figmaDesign(component: string): Config[] | undefined {
  const entry = auxokitDocs.components[component];
  if (!entry?.figmaUrl) return undefined;
  const design: Config[] = [{ type: 'figma', name: `Figma · ${entry.figmaName}`, url: entry.figmaUrl, embedHost: 'auxokit-storybook' }];
  if (entry.pageUrl) design.push({ type: 'link', name: 'Figma page', url: entry.pageUrl, label: `Open the “${entry.figmaName}” page in Figma`, target: '_blank' });
  return design;
}

/** Storybook docs id for a component, e.g. Button → components-button--docs. */
export function docsId(component: string): string {
  const title = auxokitDocs.components[component]?.storyTitle ?? `Components/${component}`;
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}--docs`;
}

export const categoryLabels: Record<string, string> = {
  actions: 'Actions',
  forms: 'Forms',
  feedback: 'Feedback',
  overlays: 'Overlays',
  navigation: 'Navigation',
  'data-display': 'Data display',
  marketing: 'Marketing',
};
