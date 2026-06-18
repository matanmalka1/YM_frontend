import { useParams, useLocation, Navigate } from 'react-router-dom'
import { AnnualReportFullPanel } from '../components/panel/AnnualReportFullPanel'

export const AnnualReportDetail: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const { state } = useLocation()
  const id = Number(reportId)

  if (!reportId || isNaN(id)) return <Navigate to="/tax/reports" replace />

  const backPath = (state as { from?: string } | null)?.from ?? '/tax/reports'

  return <AnnualReportFullPanel reportId={id} backPath={backPath} />
}
