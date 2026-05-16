import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'

export const useDetailQuery = <TData>(
  queryKey: QueryKey,
  fetchFn: () => Promise<TData>,
  id: string | number | null | undefined,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn' | 'enabled'>,
) =>
  useQuery<TData>({
    queryKey,
    queryFn: fetchFn,
    enabled: !!id,
    ...options,
  })
