import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { actionsColumn, DataTable, type Column } from '../../../../components/ui/table'
import { RowActionButton } from '@/components/ui/table'
import type { AnnexDataLine } from '../../api'
import type { FieldDef } from '../../constants/annexConstants'
import { ANNEX_TEXT, TABLE_ICON_CLASS } from '../../constants/annexTextConstants'
import { getLineFieldValue } from '../../utils/annexHelpers'
import { AnnexFieldInput } from './AnnexFieldInput'
import type { AnnexFormValues } from '../../constants/annexSchema'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface AnnexDataTableProps {
  lines: AnnexDataLine[]
  fields: FieldDef[]
  editingLineId: number | null
  register: UseFormRegister<AnnexFormValues>
  errors: FieldErrors<AnnexFormValues>
  isUpdating: boolean
  isDeleting: boolean
  onStartEdit: (line: AnnexDataLine) => void
  onCancelEdit: () => void
  onSaveEdit: (lineId: number) => void
  onDelete: (lineId: number) => void
}

export const AnnexDataTable: React.FC<AnnexDataTableProps> = ({
  lines,
  fields,
  editingLineId,
  register,
  errors,
  isUpdating,
  isDeleting,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}) => {
  const columns: Column<AnnexDataLine>[] = [
    ...fields.map(
      (field): Column<AnnexDataLine> => ({
        key: field.key,
        header: field.label,
        verticalAlign: 'top',
        className: field.type === 'text' ? undefined : 'w-36',
        render: (line) => (
          <span className={field.type === 'text' ? 'text-gray-700' : 'font-mono text-gray-800'} dir="auto">
            {getLineFieldValue(line, field)}
          </span>
        ),
      }),
    ),
    actionsColumn({
      key: '__actions',
      header: '',
      className: 'w-24',
      render: (line) => (
        <div className="flex items-center justify-end gap-1">
          <RowActionButton
            label={ANNEX_TEXT.editLine}
            icon={<Pencil className={TABLE_ICON_CLASS} />}
            tone="info"
            size="sm"
            onClick={() => onStartEdit(line)}
          />
          <RowActionButton
            label={ANNUAL_REPORTS_MESSAGES.annexDataTable.deleteLine}
            icon={<Trash2 className={TABLE_ICON_CLASS} />}
            tone="danger"
            size="sm"
            onClick={() => onDelete(line.id)}
            disabled={isDeleting}
          />
        </div>
      ),
    }),
  ]

  return (
    <DataTable
      data={lines}
      columns={columns}
      getRowKey={(line) => line.id}
      editingRowKey={editingLineId}
      renderEditRow={(line) => (
        <tr className="bg-info-50/40">
          {fields.map((field) => (
            <td key={field.key} className="px-3 py-2 align-top">
              <AnnexFieldInput field={field} register={register} errors={errors} />
            </td>
          ))}
          <td className="px-3 py-2 align-top">
            <div className="flex items-center justify-end gap-1">
              <RowActionButton
                label={ANNUAL_REPORTS_MESSAGES.annexDataTable.saveLine}
                icon={<Check className={TABLE_ICON_CLASS} />}
                tone="positive"
                size="sm"
                onClick={() => onSaveEdit(line.id)}
                disabled={isUpdating}
              />
              <RowActionButton
                label={GLOBAL_UI_MESSAGES.actions.cancel}
                icon={<X className={TABLE_ICON_CLASS} />}
                size="sm"
                onClick={onCancelEdit}
              />
              <RowActionButton
                label={ANNUAL_REPORTS_MESSAGES.annexDataTable.deleteLine}
                icon={<Trash2 className={TABLE_ICON_CLASS} />}
                tone="danger"
                size="sm"
                onClick={() => onDelete(line.id)}
                disabled={isDeleting}
              />
            </div>
          </td>
        </tr>
      )}
      surface="bare"
      density="compact"
    />
  )
}
