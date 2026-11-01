// Material management app (web), composed from AD Design Kit components after the "Material - powerplay" Figma file.
// Shell: icon rail (Sidebar collapsed) · top bar (Navbar fluid compact: org switcher, approvals bell, account) ·
// module tabs (Tabs underline, the Figma "Nav tabs" row) · the selected module. Routes live in the hash (#/tab/id).
import { useState } from 'react';
import {
  AdDesignKitIcon,
  AngleDownIcon,
  BellIcon,
  ChartPieIcon,
  CloudArrowUpIcon,
  CogIcon,
  GridIcon,
  OpenDoorIcon,
  StoreIcon,
  TagIcon,
  UsersGroupIcon,
} from '../../components/icons';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dropdown, DropdownHeader, DropdownItem, DropdownRadioItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { IconShape } from '../../components/ui/IconShape';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { Tabs } from '../../components/ui/Tabs';
import { Expenses, VendorPayable } from './Finance';
import { Grns } from './Grns';
import { useHashRoute } from './hooks';
import { Indents } from './Indents';
import { MaterialList } from './MaterialList';
import { ME, ORG, useStore } from './model';
import { PurchaseOrders } from './PurchaseOrders';
import { MaterialIssues, SiteTransfers } from './StockMoves';
import { StoreProvider } from './StoreProvider';

const TABS = [
  { value: 'materials', label: 'Material List' },
  { value: 'indent', label: 'Indent' },
  { value: 'po', label: 'Purchase Orders' },
  { value: 'grn', label: 'GRN' },
  { value: 'transfers', label: 'Site Transfers' },
  { value: 'issue', label: 'Material Issue' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'payable', label: 'Material Vendor Payable' },
];

export function MaterialsApp() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { state } = useStore();
  const [tab, extra, go] = useHashRoute('materials');
  const [org, setOrg] = useState(ORG);
  const [indentFor, setIndentFor] = useState<{ projectId: string; materialIds: string[] } | null>(null);
  const [poFrom, setPoFrom] = useState<string | null>(null);
  const [grnFor, setGrnFor] = useState<string | null>(null);

  const approvals = [
    ...state.indents.filter((i) => !i.deleted && i.status === 'Approval Pending').map((i) => ({ id: i.id, label: `Indent ${i.id}`, href: `#/indent/${i.id}` })),
    ...state.pos.filter((p) => p.status === 'Approval Pending').map((p) => ({ id: p.id, label: `Purchase order ${p.id}`, href: `#/po/${p.id}` })),
    ...state.transfers.filter((t) => t.status === 'Approval Pending').map((t) => ({ id: t.id, label: `Site transfer ${t.id}`, href: '#/transfers' })),
  ];
  const active = TABS.some((t) => t.value === tab) ? tab : 'materials';
  const projectId = extra ?? state.projects[0].id;

  return (
    <div className="flex h-dvh bg-neutral-primary">
      <Sidebar
        collapsed
        label="Apps"
        className="shrink-0 border-e border-default"
        header={
          <IconShape size="base" color="brand" shape="circle" aria-label={ORG} role="img">
            <AdDesignKitIcon />
          </IconShape>
        }
        sections={[
          [
            { label: 'Dashboard', href: '#/dashboard', icon: <GridIcon />, disabled: true },
            { label: 'Schedule', href: '#/schedule', icon: <ChartPieIcon />, disabled: true },
            { label: 'Materials', href: '#/materials', icon: <TagIcon />, current: true },
            { label: 'Vendors', href: '#/vendors', icon: <StoreIcon />, disabled: true },
            { label: 'Team', href: '#/team', icon: <UsersGroupIcon />, disabled: true },
            { label: 'Files', href: '#/files', icon: <CloudArrowUpIcon />, disabled: true },
            { label: 'Settings', href: '#/settings', icon: <CogIcon />, disabled: true },
          ],
        ]}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          fluid
          size="compact"
          logo={
            <Dropdown
              label="Organisation"
              trigger={
                <Button color="ghost" size="sm" rightIcon={<AngleDownIcon />}>
                  {org}
                </Button>
              }
            >
              {[ORG, 'Powerline Infra Pvt Ltd'].map((o) => (
                <DropdownRadioItem key={o} checked={org === o} onSelect={() => setOrg(o)}>
                  {o}
                </DropdownRadioItem>
              ))}
            </Dropdown>
          }
          actions={
            <div className="flex items-center gap-2">
              <Dropdown
                align="end"
                label="Waiting for approval"
                className="w-72"
                header={<p className="px-2 py-1.5 text-sm font-semibold text-heading">Waiting for approval</p>}
                trigger={
                  <Button color="ghost" size="sm" iconOnly aria-label={`Notifications, ${approvals.length} waiting for approval`} className="relative">
                    <BellIcon />
                    {approvals.length > 0 && (
                      <Badge color="danger" circle className="absolute -end-1 -top-1">
                        {approvals.length}
                      </Badge>
                    )}
                  </Button>
                }
              >
                {approvals.length === 0 ? (
                  <DropdownItem disabled>Nothing waiting for you</DropdownItem>
                ) : (
                  approvals.map((a) => (
                    <DropdownItem key={a.id} onSelect={() => window.location.assign(a.href)}>
                      {a.label}
                    </DropdownItem>
                  ))
                )}
              </Dropdown>
              <Dropdown
                align="end"
                label="Account"
                className="w-60"
                header={<DropdownHeader name={ME} email="rajan@demo-org.in" avatar={<Avatar name={ME} size="sm" />} />}
                trigger={
                  <Button color="ghost" size="sm" iconOnly aria-label="Account">
                    <Avatar name={ME} size="sm" />
                  </Button>
                }
              >
                <DropdownItem icon={<CogIcon />}>Settings</DropdownItem>
                <DropdownSeparator />
                <DropdownItem icon={<OpenDoorIcon />}>Log out</DropdownItem>
              </Dropdown>
            </div>
          }
        />
        {/* Figma "Nav tabs" row, directly under the fluid Navbar in the same px-4 container */}
        <div className="px-4 pt-3">
          <Tabs variant="underline" label="Material modules" items={TABS} value={active} onValueChange={(v) => go(v)} />
        </div>

        <main aria-label={TABS.find((t) => t.value === active)!.label} className="flex min-h-0 flex-1 flex-col overflow-auto">
          {active === 'materials' && (
            <MaterialList
              projectId={projectId}
              onOpenProject={(id) => go('materials', id)}
              onCreateIndent={(pid, ids) => {
                setIndentFor({ projectId: pid, materialIds: ids });
                go('indent');
              }}
            />
          )}
          {active === 'indent' && (
            <Indents
              openId={extra}
              onOpen={(id) => go('indent', id)}
              onCreatePo={(id) => {
                setPoFrom(id);
                go('po');
              }}
              createFor={indentFor}
              onCreateDone={() => setIndentFor(null)}
            />
          )}
          {active === 'po' && (
            <PurchaseOrders
              openId={extra}
              onOpen={(id) => go('po', id)}
              createFromIndent={poFrom}
              onCreateDone={() => setPoFrom(null)}
              onCreateGrn={(id) => {
                setGrnFor(id);
                go('grn');
              }}
            />
          )}
          {active === 'grn' && <Grns openId={extra} onOpen={(id) => go('grn', id)} createForPo={grnFor} onCreateDone={() => setGrnFor(null)} />}
          {active === 'transfers' && <SiteTransfers />}
          {active === 'issue' && <MaterialIssues />}
          {active === 'expenses' && <Expenses />}
          {active === 'payable' && <VendorPayable />}
        </main>
      </div>
    </div>
  );
}
