import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import {
  ContractorType,
  WageType,
  ContractorDetailsErrorCodes,
  createContractorDetailsSchema,
  deriveContractorApplicability,
} from './contractorDetailsSchema'

/**
 * Schema-level cross-check of the contractor details requiredness contract.
 *
 * The hook derives `excludeFields` from the watched discriminators and feeds it
 * into the schema, so each scenario here does the same via
 * `deriveContractorApplicability` — building exactly the schema the hook builds.
 * The hook's baseline mirrors the API (ssn/ein optional; create-required fields
 * optional on update); `optionalFieldsToRequire` is exercised where a consumer
 * (e.g. ContractorProfile) tightens beyond it.
 */

type SchemaOptions = NonNullable<Parameters<typeof createContractorDetailsSchema>[0]>

const parse = (values: Record<string, unknown>, options: SchemaOptions = {}) => {
  const { excludeFields } = deriveContractorApplicability(
    values as Parameters<typeof deriveContractorApplicability>[0],
  )
  const [schema] = createContractorDetailsSchema({ ...options, excludeFields })
  return schema.safeParse(values)
}

type ParseResult = ReturnType<typeof parse>

const issueFor = (result: ParseResult, field: string): z.core.$ZodIssue | undefined => {
  if (result.success) return undefined
  return result.error.issues.find(issue => issue.path.includes(field))
}

const startDate = '2024-02-01'

const validIndividualEmployerLed = {
  type: ContractorType.Individual,
  wageType: WageType.Fixed,
  startDate,
  selfOnboarding: false,
  fileNewHireReport: false,
  firstName: 'John',
  lastName: 'Doe',
  ssn: '123-45-6789',
}

const validIndividualSelfOnboarding = {
  type: ContractorType.Individual,
  wageType: WageType.Fixed,
  startDate,
  selfOnboarding: true,
  fileNewHireReport: false,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
}

const validBusinessEmployerLed = {
  type: ContractorType.Business,
  wageType: WageType.Fixed,
  startDate,
  selfOnboarding: false,
  fileNewHireReport: false,
  businessName: 'Acme LLC',
  ein: '12-3456789',
}

const validBusinessSelfOnboarding = {
  type: ContractorType.Business,
  wageType: WageType.Fixed,
  startDate,
  selfOnboarding: true,
  fileNewHireReport: false,
  businessName: 'Acme LLC',
  email: 'billing@acme.com',
}

const { REQUIRED, INVALID_NAME, INVALID_EMAIL, INVALID_SSN, INVALID_EIN } =
  ContractorDetailsErrorCodes

