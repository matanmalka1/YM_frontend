import { useQuery } from '@tanstack/react-query'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage } from '@/utils/utils'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import { bindersApi, bindersQK } from '../api'
import { BINDERS_ERROR_MESSAGES } from '../errorMessages'

export const useClientBinders = (clientId: number) => {
  const { getPage, setPage } = useSearchParamFilters()
  const page = getPage()

  const {
    data: listData,
    isPending: loading,
    error: listError,
  } = useQuery({
    queryKey: bindersQK.forClientPage(clientId, page, PAGE_SIZE),
    queryFn: () => bindersApi.listClientBinders(clientId, { page, page_size: PAGE_SIZE }),
  })

  return {
    binders: listData?.items ?? [],
    total: listData?.total ?? 0,
    error: listError ? getErrorMessage(listError, BINDERS_ERROR_MESSAGES.page.loadError) : null,
    loading,
    page,
    pageSize: PAGE_SIZE,
    setPage,
  }
}
