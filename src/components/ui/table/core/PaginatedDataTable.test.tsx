import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { type Column } from './DataTable'
import { PaginatedDataTable } from './PaginatedDataTable'

type Row = {
  id: number
  name: string
}

const columns: Column<Row>[] = [
  {
    key: 'name',
    header: 'שם',
    render: (row) => row.name,
  },
]

describe('PaginatedDataTable', () => {
  it('shows only the error alert when the paginated table fails with no rows', () => {
    const html = renderToStaticMarkup(
      <PaginatedDataTable
        data={[]}
        columns={columns}
        getRowKey={(row) => row.id}
        error="טעינת הנתונים נכשלה"
        page={1}
        pageSize={10}
        total={0}
        onPageChange={() => undefined}
        emptyState={{ title: 'אין רשומות', message: 'לא נמצאו נתונים' }}
      />,
    )

    expect(html).toContain('טעינת הנתונים נכשלה')
    expect(html).not.toContain('אין רשומות')
    expect(html).not.toContain('לא נמצאו נתונים')
  })

  it('suppresses the empty state during a background refetch with no rows', () => {
    const html = renderToStaticMarkup(
      <PaginatedDataTable
        data={[]}
        columns={columns}
        getRowKey={(row) => row.id}
        isFetching
        page={1}
        pageSize={10}
        total={0}
        onPageChange={() => undefined}
        emptyState={{ title: 'אין רשומות', message: 'לא נמצאו נתונים' }}
      />,
    )

    expect(html).not.toContain('אין רשומות')
    expect(html).not.toContain('לא נמצאו נתונים')
    expect(html).not.toContain('<table')
  })

  it('shows the empty state when the list is settled and empty', () => {
    const html = renderToStaticMarkup(
      <PaginatedDataTable
        data={[]}
        columns={columns}
        getRowKey={(row) => row.id}
        page={1}
        pageSize={10}
        total={0}
        onPageChange={() => undefined}
        emptyState={{ title: 'אין רשומות', message: 'לא נמצאו נתונים' }}
      />,
    )

    expect(html).toContain('אין רשומות')
    expect(html).toContain('לא נמצאו נתונים')
  })
})
