import type { Column } from './DataTable'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

interface BuildSelectionColumnParams<T> {
  allIds: number[]
  getId: (item: T) => number
  getItemAriaLabel: (item: T) => string
  onToggleAll?: (ids: number[]) => void
  onToggleSelect: (id: number) => void
  selectAllAriaLabel?: string
  selectedIds?: Set<number>
}

export const buildSelectionColumn = <T,>({
  allIds,
  getId,
  getItemAriaLabel,
  onToggleAll,
  onToggleSelect,
  selectAllAriaLabel = GLOBAL_UI_MESSAGES.actions.selectAll,
  selectedIds,
}: BuildSelectionColumnParams<T>): Column<T> => {
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds?.has(id))
  const someSelected = !allSelected && allIds.some((id) => selectedIds?.has(id))

  return {
    key: 'select',
    header: '',
    headerClassName: 'w-10',
    className: 'w-10',
    headerRender: () => (
      <input
        type="checkbox"
        checked={allSelected}
        ref={(element) => {
          if (element) {
            element.indeterminate = someSelected
          }
        }}
        onChange={() => onToggleAll?.(allIds)}
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        aria-label={selectAllAriaLabel}
      />
    ),
    render: (item) => {
      const id = getId(item)
      return (
        <input
          type="checkbox"
          checked={selectedIds?.has(id) ?? false}
          onChange={() => onToggleSelect(id)}
          onClick={(event) => event.stopPropagation()}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          aria-label={getItemAriaLabel(item)}
        />
      )
    },
  }
}
