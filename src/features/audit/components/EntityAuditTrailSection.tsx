import { useMemo } from 'react'
import { AlertTriangle, History } from 'lucide-react'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { Card } from '@/components/ui/primitives/Card'
import { InlineState } from '@/components/ui/feedback'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { cn } from '@/utils/utils'
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

  const renderBody = () => {
    if (auditTrail.isPending) {
      return (
        <Card className={cardClassName}>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Spinner size="md" />
            <p className="text-sm text-gray-400">{GLOBAL_UI_MESSAGES.common.loading}</p>
          </div>
        </Card>
      )
    }

    if (auditTrail.isError) {
      return (
        <Card className={cardClassName}>
          <InlineState
            variant="error"
            icon={AlertTriangle}
            title={AUDIT_ERROR_MESSAGES.section.load}
            action={{ label: GLOBAL_UI_MESSAGES.actions.retry, onClick: () => auditTrail.refetch() }}
          />
        </Card>
      )
    }

    if (auditTrail.total === 0) {
      return (
        <Card className={cardClassName}>
          <InlineState
            icon={History}
            title={
              auditTrail.hasActiveFilters ? AUDIT_MESSAGES.section.emptyFiltered : AUDIT_MESSAGES.section.emptyDefault
            }
          />
        </Card>
      )
    }

    return (
      <AuditTrailTable
        items={auditTrail.items}
        actionLabels={AUDIT_ACTION_LABELS}
        formatDetails={formatAuditDetails}
        page={auditTrail.safePage}
        pageSize={auditTrail.pageSize}
        total={auditTrail.total}
        isFetching={auditTrail.isFetching}
        onPageChange={auditTrail.handlePageChange}
      />
    )
  }

  return (
    <div className="space-y-3">
      <Card
        title={title}
        subtitle={subtitle}
        className={cn(cardClassName, 'overflow-visible')}
        actions={
          <FilterPanel
            fields={auditTrail.filterFields}
            values={auditTrail.filterValues}
            onChange={auditTrail.handleFilterChange}
            onReset={auditTrail.handleFilterReset}
          />
        }
      />
      {renderBody()}
    </div>
  )
}

EntityAuditTrailSection.displayName = 'EntityAuditTrailSection'

export type { FieldValueLabels }
