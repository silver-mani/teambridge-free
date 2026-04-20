import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table }       from './Table';
import { TableHeader } from './TableHeader';
import { TableBody }   from './TableBody';
import { TableRow }    from './TableRow';
import { TableHead }   from './TableHead';
import { TableCell }   from './TableCell';
import {
  CellText,
  CellStack,
  CellTag,
  CellStatusTag,
  CellActions,
  CellControl,
} from './CellContent';
import { Button }      from '../Button/Button';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import type { DropdownMenuGroup } from '../DropdownMenu/DropdownMenu';
import type { TableSortDirection } from './TableHead';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Table>;

// ─────────────────────────────────────────────────────────────────────────────
// Payroll table — matches the Figma reference exactly
// ─────────────────────────────────────────────────────────────────────────────

const PAY_PERIODS = [
  { period: 'Feb 16–29, 2026', workers: 124, pending: 3  },
  { period: 'Feb 1–15, 2026',  workers: 118, pending: 5  },
  { period: 'Jan 16–31, 2026', workers: 131, pending: 0  },
  { period: 'Jan 1–15, 2026',  workers: 129, pending: 0  },
  { period: 'Dec 16–31, 2025', workers: 122, pending: 0  },
];

export const PayPeriod: Story = {
  render: () => {
    const [sort, setSort] = useState<TableSortDirection>('none');

    const cycleSort = () => {
      setSort(prev =>
        prev === 'none' ? 'desc' :
        prev === 'desc' ? 'asc'  : 'none'
      );
    };

    const sorted = [...PAY_PERIODS].sort((a, b) =>
      sort === 'asc'  ? a.period.localeCompare(b.period) :
      sort === 'desc' ? b.period.localeCompare(a.period) : 0
    );

    return (
      <Table style={{ maxWidth: 480 }}>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead sort={sort} onSort={cycleSort}>Pay Period</TableHead>
            <TableHead sort="none" onSort={() => {}}>Workers</TableHead>
            <TableHead sort="none" onSort={() => {}}>Pending Approval</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(row => (
            <TableRow key={row.period}>
              <TableCell><CellText>{row.period}</CellText></TableCell>
              <TableCell><CellText>{row.workers}</CellText></TableCell>
              <TableCell><CellText>{row.pending}</CellText></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Cell variants showcase
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_GROUPS: DropdownMenuGroup[] = [
  {
    id: 'primary',
    options: [
      { id: 'edit',      label: 'Edit',      onClick: () => {} },
      { id: 'duplicate', label: 'Duplicate', onClick: () => {} },
    ],
  },
  {
    id: 'danger',
    options: [
      { id: 'delete', label: 'Delete', onClick: () => {}, destructive: true },
    ],
  },
];

export const CellVariants: Story = {
  name: 'Cell Variants',
  render: () => (
    <Table>
      <TableHeader>
        <TableRow hoverable={false}>
          <TableHead>Cell type</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>

        {/* CellText — primary */}
        <TableRow>
          <TableCell><CellText variant="muted">CellText · primary</CellText></TableCell>
          <TableCell><CellText>Jane Smith</CellText></TableCell>
          <TableCell><CellText variant="secondary">Default body text</CellText></TableCell>
        </TableRow>

        {/* CellText — secondary */}
        <TableRow>
          <TableCell><CellText variant="muted">CellText · secondary</CellText></TableCell>
          <TableCell><CellText variant="secondary">jane@company.com</CellText></TableCell>
          <TableCell><CellText variant="secondary">Supporting / meta text</CellText></TableCell>
        </TableRow>

        {/* CellText — mono */}
        <TableRow>
          <TableCell><CellText variant="muted">CellText · mono</CellText></TableCell>
          <TableCell><CellText variant="mono">TXN-00042819</CellText></TableCell>
          <TableCell><CellText variant="secondary">IDs, codes, amounts</CellText></TableCell>
        </TableRow>

        {/* CellStack */}
        <TableRow>
          <TableCell><CellText variant="muted">CellStack</CellText></TableCell>
          <TableCell>
            <CellStack primary="Jane Smith" secondary="jane@company.com" />
          </TableCell>
          <TableCell><CellText variant="secondary">Name + subtitle</CellText></TableCell>
        </TableRow>

        {/* CellTag */}
        <TableRow>
          <TableCell><CellText variant="muted">CellTag</CellText></TableCell>
          <TableCell>
            <CellTag color="blue" variant="subtle">Engineering</CellTag>
          </TableCell>
          <TableCell><CellText variant="secondary">Category labels</CellText></TableCell>
        </TableRow>

        {/* CellStatusTag */}
        <TableRow>
          <TableCell><CellText variant="muted">CellStatusTag</CellText></TableCell>
          <TableCell>
            <CellStatusTag status="success">Paid</CellStatusTag>
          </TableCell>
          <TableCell><CellText variant="secondary">success / warning / error / pending</CellText></TableCell>
        </TableRow>

        {/* CellStatusTag variants */}
        <TableRow>
          <TableCell><CellText variant="muted">CellStatusTag (all)</CellText></TableCell>
          <TableCell>
            <CellActions>
              <CellStatusTag status="success">Paid</CellStatusTag>
              <CellStatusTag status="warning">Pending</CellStatusTag>
              <CellStatusTag status="error">Failed</CellStatusTag>
              <CellStatusTag status="info">Processing</CellStatusTag>
            </CellActions>
          </TableCell>
          <TableCell><CellText variant="secondary">All status variants</CellText></TableCell>
        </TableRow>

        {/* CellActions — buttons */}
        <TableRow>
          <TableCell><CellText variant="muted">CellActions · buttons</CellText></TableCell>
          <TableCell>
            <CellActions>
              <Button size="sm" variant="secondary">Edit</Button>
              <Button size="sm" variant="ghost">View</Button>
            </CellActions>
          </TableCell>
          <TableCell><CellText variant="secondary">Inline action row</CellText></TableCell>
        </TableRow>

        {/* CellActions — dropdown */}
        <TableRow>
          <TableCell><CellText variant="muted">CellActions · dropdown</CellText></TableCell>
          <TableCell>
            <CellActions>
              <DropdownMenu
                trigger={<Button size="sm" variant="secondary">Actions</Button>}
                groups={ACTION_GROUPS}
              />
            </CellActions>
          </TableCell>
          <TableCell><CellText variant="secondary">DropdownMenu inside cell</CellText></TableCell>
        </TableRow>

        {/* CellControl — checkbox */}
        <TableRow>
          <TableCell><CellText variant="muted">CellControl · checkbox</CellText></TableCell>
          <TableCell compact align="center">
            <CellControl>
              <input type="checkbox" aria-label="Select row" />
            </CellControl>
          </TableCell>
          <TableCell><CellText variant="secondary">Compact + centered control</CellText></TableCell>
        </TableRow>

        {/* Custom render */}
        <TableRow>
          <TableCell><CellText variant="muted">Custom render</CellText></TableCell>
          <TableCell>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--color-bg-tertiary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-xs)', fontFamily: 'var(--font-sans)',
                color: 'var(--color-content-secondary)',
                flexShrink: 0,
              }}>
                JS
              </span>
              <CellStack primary="Jane Smith" secondary="Design Lead" />
            </div>
          </TableCell>
          <TableCell><CellText variant="secondary">Any ReactNode as children</CellText></TableCell>
        </TableRow>

      </TableBody>
    </Table>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Small size
// ─────────────────────────────────────────────────────────────────────────────

export const SmallSize: Story = {
  name: 'Size · sm',
  render: () => (
    <Table size="sm" style={{ maxWidth: 480 }}>
      <TableHeader>
        <TableRow hoverable={false}>
          <TableHead sort="none" onSort={() => {}}>Pay Period</TableHead>
          <TableHead sort="none" onSort={() => {}}>Workers</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {PAY_PERIODS.map(row => (
          <TableRow key={row.period}>
            <TableCell><CellText>{row.period}</CellText></TableCell>
            <TableCell><CellText>{row.workers}</CellText></TableCell>
            <TableCell>
              <CellStatusTag status={row.pending > 0 ? 'warning' : 'success'}>
                {row.pending > 0 ? `${row.pending} pending` : 'All approved'}
              </CellStatusTag>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Row selection
// ─────────────────────────────────────────────────────────────────────────────

export const RowSelection: Story = {
  name: 'Row Selection',
  render: () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggle = (period: string) => {
      setSelected(prev => {
        const next = new Set(prev);
        next.has(period) ? next.delete(period) : next.add(period);
        return next;
      });
    };

    return (
      <Table style={{ maxWidth: 520 }}>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead style={{ width: 40 }} />
            <TableHead sort="none" onSort={() => {}}>Pay Period</TableHead>
            <TableHead sort="none" onSort={() => {}}>Workers</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PAY_PERIODS.map(row => (
            <TableRow
              key={row.period}
              selected={selected.has(row.period)}
              onClick={() => toggle(row.period)}
              style={{ cursor: 'pointer' }}
            >
              <TableCell compact align="center">
                <CellControl>
                  <input
                    type="checkbox"
                    aria-label={`Select ${row.period}`}
                    checked={selected.has(row.period)}
                    onChange={() => toggle(row.period)}
                    onClick={e => e.stopPropagation()}
                  />
                </CellControl>
              </TableCell>
              <TableCell><CellText>{row.period}</CellText></TableCell>
              <TableCell><CellText>{row.workers}</CellText></TableCell>
              <TableCell>
                <CellStatusTag status={row.pending > 0 ? 'warning' : 'success'}>
                  {row.pending > 0 ? `${row.pending} pending` : 'Approved'}
                </CellStatusTag>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};
