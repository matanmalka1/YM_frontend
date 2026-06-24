import { useMemo } from 'react'
import { AlertTriangle, History } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { InlineState } from '@/components/ui/feedback'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { AUDIT_ACTION_LABELS } from '../constants'
import type { EntityAuditType } from '../api'
import { useEntityAuditTrailSection } from '../hooks/useEntityAuditTrailSection'
import { EMPTY_FIELD_VALUE_LABELS, makeAuditFormatter, type FieldValueLabels } from '../utils/auditFormatters'
import { AuditTrailTable } from './AuditTrailTable'
import { AUDIT_MESSAGES } from '../messages'
import { AUDIT_ERROR_MESSAGES } from '../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
  title = AUDIT_MESSAGES.section.defaultTitle,
  subtitle = AUDIT_MESSAGES.section.defaultSubtitle,
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

  const renderState = (body: React.ReactNode) => (
    <Card title={title} subtitle={subtitle} className={cardClassName}>
      <div className="space-y-3">
        {filterPanel}
        {body}
      </div>
    </Card>
  )

  if (auditTrail.isPending) {
    return renderState(
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Spinner size="md" />
        <p className="text-sm text-gray-400">{GLOBAL_UI_MESSAGES.common.loading}</p>
      </div>,
    )
  }

  if (auditTrail.isError) {
    return renderState(
      <InlineState
        variant="error"
        icon={AlertTriangle}
        title={AUDIT_ERROR_MESSAGES.section.load}
        action={{ label: AUDIT_MESSAGES.section.retryAction, onClick: () => auditTrail.refetch() }}
      />,
    )
  }

  if (auditTrail.total === 0) {
    return renderState(
      <InlineState
        icon={History}
        title={auditTrail.hasActiveFilters ? AUDIT_MESSAGES.section.emptyFiltered : AUDIT_MESSAGES.section.emptyDefault}
      />,
    )
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
