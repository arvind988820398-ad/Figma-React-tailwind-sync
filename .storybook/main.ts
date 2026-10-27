import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['./docs/**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-designs', '@storybook/addon-mcp'],
  framework: '@storybook/react-vite',
  typescript: {
    // Props tables from the TypeScript types; HTML attributes inherited from React's types are filtered out.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // The root tsconfig.json is a solution file with no files of its own; point docgen at the app config.
      tsconfigPath: './tsconfig.app.json',
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};
export default config;
