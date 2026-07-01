import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { annualReportsApi, annualReportsQK, annualReportTaxApi } from '../api'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'
import { toReportDetailsPayload, toTaxInputValues, toTaxResultPayload } from '../utils/taxHelpers'

export const useTaxCalculationTab = (reportId: number) => {
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()
  const [pension, setPension] = useState('')
  const [otherCredits, setOtherCredits] = useState('')

  const {
    data: taxCalculationData,
    isLoading: taxCalculationLoading,
    isError: taxCalculationError,
  } = useQuery({
    queryKey: annualReportsQK.taxCalc(reportId),
    queryFn: () => annualReportTaxApi.getTaxCalculation(reportId),
    enabled: reportId > 0,
  })

  const {
    data: detailData,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
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
    onError: (error) => showErrorToast(error, ANNUAL_REPORTS_ERROR_MESSAGES.taxCalculation.detailSave),
  })

  const saveTaxResultMutation = useMutation({
    mutationFn: (payload: { tax_due?: string | null; refund_due?: string | null }) =>
      annualReportTaxApi.saveTaxCalculation(reportId, payload),
    onSuccess: async () => {
      toast.success('חישוב המס נשמר בהצלחה')
      await queryClient.invalidateQueries({ queryKey: annualReportsQK.readiness(reportId) })
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, ANNUAL_REPORTS_ERROR_MESSAGES.taxCalculation.calculationSave)),
  })

  const initializeInputs = () => {
    const values = toTaxInputValues(detailData)
    setPension(values.pension)
    setOtherCredits(values.otherCredits)
  }

  const saveInputs = () => {
    updateDetailsMutation.mutate(toReportDetailsPayload(pension, otherCredits))
  }

  const saveTaxResult = () => {
    const liabilityValue = taxCalculationData?.total_liability
    if (liabilityValue == null) return
    saveTaxResultMutation.mutate(toTaxResultPayload(Number(liabilityValue)))
  }

  return {
    data: taxCalculationData,
    isLoading: taxCalculationLoading || detailLoading,
    isError: taxCalculationError || detailError,
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
