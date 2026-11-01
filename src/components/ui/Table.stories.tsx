import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { AngleDownIcon, CalendarMonthIcon, ChevronSortIcon, FilterIcon, PlusIcon, QuestionCircleIcon, SearchIcon, TrashBinIcon } from '../icons';
import { Badge } from './Badge';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { Pagination } from './Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table';

// AD Design Kit Table — one story per Figma "Table (free-component)" Type (node 1149:87477), with the Figma
// transactions content: toolbar (Table header), checkbox column, sortable Due date / Amount, status Badges,
// row actions and the Table Footer (summary + Pagination).
const transactions = [
  { kind: 'Payment from', who: 'Bonnie Green', date: '15 Mar 2025', amount: '$199', status: 'completed' },
  { kind: 'Payment refund to', who: '#00910', date: '17 Mar 2025', amount: '-$1,768', status: 'progress' },
  { kind: 'Payment failed from', who: '#087651', date: '10 Apr 2025', amount: '$199', status: 'failed' }, // ad-design-kit-lint-ignore: an invoice id, not a color
  { kind: 'Payment from', who: 'Jese Leos', date: '5 May 2025', amount: '$399', status: 'completed' },
  { kind: 'Payment from', who: 'Lana Byrd', date: '30 Jan 2025', amount: '$399', status: 'completed' },
  { kind: 'Payment from', who: 'Jese Leos', date: '12 Jun 2025', amount: '$6,554', status: 'failed' },
  { kind: 'Wire transfer for', who: 'Bergside LLC', date: '18 Jul 2025', amount: '$9,867', status: 'completed' },
  { kind: 'Payment refund to', who: '#06978', date: '25 Aug 2025', amount: '-$3,276', status: 'completed' },
  { kind: 'Payment to', who: 'Karen Nelson', date: '1 Sep 2025', amount: '-$4,756', status: 'completed' },
  { kind: 'Payment to', who: 'Alphabet LLC', date: '20 Sep 2025', amount: '-$806', status: 'completed' },
] as const;

const statuses = {
  completed: { color: 'success', label: 'Completed' },
  progress: { color: 'warning', label: 'In progress' },
  failed: { color: 'danger', label: 'Failed' },
} as const;

function SortLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children} <ChevronSortIcon className="size-4" aria-hidden />
    </span>
  );
}

const content = (
  <>
    <TableHead>
      <TableRow>
        <TableHeaderCell className="w-14">
          <Checkbox aria-label="Select all transactions" />
        </TableHeaderCell>
        <TableHeaderCell>Transaction</TableHeaderCell>
        <TableHeaderCell aria-sort="none">
          <SortLabel>Due date</SortLabel>
        </TableHeaderCell>
        <TableHeaderCell aria-sort="none">
          <SortLabel>Amount</SortLabel>
        </TableHeaderCell>
        <TableHeaderCell>Status</TableHeaderCell>
        <TableHeaderCell>
          <span className="inline-flex items-center gap-1.5">
            Actions <QuestionCircleIcon className="size-4" aria-hidden />
          </span>
        </TableHeaderCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {transactions.map((t, i) => (
        <TableRow key={i}>
          <TableCell>
            <Checkbox aria-label={`Select ${t.kind.toLowerCase()} ${t.who}`} />
          </TableCell>
          <TableCell className="whitespace-nowrap">
            <span className="font-normal text-body">{t.kind}</span> {t.who}
          </TableCell>
          <TableCell className="whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <CalendarMonthIcon className="size-4 text-body" aria-hidden /> {t.date}
            </span>
          </TableCell>
          <TableCell>{t.amount}</TableCell>
          <TableCell>
            <Badge color={statuses[t.status].color} size="sm">
              {statuses[t.status].label}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button size="xs" color="tertiary" rightIcon={<AngleDownIcon />}>
                Actions
              </Button>
              <Button size="xs" color="danger" leftIcon={<TrashBinIcon />}>
                Delete
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </>
);

// Figma "Table header" Type=Default: search Input sm, Secondary sm "Filters" and "Actions", Brand sm "Add transaction".
const toolbar = (
  <>
    <Input size="sm" className="w-64" aria-label="Search for transaction" placeholder="Search for transaction" leftIcon={<SearchIcon />} />
    <div className="flex gap-3">
      <Button size="sm" color="secondary" leftIcon={<FilterIcon />} rightIcon={<AngleDownIcon />}>
        Filters
      </Button>
      <Button size="sm" color="secondary" rightIcon={<AngleDownIcon />}>
        Actions
      </Button>
      <Button size="sm" leftIcon={<PlusIcon />}>
        Add transaction
      </Button>
    </div>
  </>
);

// Figma "Table Footer" Type=Pagination: summary text and the default Pagination with page 3 current.
function Footer() {
  const [page, setPage] = useState(3);
  return (
    <>
      <span>Showing 1-10 of 1000</span>
      <Pagination aria-label="Transactions pages" page={page} pageCount={10} siblings={10} onPageChange={setPage} />
    </>
  );
}

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: { design: figmaDesign('Table'), layout: 'padded' },
  args: { children: content },
  argTypes: {
    striped: { control: 'select', options: ['rows', 'columns'] },
    caption: { control: false },
    toolbar: { control: false },
    footer: { control: false },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Plain table: row dividers only, no toolbar or footer. */
export const Default: Story = { args: { 'aria-label': 'Transactions' } };

// Figma "Striped columns": even columns tinted, with the toolbar and the footer.
export const StripedColumns: Story = {
  args: { striped: 'columns', 'aria-label': 'Transactions', toolbar, footer: <Footer /> },
};

// Figma "Striped rows": even rows tinted, with the toolbar and the footer.
export const StripedRows: Story = {
  args: { striped: 'rows', 'aria-label': 'Transactions', toolbar, footer: <Footer /> },
};

// Figma "With table caption": title, description and a Brand sm "Add transaction" above striped rows.
export const WithTableCaption: Story = {
  args: {
    striped: 'rows',
    caption: {
      title: 'AD Design Kit transactions',
      description: 'Manage all your existing transactions or add a new one',
      actions: (
        <Button size="sm" leftIcon={<PlusIcon />}>
          Add transaction
        </Button>
      ),
    },
    footer: <Footer />,
  },
  play: async ({ canvas, userEvent }) => {
    const table = canvas.getByRole('table', { name: /AD Design Kit transactions/ });
    await expect(within(table).getAllByRole('row')).toHaveLength(transactions.length + 1);
    await expect(canvas.getByText('Showing 1-10 of 1000')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /page 4/i }));
    await expect(canvas.getByRole('button', { name: /page 4/i })).toHaveAttribute('aria-current', 'page');
  },
};

/** Header stays visible while the rows scroll inside a bounded wrapper (`stickyHeader` + `containerClassName`). */
export const StickyHeader: Story = {
  args: { stickyHeader: true, containerClassName: 'max-h-80', 'aria-label': 'Products' },
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 30 }, (_, i) => (
          <TableRow key={i}>
            <TableCell>Product {i + 1}</TableCell>
            <TableCell>{['Laptop', 'Phone', 'Audio', 'Accessory'][i % 4]}</TableCell>
            <TableCell>${(199 + i * 37).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
