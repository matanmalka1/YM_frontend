import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DataTable, type Column } from './DataTable'
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

  it('suppresses a custom empty renderer when an error exists with no rows', () => {
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
        renderEmpty={() => <div>מצב ריק מותאם</div>}
      />,
    )

    expect(html).toContain('טעינת הנתונים נכשלה')
    expect(html).not.toContain('מצב ריק מותאם')
  })
})

describe('DataTable', () => {
  it('shows only the error alert when the raw table fails with no rows', () => {
    const html = renderToStaticMarkup(
      <DataTable
        data={[]}
        columns={columns}
        getRowKey={(row) => row.id}
        error="טעינת הרשימה נכשלה"
        emptyState={{ title: 'אין נתונים', message: 'הרשימה ריקה' }}
      />,
    )

    expect(html).toContain('טעינת הרשימה נכשלה')
    expect(html).not.toContain('אין נתונים')
    expect(html).not.toContain('הרשימה ריקה')
  })
})
