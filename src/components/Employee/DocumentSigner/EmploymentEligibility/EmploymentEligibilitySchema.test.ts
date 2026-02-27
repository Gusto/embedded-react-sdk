import { describe, expect, it } from 'vitest'
import { generateEmploymentEligibilitySchema } from './EmploymentEligibilitySchema'

describe('generateEmploymentEligibilitySchema', () => {
  const schema = generateEmploymentEligibilitySchema()
  const schemaWithExistingDoc = generateEmploymentEligibilitySchema(true)

  describe('citizen / noncitizen', () => {
    it('passes with just an authorization status', () => {
      expect(schema.safeParse({ authorizationStatus: 'citizen' }).success).toBe(true)
    })

    it('passes with noncitizen and no document fields', () => {
      expect(schema.safeParse({ authorizationStatus: 'noncitizen' }).success).toBe(true)
    })
  })

  describe('permanent_resident', () => {
    it('passes when documentNumber is provided', () => {
      expect(
        schema.safeParse({
          authorizationStatus: 'permanent_resident',
          documentNumber: 'A123456789',
        }).success,
      ).toBe(true)
    })

    it('fails when documentNumber is missing and no existing document', () => {
      const result = schema.safeParse({ authorizationStatus: 'permanent_resident' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['documentNumber'])
        expect(result.error.issues[0]?.message).toBe('Document number is required')
      }
    })

    it('passes when documentNumber is missing but hasDocumentNumber is true', () => {
      expect(
        schemaWithExistingDoc.safeParse({ authorizationStatus: 'permanent_resident' }).success,
      ).toBe(true)
    })

    it('still validates format when a new documentNumber is provided with hasDocumentNumber true', () => {
      const result = schemaWithExistingDoc.safeParse({
        authorizationStatus: 'permanent_resident',
        documentNumber: 'invalid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['documentNumber'])
      }
    })
  })

  describe('alien', () => {
    it('fails when documentType and documentNumber are missing', () => {
      const result = schema.safeParse({ authorizationStatus: 'alien' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('documentType')
        expect(paths).toContain('documentNumber')
      }
    })

    it('passes with uscis_alien_registration_number and documentNumber', () => {
      expect(
        schema.safeParse({
          authorizationStatus: 'alien',
          documentType: 'uscis_alien_registration_number',
          documentNumber: 'A987654321',
        }).success,
      ).toBe(true)
    })

    it('passes when documentNumber is missing but hasDocumentNumber is true', () => {
      expect(
        schemaWithExistingDoc.safeParse({
          authorizationStatus: 'alien',
          documentType: 'uscis_alien_registration_number',
        }).success,
      ).toBe(true)
    })

    it('fails for foreign_passport when country is missing', () => {
      const result = schema.safeParse({
        authorizationStatus: 'alien',
        documentType: 'foreign_passport',
        documentNumber: 'AB1234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['country'])
        expect(result.error.issues[0]?.message).toBe('Country of issuance is required')
      }
    })

    it('passes for foreign_passport when country is provided', () => {
      expect(
        schema.safeParse({
          authorizationStatus: 'alien',
          documentType: 'foreign_passport',
          documentNumber: 'AB1234567',
          country: 'Mexico',
        }).success,
      ).toBe(true)
    })
  })
})
