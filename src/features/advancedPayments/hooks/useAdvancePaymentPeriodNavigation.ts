import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentRow } from '../api/contracts'
import { getAdvancePaymentMonthLabel } from '../utils/advancePaymentComponentUtils'

const SIBLING_PAGE_SIZE = 24

export interface AdvancePaymentPeriodOption {
  id: number
  label: string
}

export const buildAdvancePaymentPeriodNavigation = (
  payments: AdvancePaymentRow[],
  currentPaymentId: number,
): {
  options: AdvancePaymentPeriodOption[]
  previousPaymentId: number | null
  nextPaymentId: number | null
} => {
  const siblings = [...payments].sort((first, second) => first.period.localeCompare(second.period) || first.id - second.id)
  const currentIndex = siblings.findIndex((payment) => payment.id === currentPaymentId)

  return {
    options: siblings.map((payment) => ({
      id: payment.id,
      label: `${getAdvancePaymentMonthLabel(payment.period, payment.period_months_count)} ${payment.period.slice(0, 4)}`,
    })),
    previousPaymentId: currentIndex > 0 ? (siblings[currentIndex - 1]?.id ?? null) : null,
    nextPaymentId: currentIndex >= 0 && currentIndex < siblings.length - 1 ? (siblings[currentIndex + 1]?.id ?? null) : null,
  }
}

export const useAdvancePaymentPeriodNavigation = (payment: AdvancePaymentRow) => {
  const navigate = useNavigate()
  const location = useLocation()
  const year = Number(payment.period.slice(0, 4))
  const params = {
    client_record_id: payment.client_record_id,
    year,
    page: 1,
    page_size: SIBLING_PAGE_SIZE,
  }
  const siblingsQuery = useQuery({
    queryKey: advancedPaymentsQK.list(params),
    queryFn: () => advancePaymentsApi.list(params),
    enabled: Number.isInteger(year),
  })
  const navigation = buildAdvancePaymentPeriodNavigation(siblingsQuery.data?.items ?? [], payment.id)

  const goToPayment = (paymentId: number) => {
    navigate(
      {
        pathname: location.pathname.replace(/\/[^/]+\/?$/, `/${paymentId}`),
        search: location.search,
      },
      { state: location.state },
    )
  }

  return {
    ...navigation,
    isLoading: siblingsQuery.isPending,
    isError: siblingsQuery.isError,
    goToPayment,
  }
}
