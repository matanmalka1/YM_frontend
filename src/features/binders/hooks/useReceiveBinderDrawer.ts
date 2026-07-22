import { GLOBAL_UI_MESSAGES } from '@/messages'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { bindersApi, bindersQK } from '../api'
import { annualReportsApi, annualReportsQK, type AnnualReportListItem } from '@/features/annualReports/api'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '@/features/annualReports/public'
import { clientsApi, clientsQK } from '@/features/clients/api'
import type { ClientStatus } from '@/features/clients/api'
import { vatReportsApi } from '@/features/vatReports/api'
import { useAuthStore } from '../../../store/auth.store'
import { toast } from '../../../utils/toast'
import { getHttpStatus, showErrorToast } from '../../../utils/utils'
import { receiveBinderSchema, type ReceiveBinderFormInput, type ReceiveBinderFormValues } from '../schemas'
import { toBinderPeriodValue } from '../utils'
import { buildReceiveBinderPayload, getReceiveBinderDefaultValues } from '../utils/receiveBinder'
import { PAGE_SIZE_XS } from '@/constants/pagination.constants'
import { ANNUAL_BINDER_TYPES, PERIODIC_BINDER_TYPES } from '../constants'
import { BINDERS_MESSAGES } from '../messages'
import { BINDERS_ERROR_MESSAGES } from '../errorMessages'

