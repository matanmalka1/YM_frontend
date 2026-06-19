import { z, type ZodTypeAny } from 'zod'
import { SCHEDULE_FIELDS, type FieldDef } from './annexConstants'
import type { AnnualReportScheduleKey } from '../api'

const REQUIRED_MSG = 'שדה חובה'
const NUMBER_MSG = 'יש להזין מספר תקין'
const NONNEG_MSG = 'הערך חייב להיות אי שלילי'

const fieldToZod = (field: FieldDef): ZodTypeAny => {
  if (field.type === 'number') {
    return z.coerce.number({ message: NUMBER_MSG }).nonnegative(NONNEG_MSG)
  }
  return z.string().min(1, REQUIRED_MSG)
}

export const buildAnnexSchema = (schedule: AnnualReportScheduleKey) => {
  const shape: Record<string, ZodTypeAny> = {}
  for (const f of SCHEDULE_FIELDS[schedule]) shape[f.key] = fieldToZod(f)
  return z.object(shape)
}

export type AnnexFormValues = Record<string, unknown>

export const buildEmptyFormValues = (schedule: AnnualReportScheduleKey): AnnexFormValues =>
  Object.fromEntries(SCHEDULE_FIELDS[schedule].map((f) => [f.key, '']))

export const mapLineToFormValues = (
  schedule: AnnualReportScheduleKey,
  data: Record<string, unknown>,
): AnnexFormValues =>
  Object.fromEntries(SCHEDULE_FIELDS[schedule].map((f) => [f.key, data[f.key] == null ? '' : String(data[f.key])]))
