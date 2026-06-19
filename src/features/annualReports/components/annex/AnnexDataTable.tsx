import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Button } from '../../../../components/ui/primitives/Button'
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
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-500 border-b">
          {fields.map((field) => (
            <th key={field.key} className="text-right py-1 px-2 font-medium">
              {field.label}
            </th>
          ))}
          <th />
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => {
          const isEditing = editingLineId === line.id
          return (
            <tr key={line.id} className="border-b border-gray-100 hover:bg-gray-50">
              {fields.map((field) => (
                <td key={field.key} className="py-1 px-2 text-gray-700 align-top">
                  {isEditing ? (
                    <AnnexFieldInput field={field} register={register} errors={errors} />
                  ) : (
                    getLineFieldValue(line, field.key)
                  )}
                </td>
              ))}
              <td className="py-1 px-2">
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onSaveEdit(line.id)}
                        disabled={isUpdating}
                        className="p-0.5 text-positive-500 hover:text-positive-700 hover:bg-transparent"
                      >
                        <Check className={TABLE_ICON_CLASS} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancelEdit}
                        className="p-0.5 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                      >
                        <X className={TABLE_ICON_CLASS} />
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={ANNEX_TEXT.editLine}
                      onClick={() => onStartEdit(line)}
                      className="p-0.5 text-info-400 hover:text-info-600 hover:bg-transparent"
                    >
                      <Pencil className={TABLE_ICON_CLASS} />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(line.id)}
                    disabled={isDeleting}
                    className="p-0.5 text-negative-400 hover:text-negative-600 hover:bg-transparent"
                  >
                    <Trash2 className={TABLE_ICON_CLASS} />
                  </Button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)
