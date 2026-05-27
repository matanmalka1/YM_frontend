import type { Meta, StoryObj } from '@storybook/react'
import { Inbox } from 'lucide-react'
import { Badge } from '../primitives/Badge'
import { DataTable, type Column } from './DataTable'

interface ClientRow {
  id: number
  name: string
  status: 'active' | 'pending'
  owner: string
}

const rows: ClientRow[] = [
  { id: 101, name: 'ישראל ישראלי', status: 'active', owner: 'דנה כהן' },
  { id: 102, name: 'רות לוי', status: 'pending', owner: 'יוסי מזרחי' },
]

const columns: Column<ClientRow>[] = [
  { key: 'id', header: 'מספר', render: (item) => item.id },
  { key: 'name', header: 'לקוח', render: (item) => item.name },
  {
    key: 'status',
    header: 'סטטוס',
    render: (item) => <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status === 'active' ? 'פעיל' : 'ממתין'}</Badge>,
  },
  { key: 'owner', header: 'יועץ', render: (item) => item.owner },
]

const meta = {
  component: DataTable<ClientRow>,
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable<ClientRow>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: rows,
    columns,
    getRowKey: (item) => item.id,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    columns,
    getRowKey: (item) => item.id,
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    data: [],
    columns,
    getRowKey: (item) => item.id,
    emptyMessage: 'אין לקוחות להצגה',
  },
}

export const CustomEmptyState: Story = {
  args: {
    data: [],
    columns,
    getRowKey: (item) => item.id,
    emptyState: {
      icon: Inbox,
      title: 'אין לקוחות',
      message: 'לקוחות חדשים יופיעו כאן לאחר יצירה.',
    },
  },
}

export const ClickableRows: Story = {
  args: {
    data: rows,
    columns,
    getRowKey: (item) => item.id,
    onRowClick: () => undefined,
  },
}

export const StickyHeader: Story = {
  args: {
    data: rows,
    columns,
    getRowKey: (item) => item.id,
    stickyHeader: true,
  },
}
