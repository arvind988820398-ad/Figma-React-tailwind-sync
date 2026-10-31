import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';
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
  argTypes: { variant: { control: 'select', options: ['default', 'labeled', 'arrows', 'two-buttons', 'jump', 'select'] } },
  render: (args) => <PaginationDemo {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma "Buttons & helper text": "Showing 21–30 of 100".
export const WithHelperText: Story = { args: { helper: { from: 21, to: 30, total: 100 } } };

export const Arrows: Story = { args: { variant: 'arrows', helper: { from: 21, to: 30, total: 100 } } };

export const TwoButtons: Story = { args: { variant: 'two-buttons' } };

// Figma "Text buttons": numbered pages with text Previous / Next.
export const TextButtons: Story = { args: { variant: 'labeled' } };

// Figma "With dropdown": text buttons plus a rows-per-page select.
export const WithPageSize: Story = {
  args: { variant: 'labeled' },
  render: function Render(args) {
    const [size, setSize] = useState(10);
    return <PaginationDemo {...args} pageSize={{ value: size, options: [10, 25, 50], onChange: setSize }} />;
  },
};

// Figma "With input": text buttons plus a "Go to [n] Page" field.
export const WithJumpField: Story = { args: { variant: 'labeled', jumpTo: true, pageCount: 99 } };

// Figma "Simple with input": only the "Go to page" field and a Go button.
export const SimpleWithInput: Story = { args: { variant: 'jump', pageCount: 20 } };

// Figma "Dropdown & buttons": page select, "of N pages" and arrows.
export const SelectAndArrows: Story = { args: { variant: 'select', pageCount: 99 } };

// Ellipses on both sides; `siblings` controls how many neighbours stay visible.
export const ManyPages: Story = { args: { page: 25, pageCount: 50, siblings: 2 } };

// Previous is disabled on the first page.
export const FirstPage: Story = { args: { page: 1 } };

const pageButtons = (nav: HTMLElement) => [...nav.querySelectorAll('button[aria-label^="Page "]')].map((b) => Number(b.textContent));
const gapCount = (nav: HTMLElement) => nav.querySelectorAll('span[aria-hidden]').length;

// Interaction: clicking a page number selects it and recomputes the window and ellipses.
export const ClickPages: Story = {
  args: { onPageChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const nav = canvas.getByRole('navigation', { name: 'Pagination' });
    // Page 3 of 10, one sibling: 1 2 3 4 … 10.
    await expect(pageButtons(nav)).toEqual([1, 2, 3, 4, 10]);
    await expect(gapCount(nav)).toBe(1);
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(canvas.getByRole('button', { name: 'Page 4' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(4);
    await expect(canvas.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('button', { name: 'Page 3' })).not.toHaveAttribute('aria-current');
    // 1 … 3 4 5 … 10 — ellipses on both sides.
    await expect(pageButtons(nav)).toEqual([1, 3, 4, 5, 10]);
    await expect(gapCount(nav)).toBe(2);

    await userEvent.click(canvas.getByRole('button', { name: 'Page 10' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(10);
    await expect(pageButtons(nav)).toEqual([1, 9, 10]);
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  },
};

// Interaction: Previous / Next step one page and are disabled at the ends.
export const PreviousNext: Story = {
  args: { page: 2, pageCount: 3, onPageChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const prev = canvas.getByRole('button', { name: 'Previous page' });
    const next = canvas.getByRole('button', { name: 'Next page' });
    // Few pages: no ellipsis.
    await expect(gapCount(canvas.getByRole('navigation'))).toBe(0);

    await userEvent.click(prev);
    await expect(args.onPageChange).toHaveBeenLastCalledWith(1);
    await expect(canvas.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    await expect(prev).toBeDisabled();


    await userEvent.click(next);
    await userEvent.click(next);
    await expect(args.onPageChange).toHaveBeenLastCalledWith(3);
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    await expect(next).toBeDisabled();
    await expect(prev).toBeEnabled();
  },
};

// Interaction: arrows variant has no page numbers; helper text follows the page.
export const ArrowsInteraction: Story = {
  args: { variant: 'arrows', page: 1, pageCount: 3, helper: { from: 1, to: 10, total: 30 }, onPageChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.queryByRole('button', { name: /^Page / })).not.toBeInTheDocument();
    await expect(canvas.getByRole('navigation')).toHaveTextContent('Showing 1–10 of 30');
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(canvas.getByRole('navigation')).toHaveTextContent('Showing 11–20 of 30');
  },
};

// Interaction: two-buttons variant — Previous / Next text buttons with disabled ends.
export const TwoButtonsInteraction: Story = {
  args: { variant: 'two-buttons', page: 1, pageCount: 2, onPageChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const prev = canvas.getByRole('button', { name: 'Previous' });
    const next = canvas.getByRole('button', { name: 'Next' });
    await expect(prev).toBeDisabled();

    await userEvent.click(next);
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(next).toBeDisabled();
    await expect(prev).toBeEnabled();

    await userEvent.click(prev);
    await expect(args.onPageChange).toHaveBeenLastCalledWith(1);
    await expect(prev).toBeDisabled();
    await expect(args.onPageChange).toHaveBeenCalledTimes(2);
  },
};

// Interaction: text buttons label Previous / Next and keep the numbered pages.
export const TextButtonsInteraction: Story = {
  args: { variant: 'labeled', page: 2, pageCount: 5, onPageChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(3);
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
  },
};

// Interaction: rows-per-page select and the jump field (Enter), clamped to the page count.
export const PageSizeAndJump: Story = {
  args: { variant: 'labeled', page: 1, pageCount: 12, jumpTo: true, onPageChange: fn() },
  render: function Render(args) {
    const [size, setSize] = useState(10);
    return <PaginationDemo {...args} pageSize={{ value: size, options: [10, 25, 50], onChange: setSize }} />;
  },
  play: async ({ canvas, userEvent, args }) => {
    const rows = canvas.getByRole('combobox', { name: 'Rows per page' });
    await userEvent.selectOptions(rows, '25');
    await expect(rows).toHaveValue('25');
    const field = canvas.getByRole('textbox', { name: 'Go to' });
    await userEvent.type(field, '7{Enter}');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(7);
    await expect(field).toHaveValue('');
    await userEvent.type(field, '40{Enter}');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(12);
  },
};

// Interaction: "Simple with input" — digits only, Go button jumps.
export const JumpInteraction: Story = {
  args: { variant: 'jump', page: 1, pageCount: 20, onPageChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('textbox', { name: 'Go to page' });
    await userEvent.type(field, 'a5');
    await expect(field).toHaveValue('5');
    await userEvent.click(canvas.getByRole('button', { name: 'Go' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(5);
    await userEvent.click(canvas.getByRole('button', { name: 'Go' }));
    await expect(args.onPageChange).toHaveBeenCalledTimes(1);
  },
};

// Interaction: "Dropdown & buttons" — the select and the arrows stay in step.
export const SelectInteraction: Story = {
  args: { variant: 'select', page: 1, pageCount: 3, onPageChange: fn() },
  play: async ({ canvas, userEvent, args }) => {
    const select = canvas.getByRole('combobox', { name: 'Page' });
    await expect(canvas.getByRole('navigation')).toHaveTextContent('of 3 pages');
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.selectOptions(select, '3');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(3);
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Previous page' }));
    await expect(select).toHaveValue('2');
  },
};
