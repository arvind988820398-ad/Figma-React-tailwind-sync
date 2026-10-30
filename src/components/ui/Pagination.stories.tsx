import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { Pagination, type PaginationProps } from './Pagination';

// AD Design Kit Pagination — mirrors the Figma "Pagination" set (node 1149:81850).
function PaginationDemo({ page: initial, onPageChange, helper, ...args }: PaginationProps) {
  const [page, setPage] = useState(initial);
  const pageSize = 10;
  return (
    <Pagination
      {...args}
      page={page}
      onPageChange={(p) => {
        setPage(p);
        onPageChange(p);
      }}
      helper={helper ? { from: (page - 1) * pageSize + 1, to: page * pageSize, total: args.pageCount * pageSize } : undefined}
    />
  );
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: { design: figmaDesign('Pagination'), layout: 'padded' },
  args: { page: 3, pageCount: 10, onPageChange: () => {}, variant: 'default', siblings: 1 },
  argTypes: { variant: { control: 'select', options: ['default', 'arrows', 'two-buttons'] } },
  render: (args) => <PaginationDemo {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma "Buttons & helper text": "Showing 21–30 of 100".
export const WithHelperText: Story = { args: { helper: { from: 21, to: 30, total: 100 } } };

export const Arrows: Story = { args: { variant: 'arrows', helper: { from: 21, to: 30, total: 100 } } };

export const TwoButtons: Story = { args: { variant: 'two-buttons' } };

// Ellipses on both sides; `siblings` controls how many neighbours stay visible.
export const ManyPages: Story = { args: { page: 25, pageCount: 50, siblings: 2 } };

// Previous is disabled on the first page.
export const FirstPage: Story = { args: { page: 1 } };
