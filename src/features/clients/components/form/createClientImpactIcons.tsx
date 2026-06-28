import { CreditCard, FileText, FolderOpen, ReceiptText, type LucideIcon } from 'lucide-react'
import { CLIENTS_MESSAGES } from '../../messages'

/** Maps a backend creation-impact item label to its icon; falls back to a generic document icon. */
const IMPACT_ICON_BY_LABEL: Record<string, LucideIcon> = {
  [CLIENTS_MESSAGES.createModal.impactIconActiveBinder]: FolderOpen,
  [CLIENTS_MESSAGES.createModal.impactIconVatReports]: ReceiptText,
  [CLIENTS_MESSAGES.createModal.impactIconAdvancePayments]: CreditCard,
  [CLIENTS_MESSAGES.createModal.impactIconAnnualReport]: FileText,
}

export const ImpactIcon: React.FC<{ label: string }> = ({ label }) => {
  const Icon = IMPACT_ICON_BY_LABEL[label] ?? FileText
  return <Icon className="h-4 w-4" aria-hidden="true" />
}
