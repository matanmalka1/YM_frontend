import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { DataTable, type Column } from '../../../../components/ui/table/DataTable'
import { RowActionButton } from '../../../../components/ui/table/RowActions'
import type { AnnexDataLine } from '../../api'
import type { FieldDef } from '../../constants/annexConstants'
import { ANNEX_TEXT, TABLE_ICON_CLASS } from '../../constants/annexTextConstants'
import { getLineFieldValue } from '../../utils/annexHelpers'
import { AnnexFieldInput } from './AnnexFieldInput'
import type { AnnexFormValues } from '../../constants/annexSchema'

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
        align: 'right',
        className: 'align-top text-gray-700',
        render: (line) => getLineFieldValue(line, field.key),
        editRender: () => <AnnexFieldInput field={field} register={register} errors={errors} />,
      }),
    ),
    {
      key: '__actions',
      header: '',
      align: 'right',
      render: (line) => (
        <div className="flex items-center gap-1">
          <RowActionButton
            label={ANNEX_TEXT.editLine}
            icon={<Pencil className={TABLE_ICON_CLASS} />}
            tone="info"
            size="sm"
            onClick={() => onStartEdit(line)}
          />
          <RowActionButton
            label="מחיקת שורה"
            icon={<Trash2 className={TABLE_ICON_CLASS} />}
            tone="danger"
            size="sm"
            onClick={() => onDelete(line.id)}
            disabled={isDeleting}
          />
        </div>
      ),
      editRender: (line) => (
        <div className="flex items-center gap-1">
          <RowActionButton
            label="שמירת שורה"
            icon={<Check className={TABLE_ICON_CLASS} />}
            tone="positive"
            size="sm"
            onClick={() => onSaveEdit(line.id)}
            disabled={isUpdating}
          />
          <RowActionButton
            label="ביטול"
            icon={<X className={TABLE_ICON_CLASS} />}
            size="sm"
            onClick={onCancelEdit}
          />
          <RowActionButton
            label="מחיקת שורה"
            icon={<Trash2 className={TABLE_ICON_CLASS} />}
            tone="danger"
            size="sm"
            onClick={() => onDelete(line.id)}
            disabled={isDeleting}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={lines}
      columns={columns}
      getRowKey={(line) => line.id}
      editingRowKey={editingLineId}
      surface="bare"
      density="compact"
    />
  )
}
