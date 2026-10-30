// Application chrome from the "Material - powerplay" design, composed from AD Design Kit only: the app rail is a collapsed
// Sidebar, the org bar is a Navbar, the module switcher under it is the "Nav tabs" set (Tabs, underline) placed in the
// Navbar's documented container, and the projects panel is a Sidebar with `current`. No component sits in a custom band.
import { useState, type MouseEvent, type ReactNode } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dropdown, DropdownCheckboxItem, DropdownHeader, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { Input } from '../../components/ui/Input';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { Tabs } from '../../components/ui/Tabs';
import { Tooltip } from '../../components/ui/Tooltip';
import { loadTheme, setTheme } from '../../lib/theme';
import { BellIcon, ChevronDownIcon, CloudIcon, DashboardIcon, FeedbackIcon, KebabIcon, SearchIcon, SettingsIcon, StoreIcon, TagIcon, TuneIcon, UserCircleIcon } from './icons';
import { MODULES, type Module, type Scope } from './types';

const RAIL = [
  { label: 'Dashboard', href: '#app/dashboard', icon: <DashboardIcon /> },
  { label: 'Planning', href: '#app/planning', icon: <TuneIcon /> },
  { label: 'Issues', href: '#app/issues', icon: <FeedbackIcon /> },
  { label: 'Materials', href: '#app/materials', icon: <TagIcon />, current: true },
  { label: 'Vendors', href: '#app/vendors', icon: <StoreIcon /> },
  { label: 'Documents', href: '#app/documents', icon: <CloudIcon /> },
  { label: 'Settings', href: '#app/settings', icon: <SettingsIcon /> },
];

function Rail() {
  return (
    <Sidebar
      collapsed
      label="Apps"
      className="shrink-0 border-e border-default"
      header={
        <a href="/" className="flex size-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white" aria-label="AD Design Kit starter">
          A
        </a>
      }
      sections={[RAIL]}
    />
  );
}

// The app is pinned to the Modern theme (data-theme on the shell root); the account menu only switches light/dark.
function ThemeMenu() {
  const [{ theme, dark }, setPrefs] = useState(() => loadTheme());
  const apply = (nextDark: boolean) => {
    setTheme(theme, nextDark);
    setPrefs({ theme, dark: nextDark });
  };
  return (
    <Dropdown
      align="end"
      label="Account"
      trigger={
        <Button color="ghost" size="sm" iconOnly aria-label="Account">
          <UserCircleIcon />
        </Button>
      }
    >
      <DropdownHeader name="Saurabh" email="saurabh@demo-org.com" />
      <DropdownSeparator />
      <DropdownCheckboxItem checked={dark} onCheckedChange={apply}>
        Dark mode
      </DropdownCheckboxItem>
      <DropdownSeparator />
      <DropdownItem onSelect={() => window.location.assign('/')}>Back to AD Design Kit starter</DropdownItem>
    </Dropdown>
  );
}

function TopBar({ org }: { org: string }) {
  return (
    <Navbar
      size="compact"
      fluid
      className="shrink-0"
      logo={
        <Dropdown
          label="Organisation"
          trigger={
            <Button color="ghost" size="sm" className="-ms-2" rightIcon={<ChevronDownIcon />}>
              {org}
            </Button>
          }
        >
          <DropdownItem>{org}</DropdownItem>
          <DropdownItem>Powerplay Infra Pvt. Ltd.</DropdownItem>
          <DropdownSeparator />
          <DropdownItem>Create organisation</DropdownItem>
        </Dropdown>
      }
      actions={
        <>
          <Tooltip content="Notifications">
            <Button color="ghost" size="sm" iconOnly aria-label="Notifications">
              <BellIcon />
            </Button>
          </Tooltip>
          <ThemeMenu />
        </>
      }
    />
  );
}

export interface AppShellProps {
  org?: string;
  projectName?: string;
  module: Module;
  onModuleChange: (m: Module) => void;
  /** Shown as a counter on the Indent tab. */
  pendingIndents?: number;
  scope: Scope;
  onScopeChange: (s: Scope) => void;
  projectQuery: string;
  onProjectQueryChange: (q: string) => void;
  onLoadSamples: () => void;
  onClearAll: () => void;
  children: ReactNode;
}

export function AppShell({ org = 'Saurabh’s Demo Org', projectName = 'Project Name', module, onModuleChange, pendingIndents = 0, scope, onScopeChange, projectQuery, onProjectQueryChange, onLoadSamples, onClearAll, children }: AppShellProps) {
  const showProject = !projectQuery || projectName.toLowerCase().includes(projectQuery.toLowerCase());

  // Sidebar items are links; in-app "#…" links switch state here instead of navigating.
  const onHashLink = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href === '#scope/directory') onScopeChange('directory');
    if (href === '#scope/project') onScopeChange('project');
  };

  return (
    <div data-theme="modern" className="flex h-dvh min-h-0 bg-neutral-primary text-body" onClickCapture={onHashLink}>
      <Rail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar org={org} />
        {/* Nav tabs below the Navbar, full width and aligned with it through the same fluid container (px-4). */}
        <div className="shrink-0 bg-neutral-primary-soft">
          <div className="px-4 pt-4">
            <Tabs
              items={MODULES.map((m) => ({
                value: m,
                label:
                  m === 'Indent' && pendingIndents > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      {m}
                      <Badge color="warning" circle aria-label={`${pendingIndents} pending`}>
                        {pendingIndents}
                      </Badge>
                    </span>
                  ) : (
                    m
                  ),
              }))}
              value={module}
              onValueChange={(v) => onModuleChange(v as Module)}
              variant="underline"
              label="Material modules"
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <Sidebar
            label="Projects"
            className="shrink-0 overflow-y-auto border-e border-default"
            header={
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-heading">Projects</h2>
                  <Dropdown
                    align="end"
                    label="Project options"
                    trigger={
                      <Button color="ghost" size="xs" iconOnly aria-label="Project options">
                        <KebabIcon />
                      </Button>
                    }
                  >
                    <DropdownItem onSelect={onLoadSamples}>Load sample materials</DropdownItem>
                    <DropdownItem onSelect={onClearAll}>Clear all materials</DropdownItem>
                  </Dropdown>
                </div>
                <Input size="sm" placeholder="Search" aria-label="Search projects" value={projectQuery} onChange={(e) => onProjectQueryChange(e.target.value)} rightIcon={<SearchIcon />} />
              </div>
            }
            sections={[
              [
                { label: 'Material Directory', href: '#scope/directory', icon: <StoreIcon />, current: scope === 'directory' },
                ...(showProject ? [{ label: projectName, href: '#scope/project', icon: <TagIcon />, current: scope === 'project' }] : []),
              ],
            ]}
          />
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
