import { Plus } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { ANNEX_TEXT, TABLE_ICON_CLASS } from '../../constants/annexTextConstants'

interface AnnexEmptyStateProps {
  onAdd: () => void
}

export const AnnexEmptyState: React.FC<AnnexEmptyStateProps> = ({ onAdd }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <p className="text-xs text-gray-500">{ANNEX_TEXT.noLines}</p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onAdd}
      icon={<Plus className={TABLE_ICON_CLASS} />}
    >
      {ANNEX_TEXT.addLine}
    </Button>
  </div>
)

AnnexEmptyState.displayName = 'AnnexEmptyState'
