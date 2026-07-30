// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReportMutations } from './useReportMutations'
import { annualReportsApi } from '../api'

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>()
  return {
    ...actual,
    annualReportsApi: { createAmendment: vi.fn(), withdrawAmendment: vi.fn() },
    annualReportStatusApi: { submitReport: vi.fn(), transitionStatus: vi.fn() },
  }
})
vi.mock('../../../utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedCreate = vi.mocked(annualReportsApi.createAmendment)
const mockedWithdraw = vi.mocked(annualReportsApi.withdrawAmendment)

type Report = Awaited<ReturnType<typeof annualReportsApi.createAmendment>>

const LocationProbe: React.FC<{ onChange: (pathname: string) => void }> = ({ onChange }) => {
  const { pathname } = useLocation()
  onChange(pathname)
  return null
}

const renderAt = (initialPath: string, routePath: string, reportId: number) => {
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

  return { ...renderHook(() => useReportMutations(reportId), { wrapper }), seen }
}

afterEach(cleanup)

describe('useReportMutations — amendment chain', () => {
  beforeEach(() => {
    mockedCreate.mockReset()
    mockedWithdraw.mockReset()
    mockedCreate.mockResolvedValue({ id: 34, amends_id: 12 } as Report)
    mockedWithdraw.mockResolvedValue({ id: 12, amends_id: null } as Report)
  })

  it('moves to the correction from the standalone screen', async () => {
    const { result, seen } = renderAt('/tax/reports/12', '/tax/reports/:reportId', 12)

    await act(async () => {
      await result.current.createAmendment()
    })

    expect(mockedCreate).toHaveBeenCalledWith(12)
    await waitFor(() => expect(seen.pathname).toBe('/tax/reports/34'))
  })

  it('stays inside the client tab when mounted there', async () => {
    const { result, seen } = renderAt('/clients/7/annual-reports/12', '/clients/:clientId/annual-reports/:reportId', 12)

    await act(async () => {
      await result.current.createAmendment()
    })

    await waitFor(() => expect(seen.pathname).toBe('/clients/7/annual-reports/34'))
  })

  it('returns to the restored original when the correction is withdrawn', async () => {
    const { result, seen } = renderAt('/tax/reports/34', '/tax/reports/:reportId', 34)

    await act(async () => {
      await result.current.withdrawAmendment()
    })

    await waitFor(() => expect(seen.pathname).toBe('/tax/reports/12'))
  })
})
