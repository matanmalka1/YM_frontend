import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { Button } from '@/components/ui/primitives/Button'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { bindersApi, bindersQK } from '../../api'
import { formatMonthYear } from '@/utils/utils'
import { NUMERIC_MONTH_OPTIONS, getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { PAGE_SIZE_LG } from '@/constants/pagination.constants'
import { BINDERS_MESSAGES } from '../../messages'

interface BinderHandoverPanelProps {
  clientId: number
  initialBinderId: number
  isSubmitting: boolean
  onSubmit: (payload: {
    binderIds: number[]
    receivedByName: string
    handedOverAt: string
    untilPeriodYear: number
    untilPeriodMonth: number
    notes: string | null
  }) => void
}

export const BinderHandoverPanel: React.FC<BinderHandoverPanelProps> = ({
  clientId,
  initialBinderId,
  isSubmitting,
  onSubmit,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([initialBinderId])
  const [receivedByName, setReceivedByName] = useState('')
  const [handedOverAt, setHandedOverAt] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [untilPeriodYear, setUntilPeriodYear] = useState(() => new Date().getFullYear())
  const [untilPeriodMonth, setUntilPeriodMonth] = useState(new Date().getMonth() + 1)
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: bindersQK.list({
      client_record_id: clientId,
      location_status: 'ready_for_handover',
      page_size: PAGE_SIZE_LG,
    }),
    queryFn: () =>
      bindersApi.list({ client_record_id: clientId, location_status: 'ready_for_handover', page_size: PAGE_SIZE_LG }),
    enabled: clientId > 0,
    staleTime: QUERY_STALE_TIME.default,
  })

  const readyBinders = data?.items ?? []

  useEffect(() => {
    const items = data?.items ?? []
    if (items.length === 0) {
      setSelectedIds([])
      return
    }
    setSelectedIds((current) => {
      const keep = current.filter((id) => items.some((binder) => binder.id === id))
      if (keep.length > 0) return keep
      if (items.some((binder) => binder.id === initialBinderId)) return [initialBinderId]
      return [items[0].id]
    })
  }, [data, initialBinderId])

  const selectedCount = selectedIds.length
  const canSubmit = selectedCount > 0 && receivedByName.trim().length > 0 && !!handedOverAt

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-sm font-medium text-gray-900">{BINDERS_MESSAGES.handover.selectionTitle}</p>
        <p className="mt-1 text-xs text-gray-500">{BINDERS_MESSAGES.handover.selectionHelp}</p>

        <div className="mt-3 space-y-2">
          {isLoading ? (
            <p className="text-sm text-gray-500">{BINDERS_MESSAGES.handover.loadingReadyBinders}</p>
          ) : readyBinders.length === 0 ? (
            <p className="text-sm text-gray-500">{BINDERS_MESSAGES.handover.noReadyBinders}</p>
          ) : (
            readyBinders.map((binder) => {
              const checked = selectedIds.includes(binder.id)
              return (
                <div
                  key={binder.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  <Checkbox
                    id={`handover-binder-${binder.id}`}
                    checked={checked}
                    onChange={() =>
                      setSelectedIds((current) =>
                        checked ? current.filter((id) => id !== binder.id) : [...current, binder.id],
                      )
                    }
                    inputClassName="mt-0.5"
                  />
                  <label htmlFor={`handover-binder-${binder.id}`} className="min-w-0 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900">{binder.binder_number}</div>
                    <div className="text-xs text-gray-500">
                      {binder.period_start
                        ? `${formatMonthYear(binder.period_start)} - ${binder.period_end ? formatMonthYear(binder.period_end) : BINDERS_MESSAGES.period.active}`
                        : BINDERS_MESSAGES.period.noPeriod}
                    </div>
                  </label>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Input
        label={BINDERS_MESSAGES.handover.recipientLabel}
        value={receivedByName}
        onChange={(event) => setReceivedByName(event.target.value)}
        placeholder={BINDERS_MESSAGES.handover.recipientPlaceholder}
      />

      <DatePicker label={BINDERS_MESSAGES.handover.handoverDate} value={handedOverAt} onChange={setHandedOverAt} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label={BINDERS_MESSAGES.handover.untilYear}
          value={String(untilPeriodYear)}
          onChange={(event) => setUntilPeriodYear(Number(event.target.value))}
          options={getOperationalYearOptions()}
        />
        <Select
          label={BINDERS_MESSAGES.handover.untilMonth}
          value={String(untilPeriodMonth)}
          onChange={(event) => setUntilPeriodMonth(Number(event.target.value))}
          options={NUMERIC_MONTH_OPTIONS}
        />
      </div>

      <Textarea
        label={BINDERS_MESSAGES.receive.notes}
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder={BINDERS_MESSAGES.handover.notesPlaceholder}
      />

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <span>{BINDERS_MESSAGES.handover.selectedCount(selectedCount)}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canSubmit || isSubmitting}
          onClick={() =>
            onSubmit({
              binderIds: selectedIds,
              receivedByName: receivedByName.trim(),
              handedOverAt,
              untilPeriodYear,
              untilPeriodMonth,
              notes: notes.trim() || null,
            })
          }
        >
          {BINDERS_MESSAGES.actions.confirmHandover}
        </Button>
      </div>
    </div>
  )
}

BinderHandoverPanel.displayName = 'BinderHandoverPanel'
