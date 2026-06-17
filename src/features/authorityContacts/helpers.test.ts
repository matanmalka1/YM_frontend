import { describe, expect, it } from 'vitest'
import { authorityContactDefaults } from './schemas'
import { toAuthorityContactFormValues, toAuthorityContactPayload } from './helpers'
import type { AuthorityContactResponse } from './api'

describe('authority contact helpers', () => {
  it('maps an empty contact to form defaults', () => {
    expect(toAuthorityContactFormValues(null)).toBe(authorityContactDefaults)
  })

  it('maps nullable API fields to editable form strings', () => {
    const contact: AuthorityContactResponse = {
      id: 7,
      client_record_id: 42,
      contact_type: 'assessing_officer',
      name: 'פקיד שומה אילת',
      office: null,
      phone: '08-1234567',
      email: null,
      notes: 'הערה',
      created_at: '2026-06-17T08:00:00Z',
      updated_at: null,
    }

    expect(toAuthorityContactFormValues(contact)).toEqual({
      contact_type: 'assessing_officer',
      name: 'פקיד שומה אילת',
      office: '',
      phone: '08-1234567',
      email: '',
      notes: 'הערה',
    })
  })

  it('normalizes empty optional form fields to API nulls', () => {
    expect(
      toAuthorityContactPayload({
        contact_type: 'other',
        name: 'רשות אחרת',
        office: '',
        phone: '',
        email: '',
        notes: '',
      }),
    ).toEqual({
      contact_type: 'other',
      name: 'רשות אחרת',
      office: null,
      phone: null,
      email: null,
      notes: null,
    })
  })
})
