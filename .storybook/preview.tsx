import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import '../src/styles/app.css';
import { setTheme, themes, type ADDesignKitTheme } from '../src/lib/theme';
import { ADDesignKitDocsContainer } from './ad-design-kit/DocsContainer';
import { ADDesignKitDocsPage } from './ad-design-kit/DocsPage';

// Theme + dark mode come from the AD Design Kit tokens (Figma "Themes" collection modes).
// The toolbar switches data-theme / .dark on <html>, exactly like the app does.
function ThemeFrame({ theme, dark, children }: { theme: ADDesignKitTheme; dark: boolean; children: ReactNode }) {
  useEffect(() => {
    setTheme(theme, dark);
  }, [theme, dark]);
  return <div className="bg-neutral-primary p-6 text-body">{children}</div>;
}

const withADDesignKitTheme: Decorator = (Story, context) => (
  <ThemeFrame theme={context.globals.theme as ADDesignKitTheme} dark={context.globals.scheme === 'dark'}>
    <Story />
  </ThemeFrame>
);

const preview: Preview = {
  decorators: [withADDesignKitTheme],
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'AD Design Kit theme',
      toolbar: { title: 'Theme', icon: 'paintbrush', items: [...themes], dynamicTitle: true },
    },
    scheme: {
      description: 'Light or dark mode',
      toolbar: {
        title: 'Scheme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'modern', scheme: 'light' },
  parameters: {
    layout: 'centered',
    options: {
      storySort: {
        order: ['Introduction', 'Foundations', ['Colors', 'Typography', 'Radius & shadows', 'Themes'], 'Guides', ['Choosing a component', 'Figma sync'], 'Components'],
      },
    },
    docs: {
      page: ADDesignKitDocsPage,
      container: ADDesignKitDocsContainer,
      toc: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
