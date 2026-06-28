import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { MonoValue } from '@/components/ui/primitives/MonoValue'
import type { BinderResponse } from '../../types'
import { getBinderCapacityStatusLabel, getBinderLocationStatusLabel } from '../../constants'
import { formatBinderNumber, formatClientOfficeId, formatDate, formatMonthYear } from '@/utils/utils'
import { BINDER_CAPACITY_STATUS_VARIANTS, BINDER_LOCATION_STATUS_VARIANTS } from '../../constants'
import { BINDERS_MESSAGES } from '../../messages'

const formatPeriod = (start: string | null, end: string | null): string => {
  if (!start) return '—'
  return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : BINDERS_MESSAGES.period.active}`
}

interface BinderDetailsPanelProps {
  binder: BinderResponse
}

export const BinderDetailsPanel: React.FC<BinderDetailsPanelProps> = ({ binder }) => {
  return (
    <>
      <DrawerSection title={BINDERS_MESSAGES.details.sectionTitle}>
        <DefinitionList
          layout="stacked"
          items={[
            { label: BINDERS_MESSAGES.details.binderNumber, value: formatBinderNumber(binder.binder_number) },
            {
              label: BINDERS_MESSAGES.details.client,
              value: (
                <Link to={`/clients/${binder.client_record_id}`} className="text-primary-600 hover:underline">
                  {binder.client_name ?? BINDERS_MESSAGES.details.clientFallback(binder.client_record_id)}
                </Link>
              ),
            },
            {
              label: BINDERS_MESSAGES.details.officeClientNumber,
              value: binder.office_client_number != null ? formatClientOfficeId(binder.office_client_number) : '—',
            },
            { label: BINDERS_MESSAGES.details.idNumber, value: binder.client_id_number ?? '—' },
            ...(binder.period_start != null || binder.period_end != null
              ? [
                  {
                    label: BINDERS_MESSAGES.details.period,
                    value: formatPeriod(binder.period_start, binder.period_end),
                  },
                ]
              : []),
            {
              label: BINDERS_MESSAGES.details.location,
              value: (
                <StatusBadge
                  status={binder.location_status}
                  getLabel={getBinderLocationStatusLabel}
                  variantMap={BINDER_LOCATION_STATUS_VARIANTS}
                />
              ),
            },
            {
              label: BINDERS_MESSAGES.details.capacity,
              value: (
                <StatusBadge
                  status={binder.capacity_status}
                  getLabel={getBinderCapacityStatusLabel}
                  variantMap={BINDER_CAPACITY_STATUS_VARIANTS}
                />
              ),
            },
            ...(binder.handed_over_at
              ? [{ label: BINDERS_MESSAGES.details.handedOverAt, value: formatDate(binder.handed_over_at) }]
              : []),
            ...(binder.handover_recipient_name
              ? [{ label: BINDERS_MESSAGES.details.handedOverTo, value: binder.handover_recipient_name }]
              : []),
            {
              label: BINDERS_MESSAGES.details.daysInOffice,
              value: <MonoValue value={binder.days_in_office} format="days" />,
            },
          ]}
        />
      </DrawerSection>
    </>
  )
}

BinderDetailsPanel.displayName = 'BinderDetailsPanel'
