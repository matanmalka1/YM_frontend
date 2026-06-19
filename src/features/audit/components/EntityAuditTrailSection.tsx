import { useMemo } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { AUDIT_ACTION_LABELS } from '../constants'
import type { EntityAuditType } from '../api'
import { useEntityAuditTrailSection } from '../hooks/useEntityAuditTrailSection'
import { EMPTY_FIELD_VALUE_LABELS, makeAuditFormatter, type FieldValueLabels } from '../utils/auditFormatters'
import { AuditTrailTable } from './AuditTrailTable'

type EntityAuditTrailSectionProps = {
  entityType: EntityAuditType
  entityId: number
  title?: string
  subtitle?: string
  compact?: boolean
  fieldValueLabels?: FieldValueLabels
}

export const EntityAuditTrailSection: React.FC<EntityAuditTrailSectionProps> = ({
  entityType,
  entityId,
  title = 'היסטוריית שינויים',
  subtitle = 'פעולות שבוצעו על הרשומה',
  compact = false,
  fieldValueLabels = EMPTY_FIELD_VALUE_LABELS,
}) => {
  const formatAuditDetails = useMemo(() => makeAuditFormatter(fieldValueLabels), [fieldValueLabels])
  const auditTrail = useEntityAuditTrailSection(entityType, entityId)
  const cardClassName = compact ? 'shadow-none rounded-lg' : 'shadow-sm'

  const filterPanel = (
    <FilterPanel
      fields={auditTrail.filterFields}
      values={auditTrail.filterValues}
      onChange={auditTrail.handleFilterChange}
      onReset={auditTrail.handleFilterReset}
      gridClass="grid-cols-1 sm:grid-cols-2"
    />
  )

  const renderState = (message: string, className = 'text-gray-400', action?: React.ReactNode) => (
    <Card title={title} subtitle={subtitle} className={cardClassName}>
      <div className="space-y-3">
        {filterPanel}
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className={`text-sm ${className}`}>{message}</p>
          {action}
        </div>
      </div>
    </Card>
  )

  if (auditTrail.isPending) {
    return renderState('טוען...')
  }

  if (auditTrail.isError) {
    return renderState(
      'שגיאה בטעינת ההיסטוריה',
      'text-negative-600',
      <Button type="button" variant="outline" size="sm" onClick={() => auditTrail.refetch()}>
        נסה שוב
      </Button>,
    )
  }

  if (auditTrail.total === 0) {
    return renderState(auditTrail.hasActiveFilters ? 'אין תוצאות התואמות את הסינון' : 'אין היסטוריית שינויים')
  }

  return (
    <Card title={title} subtitle={subtitle} className={cardClassName}>
      <div className="space-y-3">
        {filterPanel}
        <AuditTrailTable
          items={auditTrail.items}
          actionLabels={AUDIT_ACTION_LABELS}
          formatDetails={formatAuditDetails}
          totalPages={auditTrail.totalPages}
          maxPage={auditTrail.maxPage}
          safePage={auditTrail.safePage}
          isFetching={auditTrail.isFetching}
          setPage={auditTrail.handlePageChange}
        />
      </div>
    </Card>
  )
}

EntityAuditTrailSection.displayName = 'EntityAuditTrailSection'

export type { FieldValueLabels }
