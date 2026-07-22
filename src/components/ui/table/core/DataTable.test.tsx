import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DataTable, type Column } from './DataTable'

type Row = {
  id: number
  name: string
  amount: number
}

const rows: Row[] = [
  { id: 1, name: 'ראשון', amount: 100 },
  { id: 2, name: 'שני', amount: 250 },
]

const columns: Column<Row>[] = [
  { key: 'name', header: 'שם', render: (row) => row.name },
  { key: 'amount', header: 'סכום', kind: 'money', render: (row) => row.amount },
]

describe('DataTable inline edit', () => {
  it('replaces the editing row with renderEditRow and keeps other rows intact', () => {
    const html = renderToStaticMarkup(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        editingRowKey={1}
        renderEditRow={(row) => (
          <tr>
            <td colSpan={columns.length}>עריכת {row.name}</td>
          </tr>
        )}
      />,
    )

    expect(html).toContain('עריכת ראשון')
    expect(html).not.toContain('>ראשון<')
    expect(html).toContain('שני')
  })
})

describe('DataTable footer', () => {
  it('renders an automatic tfoot from column footers', () => {
    const withFooter: Column<Row>[] = [
      { key: 'name', header: 'שם', render: (row) => row.name, footer: 'סה"כ' },
      { key: 'amount', header: 'סכום', kind: 'money', render: (row) => row.amount, footer: 350 },
    ]
    const html = renderToStaticMarkup(<DataTable data={rows} columns={withFooter} getRowKey={(row) => row.id} />)

    expect(html).toContain('<tfoot')
    expect(html).toContain('סה&quot;כ')
    expect(html).toContain('350')
  })

  it('lets renderFooter replace the automatic footer row', () => {
    const withFooter: Column<Row>[] = [{ key: 'name', header: 'שם', render: (row) => row.name, footer: 'ignored' }]
    const html = renderToStaticMarkup(
      <DataTable
        data={rows}
        columns={withFooter}
        getRowKey={(row) => row.id}
        renderFooter={() => (
          <tr>
            <td colSpan={1}>שורת סיכום</td>
          </tr>
        )}
      />,
    )

    expect(html).toContain('שורת סיכום')
    expect(html).not.toContain('ignored')
  })
})

describe('DataTable row variants', () => {
  it('applies the variant class from getRowVariant', () => {
    const html = renderToStaticMarkup(
      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        getRowVariant={(row) => (row.id === 2 ? 'dangerSoft' : undefined)}
      />,
    )

    expect(html).toContain('bg-negative-50/40')
  })
})
