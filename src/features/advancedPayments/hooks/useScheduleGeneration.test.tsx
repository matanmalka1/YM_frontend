// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { useScheduleGeneration } from './useScheduleGeneration'

afterEach(cleanup)

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

describe('useScheduleGeneration', () => {
  it('keeps reset stable across renders', () => {
    // GenerateScheduleModal puts reset in an effect's dependency list, and reset
    // notifies react-query. A new identity per render made that effect re-run on
    // its own output until React aborted the tree.
    const { result, rerender } = renderHook(() => useScheduleGeneration({ year: 2026, onGenerated: () => {} }), { wrapper })
    const first = result.current.reset

    rerender()

    expect(result.current.reset).toBe(first)
  })
})
