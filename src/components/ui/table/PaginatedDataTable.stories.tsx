import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Badge } from '../primitives/Badge'
import type { Column } from './DataTable'
import { PaginatedDataTable } from './PaginatedDataTable'

interface ClientRow {
  id: number
  name: string
  status: 'active' | 'pending'
}

const rows: ClientRow[] = [
  { id: 101, name: 'ישראל ישראלי', status: 'active' },
  { id: 102, name: 'רות לוי', status: 'pending' },
]

const columns: Column<ClientRow>[] = [
  { key: 'id', header: 'מספר', render: (item) => item.id },
  { key: 'name', header: 'לקוח', render: (item) => item.name },
  {
    key: 'status',
    header: 'סטטוס',
    render: (item) => <Badge variant={item.status === 'active' ? 'success' : 'warning'}>{item.status === 'active' ? 'פעיל' : 'ממתין'}</Badge>,
  },
]

const meta = {
  component: PaginatedDataTable<ClientRow>,
  tags: ['autodocs'],
} satisfies Meta<typeof PaginatedDataTable<ClientRow>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: rows,
    columns,
    getRowKey: (item) => item.id,
    page: 1,
    pageSize: 10,
    total: 28,
    label: 'לקוחות',
    onPageChange: () => undefined,
  },
  render: (args) => {
    const [page, setPage] = useState(args.page)
    return <PaginatedDataTable {...args} page={page} onPageChange={setPage} />
  },
}

export const Loading: Story = {
  args: {
    data: [],
    columns,
    getRowKey: (item) => item.id,
    page: 1,
    pageSize: 10,
    total: 0,
    isLoading: true,
    onPageChange: () => undefined,
  },
}

export const Error: Story = {
  args: {
    data: [],
    columns,
    getRowKey: (item) => item.id,
    page: 1,
    pageSize: 10,
    total: 0,
    error: 'טעינת הטבלה נכשלה.',
    onPageChange: () => undefined,
  },
}
