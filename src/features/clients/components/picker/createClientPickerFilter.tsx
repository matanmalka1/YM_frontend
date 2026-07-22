import type { CustomFilterFieldDef } from '@/components/ui/filters/types'
import { ClientPickerFilter, type ClientPickerFilterConfig } from './ClientPickerFilter'

export const createClientPickerFilter = (field: ClientPickerFilterConfig): CustomFilterFieldDef => ({
  type: 'custom',
  key: field.nameKey ? `${field.idKey}__${field.nameKey}` : field.idKey,
  inline: true,
  render: ({ values, onMultiChange, size, hideLabel }) => (
    <ClientPickerFilter field={field} values={values} onMultiChange={onMultiChange} size={size} hideLabel={hideLabel} />
  ),
  getBadges: (values, onMultiChange) => {
    const id = values[field.idKey]
    const name = field.nameKey ? values[field.nameKey] : undefined
    if (!id) return []

    return [
      {
        key: field.idKey,
        label: `לקוח: ${name ?? `#${id}`}`,
        onRemove: () => onMultiChange(field.nameKey ? { [field.idKey]: '', [field.nameKey]: '' } : { [field.idKey]: '' }),
      },
    ]
  },
})
