import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showErrorToast } from '@/utils/utils'
import { annualReportsApi, annualReportsQK, type AnnualReportScheduleKey } from '../api'
import { SCHEDULE_FIELDS } from '../annex.constants'
import {
  buildAnnexSchema,
  buildEmptyFormValues,
  mapLineToFormValues,
  type AnnexFormValues,
} from '../components/annex/annexSchema'

export const useAnnexDataPanel = (reportId: number, schedule: AnnualReportScheduleKey) => {
  const queryClient = useQueryClient()
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
  }, [emptyDefaults, reset])

  const queryKey = annualReportsQK.annex(reportId, schedule)
  const annexQuery = useQuery({
    queryKey,
    queryFn: () => annualReportsApi.getAnnexLines(reportId, schedule),
    enabled: reportId > 0,
  })

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: annualReportsQK.readiness(reportId) }),
    ])
  }

  const addMutation = useMutation({
    mutationFn: (values: AnnexFormValues) => annualReportsApi.addAnnexLine(reportId, schedule, { data: values }),
    onSuccess: async () => {
      await invalidate()
      setShowForm(false)
      reset(emptyDefaults)
    },
    onError: (error) => showErrorToast(error, 'שגיאה בהוספת שורה'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ lineId, values }: { lineId: number; values: AnnexFormValues }) =>
      annualReportsApi.updateAnnexLine(reportId, schedule, lineId, { data: values }),
    onSuccess: async () => {
      await invalidate()
      setEditingLineId(null)
      reset(emptyDefaults)
    },
    onError: (error) => showErrorToast(error, 'שגיאה בעדכון שורה'),
  })

  const deleteMutation = useMutation({
    mutationFn: (lineId: number) => annualReportsApi.deleteAnnexLine(reportId, schedule, lineId),
    onSuccess: invalidate,
    onError: (error) => showErrorToast(error, 'שגיאה במחיקת שורה'),
  })

  const add: SubmitHandler<AnnexFormValues> = (values) => addMutation.mutate(values)
  const update =
    (lineId: number): SubmitHandler<AnnexFormValues> =>
    (values) =>
      updateMutation.mutate({ lineId, values })

  return {
    fields,
    lines: annexQuery.data?.items ?? [],
    isLoading: annexQuery.isLoading,
    showForm,
    editingLineId,
    register,
    errors,
    openAddForm: () => {
      reset(emptyDefaults)
      setEditingLineId(null)
      setShowForm(true)
    },
    cancelAdd: () => {
      setShowForm(false)
      reset(emptyDefaults)
    },
    startEdit: (line: { id: number; data: unknown }) => {
      setShowForm(false)
      setEditingLineId(line.id)
      reset(mapLineToFormValues(schedule, line.data as Record<string, unknown>))
    },
    cancelEdit: () => {
      setEditingLineId(null)
      reset(emptyDefaults)
    },
    submitAdd: handleSubmit(add),
    submitEdit: (lineId: number) => handleSubmit(update(lineId))(),
    deleteLine: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
