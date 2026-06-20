import { DrawerField, DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { MonoValue } from '@/components/ui/primitives/MonoValue'
import type { BinderResponse } from '../../types'
import { getBinderCapacityStatusLabel, getBinderLocationStatusLabel } from '../../constants'
import { formatBinderNumber, formatClientOfficeId, formatDate, formatMonthYear } from '@/utils/utils'
import { BINDER_CAPACITY_STATUS_VARIANTS, BINDER_LOCATION_STATUS_VARIANTS } from '../../constants'

const formatPeriod = (start: string | null, end: string | null): string => {
  if (!start) return '—'
  return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : 'פעיל'}`
}

interface BinderDetailsPanelProps {
  binder: BinderResponse
}

export const BinderDetailsPanel: React.FC<BinderDetailsPanelProps> = ({ binder }) => {
  return (
    <>
      <DrawerSection title="פרטי קלסר">
        <DrawerField label="מספר קלסר" value={formatBinderNumber(binder.binder_number)} />
        <DrawerField
          label="לקוח"
          value={
            <Link to={`/clients/${binder.client_record_id}`} className="text-primary-600 hover:underline">
              {binder.client_name ?? `לקוח #${binder.client_record_id}`}
            </Link>
          }
        />
        <DrawerField
          label="מס' לקוח "
          value={binder.office_client_number != null ? formatClientOfficeId(binder.office_client_number) : '—'}
        />
        <DrawerField label="ת.ז / ח.פ" value={binder.client_id_number ?? '—'} />
        {(binder.period_start != null || binder.period_end != null) && (
          <DrawerField label="תקופה" value={formatPeriod(binder.period_start, binder.period_end)} />
        )}
        <DrawerField
          label="מיקום"
          value={
            <StatusBadge
              status={binder.location_status}
              getLabel={getBinderLocationStatusLabel}
              variantMap={BINDER_LOCATION_STATUS_VARIANTS}
            />
          }
        />
        <DrawerField
          label="קיבולת"
          value={
            <StatusBadge
              status={binder.capacity_status}
              getLabel={getBinderCapacityStatusLabel}
              variantMap={BINDER_CAPACITY_STATUS_VARIANTS}
            />
          }
        />
        {binder.handed_over_at && <DrawerField label="תאריך מסירה" value={formatDate(binder.handed_over_at)} />}
        {binder.handover_recipient_name && <DrawerField label="נמסר לידי" value={binder.handover_recipient_name} />}
        <DrawerField label="ימים במשרד" value={<MonoValue value={binder.days_in_office} format="days" />} />
      </DrawerSection>
    </>
  )
}

BinderDetailsPanel.displayName = 'BinderDetailsPanel'
