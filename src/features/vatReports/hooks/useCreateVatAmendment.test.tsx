// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateVatAmendment } from './useCreateVatAmendment'
import { vatReportsApi } from '../api'
import { vatReportsQK } from '../api/queryKeys'

vi.mock('../api', () => ({
  vatReportsApi: { createAmendment: vi.fn() },
}))
vi.mock('@/utils/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedCreate = vi.mocked(vatReportsApi.createAmendment)

const AMENDMENT = { id: 34, client_record_id: 7 } as Awaited<ReturnType<typeof vatReportsApi.createAmendment>>

const renderAt = (initialPath: string, routePath: string, workItemId: number) => {
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

  return { ...renderHook(() => useCreateVatAmendment(workItemId), { wrapper }), queryClient, seen }
}

const LocationProbe: React.FC<{ onChange: (pathname: string) => void }> = ({ onChange }) => {
  const { pathname } = useLocation()
  onChange(pathname)
  return null
}

afterEach(cleanup)

describe('useCreateVatAmendment', () => {
  beforeEach(() => {
    mockedCreate.mockReset()
    mockedCreate.mockResolvedValue(AMENDMENT)
  })

  it('moves to the correction from the standalone screen', async () => {
    // The record left behind is filed and locked (D-13), so staying on it lands
    // the advisor on the one screen where the corrected figures cannot be typed.
    const { result, seen } = renderAt('/tax/vat/12', '/tax/vat/:id', 12)

    await act(async () => {
      await result.current.createAmendment()
    })

    await waitFor(() => expect(seen.pathname).toBe('/tax/vat/34'))
  })

  it('stays inside the client tab when mounted there', async () => {
    const { result, seen } = renderAt('/clients/7/vat/12', '/clients/:clientId/vat/:workItemId', 12)

    await act(async () => {
      await result.current.createAmendment()
    })

    await waitFor(() => expect(seen.pathname).toBe('/clients/7/vat/34'))
  })

  it('invalidates both chains, which no other key covers', async () => {
    const { result, queryClient } = renderAt('/tax/vat/12', '/tax/vat/:id', 12)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await act(async () => {
      await result.current.createAmendment()
    })

    const keys = invalidate.mock.calls.map(([args]) => JSON.stringify(args?.queryKey))
    expect(keys).toContain(JSON.stringify(vatReportsQK.chain(12)))
    expect(keys).toContain(JSON.stringify(vatReportsQK.chain(34)))
  })
})
