import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { InfoIcon, PlusIcon } from '../icons';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table';

// AD Design Kit Table — mirrors the Figma "Table (free-component)" set (node 1149:87477).
const rows = [
  { name: 'Apple MacBook Pro', category: 'Laptop', price: '$2,999', status: 'success' as const, label: 'In stock' },
  { name: 'Microsoft Surface Pro', category: 'Laptop PC', price: '$1,999', status: 'warning' as const, label: 'Low stock' },
  { name: 'Magic Mouse 2', category: 'Accessories', price: '$99', status: 'danger' as const, label: 'Sold out' },
  { name: 'Apple Watch', category: 'Watches', price: '$199', status: 'success' as const, label: 'In stock' },
];

const content = (
  <>
    <TableHead>
      <TableRow>
        <TableHeaderCell>Product</TableHeaderCell>
        <TableHeaderCell>Category</TableHeaderCell>
        <TableHeaderCell>Price</TableHeaderCell>
        <TableHeaderCell>Status</TableHeaderCell>
        <TableHeaderCell>
          <span className="sr-only">Actions</span>
        </TableHeaderCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={r.name}>
          <TableCell className="font-semibold">{r.name}</TableCell>
          <TableCell className="text-body">{r.category}</TableCell>
          <TableCell>{r.price}</TableCell>
          <TableCell>
            <Badge color={r.status} size="sm">
              {r.label}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-2">
              <Button size="xs" color="tertiary">
                Edit
              </Button>
              <Button size="xs" color="danger">
                Delete
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </>
);

const toolbar = (
  <>
    <Input size="sm" className="w-64" aria-label="Search products" placeholder="Search products" leftIcon={<InfoIcon />} />
    <div className="flex gap-3">
      <Button size="sm" color="secondary">
        Filters
      </Button>
      <Button size="sm" leftIcon={<PlusIcon />}>
        Add product
      </Button>
    </div>
  </>
);

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: { design: figmaDesign('Table'), layout: 'padded' },
  args: { children: content },
  argTypes: {
    striped: { control: 'select', options: ['rows', 'columns'] },
    caption: { control: false },
    toolbar: { control: false },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const StripedRows: Story = { args: { striped: 'rows' } };
export const StripedColumns: Story = { args: { striped: 'columns' } };

export const WithCaption: Story = {
  args: { caption: { title: 'Our products', description: 'Browse the products in stock and their current prices.' } },
};

export const WithToolbar: Story = { args: { toolbar } };

export const Full: Story = {
  args: {
    striped: 'rows',
    toolbar,
    caption: { title: 'Our products', description: 'Browse the products in stock and their current prices.' },
  },
};

/** Header stays visible while the rows scroll inside a bounded wrapper (`stickyHeader` + `containerClassName`). */
export const StickyHeader: Story = {
  args: { stickyHeader: true, containerClassName: 'max-h-80' },
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
