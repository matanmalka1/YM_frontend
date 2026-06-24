import { Card } from '@/components/ui/primitives/Card'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import type { FilterFieldDef } from '@/components/ui/filters/types'

type AuditTrailFilterCardProps = {
  fields: FilterFieldDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset: () => void
  className?: string
}

export const AuditTrailFilterCard: React.FC<AuditTrailFilterCardProps> = ({
  fields,
  values,
  onChange,
  onReset,
  className,
}) => (
  <Card className={className}>
    <FilterPanel fields={fields} values={values} onChange={onChange} onReset={onReset} />
  </Card>
)

AuditTrailFilterCard.displayName = 'AuditTrailFilterCard'
