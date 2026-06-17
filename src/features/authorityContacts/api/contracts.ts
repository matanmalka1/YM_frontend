export const AUTHORITY_CONTACT_TYPE_VALUES = ['assessing_officer', 'vat_branch', 'national_insurance', 'other'] as const

export type ContactType = (typeof AUTHORITY_CONTACT_TYPE_VALUES)[number]

export const AUTHORITY_CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  assessing_officer: 'פקיד שומה',
  vat_branch: 'סניף מע״מ',
  national_insurance: 'ביטוח לאומי',
  other: 'אחר',
}

export const AUTHORITY_CONTACT_TYPE_OPTIONS = AUTHORITY_CONTACT_TYPE_VALUES.map((value) => ({
  value,
  label: AUTHORITY_CONTACT_TYPE_LABELS[value],
}))

export interface AuthorityContactResponse {
  id: number
  client_record_id: number
  contact_type: ContactType
  name: string
  office: string | null
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export interface AuthorityContactsListParams {
  contact_type?: ContactType
  page: number
  page_size: number
}

export interface AuthorityContactCreatePayload {
  contact_type: ContactType
  name: string
  office?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
}

export interface AuthorityContactUpdatePayload {
  contact_type?: ContactType
  name?: string
  office?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
}
