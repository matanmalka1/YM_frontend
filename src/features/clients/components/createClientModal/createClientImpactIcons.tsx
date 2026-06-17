import { CreditCard, FileText, FolderOpen, ReceiptText, type LucideIcon } from 'lucide-react'

/** Maps a backend creation-impact item label to its icon; falls back to a generic document icon. */
const IMPACT_ICON_BY_LABEL: Record<string, LucideIcon> = {
  'קלסר פעיל': FolderOpen,
  'דוחות מע"מ': ReceiptText,
  'תשלומי מקדמות': CreditCard,
  'דוח שנתי': FileText,
}

export const ImpactIcon: React.FC<{ label: string }> = ({ label }) => {
  const Icon = IMPACT_ICON_BY_LABEL[label] ?? FileText
  return <Icon className="h-4 w-4" aria-hidden="true" />
}
