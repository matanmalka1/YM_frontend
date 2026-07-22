import type { ReceiveBinderPayload } from '../types'
import type { ReceiveBinderFormInput, ReceiveBinderFormValues } from '../schemas'
import { ANNUAL_BINDER_TYPES, PERIODIC_BINDER_TYPES } from '../constants'

export const getReceiveBinderDefaultValues = (clientRecordId?: number): ReceiveBinderFormInput => ({
  client_record_id: clientRecordId,
  business_id: undefined,
  binder_types: [],
  annual_report_id: null,
  open_new_binder: false,
  period_year: new Date().getFullYear(),
  period_month_start: null,
  period_month_end: null,
  salary_month: null,
  received_at: new Date().toISOString().slice(0, 10),
  notes: null,
})

export const buildReceiveBinderPayload = (
  values: ReceiveBinderFormValues,
  receivedBy: number,
  vatReportId: number | null,
): ReceiveBinderPayload => ({
  client_record_id: values.client_record_id,
  received_at: values.received_at,
  received_by: receivedBy,
  open_new_binder: values.open_new_binder ?? false,
  notes: values.notes ?? null,
  materials: values.binder_types.map((materialType) => {
    const annual = ANNUAL_BINDER_TYPES.has(materialType) || !PERIODIC_BINDER_TYPES.has(materialType)
    const monthStart = annual ? 1 : (values.period_month_start ?? 1)
    const monthEnd = annual
      ? 12
      : materialType === 'vat'
        ? (values.period_month_end ?? monthStart)
        : materialType === 'salary'
          ? (values.salary_month ?? monthStart)
          : monthStart

    return {
      material_type: materialType,
      business_id: materialType === 'vat' ? (values.business_id ?? null) : null,
      annual_report_id: materialType === 'annual_report' ? (values.annual_report_id ?? null) : null,
      vat_report_id: materialType === 'vat' ? vatReportId : null,
      period_year: values.period_year,
      period_month_start: monthStart,
      period_month_end: monthEnd,
      description: null,
    }
  }),
})
