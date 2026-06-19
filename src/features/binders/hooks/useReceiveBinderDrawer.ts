import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { bindersApi, bindersQK } from '../api'
import {
  ANNUAL_REPORTS_COMPLETE_LIST_PARAMS,
  annualReportsApi,
  annualReportsQK,
  type AnnualReportListItem,
} from '@/features/annualReports'
import { clientsApi, clientsQK } from '@/features/clients'
import { vatReportsApi } from '@/features/vatReports'
import { useAuthStore } from '../../../store/auth.store'
import { toast } from '../../../utils/toast'
import { getHttpStatus, showErrorToast } from '../../../utils/utils'
import { receiveBinderSchema, type ReceiveBinderFormValues } from '../schemas'
import { toBinderPeriodValue } from '../utils'
import { PAGE_SIZE_XS } from '@/constants/pagination.constants'
import { ANNUAL_BINDER_TYPES, PERIODIC_BINDER_TYPES } from '../constants'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const DUPLICATE_BINDER_NUMBER_MESSAGE = 'קיים כבר קלסר עם מספר זה ללקוח'

const getDefaultValues = (): ReceiveBinderFormValues => ({
  client_record_id: undefined as unknown as number,
  business_id: undefined as unknown as number | null,
  binder_types: [],
  annual_report_id: null,
  open_new_binder: false,
  period_year: new Date().getFullYear(),
  period_month_start: null,
  period_month_end: null,
  salary_month: null,
  received_at: format(new Date(), 'yyyy-MM-dd'),
  notes: null,
})

const resetBinderPeriodFields = (form: UseFormReturn<ReceiveBinderFormValues>) => {
  form.setValue('period_year', new Date().getFullYear())
  form.setValue('period_month_start', null)
  form.setValue('period_month_end', null)
  form.setValue('salary_month', null)
  form.setValue('annual_report_id', null)
}

interface UseReceiveBinderDrawerOptions {
  onSuccess?: () => void
  initialClient?: { id: number; name: string } | null
}