const resetBinderPeriodFields = (form: UseFormReturn<ReceiveBinderFormInput, unknown, ReceiveBinderFormValues>) => {
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
    client_status?: ClientStatus | null
  } | null>(initialClient ? { id: initialClient.id, name: initialClient.name } : null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)

  const form = useForm<ReceiveBinderFormInput, unknown, ReceiveBinderFormValues>({
    resolver: zodResolver(receiveBinderSchema),
    defaultValues: getReceiveBinderDefaultValues(initialClient?.id),
  })

  const clientRecordId: number | undefined = form.watch('client_record_id')
  const binderTypes = form.watch('binder_types') ?? []
  const hasVatMaterial = binderTypes.includes('vat')
  const hasSalaryMaterial = binderTypes.includes('salary')
  const hasAnnualReportMaterial = binderTypes.includes('annual_report')

  const { data: businessesData } = useQuery({
    queryKey: clientsQK.businessesAll(clientRecordId!),
    queryFn: () => clientsApi.listAllBusinessesForClient(clientRecordId!),
    enabled: !!clientRecordId,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const businesses = useMemo(() => businessesData?.items ?? [], [businessesData?.items])

  const { data: clientBindersData } = useQuery({
    queryKey: bindersQK.list({ client_record_id: clientRecordId, page_size: PAGE_SIZE_XS }),
    queryFn: () => bindersApi.list({ client_record_id: clientRecordId, page_size: PAGE_SIZE_XS }),
    enabled: !!clientRecordId,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const hasActiveBinder = (clientBindersData?.items ?? []).some((b) => b.location_status === 'in_office')

  const { data: clientProfile } = useQuery({
    queryKey: clientsQK.detail(clientRecordId!),
    queryFn: () => clientsApi.getById(clientRecordId!),
    enabled: typeof clientRecordId === 'number' && clientRecordId > 0,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const { data: annualReportsData } = useQuery({
    queryKey: annualReportsQK.forClient(typeof clientRecordId === 'number' ? clientRecordId : 0),
    queryFn: () => annualReportsApi.listClientReports(clientRecordId as number, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
    enabled: hasAnnualReportMaterial && typeof clientRecordId === 'number' && clientRecordId > 0,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const vatType: 'monthly' | 'bimonthly' | 'exempt' | null = clientProfile?.vat_reporting_frequency ?? null

  const annualReports: AnnualReportListItem[] = annualReportsData ?? []

  const resetState = () => {
    form.reset(getReceiveBinderDefaultValues(initialClient?.id))
    setClientQuery(initialClient?.name ?? '')
    setSelectedClient(initialClient ? { id: initialClient.id, name: initialClient.name } : null)
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

      if (userId == null) throw new Error(BINDERS_ERROR_MESSAGES.receive.receiveError)
      const result = await bindersApi.receive(buildReceiveBinderPayload(values, userId, vatReportId))
      return { result, vatReportId }
    },
    onSuccess: async ({ result, vatReportId }, values) => {
      toast.success(
        result.is_new_binder ? BINDERS_MESSAGES.receive.newBinderReceived : BINDERS_MESSAGES.receive.materialAddedToExisting,
      )
      await queryClient.invalidateQueries({ queryKey: bindersQK.all })

      if (
        values.binder_types.includes('vat') &&
        values.client_record_id &&
        values.period_year &&
        values.period_month_start &&
        values.period_month_end
      ) {
        const period = toBinderPeriodValue(values.period_year, values.period_month_start, values.period_month_end)
        if (vatReportId !== null) {
          toast.info(BINDERS_MESSAGES.receive.existingVatReport, {
            action: {
              label: GLOBAL_UI_MESSAGES.actions.open,
              onClick: () => navigate(`/tax/vat/${vatReportId}`),
            },
          })
        } else {
          toast.info(BINDERS_MESSAGES.receive.missingVatReport, {
            action: {
              label: BINDERS_MESSAGES.receive.createVatReport,
              onClick: () => navigate(`/tax/vat?create=1&client_id=${values.client_record_id}&period=${period}`),
            },
          })
        }
      }

      resetState()
      onSuccess?.()
    },
    onError: (err) => {
      if (getHttpStatus(err) === 409) {
        toast.error(BINDERS_ERROR_MESSAGES.receive.duplicateBinderNumber)
        return
      }
      showErrorToast(err, BINDERS_ERROR_MESSAGES.receive.receiveError)
    },
  })

  const handleClientSelect = (client: { id: number; name: string; id_number: string; client_status?: ClientStatus | null }) => {
    setSelectedClient({ id: client.id, name: client.name, client_status: client.client_status })
    setClientQuery(client.name)
    form.setValue('client_record_id', client.id, { shouldValidate: true })
    resetBinderPeriodFields(form)
    form.setValue('business_id', undefined)
  }

  const handleClientQueryChange = (query: string) => {
    setClientQuery(query)
    if (selectedClient) {
      setSelectedClient(null)
      form.setValue('client_record_id', undefined)
      resetBinderPeriodFields(form)
      form.setValue('business_id', undefined)
    }
  }

  const handleBinderTypesChange = (types: ReceiveBinderFormInput['binder_types']) => {
    form.setValue('binder_types', types, { shouldValidate: true })
    resetBinderPeriodFields(form)
    if (!types.includes('vat')) form.setValue('business_id', null, { shouldValidate: false })

    const periodic = types.some((type) => PERIODIC_BINDER_TYPES.has(type))
    const annualOnly = types.length > 0 && types.every((type) => ANNUAL_BINDER_TYPES.has(type))
    if (!periodic || annualOnly) {
      form.setValue('period_month_start', 1, { shouldValidate: false })
      form.setValue('period_month_end', 12, { shouldValidate: false })
    }
  }

  const handleBusinessChange = (business: number | null | undefined) => {
    form.setValue('business_id', business, { shouldValidate: true })
    resetBinderPeriodFields(form)
  }

  const handlePeriodMonthStartChange = (month: number | null) => {
    form.setValue('period_month_start', month, { shouldValidate: true })
    const monthEnd = month == null ? null : hasVatMaterial && vatType === 'bimonthly' ? Math.min(month + 1, 12) : month
    form.setValue('period_month_end', monthEnd, { shouldValidate: false })
    if (hasVatMaterial && hasSalaryMaterial) form.setValue('salary_month', monthEnd, { shouldValidate: false })
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
    handleBinderTypesChange,
    handleBusinessChange,
    handlePeriodMonthStartChange,
    handleReset,
  }
}
