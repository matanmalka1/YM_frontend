import { useParams, Navigate } from 'react-router-dom'
import { VatWorkItemFullPanel } from '../components/detail/VatWorkItemFullPanel'

export const VatWorkItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const numId = Number(id)
  if (!id || isNaN(numId) || numId <= 0) return <Navigate to="/tax/vat" replace />
  return <VatWorkItemFullPanel workItemId={numId} />
}
