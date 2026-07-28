import { describe, expect, it } from 'vitest'
import type { Document } from '@gusto/embedded-api/models/components/document'
import { requiresSignature } from './documentSigningStatus'

function document(overrides: Partial<Document> = {}): Document {
  return {
    uuid: 'doc-1',
    name: 'contractor_handbook',
    title: 'Contractor handbook',
    ...overrides,
  }
}

describe('requiresSignature', () => {
  it('returns true when the document has not been signed', () => {
    expect(requiresSignature(document({ signedAt: undefined }))).toBe(true)
  })

  it('returns false when the document has been signed', () => {
    expect(requiresSignature(document({ signedAt: '2025-01-01T00:00:00Z' }))).toBe(false)
  })

  it('returns true even when requiresSigning is false, as long as signedAt is unset', () => {
    expect(requiresSignature(document({ requiresSigning: false, signedAt: undefined }))).toBe(true)
  })
})
