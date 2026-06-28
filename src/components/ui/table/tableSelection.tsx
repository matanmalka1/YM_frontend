import type { Column } from './DataTable'
import { Checkbox } from '../primitives/Checkbox'
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
      <Checkbox
        checked={allSelected}
        indeterminate={someSelected}
        onChange={() => onToggleAll?.(allIds)}
        className="cursor-pointer"
        aria-label={selectAllAriaLabel}
      />
    ),
    render: (item) => {
      const id = getId(item)
      return (
        <Checkbox
          checked={selectedIds?.has(id) ?? false}
          onChange={() => onToggleSelect(id)}
          onClick={(event) => event.stopPropagation()}
          className="cursor-pointer"
          aria-label={getItemAriaLabel(item)}
        />
      )
    },
  }
}