describe('createContractorDetailsSchema', () => {
  describe('Individual, employer-led (selfOnboarding: false)', () => {
    it('accepts a fully valid individual contractor', () => {
      expect(parse(validIndividualEmployerLed, { mode: 'create' }).success).toBe(true)
    })

    it('requires firstName on create', () => {
      const result = parse({ ...validIndividualEmployerLed, firstName: '' }, { mode: 'create' })
      expect(issueFor(result, 'firstName')?.message).toBe(REQUIRED)
    })

    it('requires lastName on create', () => {
      const result = parse({ ...validIndividualEmployerLed, lastName: '' }, { mode: 'create' })
      expect(issueFor(result, 'lastName')?.message).toBe(REQUIRED)
    })

    it('makes firstName optional on update by default', () => {
      const result = parse({ ...validIndividualEmployerLed, firstName: '' }, { mode: 'update' })
      expect(result.success).toBe(true)
    })

    it('rejects a malformed firstName', () => {
      const result = parse(
        { ...validIndividualEmployerLed, firstName: 'John123' },
        { mode: 'create' },
      )
      expect(issueFor(result, 'firstName')?.message).toBe(INVALID_NAME)
    })

    it('treats ssn as optional by default (API contract)', () => {
      const result = parse({ ...validIndividualEmployerLed, ssn: '' }, { mode: 'create' })
      expect(result.success).toBe(true)
    })

    it.each([
      ['too short', '123-45-678'],
      ['contains letters', '12a-45-6789'],
      ['reserved area number', '666-45-6789'],
    ])('still validates ssn format when present (%s)', (_label, ssn) => {
      const result = parse({ ...validIndividualEmployerLed, ssn }, { mode: 'create' })
      expect(issueFor(result, 'ssn')?.message).toBe(INVALID_SSN)
    })

    it('does not require businessName or ein for an individual', () => {
      expect(parse(validIndividualEmployerLed, { mode: 'create' }).success).toBe(true)
    })
  })

  describe('ssn promoted to required via optionalFieldsToRequire', () => {
    it('requires ssn on create when promoted', () => {
      const result = parse(
        { ...validIndividualEmployerLed, ssn: '' },
        { mode: 'create', optionalFieldsToRequire: { create: ['ssn'] } },
      )
      expect(issueFor(result, 'ssn')?.message).toBe(REQUIRED)
    })

    it('waives the promoted ssn requirement when one is on file', () => {
      const result = parse(
        { ...validIndividualEmployerLed, ssn: '' },
        { mode: 'create', hasSsn: true, optionalFieldsToRequire: { create: ['ssn'] } },
      )
      expect(result.success).toBe(true)
    })
  })

  describe('Individual, self-onboarding (selfOnboarding: true)', () => {
    it('does not require ssn (field excluded)', () => {
      const result = parse({ ...validIndividualSelfOnboarding, ssn: '' }, { mode: 'create' })
      expect(result.success).toBe(true)
    })

    it('requires email on create', () => {
      const result = parse({ ...validIndividualSelfOnboarding, email: '' }, { mode: 'create' })
      expect(issueFor(result, 'email')?.message).toBe(REQUIRED)
    })

    it('requires email on update too', () => {
      const result = parse({ ...validIndividualSelfOnboarding, email: '' }, { mode: 'update' })
      expect(issueFor(result, 'email')?.message).toBe(REQUIRED)
    })

    it('rejects a malformed email', () => {
      const result = parse(
        { ...validIndividualSelfOnboarding, email: 'not-an-email' },
        { mode: 'create' },
      )
      expect(issueFor(result, 'email')?.message).toBe(INVALID_EMAIL)
    })
  })

  describe('Business, employer-led (selfOnboarding: false)', () => {
    it('accepts a fully valid business contractor', () => {
      expect(parse(validBusinessEmployerLed, { mode: 'create' }).success).toBe(true)
    })

    it('requires businessName on create', () => {
      const result = parse({ ...validBusinessEmployerLed, businessName: '' }, { mode: 'create' })
      expect(issueFor(result, 'businessName')?.message).toBe(REQUIRED)
    })

    it('treats ein as optional by default (API contract)', () => {
      const result = parse({ ...validBusinessEmployerLed, ein: '' }, { mode: 'create' })
      expect(result.success).toBe(true)
    })

    it('requires ein on create when promoted', () => {
      const result = parse(
        { ...validBusinessEmployerLed, ein: '' },
        { mode: 'create', optionalFieldsToRequire: { create: ['ein'] } },
      )
      expect(issueFor(result, 'ein')?.message).toBe(REQUIRED)
    })

    it.each([
      ['too short', '12-345'],
      ['only two digits', '12'],
    ])('still validates ein format when present (%s)', (_label, ein) => {
      const result = parse({ ...validBusinessEmployerLed, ein }, { mode: 'create' })
      expect(issueFor(result, 'ein')?.message).toBe(INVALID_EIN)
    })

    it('does not require firstName, lastName, or ssn for a business', () => {
      expect(parse(validBusinessEmployerLed, { mode: 'create' }).success).toBe(true)
    })
  })

  describe('Business with existing EIN promoted (hasEin: true)', () => {
    it('waives the promoted ein requirement', () => {
      const result = parse(
        { ...validBusinessEmployerLed, ein: '' },
        { mode: 'create', hasEin: true, optionalFieldsToRequire: { create: ['ein'] } },
      )
      expect(result.success).toBe(true)
    })
  })

  describe('Business, self-onboarding (selfOnboarding: true)', () => {
    it('does not require ein (field excluded)', () => {
      const result = parse({ ...validBusinessSelfOnboarding, ein: '' }, { mode: 'create' })
      expect(result.success).toBe(true)
    })

    it('requires email', () => {
      const result = parse({ ...validBusinessSelfOnboarding, email: '' }, { mode: 'create' })
      expect(issueFor(result, 'email')?.message).toBe(REQUIRED)
    })
  })

  describe('Wage type', () => {
    it('requires hourlyRate on create when wageType is Hourly', () => {
      const result = parse(
        { ...validIndividualEmployerLed, wageType: WageType.Hourly, hourlyRate: undefined },
        { mode: 'create' },
      )
      expect(issueFor(result, 'hourlyRate')?.message).toBe(REQUIRED)
    })

    it('rejects a negative hourlyRate', () => {
      const result = parse(
        { ...validIndividualEmployerLed, wageType: WageType.Hourly, hourlyRate: -5 },
        { mode: 'create' },
      )
      expect(issueFor(result, 'hourlyRate')).toBeDefined()
    })

    it('accepts a zero hourlyRate when wageType is Hourly', () => {
      const result = parse(
        { ...validIndividualEmployerLed, wageType: WageType.Hourly, hourlyRate: 0 },
        { mode: 'create' },
      )
      expect(result.success).toBe(true)
    })

    it('ignores hourlyRate when wageType is Fixed (field excluded)', () => {
      const result = parse(
        { ...validIndividualEmployerLed, wageType: WageType.Fixed, hourlyRate: undefined },
        { mode: 'create' },
      )
      expect(result.success).toBe(true)
    })
  })

  describe('Cross-cutting required fields', () => {
    it('requires startDate on create', () => {
      const result = parse({ ...validIndividualEmployerLed, startDate: '' }, { mode: 'create' })
      expect(issueFor(result, 'startDate')?.message).toBe(REQUIRED)
    })

    it('does not require startDate on update by default', () => {
      const result = parse({ ...validIndividualEmployerLed, startDate: '' }, { mode: 'update' })
      expect(result.success).toBe(true)
    })

    it('promotes startDate to required on update via optionalFieldsToRequire', () => {
      const result = parse(
        { ...validIndividualEmployerLed, startDate: '' },
        { mode: 'update', optionalFieldsToRequire: { update: ['startDate'] } },
      )
      expect(issueFor(result, 'startDate')?.message).toBe(REQUIRED)
    })

    it('rejects an unknown contractor type', () => {
      const result = parse({ ...validIndividualEmployerLed, type: 'Robot' }, { mode: 'create' })
      expect(issueFor(result, 'type')).toBeDefined()
    })

    it('rejects an unknown wage type', () => {
      const result = parse(
        { ...validIndividualEmployerLed, wageType: 'Salary' },
        { mode: 'create' },
      )
      expect(issueFor(result, 'wageType')).toBeDefined()
    })
  })

  describe('Work state (new-hire report)', () => {
    it('requires workState on create when an individual files a new-hire report', () => {
      const result = parse(
        { ...validIndividualEmployerLed, fileNewHireReport: true, workState: '' },
        { mode: 'create' },
      )
      expect(issueFor(result, 'workState')?.message).toBe(REQUIRED)
    })

    it('does not require workState when the new-hire report is off (field excluded)', () => {
      const result = parse(
        { ...validIndividualEmployerLed, fileNewHireReport: false, workState: '' },
        { mode: 'create' },
      )
      expect(result.success).toBe(true)
    })
  })
})
