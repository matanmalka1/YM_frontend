import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { annualReportsApi, annualReportsQK, type CreateAnnualReportPayload } from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { createReportSchema, type CreateReportFormValues } from '../schemas'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

type CreateReportFormOutput = z.output<typeof createReportSchema>

const buildDefaultValues = (taxYear?: number): CreateReportFormValues => ({
  client_id: '',
  tax_year: taxYear ? String(taxYear) : '',
  client_type: 'individual',
  deadline_type: 'standard',
  submission_method: undefined,
  extension_reason: undefined,
  notes: '',
  has_rental_income: false,
  has_capital_gains: false,
  has_foreign_income: false,
  has_depreciation: false,
  gross_income: '',
  expenses: '',
  advances_paid: '',
  credit_points: '',
})

export const useCreateReport = (taxYear?: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  const form = useForm<CreateReportFormValues, undefined, CreateReportFormOutput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: buildDefaultValues(taxYear),
  })

  const [grossIncome, expenses, advancesPaid, creditPoints, taxYearStr] = useWatch({
    control: form.control,
    name: ['gross_income', 'expenses', 'advances_paid', 'credit_points', 'tax_year'],
  })

  const previewParams = useMemo(() => {
    const income = parseFloat(grossIncome ?? '') || 0
    const exp = parseFloat(expenses ?? '') || 0
    const advances = parseFloat(advancesPaid ?? '') || 0
    const credits = parseFloat(creditPoints ?? '') || 0
    const year = parseInt(taxYearStr ?? '') || taxYear || 0
    return {
      tax_year: year,
      gross_income: income,
      expenses: exp,
      advances_paid: advances,
      credit_points: credits,
    }
  }, [grossIncome, expenses, advancesPaid, creditPoints, taxYearStr, taxYear])

  const { data: previewData } = useQuery({
    queryKey: ['annualReport', 'taxPreview', previewParams],
    queryFn: () => annualReportsApi.taxPreview(previewParams),
    enabled: previewParams.tax_year > 0,
    staleTime: QUERY_STALE_TIME.default,
    placeholderData: (prev) => prev,
  })

  const preview = {
    netProfit: previewData?.net_profit ?? 0,
    estimatedTax: previewData?.estimated_tax ?? 0,
    balance: previewData?.balance ?? 0,
  }

  const mutation = useMutation({
    mutationFn: (payload: CreateAnnualReportPayload) => annualReportsApi.createReport(payload),
    onSuccess: (data) => {
      const message =
        data.profit != null
          ? `דוח נוצר | רווח ראשוני: ₪${Number(data.profit).toLocaleString('he-IL')}`
          : 'דוח שנתי נוצר בהצלחה'
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: annualReportsQK.all })
      form.reset(buildDefaultValues(taxYear))
      onSuccess?.()
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת דוח'),
  })

  const buildPayload = (values: CreateReportFormOutput): CreateAnnualReportPayload => ({
    client_record_id: Number(values.client_id),
    tax_year: Number(values.tax_year),
    client_type: values.client_type,
    deadline_type: values.deadline_type,
    submission_method: values.submission_method ?? null,
    extension_reason: values.extension_reason ?? null,
    notes: values.notes || null,
    has_rental_income: values.has_rental_income,
    has_capital_gains: values.has_capital_gains,
    has_foreign_income: values.has_foreign_income,
    has_depreciation: values.has_depreciation,
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(buildPayload(values))
  })

  const resetForm = useCallback(() => {
    form.reset(buildDefaultValues(taxYear))
  }, [form, taxYear])

  return { form, onSubmit, isSubmitting: mutation.isPending, preview, resetForm }
}
