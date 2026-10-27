// Docs container that follows the Scheme toolbar: the theme decorator toggles `.dark` on <html>,
// and the Storybook docs chrome switches between its light and dark themes to match.
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { themes } from 'storybook/theming';

const isDark = () => document.documentElement.classList.contains('dark');

export function AuxoDocsContainer(props: PropsWithChildren<DocsContainerProps>) {
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return <DocsContainer {...props} theme={dark ? themes.dark : themes.light} />;
}
