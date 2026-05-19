import { DrawerField, DrawerSection } from '@/components/ui/overlays/DetailDrawer'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { MonoValue } from '@/components/ui/primitives/MonoValue'
import type { BinderResponse } from '../../types'
import { getBinderStatusLabel } from '../../constants'
import { formatBinderNumber, formatClientOfficeId, formatDate, formatMonthYear } from '@/utils/utils'
import { BINDER_STATUS_VARIANTS } from '../../constants'

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
          label="סטטוס"
          value={
            <StatusBadge status={binder.status} getLabel={getBinderStatusLabel} variantMap={BINDER_STATUS_VARIANTS} />
          }
        />
        {binder.returned_at && <DrawerField label="תאריך החזרה" value={formatDate(binder.returned_at)} />}
        {binder.pickup_person_name && <DrawerField label="נאסף על ידי" value={binder.pickup_person_name} />}
        <DrawerField label="ימים במשרד" value={<MonoValue value={binder.days_in_office} format="days" />} />
      </DrawerSection>
    </>
  )
}

BinderDetailsPanel.displayName = 'BinderDetailsPanel'
