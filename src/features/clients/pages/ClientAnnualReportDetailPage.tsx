import { GLOBAL_UI_MESSAGES } from '@/messages'
import { type FC } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout/PageContent'
import { AnnualReportFullPanel } from '@/features/annualReports'
import { CLIENT_ROUTES } from '../api/endpoints'
import { CLIENT_DETAILS_TAB_LABELS } from '../constants'
import { useClientQuery } from '../hooks/useClientQuery'
import { CLIENTS_MESSAGES } from '../messages'

/**
 * A single annual report opened from within a client's "annual-reports" tab.
 * Lives under /clients/:clientId/annual-reports/:reportId so the top nav keeps
 * לקוחות highlighted and the breadcrumb shows the full client-scoped chain.
 * The panel owns its own loading/error/header, so this page only resolves the
 * client name for the breadcrumb (falling back until the client query settles).
 */
export const ClientAnnualReportDetail: FC = () => {
  const { clientId, reportId } = useParams<{ clientId: string; reportId: string }>()
  const clientIdNum = clientId ? Number(clientId) : null
  const reportIdNum = Number(reportId)
  const { client, isValidId } = useClientQuery({ clientId: clientIdNum })

  if (!reportId || Number.isNaN(reportIdNum) || !isValidId) {
    return <Navigate to={clientId ? CLIENT_ROUTES.annualReports(clientId) : CLIENT_ROUTES.list} replace />
  }

  const clientName = client?.full_name ?? CLIENTS_MESSAGES.details.pageTitle

  return (
    <PageContent>
      <AnnualReportFullPanel
        reportId={reportIdNum}
        backPath={CLIENT_ROUTES.annualReports(clientId!)}
        leadingBreadcrumbs={[
          { label: GLOBAL_UI_MESSAGES.common.clients, to: CLIENT_ROUTES.list },
          { label: clientName, to: CLIENT_ROUTES.detail(clientId!) },
          {
            label: CLIENT_DETAILS_TAB_LABELS['annual-reports'],
            to: CLIENT_ROUTES.annualReports(clientId!),
          },
        ]}
      />
    </PageContent>
  )
}

ClientAnnualReportDetail.displayName = 'ClientAnnualReportDetail'
