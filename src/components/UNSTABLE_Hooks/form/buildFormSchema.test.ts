import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { buildFormSchema, type OptionalFieldsToRequire } from './buildFormSchema'

function getErrorFields(result: {
  success: boolean
  error?: { issues: { path: PropertyKey[] }[] }
}) {
  if (result.success) return new Set<string>()
  return new Set(result.error!.issues.map(i => String(i.path[0])))
}

function getErrorMessages(
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } },
  fieldName: string,
) {
  if (result.success) return []
  return result.error!.issues.filter(i => String(i.path[0]) === fieldName).map(i => i.message)
}

describe('buildFormSchema', () => {
  describe('mode-scoped rules (create/update)', () => {
    const fieldValidators = {
      firstName: z.string(),
      lastName: z.string(),
      nickname: z.string(),
      active: z.boolean(),
    }

    const requiredFieldsConfig = {
      firstName: 'create',
      lastName: 'create',
      nickname: 'update',
    } as const

    it('makes fields required in create mode based on preset', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const valid = schema.safeParse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        nickname: '',
        active: true,
      })
      expect(valid.success).toBe(true)

      const missing = schema.safeParse({
        firstName: '',
        lastName: '',
        nickname: '',
        active: true,
      })
      expect(missing.success).toBe(false)
      const errors = getErrorFields(missing)
      expect(errors).toContain('firstName')
      expect(errors).toContain('lastName')
      expect(errors).not.toContain('nickname')
    })

    it('makes fields required in update mode based on preset', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
      })

      const valid = schema.safeParse({
        firstName: '',
        lastName: '',
        nickname: 'Ada',
        active: true,
      })
      expect(valid.success).toBe(true)

      const missing = schema.safeParse({
        firstName: '',
        lastName: '',
        nickname: '',
        active: true,
      })
      expect(missing.success).toBe(false)
      const errors = getErrorFields(missing)
      expect(errors).not.toContain('firstName')
      expect(errors).not.toContain('lastName')
      expect(errors).toContain('nickname')
    })

    it('converts empty strings to undefined for optional fields', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        nickname: '',
        active: true,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).nickname).toBeUndefined()
      }
    })

    it('converts null to undefined for optional fields', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        nickname: null,
        active: true,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).nickname).toBeUndefined()
      }
    })

    it('uses requiredErrorCode in validation messages', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        requiredErrorCode: 'REQUIRED',
        mode: 'create',
      })

      const result = schema.safeParse({
        firstName: '',
        lastName: 'Lovelace',
        nickname: '',
        active: true,
      })
      expect(result.success).toBe(false)
      const messages = getErrorMessages(result, 'firstName')
      expect(messages).toContain('REQUIRED')
    })

    it('defaults requiredErrorCode to REQUIRED', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({
        firstName: '',
        lastName: 'Lovelace',
        nickname: '',
        active: true,
      })
      expect(result.success).toBe(false)
      const messages = getErrorMessages(result, 'firstName')
      expect(messages).toContain('REQUIRED')
    })
  })

  describe('always rule (explicit and default)', () => {
    it('explicit always rule is required in both modes', () => {
      const fieldValidators = {
        name: z.string(),
        toggle: z.boolean(),
      }

      const requiredFieldsConfig = { name: 'always' } as const

      for (const mode of ['create', 'update'] as const) {
        const { schema } = buildFormSchema(fieldValidators, {
          requiredFieldsConfig,
          mode,
        })
        const result = schema.safeParse({ name: '', toggle: true })
        expect(result.success).toBe(false)
        expect(getErrorFields(result)).toContain('name')

        const valid = schema.safeParse({ name: 'test', toggle: true })
        expect(valid.success).toBe(true)
      }
    })

    it('unlisted fields default to always-required', () => {
      const fieldValidators = {
        name: z.string(),
        notes: z.string(),
      }

      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig: { name: 'create' },
        mode: 'update',
      })

      const result = schema.safeParse({ name: '', notes: '' })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('notes')
      expect(errors).not.toContain('name')
    })

    it('unlisted fields reject empty values in both modes', () => {
      const fieldValidators = {
        title: z.string(),
      }

      for (const mode of ['create', 'update'] as const) {
        const { schema } = buildFormSchema(fieldValidators, { mode })
        const result = schema.safeParse({ title: '' })
        expect(result.success).toBe(false)
        expect(getErrorFields(result)).toContain('title')
      }
    })
  })

  describe('never rule (optional in both modes, partner-configurable)', () => {
    const fieldValidators = {
      name: z.string(),
      notes: z.string(),
      active: z.boolean(),
    }

    const requiredFieldsConfig = {
      name: 'create',
      notes: 'never',
    } as const

    it('never rule is optional in both modes', () => {
      for (const mode of ['create', 'update'] as const) {
        const { schema } = buildFormSchema(fieldValidators, {
          requiredFieldsConfig,
          mode,
        })
        const result = schema.safeParse({
          name: mode === 'create' ? 'test' : '',
          notes: '',
          active: true,
        })
        expect(result.success).toBe(true)
      }
    })

    it('partner can require a never field on create', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
        optionalFieldsToRequire: { create: ['notes'] },
      })

      const result = schema.safeParse({ name: 'test', notes: '', active: true })
      expect(result.success).toBe(false)
      expect(getErrorFields(result)).toContain('notes')
    })

    it('partner can require a never field on update', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
        optionalFieldsToRequire: { update: ['notes'] },
      })

      const result = schema.safeParse({ name: '', notes: '', active: true })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('notes')
      expect(errors).not.toContain('name')
    })

    it('metadata shows isRequired: false for never fields without partner override', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })
      const metadata = getFieldsMetadata()

      expect(metadata.notes.isRequired).toBe(false)
    })

    it('metadata shows isRequired: true for never fields with partner override', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
        optionalFieldsToRequire: { update: ['notes'] },
      })
      const metadata = getFieldsMetadata()

      expect(metadata.notes.isRequired).toBe(true)
    })

    it('excluded never field is not validated even with partner override', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
        optionalFieldsToRequire: { create: ['notes'] },
        excludeFields: ['notes'],
      })

      const result = schema.safeParse({ name: 'test', active: true })
      expect(result.success).toBe(true)
    })
  })

  describe('function rules (predicates)', () => {
    const fieldValidators = {
      adjustForMinimumWage: z.boolean(),
      minimumWageId: z.string(),
    }

    const requiredFieldsConfig = {
      minimumWageId: (data: Record<string, unknown>) => Boolean(data.adjustForMinimumWage),
    } as const

    it('rejects empty dependent field when toggle is on', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({ adjustForMinimumWage: true, minimumWageId: '' })
      expect(result.success).toBe(false)
      expect(getErrorFields(result)).toContain('minimumWageId')
    })

    it('accepts empty dependent field when toggle is off', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({ adjustForMinimumWage: false, minimumWageId: '' })
      expect(result.success).toBe(true)
    })

    it('accepts populated dependent field when toggle is on', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({
        adjustForMinimumWage: true,
        minimumWageId: 'wage-123',
      })
      expect(result.success).toBe(true)
    })

    it('uses the requiredErrorCode for empty required fields', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        requiredErrorCode: 'REQUIRED',
        mode: 'create',
      })

      const result = schema.safeParse({ adjustForMinimumWage: true, minimumWageId: '' })
      const messages = getErrorMessages(result, 'minimumWageId')
      expect(messages).toContain('REQUIRED')
    })

    it('treats whitespace-only strings as empty', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({ adjustForMinimumWage: true, minimumWageId: '   ' })
      expect(result.success).toBe(false)
    })
  })

  describe('mode-scoped function predicates', () => {
    const fieldValidators = {
      selfOnboarding: z.boolean(),
      email: z.string().email(),
    }

    const requiredFieldsConfig = {
      email: (data: Record<string, unknown>, mode: string) =>
        mode === 'create' && Boolean(data.selfOnboarding),
    } as const

    it('requires email when selfOnboarding is on in create mode', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        requiredErrorCode: 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING',
        mode: 'create',
      })

      const result = schema.safeParse({ selfOnboarding: true, email: '' })
      expect(result.success).toBe(false)
      expect(getErrorMessages(result, 'email')).toContain('EMAIL_REQUIRED_FOR_SELF_ONBOARDING')
    })

    it('does not require email when selfOnboarding is on in update mode', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
      })

      const result = schema.safeParse({ selfOnboarding: true, email: '' })
      expect(result.success).toBe(true)
    })

    it('does not require email when selfOnboarding is off in create mode', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const result = schema.safeParse({ selfOnboarding: false, email: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('partner optionalFieldsToRequire overrides', () => {
    const fieldValidators = {
      firstName: z.string(),
      email: z.string().email(),
    }

    const requiredFieldsConfig = {
      firstName: 'create',
      email: 'create',
    } as const

    it('makes fields required via partner mode-specific override', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
        optionalFieldsToRequire: { update: ['email'] },
      })

      const result = schema.safeParse({ firstName: '', email: '' })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('email')
      expect(errors).not.toContain('firstName')
    })

    it('makes multiple fields required via partner override', () => {
      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
        optionalFieldsToRequire: { update: ['firstName', 'email'] },
      })

      const result = schema.safeParse({ firstName: '', email: '' })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('firstName')
      expect(errors).toContain('email')
    })

    it('only applies overrides for the active mode', () => {
      const fieldValidators = {
        createField: z.string(),
        updateField: z.string(),
      }

      const requiredFieldsConfig = {
        createField: 'update',
        updateField: 'create',
      } as const

      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
        optionalFieldsToRequire: { update: ['updateField'] },
      })

      const result = schema.safeParse({ createField: '', updateField: '' })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('updateField')
      expect(errors).toContain('createField')
    })

    it('partner override on a function-required field makes it always required', () => {
      const fieldValidators = {
        toggle: z.boolean(),
        dependent: z.string(),
      }

      const requiredFieldsConfig = {
        dependent: (data: Record<string, unknown>) => Boolean(data.toggle),
      } as const

      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
        optionalFieldsToRequire: {
          create: ['dependent'],
        } as unknown as OptionalFieldsToRequire<typeof requiredFieldsConfig>,
      })

      const result = schema.safeParse({ toggle: false, dependent: '' })
      expect(result.success).toBe(false)
      expect(getErrorFields(result)).toContain('dependent')
    })
  })

  describe('superRefine option', () => {
    it('runs the provided superRefine callback', () => {
      const fieldValidators = {
        rate: z.number(),
        flsaStatus: z.string(),
      }

      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig: { rate: 'create', flsaStatus: 'create' },
        mode: 'create',
        superRefine: (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
          if (data.flsaStatus === 'owner' && (data.rate as number) < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['rate'],
              message: 'RATE_MINIMUM',
            })
          }
        },
      })

      const valid = schema.safeParse({ rate: 100, flsaStatus: 'owner' })
      expect(valid.success).toBe(true)

      const invalid = schema.safeParse({ rate: 0, flsaStatus: 'owner' })
      expect(invalid.success).toBe(false)
      expect(getErrorMessages(invalid, 'rate')).toContain('RATE_MINIMUM')
    })

    it('runs superRefine alongside dynamic required checks', () => {
      const fieldValidators = {
        toggle: z.boolean(),
        dependent: z.string(),
        rate: z.number(),
      }

      const { schema } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig: {
          dependent: (data: Record<string, unknown>) => Boolean(data.toggle),
          rate: 'create',
        },
        mode: 'create',
        superRefine: (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
          if ((data.rate as number) < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['rate'],
              message: 'RATE_NEGATIVE',
            })
          }
        },
      })

      const result = schema.safeParse({ toggle: true, dependent: '', rate: -1 })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('dependent')
      expect(errors).toContain('rate')
      expect(getErrorMessages(result, 'dependent')).toContain('REQUIRED')
      expect(getErrorMessages(result, 'rate')).toContain('RATE_NEGATIVE')
    })

    it('superRefine still runs when no requiredFieldsConfig is provided', () => {
      const fieldValidators = {
        name: z.string(),
      }

      const { schema } = buildFormSchema(fieldValidators, { mode: 'create' })

      const result = schema.safeParse({ name: 'test' })
      expect(result.success).toBe(true)
    })
  })

  describe('getFieldsMetadata', () => {
    const fieldValidators = {
      firstName: z.string(),
      lastName: z.string(),
      nickname: z.string(),
      active: z.boolean(),
      minimumWageId: z.string(),
      adjustForMinimumWage: z.boolean(),
    }

    const requiredFieldsConfig = {
      firstName: 'create',
      lastName: 'create',
      nickname: 'update',
      minimumWageId: (data: Record<string, unknown>) => Boolean(data.adjustForMinimumWage),
    } as const

    it('returns static isRequired for mode-scoped fields', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })
      const metadata = getFieldsMetadata()

      expect(metadata.firstName.isRequired).toBe(true)
      expect(metadata.lastName.isRequired).toBe(true)
      expect(metadata.nickname.isRequired).toBe(false)
    })

    it('reflects mode in static metadata', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
      })
      const metadata = getFieldsMetadata()

      expect(metadata.firstName.isRequired).toBe(false)
      expect(metadata.lastName.isRequired).toBe(false)
      expect(metadata.nickname.isRequired).toBe(true)
    })

    it('returns isRequired: true for unlisted fields (default always)', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })
      const metadata = getFieldsMetadata()

      expect(metadata.active.isRequired).toBe(true)
      expect(metadata.adjustForMinimumWage.isRequired).toBe(true)
    })

    it('evaluates function predicates when data is provided', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const whenOn = getFieldsMetadata({ adjustForMinimumWage: true })
      expect(whenOn.minimumWageId.isRequired).toBe(true)

      const whenOff = getFieldsMetadata({ adjustForMinimumWage: false })
      expect(whenOff.minimumWageId.isRequired).toBe(false)
    })

    it('returns isRequired: false for function predicates when no data is provided', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })
      const metadata = getFieldsMetadata()

      expect(metadata.minimumWageId.isRequired).toBe(false)
    })

    it('reflects partner overrides in metadata', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'update',
        optionalFieldsToRequire: { update: ['firstName'] },
      })
      const metadata = getFieldsMetadata()

      expect(metadata.firstName.isRequired).toBe(true)
    })

    it('partner override on function-required field shows isRequired: true', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
        optionalFieldsToRequire: {
          create: ['minimumWageId'],
        } as unknown as OptionalFieldsToRequire<typeof requiredFieldsConfig>,
      })
      const metadata = getFieldsMetadata({ adjustForMinimumWage: false })

      expect(metadata.minimumWageId.isRequired).toBe(true)
    })

    it('includes name property matching the field key', () => {
      const { getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })
      const metadata = getFieldsMetadata()

      for (const [key, value] of Object.entries(metadata)) {
        expect(value.name).toBe(key)
      }
    })
  })

  describe('combined: schema + metadata consistency', () => {
    const fieldValidators = {
      title: z.string(),
      toggle: z.boolean(),
      dependent: z.string(),
    }

    const requiredFieldsConfig = {
      title: 'create',
      dependent: (data: Record<string, unknown>) => Boolean(data.toggle),
    } as const

    it('schema rejects and metadata agrees when conditional field is required', () => {
      const { schema, getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        requiredErrorCode: 'DEP_REQUIRED',
        mode: 'create',
      })

      const data = { title: 'test', toggle: true, dependent: '' }
      const result = schema.safeParse(data)
      const metadata = getFieldsMetadata(data)

      expect(result.success).toBe(false)
      expect(metadata.dependent.isRequired).toBe(true)
    })

    it('schema accepts and metadata agrees when conditional field is not required', () => {
      const { schema, getFieldsMetadata } = buildFormSchema(fieldValidators, {
        requiredFieldsConfig,
        mode: 'create',
      })

      const data = { title: 'test', toggle: false, dependent: '' }
      const result = schema.safeParse(data)
      const metadata = getFieldsMetadata(data)

      expect(result.success).toBe(true)
      expect(metadata.dependent.isRequired).toBe(false)
    })
  })
})