export const useReceiveBinderDrawer = (opts: UseReceiveBinderDrawerOptions = {}) => {
  const { onSuccess, initialClient } = opts

  const [clientQuery, setClientQuery] = useState(initialClient?.name ?? '')
  const [selectedClient, setSelectedClient] = useState<{
    id: number
    name: string
    client_status?: string | null
  } | null>(initialClient ? { id: initialClient.id, name: initialClient.name } : null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)

  const form = useForm<ReceiveBinderFormValues>({
    resolver: zodResolver(receiveBinderSchema),
    defaultValues: initialClient ? { ...getDefaultValues(), client_record_id: initialClient.id } : getDefaultValues(),
  })

  const clientRecordId: number | undefined = form.watch('client_record_id')
  const binderTypes = form.watch('binder_types') ?? []
  const businessId = form.watch('business_id')
  const periodMonthStart = form.watch('period_month_start')
  const selectedTypeKey = binderTypes.join('|')
  const hasVatMaterial = binderTypes.includes('vat')
  const hasSalaryMaterial = binderTypes.includes('salary')
  const hasAnnualReportMaterial = binderTypes.includes('annual_report')
  const hasPeriodicMaterial = binderTypes.some((type) => PERIODIC_BINDER_TYPES.has(type))
  const hasOnlyAnnualMaterials = binderTypes.length > 0 && binderTypes.every((type) => ANNUAL_BINDER_TYPES.has(type))

  const { data: businessesData } = useQuery({
    queryKey: clientsQK.businessesAll(clientRecordId!),
    queryFn: () => clientsApi.listAllBusinessesForClient(clientRecordId!),
    enabled: !!clientRecordId,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const businesses = useMemo(() => businessesData?.items ?? [], [businessesData?.items])

  useEffect(() => {
    resetBinderPeriodFields(form)

    if (!hasVatMaterial) {
      form.setValue('business_id', null, { shouldValidate: false })
      return
    }

    if (businesses.length === 1) {
      form.setValue('business_id', businesses[0].id, { shouldValidate: true })
    } else if (businesses.length === 0) {
      form.setValue('business_id', null, { shouldValidate: false })
    }
  }, [hasVatMaterial, businesses, form])

  useEffect(() => {
    resetBinderPeriodFields(form)
  }, [businessId, form])

  const { data: clientBindersData } = useQuery({
    queryKey: bindersQK.list({ client_record_id: clientRecordId, page_size: PAGE_SIZE_XS }),
    queryFn: () => bindersApi.list({ client_record_id: clientRecordId, page_size: PAGE_SIZE_XS }),
    enabled: !!clientRecordId,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const hasActiveBinder = (clientBindersData?.items ?? []).some((b) => b.location_status === 'in_office')

  const { data: clientProfile } = useQuery({
    queryKey: clientsQK.detail(clientRecordId!),
    queryFn: () => clientsApi.getById(clientRecordId!),
    enabled: typeof clientRecordId === 'number' && clientRecordId > 0,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const { data: annualReportsData } = useQuery({
    queryKey: annualReportsQK.forClient(typeof clientRecordId === 'number' ? clientRecordId : 0),
    queryFn: () => annualReportsApi.listClientReports(clientRecordId as number, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
    enabled: hasAnnualReportMaterial && typeof clientRecordId === 'number' && clientRecordId > 0,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const vatType: 'monthly' | 'bimonthly' | 'exempt' | null = clientProfile?.vat_reporting_frequency ?? null

  useEffect(() => {
    if (binderTypes.length === 0) return
    if (!hasPeriodicMaterial || hasOnlyAnnualMaterials) {
      form.setValue('period_month_start', 1, { shouldValidate: false })
      form.setValue('period_month_end', 12, { shouldValidate: false })
      return
    }

    if (periodMonthStart == null) {
      form.setValue('period_month_end', null, { shouldValidate: false })
      return
    }

    const monthEnd = hasVatMaterial && vatType === 'bimonthly' ? Math.min(periodMonthStart + 1, 12) : periodMonthStart
    form.setValue('period_month_end', monthEnd, { shouldValidate: false })
    if (hasVatMaterial && hasSalaryMaterial) {
      form.setValue('salary_month', monthEnd, { shouldValidate: false })
    }
  }, [
    selectedTypeKey,
    binderTypes.length,
    hasPeriodicMaterial,
    hasOnlyAnnualMaterials,
    hasVatMaterial,
    hasSalaryMaterial,
    periodMonthStart,
    vatType,
    form,
  ])

  const annualReports: AnnualReportListItem[] = annualReportsData ?? []

  const resetState = () => {
    form.reset(getDefaultValues())
    setClientQuery('')
    setSelectedClient(null)
  }

  const mutation = useMutation({
    mutationFn: async (values: ReceiveBinderFormValues) => {
      const selectedTypes = values.binder_types

      let vatReportId: number | null = null
      if (
        selectedTypes.includes('vat') &&
        values.client_record_id &&
        values.period_year &&
        values.period_month_start &&
        values.period_month_end
      ) {
        const lookup = await vatReportsApi.lookup(
          values.client_record_id,
          toBinderPeriodValue(values.period_year, values.period_month_start, values.period_month_end),
        )
        vatReportId = lookup?.id ?? null
      }

      return bindersApi.receive({
        client_record_id: values.client_record_id,
        received_at: values.received_at,
        received_by: userId!,
        open_new_binder: values.open_new_binder ?? false,
        notes: values.notes ?? null,
        materials: selectedTypes.map((materialType) => {
          const monthStart =
            ANNUAL_BINDER_TYPES.has(materialType) || !PERIODIC_BINDER_TYPES.has(materialType)
              ? 1
              : values.period_month_start
          const monthEnd =
            ANNUAL_BINDER_TYPES.has(materialType) || !PERIODIC_BINDER_TYPES.has(materialType)
              ? 12
              : materialType === 'vat'
                ? values.period_month_end
                : materialType === 'salary'
                  ? (values.salary_month ?? values.period_month_start)
                  : values.period_month_start

          return {
            material_type: materialType,
            business_id: materialType === 'vat' ? (values.business_id ?? null) : null,
            annual_report_id: materialType === 'annual_report' ? (values.annual_report_id ?? null) : null,
            vat_report_id: materialType === 'vat' ? vatReportId : null,
            period_year: values.period_year,
            period_month_start: monthStart ?? 1,
            period_month_end: monthEnd ?? monthStart ?? 1,
            description: null,
          }
        }),
      })
    },
    onSuccess: async (result, values) => {
      toast.success(result.is_new_binder ? 'קלסר חדש נפתח והחומר נקלט' : 'החומר נוסף לקלסר קיים')
      await queryClient.invalidateQueries({ queryKey: bindersQK.all })

      if (
        values.binder_types.includes('vat') &&
        values.client_record_id &&
        values.period_year &&
        values.period_month_start &&
        values.period_month_end
      ) {
        const period = toBinderPeriodValue(values.period_year, values.period_month_start, values.period_month_end)
        try {
          const existing = await vatReportsApi.lookup(values.client_record_id, period)
          if (existing) {
            toast.info('קיים דוח מע״מ לתקופה זו', {
              action: { label: 'פתח', onClick: () => navigate(`/tax/vat/${existing.id}`) },
            })
          } else {
            toast.info('לא קיים תיק מע"מ לתקופה זו', {
              action: {
                label: 'צור דוח מע״מ',
                onClick: () => navigate(`/tax/vat?create=1&client_id=${values.client_record_id}&period=${period}`),
              },
            })
          }
        } catch {
          // lookup failed — silently ignore
        }
      }

      resetState()
      onSuccess?.()
    },
    onError: (err) => {
      if (getHttpStatus(err) === 409) {
        toast.error(DUPLICATE_BINDER_NUMBER_MESSAGE)
        return
      }
      showErrorToast(err, 'שגיאה בקליטת חומר')
    },
  })

  const handleClientSelect = (client: {
    id: number
    name: string
    id_number: string
    client_status?: string | null
  }) => {
    setSelectedClient({ id: client.id, name: client.name, client_status: client.client_status })
    setClientQuery(client.name)
    form.setValue('client_record_id', client.id, { shouldValidate: true })
    resetBinderPeriodFields(form)
    form.setValue('business_id', undefined as unknown as number | null)
  }

  const handleClientQueryChange = (query: string) => {
    setClientQuery(query)
    if (selectedClient) {
      setSelectedClient(null)
      form.setValue('client_record_id', undefined as unknown as number)
      resetBinderPeriodFields(form)
      form.setValue('business_id', undefined as unknown as number | null)
    }
  }

  const handleReset = () => resetState()
  const handleSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return {
    form,
    clientQuery,
    selectedClient,
    businesses,
    annualReports,
    hasActiveBinder,
    vatType,
    isSubmitting: mutation.isPending,
    handleSubmit,
    handleClientSelect,
    handleClientQueryChange,
    handleReset,
  }
}
