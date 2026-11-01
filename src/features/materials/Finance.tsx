// Reference "Expenses" and "Material Vendor Payable": site expenses recorded by hand, and what each vendor is owed,
// worked out from the purchase orders (PO value, advance paid, value received through GRNs).
import { useState } from 'react';
import { PlusIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { Datepicker } from '../../components/ui/Datepicker';
import { HelperText, Input, Label } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { usePaged } from './hooks';
import { deliveredValue, fmtDate, inr, poTotals, useStore } from './model';
import { EmptyState, TableFooter } from './shared';

const EXPENSE_CATEGORIES = ['Equipment', 'Transport', 'Labour', 'Site office', 'Other'];

export function Expenses() {
  const { state, project } = useStore();
  const [adding, setAdding] = useState(false);
  const { visible, footer } = usePaged(state.expenses);
  const total = state.expenses.reduce((s, e) => s + e.amount, 0);
  const add = (
    <Button size="sm" leftIcon={<PlusIcon />} onClick={() => setAdding(true)}>
      Add Expense
    </Button>
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      {state.expenses.length === 0 ? (
        <EmptyState title="Record your site expenses.">{add}</EmptyState>
      ) : (
        <Table
          aria-label="Expenses"
          stickyHeader
          containerClassName="min-h-0 flex-1"
          toolbar={
            <>
              <span className="text-sm text-body">
                Total spent: <b className="text-heading">{inr(total)}</b>
              </span>
              {add}
            </>
          }
          footer={<TableFooter {...footer} />}
        >
          <TableHead>
            <TableRow className="whitespace-nowrap">
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Expense</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Paid to</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap">{e.id}</TableCell>
                <TableCell>{e.title}</TableCell>
                <TableCell className="whitespace-nowrap">{project(e.projectId).name}</TableCell>
                <TableCell>{e.category}</TableCell>
                <TableCell className="whitespace-nowrap">{e.paidTo}</TableCell>
                <TableCell className="whitespace-nowrap">{fmtDate(e.date)}</TableCell>
                <TableCell className="whitespace-nowrap">{inr(e.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <AddExpense open={adding} onOpenChange={setAdding} />
    </div>
  );
}

function AddExpense({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, dispatch, notify } = useStore();
  const blank = { title: '', projectId: state.projects[0].id, category: EXPENSE_CATEGORIES[0], paidTo: '', amount: '' };
  const [f, setF] = useState(blank);
  const [today] = useState(() => new Date());
  const [date, setDate] = useState<Date | null>(today);
  const [tried, setTried] = useState(false);
  const errors = { title: !f.title.trim(), amount: !(Number(f.amount) > 0) };
  const close = () => {
    setF(blank);
    setTried(false);
    onOpenChange(false);
  };
  return (
    <Modal
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(true) : close())}
      title="Add Expense"
      footer={
        <>
          <Button color="tertiary" onClick={close}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTried(true);
              if (errors.title || errors.amount || !date) return;
              dispatch({ type: 'addExpense', expense: { title: f.title.trim(), projectId: f.projectId, category: f.category, paidTo: f.paidTo.trim() || '-', amount: Number(f.amount), date } });
              notify('Expense added');
              close();
            }}
          >
            Add Expense
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="exp-title" required>
            Expense
          </Label>
          <Input id="exp-title" placeholder="e.g. Crane hire · 2 days" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} status={tried && errors.title ? 'danger' : undefined} />
          {tried && errors.title && <HelperText status="danger">Describe the expense.</HelperText>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="exp-project">Project</Label>
            <Select id="exp-project" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })}>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="exp-category">Category</Label>
            <Select id="exp-category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="exp-paid">Paid to</Label>
            <Input id="exp-paid" placeholder="Enter" value={f.paidTo} onChange={(e) => setF({ ...f, paidTo: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="exp-amount" required>
              Amount
            </Label>
            <Input id="exp-amount" inputMode="decimal" placeholder="Enter" addonText="₹" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^\d.]/g, '') })} status={tried && errors.amount ? 'danger' : undefined} />
            {tried && errors.amount && <HelperText status="danger">Enter the amount.</HelperText>}
          </div>
        </div>
        <div>
          <Label htmlFor="exp-date">Date</Label>
          <Datepicker id="exp-date" value={date} onChange={setDate} max={today} />
        </div>
      </div>
    </Modal>
  );
}

export function VendorPayable() {
  const { state } = useStore();
  const rows = state.vendors
    .map((vendor) => {
      const pos = state.pos.filter((p) => p.vendor === vendor && p.status !== 'Rejected' && p.status !== 'Approval Pending');
      const poValue = pos.reduce((s, p) => s + poTotals(p).total, 0);
      const advance = pos.reduce((s, p) => s + p.advance, 0);
      // GST applies to what was received, the same way it applies to the PO.
      const received = pos.reduce((s, p) => s + deliveredValue(state, p.id) * (1 + p.gstRate / 100), 0);
      return { vendor, count: pos.length, poValue, advance, received, payable: Math.max(0, Math.round(received - advance)) };
    })
    .filter((r) => r.count > 0);
  const totalPayable = rows.reduce((s, r) => s + r.payable, 0);
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      {rows.length === 0 ? (
        <EmptyState title="Vendor dues appear here once purchase orders are approved.">{null}</EmptyState>
      ) : (
        <Table
          aria-label="Material vendor payable"
          stickyHeader
          containerClassName="min-h-0 flex-1"
          toolbar={
            <span className="text-sm text-body">
              Total payable: <b className="text-heading">{inr(totalPayable)}</b> · amounts include GST on what was received
            </span>
          }
        >
          <TableHead>
            <TableRow className="whitespace-nowrap">
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Purchase orders</TableHeaderCell>
              <TableHeaderCell>PO value</TableHeaderCell>
              <TableHeaderCell>Received value</TableHeaderCell>
              <TableHeaderCell>Advance paid</TableHeaderCell>
              <TableHeaderCell>Payable</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.vendor}>
                <TableCell className="whitespace-nowrap">{r.vendor}</TableCell>
                <TableCell>{r.count}</TableCell>
                <TableCell className="whitespace-nowrap">{inr(r.poValue)}</TableCell>
                <TableCell className="whitespace-nowrap">{inr(r.received)}</TableCell>
                <TableCell className="whitespace-nowrap">{inr(r.advance)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <b className="text-heading">{inr(r.payable)}</b>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
