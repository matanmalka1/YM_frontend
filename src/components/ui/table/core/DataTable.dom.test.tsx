// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach } from 'vitest'
import { DataTable, type Column } from './DataTable'
import { buildSelectionColumn } from '../columns/tableSelection'

type Row = {
  id: number
  name: string
}

const rows: Row[] = [
  { id: 1, name: 'ראשון' },
  { id: 2, name: 'שני' },
]

afterEach(cleanup)

describe('DataTable keyboard navigation', () => {
  it('fires onRowClick for Enter on the row itself', () => {
    const onRowClick = vi.fn()
    const columns: Column<Row>[] = [{ key: 'name', header: 'שם', render: (row) => row.name }]
    const { getAllByRole } = render(
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} onRowClick={onRowClick} />,
    )

    const [firstRow] = getAllByRole('button')
    fireEvent.keyDown(firstRow, { key: 'Enter' })

    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })

  it('ignores Space bubbled from a nested checkbox', () => {
    const onRowClick = vi.fn()
    const columns: Column<Row>[] = [
      { key: 'name', header: 'שם', render: (row) => row.name },
      {
        key: 'select',
        header: '',
        kind: 'selection',
        render: (row) => <input type="checkbox" aria-label={`בחר ${row.name}`} readOnly />,
      },
    ]
    const { getByLabelText } = render(
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} onRowClick={onRowClick} />,
    )

    const checkbox = getByLabelText('בחר ראשון')
    const spaceEvent = fireEvent.keyDown(checkbox, { key: ' ' })

    expect(onRowClick).not.toHaveBeenCalled()
    // preventDefault must not have fired — the checkbox keeps its native toggle.
    expect(spaceEvent).toBe(true)
  })

  it('moves focus between rows with ArrowDown/ArrowUp', () => {
    const onRowClick = vi.fn()
    const columns: Column<Row>[] = [{ key: 'name', header: 'שם', render: (row) => row.name }]
    const { getAllByRole } = render(
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} onRowClick={onRowClick} />,
    )

    const [firstRow, secondRow] = getAllByRole('button')
    firstRow.focus()
    fireEvent.keyDown(firstRow, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(secondRow)

    fireEvent.keyDown(secondRow, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(firstRow)
  })
})

describe('selection column header checkbox', () => {
  it('is indeterminate when only some rows are selected', () => {
    const column = buildSelectionColumn<Row>({
      allIds: [1, 2],
      getId: (row) => row.id,
      getItemAriaLabel: (row) => `בחר ${row.name}`,
      onToggleSelect: () => undefined,
      onToggleAll: () => undefined,
      selectAllAriaLabel: 'בחר הכל',
      selectedIds: new Set([1]),
    })
    const { getByLabelText } = render(<DataTable data={rows} columns={[column]} getRowKey={(row) => row.id} />)

    const selectAll = getByLabelText('בחר הכל') as HTMLInputElement
    expect(selectAll.indeterminate).toBe(true)
    expect(selectAll.checked).toBe(false)
  })
})
