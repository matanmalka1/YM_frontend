import { useMemo } from 'react'
import { DetailTabPanel } from '@/components/ui/layout'
import { PaginatedDataTable } from '@/components/ui/table'
import { useClientBinders } from '../../hooks/useClientBinders'
import { buildClientBinderColumns } from '../list/BindersColumns'
import { BINDERS_MESSAGES } from '../../messages'

interface ClientBindersTabProps {
  clientId: number
}

export const ClientBindersTab: React.FC<ClientBindersTabProps> = ({ clientId }) => {
  const { binders, total, error, loading, page, pageSize, setPage } = useClientBinders(clientId)

  const columns = useMemo(() => buildClientBinderColumns(), [])

  return (
    <DetailTabPanel title={BINDERS_MESSAGES.clientTab.title} subtitle={BINDERS_MESSAGES.clientTab.subtitle}>
      <PaginatedDataTable
        data={binders}
        columns={columns}
        error={error}
        getRowKey={(binder) => binder.id}
        isLoading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        label={BINDERS_MESSAGES.clientTab.title}
        onPageChange={setPage}
        emptyState={{
          title: BINDERS_MESSAGES.clientTab.emptyTitle,
          message: BINDERS_MESSAGES.clientTab.emptyMessage,
        }}
      />
    </DetailTabPanel>
  )
}

ClientBindersTab.displayName = 'ClientBindersTab'
