import { describe, expect, it } from 'vitest'
import { signatureRequestCreateFormSchema, toCreateSignatureRequestPayload } from './schemas'

const validValues = {
  client_record_id: 12,
  request_type: 'engagement_agreement' as const,
  title: 'הסכם התקשרות',
  description: 'תיאור',
  signer_name: 'ישראל ישראלי',
  signer_email: 'israel@example.com',
  signer_phone: ' 050-1234567 ',
}

describe('signature request create contract', () => {
  it('preserves a supplied signer phone in the API payload', () => {
    const parsed = signatureRequestCreateFormSchema.parse(validValues)
    expect(toCreateSignatureRequestPayload(parsed)).toMatchObject({ signer_phone: '050-1234567' })
  })

  it.each([
    [{ ...validValues, client_record_id: 0 }, 'client_record_id'],
    [{ ...validValues, title: 'ab' }, 'title'],
    [{ ...validValues, title: 'x'.repeat(201) }, 'title'],
    [{ ...validValues, signer_name: 'a' }, 'signer_name'],
    [{ ...validValues, signer_name: 'x'.repeat(101) }, 'signer_name'],
    [{ ...validValues, description: 'x'.repeat(2001) }, 'description'],
  ])('rejects a backend-invalid boundary for %s', (values, field) => {
    const result = signatureRequestCreateFormSchema.safeParse(values)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toContain(field)
  })

  it('accepts backend maximum lengths', () => {
    expect(
      signatureRequestCreateFormSchema.safeParse({
        ...validValues,
        title: 'x'.repeat(200),
        signer_name: 'x'.repeat(100),
        description: 'x'.repeat(2000),
      }).success,
    ).toBe(true)
  })
})
