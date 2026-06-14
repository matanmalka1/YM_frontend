import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { annualReportsApi, annualReportsQK, annualReportTaxApi } from '../api'
import { toReportDetailsPayload, toTaxInputValues, toTaxResultPayload } from '../components/tax/helpers'

export const useTaxCalculationPanel = (reportId: number) => {
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()
  const [pension, setPension] = useState('')
  const [otherCredits, setOtherCredits] = useState('')

  const taxCalculationQuery = useQuery({
    queryKey: annualReportsQK.taxCalc(reportId),
    queryFn: () => annualReportTaxApi.getTaxCalculation(reportId),
    enabled: reportId > 0,
  })

  const detailQuery = useQuery({
    queryKey: annualReportsQK.detail(reportId),
    queryFn: () => annualReportsApi.getReport(reportId),
    enabled: reportId > 0,
  })

  const updateDetailsMutation = useMutation({
    mutationFn: (payload: Parameters<typeof annualReportsApi.patchReportDetails>[1]) =>
      annualReportsApi.patchReportDetails(reportId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: annualReportsQK.taxCalc(reportId) }),
        queryClient.invalidateQueries({ queryKey: annualReportsQK.detail(reportId) }),
      ])
    },
    onError: (error) => showErrorToast(error, 'שגיאה בשמירת נתוני דוח'),
  })

  const saveTaxResultMutation = useMutation({
    mutationFn: (payload: { tax_due?: string | null; refund_due?: string | null }) =>
      annualReportTaxApi.saveTaxCalculation(reportId, payload),
    onSuccess: async () => {
      toast.success('חישוב המס נשמר בהצלחה')
      await queryClient.invalidateQueries({ queryKey: annualReportsQK.readiness(reportId) })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'שגיאה בשמירת חישוב המס')),
  })

  const initializeInputs = () => {
    const values = toTaxInputValues(detailQuery.data)
    setPension(values.pension)
    setOtherCredits(values.otherCredits)
  }

  const saveInputs = () => {
    updateDetailsMutation.mutate(toReportDetailsPayload(pension, otherCredits))
  }

  const saveTaxResult = () => {
    const liabilityValue = taxCalculationQuery.data?.total_liability
    if (liabilityValue == null) return
    saveTaxResultMutation.mutate(toTaxResultPayload(Number(liabilityValue)))
  }

  return {
    data: taxCalculationQuery.data,
    isLoading: taxCalculationQuery.isLoading || detailQuery.isLoading,
    isError: taxCalculationQuery.isError || detailQuery.isError,
    isAdvisor,
    pension,
    otherCredits,
    setPension,
    setOtherCredits,
    initializeInputs,
    saveInputs,
    saveTaxResult,
    isSavingInputs: updateDetailsMutation.isPending,
    isSavingTaxResult: saveTaxResultMutation.isPending,
  }
}
