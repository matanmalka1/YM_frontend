import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignatureRequestAuditDrawer } from './SignatureRequestAuditDrawer'

const detailData = {
  id: 17,
  client_record_id: 101,
  office_client_number: 101,
  business_id: 22,
  business_name: 'עסק',
  created_by: 1,
  request_type: 'annual_report_approval',
  title: 'חתימה לדוח',
  description: null,
  signer_name: 'חותם בדיקה',
  signer_email: 'signer@example.com',
  signer_phone: null,
  status: 'signed',
  content_hash: null,
  storage_key: null,
  annual_report_id: 8,
  document_id: 9,
  created_at: '2026-01-01T08:00:00Z',
  updated_at: '2026-01-01T09:00:00Z',
  sent_at: '2026-01-01T08:05:00Z',
  expires_at: '2026-01-15T08:05:00Z',
  signed_at: '2026-01-01T09:00:00Z',
  declined_at: null,
  canceled_at: null,
  canceled_by: null,
  decline_reason: null,
  signed_document_key: null,
  audit_trail: [
    {
      id: 1,
      action: 'signature_request.created',
      actor_type: 'user',
      actor_display_name: 'יועץ',
      performed_at: '2026-01-01T08:00:00Z',
      note: 'נוצרה',
      client_record_id: 101,
      signer_name: 'חותם בדיקה',
      signer_email: 'signer@example.com',
      business_id: 22,
      annual_report_id: 8,
      document_id: 9,
      ip_address: null,
      user_agent: null,
      content_hash: null,
      content_hash_missing: null,
      signed_document_key: null,
      reason: null,
    },
    {
      id: 2,
      action: 'signature_request.signed',
      actor_type: 'external_signer',
      actor_display_name: 'חותם בדיקה',
      performed_at: '2026-01-01T09:00:00Z',
      note: 'נחתם',
      client_record_id: 101,
      signer_name: 'חותם בדיקה',
      signer_email: 'signer@example.com',
      business_id: 22,
      annual_report_id: 8,
      document_id: 9,
      ip_address: 'testclient',
      user_agent: 'signature-test/1.0',
      content_hash: null,
      content_hash_missing: true,
      signed_document_key: 'signed/report.pdf',
      reason: null,
    },
  ],
} as const

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

const { useQuery } = await import('@tanstack/react-query')
const mockedUseQuery = vi.mocked(useQuery)

describe('SignatureRequestAuditDrawer', () => {
  beforeEach(() => {
    mockedUseQuery.mockReturnValue({
      data: detailData,
      isLoading: false,
    } as ReturnType<typeof useQuery>)
  })

  it('renders new audit item fields in chronological order', () => {
    const html = renderToStaticMarkup(<SignatureRequestAuditDrawer requestId={17} onClose={() => undefined} />)

    expect(html.indexOf('נוצרה')).toBeLessThan(html.indexOf('נחתמה'))
    expect(html).toContain('חותם בדיקה')
    expect(html).toContain('testclient')
    expect(html).toContain('signature-test/1.0')
    expect(html).toContain('SHA-256')
    expect(html).toContain('לא זמין')
    expect(html).toContain('signed/report.pdf')
  })
})
