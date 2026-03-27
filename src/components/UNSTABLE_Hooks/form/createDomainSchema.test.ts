import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createDomainSchema, type DomainSchemaConfig } from './createDomainSchema'

const fieldDefinitions = {
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  email: z.string(),
  selfOnboarding: z.boolean(),
}

const simpleConfig: DomainSchemaConfig<typeof fieldDefinitions> = {
  fieldDefinitions,
  requiredFieldsConfig: {
    requiredMessageCode: 'REQUIRED',
    partnerConfigurableFields: ['firstName', 'middleName', 'lastName', 'email'],
    apiRequired: {
      create: ['firstName', 'lastName'],
      update: [],
    },
  },
}

describe('createDomainSchema', () => {
  describe('Layer 2: required fields config', () => {
    it('makes apiRequired fields required on create', () => {
      const { schema } = createDomainSchema(simpleConfig, { mode: 'create' })
      const result = schema.safeParse({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        selfOnboarding: false,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('firstName')
        expect(paths).toContain('lastName')
      }
    })

    it('uses requiredMessageCode for required field errors', () => {
      const { schema } = createDomainSchema(simpleConfig, { mode: 'create' })
      const result = schema.safeParse({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        selfOnboarding: false,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const firstNameIssue = result.error.issues.find(i => i.path[0] === 'firstName')
        expect(firstNameIssue?.message).toBe('REQUIRED')
      }
    })

    it('makes apiRequired fields optional on update', () => {
      const { schema } = createDomainSchema(simpleConfig, { mode: 'update' })
      const result = schema.safeParse({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        selfOnboarding: false,
      })

      expect(result.success).toBe(true)
    })

    it('allows partners to add required fields additively', () => {
      const { schema } = createDomainSchema(simpleConfig, {
        mode: 'update',
        requiredFields: ['email'],
      })

      const result = schema.safeParse({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        selfOnboarding: false,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0])
        expect(paths).toContain('email')
        expect(paths).not.toContain('firstName')
      }
    })

    it('validates partner-required fields that are otherwise optional', () => {
      const { schema } = createDomainSchema(simpleConfig, {
        mode: 'update',
        requiredFields: ['middleName'],
      })

      const result = schema.safeParse({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        selfOnboarding: false,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const middleNameIssue = result.error.issues.find(i => i.path[0] === 'middleName')
        expect(middleNameIssue?.message).toBe('REQUIRED')
      }
    })
  })

  describe('fieldsMetadata', () => {
    it('marks apiRequired fields as required for the current mode', () => {
      const { fieldsMetadata } = createDomainSchema(simpleConfig, { mode: 'create' })

      expect(fieldsMetadata.firstName.isRequired).toBe(true)
      expect(fieldsMetadata.lastName.isRequired).toBe(true)
      expect(fieldsMetadata.middleName.isRequired).toBe(false)
      expect(fieldsMetadata.email.isRequired).toBe(false)
    })

    it('does not mark internal fields as required in metadata', () => {
      const { fieldsMetadata } = createDomainSchema(simpleConfig, { mode: 'create' })

      expect(fieldsMetadata.selfOnboarding.isRequired).toBe(false)
    })

    it('reflects partner-required fields', () => {
      const { fieldsMetadata } = createDomainSchema(simpleConfig, {
        mode: 'update',
        requiredFields: ['email'],
      })

      expect(fieldsMetadata.email.isRequired).toBe(true)
      expect(fieldsMetadata.firstName.isRequired).toBe(false)
    })

    it('includes all field names', () => {
      const { fieldsMetadata } = createDomainSchema(simpleConfig, { mode: 'create' })

      expect(Object.keys(fieldsMetadata)).toEqual(
        expect.arrayContaining(['firstName', 'middleName', 'lastName', 'email', 'selfOnboarding']),
      )
      for (const key of Object.keys(fieldsMetadata)) {
        expect(fieldsMetadata[key as keyof typeof fieldsMetadata].name).toBe(key)
      }
    })
  })

  describe('Layer 3: field transforms', () => {
    it('applies preprocessing transforms to specified fields', () => {
      const transformFieldDefs = {
        amount: z.number(),
        active: z.boolean(),
      }

      const config: DomainSchemaConfig<typeof transformFieldDefs> = {
        fieldDefinitions: transformFieldDefs,
        requiredFieldsConfig: {
          requiredMessageCode: 'REQUIRED',
          partnerConfigurableFields: ['amount'],
          apiRequired: { create: ['amount'], update: [] },
        },
        fieldTransforms: {
          amount: (val: unknown) =>
            val === undefined || val === null || Number.isNaN(val) ? 0 : val,
        },
      }

      const { schema } = createDomainSchema(config, { mode: 'create' })
      const result = schema.safeParse({ amount: NaN, active: true })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(0)
      }
    })
  })

  describe('Layer 4a: conditional requirements (declarative)', () => {
    const configWithConditional: DomainSchemaConfig<typeof fieldDefinitions> = {
      ...simpleConfig,
      conditionalRequirements: [
        {
          when: { field: 'selfOnboarding', is: true },
          then: { require: 'email', message: 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING' },
        },
      ],
    }

    it('validates conditionally required field when condition is met', () => {
      const { schema } = createDomainSchema(configWithConditional, { mode: 'create' })
      const result = schema.safeParse({
        firstName: 'Jane',
        middleName: '',
        lastName: 'Doe',
        email: '',
        selfOnboarding: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.error.issues.find(i => i.path[0] === 'email')
        expect(emailIssue?.message).toBe('EMAIL_REQUIRED_FOR_SELF_ONBOARDING')
      }
    })

    it('skips conditional validation when condition is not met', () => {
      const { schema } = createDomainSchema(configWithConditional, { mode: 'create' })
      const result = schema.safeParse({
        firstName: 'Jane',
        middleName: '',
        lastName: 'Doe',
        email: '',
        selfOnboarding: false,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Layer 4a: conditional requirements (function predicate)', () => {
    const contractorFieldDefs = {
      contractorType: z.enum(['Individual', 'Business']),
      selfOnboarding: z.boolean(),
      firstName: z.string(),
      lastName: z.string(),
      ssn: z.string(),
    }

    it('supports function predicates for complex conditions', () => {
      const config: DomainSchemaConfig<typeof contractorFieldDefs> = {
        fieldDefinitions: contractorFieldDefs,
        requiredFieldsConfig: {
          requiredMessageCode: 'REQUIRED',
          partnerConfigurableFields: ['contractorType', 'firstName', 'lastName'],
          apiRequired: {
            create: ['contractorType'],
            update: [],
          },
        },
        conditionalRequirements: [
          {
            when: { field: 'contractorType', is: 'Individual' },
            then: {
              require: ['firstName', 'lastName'],
              message: 'REQUIRED_FOR_INDIVIDUAL',
            },
          },
          {
            when: data => data.contractorType === 'Individual' && !data.selfOnboarding,
            then: { require: 'ssn', message: 'SSN_REQUIRED' },
          },
        ],
      }

      const { schema } = createDomainSchema(config, { mode: 'create' })

      const missingIdentity = schema.safeParse({
        contractorType: 'Individual',
        selfOnboarding: false,
        firstName: '',
        lastName: '',
        ssn: '',
      })

      expect(missingIdentity.success).toBe(false)
      if (!missingIdentity.success) {
        const paths = missingIdentity.error.issues.map(i => i.path[0])
        expect(paths).toContain('firstName')
        expect(paths).toContain('lastName')
        expect(paths).toContain('ssn')
      }
    })

    it('skips function predicate when condition is not met', () => {
      const minimalContractorFieldDefs = {
        contractorType: z.enum(['Individual', 'Business']),
        selfOnboarding: z.boolean(),
        firstName: z.string(),
        ssn: z.string(),
      }

      const config: DomainSchemaConfig<typeof minimalContractorFieldDefs> = {
        fieldDefinitions: minimalContractorFieldDefs,
        requiredFieldsConfig: {
          requiredMessageCode: 'REQUIRED',
          partnerConfigurableFields: ['contractorType', 'firstName'],
          apiRequired: { create: ['contractorType'], update: [] },
        },
        conditionalRequirements: [
          {
            when: data => data.contractorType === 'Individual' && !data.selfOnboarding,
            then: { require: 'ssn', message: 'SSN_REQUIRED' },
          },
        ],
      }

      const { schema } = createDomainSchema(config, { mode: 'create' })

      const businessType = schema.safeParse({
        contractorType: 'Business',
        selfOnboarding: false,
        firstName: '',
        ssn: '',
      })

      expect(businessType.success).toBe(true)
    })
  })

  describe('Layer 5: business constraints', () => {
    it('validates business rules on non-empty values', () => {
      const rateFieldDefs = {
        rate: z.number(),
        flsaStatus: z.enum(['Exempt', 'Nonexempt']),
      }

      const config: DomainSchemaConfig<typeof rateFieldDefs> = {
        fieldDefinitions: rateFieldDefs,
        requiredFieldsConfig: {
          requiredMessageCode: 'REQUIRED',
          partnerConfigurableFields: ['rate', 'flsaStatus'],
          apiRequired: {
            create: ['rate', 'flsaStatus'],
            update: [],
          },
        },
        businessConstraints: [
          (data, ctx) => {
            if (data.rate < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rate'],
                message: 'RATE_MINIMUM',
              })
            }
          },
        ],
      }

      const { schema } = createDomainSchema(config, { mode: 'create' })
      const result = schema.safeParse({ rate: 0, flsaStatus: 'Nonexempt' })

      expect(result.success).toBe(false)
      if (!result.success) {
        const rateIssue = result.error.issues.find(i => i.path[0] === 'rate')
        expect(rateIssue?.message).toBe('RATE_MINIMUM')
      }
    })

    it('handles format validation as a business constraint on non-empty values', () => {
      const emailFieldDefs = {
        email: z.string(),
        name: z.string(),
      }

      const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

      const config: DomainSchemaConfig<typeof emailFieldDefs> = {
        fieldDefinitions: emailFieldDefs,
        requiredFieldsConfig: {
          requiredMessageCode: 'REQUIRED',
          partnerConfigurableFields: ['email', 'name'],
          apiRequired: { create: ['email'], update: [] },
        },
        businessConstraints: [
          (data, ctx) => {
            if (data.email && !isValidEmail(data.email)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['email'],
                message: 'INVALID_EMAIL',
              })
            }
          },
        ],
      }

      const { schema } = createDomainSchema(config, { mode: 'create' })

      const emptyEmail = schema.safeParse({ email: '', name: 'Jane' })
      expect(emptyEmail.success).toBe(false)
      if (!emptyEmail.success) {
        const emailIssues = emptyEmail.error.issues.filter(i => i.path[0] === 'email')
        expect(emailIssues).toHaveLength(1)
        expect(emailIssues[0]?.message).toBe('REQUIRED')
      }

      const invalidEmail = schema.safeParse({ email: 'notanemail', name: 'Jane' })
      expect(invalidEmail.success).toBe(false)
      if (!invalidEmail.success) {
        const emailIssues = invalidEmail.error.issues.filter(i => i.path[0] === 'email')
        expect(emailIssues).toHaveLength(1)
        expect(emailIssues[0]?.message).toBe('INVALID_EMAIL')
      }

      const validEmail = schema.safeParse({ email: 'jane@example.com', name: 'Jane' })
      expect(validEmail.success).toBe(true)
    })
  })

  describe('composition: all layers together', () => {
    const compensationFieldDefs = {
      adjustForMinimumWage: z.boolean(),
      minimumWageId: z.string(),
      rate: z.number(),
      flsaStatus: z.enum(['Exempt', 'Nonexempt', 'Owner']),
    }

    it('applies transforms, required config, conditional requirements, and business constraints', () => {
      const config: DomainSchemaConfig<typeof compensationFieldDefs> = {
        fieldDefinitions: compensationFieldDefs,
        requiredFieldsConfig: {
          requiredMessageCode: 'REQUIRED',
          partnerConfigurableFields: ['rate', 'flsaStatus'],
          apiRequired: {
            create: ['rate', 'flsaStatus'],
            update: [],
          },
        },
        fieldTransforms: {
          rate: (val: unknown) =>
            val === undefined || val === null || Number.isNaN(val) ? 0 : val,
        },
        conditionalRequirements: [
          {
            when: { field: 'adjustForMinimumWage', is: true },
            then: { require: 'minimumWageId', message: 'MINIMUM_WAGE_ID_REQUIRED' },
          },
        ],
        businessConstraints: [
          (data, ctx) => {
            if (['Exempt', 'Nonexempt'].includes(data.flsaStatus) && data.rate < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rate'],
                message: 'RATE_MINIMUM',
              })
            }
          },
        ],
      }

      const { schema } = createDomainSchema(config, { mode: 'create' })

      const result = schema.safeParse({
        adjustForMinimumWage: true,
        minimumWageId: '',
        rate: NaN,
        flsaStatus: 'Nonexempt',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map(i => ({ path: i.path[0], message: i.message }))
        expect(messages).toContainEqual({
          path: 'minimumWageId',
          message: 'MINIMUM_WAGE_ID_REQUIRED',
        })
        expect(messages).toContainEqual({ path: 'rate', message: 'RATE_MINIMUM' })
      }
    })

    it('passes when all layers are satisfied', () => {
      const config: DomainSchemaConfig<typeof compensationFieldDefs> = {
        fieldDefinitions: compensationFieldDefs,
        requiredFieldsConfig: {
          requiredMessageCode: 'REQUIRED',
          partnerConfigurableFields: ['rate', 'flsaStatus'],
          apiRequired: {
            create: ['rate', 'flsaStatus'],
            update: [],
          },
        },
        conditionalRequirements: [
          {
            when: { field: 'adjustForMinimumWage', is: true },
            then: { require: 'minimumWageId', message: 'MINIMUM_WAGE_ID_REQUIRED' },
          },
        ],
        businessConstraints: [
          (data, ctx) => {
            if (data.rate < 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rate'],
                message: 'RATE_MINIMUM',
              })
            }
          },
        ],
      }

      const { schema } = createDomainSchema(config, { mode: 'create' })

      const result = schema.safeParse({
        adjustForMinimumWage: true,
        minimumWageId: 'wage-123',
        rate: 50,
        flsaStatus: 'Nonexempt',
      })

      expect(result.success).toBe(true)
    })
  })
})
