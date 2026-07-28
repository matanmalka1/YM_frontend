import { Controller, type Control, type FieldErrors, type FieldValues, type Path } from 'react-hook-form'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { CLIENT_LIABILITY_RANGES, type ClientLiabilityRangeKey } from '../../constants'
import { CLIENTS_MESSAGES } from '../../messages'

const RANGE_LABELS: Record<ClientLiabilityRangeKey, string> = {
  vat: CLIENTS_MESSAGES.liability.vatLabel,
  advance: CLIENTS_MESSAGES.liability.advanceLabel,
  annual: CLIENTS_MESSAGES.liability.annualLabel,
}

interface Props<T extends FieldValues> {
  control: Control<T>
  disabled?: boolean
  errors: FieldErrors<T>
  /** Ranges to render. Defaults to all three. */
  only?: ReadonlyArray<ClientLiabilityRangeKey>
}

/**
 * The per-obligation-type liability ranges.
 *
 * Rendered from `CLIENT_LIABILITY_RANGES` rather than six hand-written fields, so
 * the create form, the edit form and the backend's trigger-field set all describe
 * the same three pairs in one place.
 */
export const ClientLiabilityRangeFields = <T extends FieldValues>({ control, disabled, errors, only }: Props<T>) => {
  const ranges = only ? CLIENT_LIABILITY_RANGES.filter((r) => only.includes(r.key)) : CLIENT_LIABILITY_RANGES

  return (
    <section className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-gray-700">{CLIENTS_MESSAGES.liability.sectionTitle}</h4>
        <p className="mt-1 text-xs text-gray-500">{CLIENTS_MESSAGES.liability.sectionHelp}</p>
      </div>
      {ranges.map(({ key, from, to }) => (
        <div key={key} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {([from, to] as const).map((fieldName, index) => (
            <Controller
              key={fieldName}
              control={control}
              name={fieldName as Path<T>}
              render={({ field }) => (
                <DatePicker
                  label={`${RANGE_LABELS[key]} — ${
                    index === 0 ? CLIENTS_MESSAGES.liability.fromLabel : CLIENTS_MESSAGES.liability.toLabel
                  }`}
                  error={errors[fieldName as keyof FieldErrors<T>]?.message as string | undefined}
                  disabled={disabled}
                  value={(field.value as string | null) ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
          ))}
        </div>
      ))}
      <p className="text-xs text-gray-400">{CLIENTS_MESSAGES.liability.partialPeriodNote}</p>
    </section>
  )
}
