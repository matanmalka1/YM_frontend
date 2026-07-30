// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdvancePaymentRow } from '../api/contracts'
import { useAdvancePaymentDetailPage } from './useAdvancePaymentDetailPage'
import { advancePaymentsApi } from '../api'

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>()
  return {
    ...actual,
    advancePaymentsApi: {
      getById: vi.fn(),
      getAnnualKPIs: vi.fn(),
      createAmendment: vi.fn(),
      withdrawAmendment: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      refreshTurnover: vi.fn(),
    },
  }
})
vi.mock('@/utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ role: 'advisor', isAdvisor: true, isSecretary: false, can: {} }),
}))

const mockedGetById = vi.mocked(advancePaymentsApi.getById)
const mockedGetKpis = vi.mocked(advancePaymentsApi.getAnnualKPIs)
const mockedCreate = vi.mocked(advancePaymentsApi.createAmendment)
const mockedWithdraw = vi.mocked(advancePaymentsApi.withdrawAmendment)

const createPayment = (overrides: Partial<AdvancePaymentRow> = {}): AdvancePaymentRow =>
  ({
    id: 12,
    client_record_id: 7,
    period: '2026-01',
    period_months_count: 1,
    status: 'submitted',
    amends_id: null,
    superseded_at: null,
    is_withdrawn: false,
    expected_amount: '0',
    paid_amount: '0',
    delta: '0',
    timing_status: 'on_time',
    ...overrides,
  }) as AdvancePaymentRow

const LocationProbe: React.FC<{ onChange: (pathname: string) => void }> = ({ onChange }) => {
  const { pathname } = useLocation()
  onChange(pathname)
  return null
}

const renderAt = (initialPath: string, routePath: string, backPath: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const seen = { pathname: initialPath }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path={routePath} element={<>{children}</>} />
        </Routes>
        <LocationProbe onChange={(pathname) => (seen.pathname = pathname)} />
      </MemoryRouter>
    </QueryClientProvider>
  )

  const rendered = renderHook(
    () =>
      useAdvancePaymentDetailPage({
        clientRecordId: 7,
        paymentId: 12,
        backPath,
        leadingBreadcrumbs: [],
      }),
    { wrapper },
  )
  return { ...rendered, seen }
}

afterEach(cleanup)

describe('useAdvancePaymentDetailPage — amendment chain', () => {
  beforeEach(() => {
    mockedGetById.mockReset()
    mockedGetKpis.mockReset()
    mockedCreate.mockReset()
    mockedWithdraw.mockReset()
    mockedGetById.mockResolvedValue(createPayment())
    mockedGetKpis.mockResolvedValue({} as Awaited<ReturnType<typeof advancePaymentsApi.getAnnualKPIs>>)
    mockedCreate.mockResolvedValue(createPayment({ id: 34, amends_id: 12, status: 'in_progress' }))
    mockedWithdraw.mockResolvedValue(createPayment({ id: 12 }))
  })

  it('offers "create amendment" on a closed payment that has no correction yet', async () => {
    const { result } = renderAt('/tax/advance-payments/7/12', '/tax/advance-payments/:clientId/:paymentId', '/tax/advance-payments')

    await waitFor(() => expect(result.current.payment).not.toBeNull())
    expect(result.current.actions.onCreateAmendment).toBeDefined()
    // The counterpart acts are withheld on exactly this record: it is locked.
    expect(result.current.actions.onDelete).toBeUndefined()
    expect(result.current.actions.onWithdraw).toBeUndefined()
  })

  it('withholds it on an open payment — an open obligation is corrected by editing it', async () => {
    mockedGetById.mockResolvedValue(createPayment({ status: 'in_progress' }))
    const { result } = renderAt('/tax/advance-payments/7/12', '/tax/advance-payments/:clientId/:paymentId', '/tax/advance-payments')

    await waitFor(() => expect(result.current.payment).not.toBeNull())
    expect(result.current.actions.onCreateAmendment).toBeUndefined()
  })

  it('withholds it on a payment that already has a correction — a chain is a line', async () => {
    mockedGetById.mockResolvedValue(createPayment({ superseded_at: '2026-02-01T00:00:00Z' }))
    const { result } = renderAt('/tax/advance-payments/7/12', '/tax/advance-payments/:clientId/:paymentId', '/tax/advance-payments')

    await waitFor(() => expect(result.current.payment).not.toBeNull())
    expect(result.current.actions.onCreateAmendment).toBeUndefined()
  })

  it('moves to the correction, keeping the client segment of the standalone route', async () => {
    const { result, seen } = renderAt(
      '/tax/advance-payments/7/12',
      '/tax/advance-payments/:clientId/:paymentId',
      '/tax/advance-payments',
    )

    await waitFor(() => expect(result.current.actions.onCreateAmendment).toBeDefined())
    await act(async () => {
      await result.current.actions.onCreateAmendment?.()
    })

    expect(mockedCreate).toHaveBeenCalledWith(7, 12)
    await waitFor(() => expect(seen.pathname).toBe('/tax/advance-payments/7/34'))
  })

  it('returns to the restored original on the standalone route, not to the list path', async () => {
    // Regression: this was built as `${backPath}/${id}`, and backPath here is the
    // list path — so the client segment was dropped and the route did not exist.
    mockedGetById.mockResolvedValue(createPayment({ id: 34, amends_id: 12, status: 'in_progress' }))
    const { result, seen } = renderAt(
      '/tax/advance-payments/7/34',
      '/tax/advance-payments/:clientId/:paymentId',
      '/tax/advance-payments?year=2026',
    )

    await waitFor(() => expect(result.current.actions.onWithdraw).toBeDefined())
    await act(async () => {
      await result.current.actions.onWithdraw?.()
    })

    await waitFor(() => expect(seen.pathname).toBe('/tax/advance-payments/7/12'))
  })

  it('stays inside the client tab when mounted there', async () => {
    const { result, seen } = renderAt(
      '/clients/7/advance-payments/12',
      '/clients/:clientId/advance-payments/:paymentId',
      '/clients/7/advance-payments',
    )

    await waitFor(() => expect(result.current.actions.onCreateAmendment).toBeDefined())
    await act(async () => {
      await result.current.actions.onCreateAmendment?.()
    })

    await waitFor(() => expect(seen.pathname).toBe('/clients/7/advance-payments/34'))
  })
})
