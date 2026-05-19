import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Plus, X } from 'lucide-react'
import { annualReportsApi, annualReportsQK, type AnnualReportScheduleKey } from '../../api'
import { showErrorToast } from '../../../../utils/utils'
import { Button } from '../../../../components/ui/primitives/Button'
import { Input } from '../../../../components/ui/inputs/Input'
import { SCHEDULE_FIELDS } from '../../annex.constants'
import { AnnexDataTable } from './AnnexDataTable'
import { ANNEX_TEXT, FIELD_INPUT_CLASS, TABLE_ICON_CLASS } from './annex.constants'
import { getInputType } from './annex.helpers'
import { buildAnnexSchema, buildEmptyFormValues, mapLineToFormValues, type AnnexFormValues } from './annexSchema'

interface Props {
  reportId: number
  schedule: AnnualReportScheduleKey
  scheduleLabel: string
}

export const AnnexDataPanel: React.FC<Props> = ({ reportId, schedule, scheduleLabel }) => {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingLineId, setEditingLineId] = useState<number | null>(null)

  const schema = useMemo(() => buildAnnexSchema(schedule), [schedule])
  const fields = SCHEDULE_FIELDS[schedule]
  const emptyDefaults = useMemo(() => buildEmptyFormValues(schedule), [schedule])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnexFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    reset(emptyDefaults)
    setShowForm(false)
    setEditingLineId(null)
  }, [schedule, emptyDefaults, reset])

  const qk = annualReportsQK.annex(reportId, schedule)

  const { data: annexData, isLoading } = useQuery({
    queryKey: qk,
    queryFn: () => annualReportsApi.getAnnexLines(reportId, schedule),
  })
  const lines = annexData?.items ?? []

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk })
    qc.invalidateQueries({ queryKey: annualReportsQK.readiness(reportId) })
  }

  const addMutation = useMutation({
    mutationFn: (values: AnnexFormValues) => annualReportsApi.addAnnexLine(reportId, schedule, { data: values }),
    onSuccess: () => {
      invalidate()
      setShowForm(false)
      reset(emptyDefaults)
    },
    onError: (err) => showErrorToast(err, 'שגיאה בהוספת שורה'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ lineId, values }: { lineId: number; values: AnnexFormValues }) =>
      annualReportsApi.updateAnnexLine(reportId, schedule, lineId, { data: values }),
    onSuccess: () => {
      invalidate()
      setEditingLineId(null)
      reset(emptyDefaults)
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון שורה'),
  })

  const deleteMutation = useMutation({
    mutationFn: (lineId: number) => annualReportsApi.deleteAnnexLine(reportId, schedule, lineId),
    onSuccess: invalidate,
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת שורה'),
  })

  const onAddSubmit: SubmitHandler<AnnexFormValues> = (values) => addMutation.mutate(values)
  const onEditSubmit =
    (lineId: number): SubmitHandler<AnnexFormValues> =>
    (values) =>
      updateMutation.mutate({ lineId, values })

  if (isLoading) return <p className="text-xs text-gray-400 py-2">{ANNEX_TEXT.loading}</p>

  return (
    <div className="mt-3 space-y-2">
      {lines.length > 0 ? (
        <AnnexDataTable
          lines={lines}
          fields={fields}
          editingLineId={editingLineId}
          register={register}
          errors={errors}
          isUpdating={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onStartEdit={(line) => {
            setShowForm(false)
            setEditingLineId(line.id)
            reset(mapLineToFormValues(schedule, line.data as Record<string, unknown>))
          }}
          onCancelEdit={() => {
            setEditingLineId(null)
            reset(emptyDefaults)
          }}
          onSaveEdit={(lineId) => {
            void handleSubmit(onEditSubmit(lineId))()
          }}
          onDelete={(lineId) => deleteMutation.mutate(lineId)}
        />
      ) : null}

      {showForm ? (
        <form
          onSubmit={(e) => {
            void handleSubmit(onAddSubmit)(e)
          }}
          className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
        >
          <p className="text-xs font-medium text-gray-600">
            {ANNEX_TEXT.addLine} - {scheduleLabel}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 block mb-0.5">{f.label}</label>
                <Input
                  type={getInputType(f.type)}
                  step={f.type === 'number' ? 'any' : undefined}
                  className={FIELD_INPUT_CLASS}
                  error={errors[f.key]?.message as string | undefined}
                  {...register(f.key)}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                reset(emptyDefaults)
              }}
            >
              <X className={TABLE_ICON_CLASS} />
            </Button>
            <Button type="submit" size="sm" isLoading={addMutation.isPending}>
              <Check className={`${TABLE_ICON_CLASS} ml-1`} />
              {ANNEX_TEXT.save}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            reset(emptyDefaults)
            setEditingLineId(null)
            setShowForm(true)
          }}
        >
          <Plus className={`${TABLE_ICON_CLASS} ml-1`} />
          {ANNEX_TEXT.addLine}
        </Button>
      )}
    </div>
  )
}

AnnexDataPanel.displayName = 'AnnexDataPanel'
