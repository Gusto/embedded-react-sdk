import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { buildFormSchema } from './buildFormSchema'
import { field } from './field'

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
  describe('static required (string presets)', () => {
    const fields = {
      firstName: field(z.string().min(1), { required: 'create', errorCode: 'REQUIRED' }),
      lastName: field(z.string().min(1), { required: 'always', errorCode: 'REQUIRED' }),
      nickname: field(z.string().min(1), { required: 'update' }),
      active: field(z.boolean()),
    }

    it('makes fields required in create mode based on preset', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

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
      const { schema } = buildFormSchema(fields, { mode: 'update' })

      const valid = schema.safeParse({
        firstName: '',
        lastName: 'Lovelace',
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
      expect(errors).toContain('lastName')
      expect(errors).toContain('nickname')
    })

    it('converts empty strings to undefined for optional fields', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

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
      const { schema } = buildFormSchema(fields, { mode: 'create' })

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
  })

  describe('static fields (no required)', () => {
    it('passes through validators unchanged', () => {
      const fields = {
        name: field(z.string().min(1), { required: 'create' }),
        toggle: field(z.boolean()),
        notes: field(z.string().optional()),
      }

      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const valid = schema.safeParse({ name: 'test', toggle: true, notes: 'hello' })
      expect(valid.success).toBe(true)

      const missingToggle = schema.safeParse({ name: 'test', notes: 'hello' })
      expect(missingToggle.success).toBe(false)
    })
  })

  describe('function required (predicates)', () => {
    const fields = {
      adjustForMinimumWage: field(z.boolean()),
      minimumWageId: field(z.string().optional(), {
        required: (data: Record<string, unknown>) => Boolean(data.adjustForMinimumWage),
        errorCode: 'REQUIRED',
      }),
    }

    it('rejects empty dependent field when toggle is on', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ adjustForMinimumWage: true, minimumWageId: '' })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('minimumWageId')
    })

    it('accepts empty dependent field when toggle is off', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ adjustForMinimumWage: false, minimumWageId: '' })
      expect(result.success).toBe(true)
    })

    it('accepts populated dependent field when toggle is on', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({
        adjustForMinimumWage: true,
        minimumWageId: 'wage-123',
      })
      expect(result.success).toBe(true)
    })

    it('uses the errorCode from the field definition', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ adjustForMinimumWage: true, minimumWageId: '' })
      const messages = getErrorMessages(result, 'minimumWageId')
      expect(messages).toContain('REQUIRED')
    })

    it('treats whitespace-only strings as empty', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ adjustForMinimumWage: true, minimumWageId: '   ' })
      expect(result.success).toBe(false)
    })
  })

  describe('mode-scoped function predicates', () => {
    const fields = {
      selfOnboarding: field(z.boolean()),
      email: field(z.string().email().optional(), {
        required: (data: Record<string, unknown>, mode: string) =>
          mode === 'create' && Boolean(data.selfOnboarding),
        errorCode: 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING',
      }),
    }

    it('requires email when selfOnboarding is on in create mode', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ selfOnboarding: true, email: '' })
      expect(result.success).toBe(false)
      expect(getErrorMessages(result, 'email')).toContain('EMAIL_REQUIRED_FOR_SELF_ONBOARDING')
    })

    it('does not require email when selfOnboarding is on in update mode', () => {
      const { schema } = buildFormSchema(fields, { mode: 'update' })

      const result = schema.safeParse({ selfOnboarding: true, email: '' })
      expect(result.success).toBe(true)
    })

    it('does not require email when selfOnboarding is off in create mode', () => {
      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ selfOnboarding: false, email: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('partner requiredFields overrides', () => {
    const fields = {
      firstName: field(z.string().min(1), { required: 'create', errorCode: 'REQUIRED' }),
      email: field(z.string().email(), { required: 'create', errorCode: 'REQUIRED' }),
    }

    it('makes fields required via partner array override', () => {
      const { schema } = buildFormSchema(fields, {
        mode: 'update',
        requiredFields: ['email'],
      })

      const result = schema.safeParse({ firstName: '', email: '' })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('email')
      expect(errors).not.toContain('firstName')
    })

    it('makes fields required via partner mode-specific override', () => {
      const { schema } = buildFormSchema(fields, {
        mode: 'update',
        requiredFields: { update: ['firstName', 'email'] },
      })

      const result = schema.safeParse({ firstName: '', email: '' })
      expect(result.success).toBe(false)
      const errors = getErrorFields(result)
      expect(errors).toContain('firstName')
      expect(errors).toContain('email')
    })

    it('partner override on a function-required field makes it always required', () => {
      const conditionalFields = {
        toggle: field(z.boolean()),
        dependent: field(z.string().optional(), {
          required: (data: Record<string, unknown>) => Boolean(data.toggle),
          errorCode: 'REQUIRED',
        }),
      }

      const { schema } = buildFormSchema(conditionalFields, {
        mode: 'create',
        requiredFields: ['dependent'],
      })

      const result = schema.safeParse({ toggle: false, dependent: '' })
      expect(result.success).toBe(false)
      expect(getErrorFields(result)).toContain('dependent')
    })
  })

  describe('preprocess', () => {
    it('applies preprocess before validation', () => {
      const fields = {
        rate: field(z.number(), {
          required: 'create',
          errorCode: 'REQUIRED',
          preprocess: (val: unknown) => {
            if (val === undefined || val === null || Number.isNaN(val)) return 0
            return val
          },
        }),
      }

      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ rate: undefined })
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).rate).toBe(0)
      }
    })

    it('applies preprocess on static fields', () => {
      const fields = {
        stateWcCovered: field(z.boolean().optional(), {
          preprocess: (val: unknown) => (typeof val === 'string' ? val === 'true' : val),
        }),
      }

      const { schema } = buildFormSchema(fields, { mode: 'create' })

      const result = schema.safeParse({ stateWcCovered: 'true' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).stateWcCovered).toBe(true)
      }
    })
  })

  describe('getFieldsMetadata', () => {
    const fields = {
      firstName: field(z.string().min(1), { required: 'create', errorCode: 'REQUIRED' }),
      lastName: field(z.string().min(1), { required: 'always' }),
      nickname: field(z.string().min(1), { required: 'update' }),
      active: field(z.boolean()),
      minimumWageId: field(z.string().optional(), {
        required: (data: Record<string, unknown>) => Boolean(data.adjustForMinimumWage),
        errorCode: 'REQUIRED',
      }),
      adjustForMinimumWage: field(z.boolean()),
    }

    it('returns static isRequired for string preset fields', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, { mode: 'create' })
      const metadata = getFieldsMetadata()

      expect(metadata.firstName.isRequired).toBe(true)
      expect(metadata.lastName.isRequired).toBe(true)
      expect(metadata.nickname.isRequired).toBe(false)
    })

    it('reflects mode in static metadata', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, { mode: 'update' })
      const metadata = getFieldsMetadata()

      expect(metadata.firstName.isRequired).toBe(false)
      expect(metadata.lastName.isRequired).toBe(true)
      expect(metadata.nickname.isRequired).toBe(true)
    })

    it('returns isRequired: false for static fields without required', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, { mode: 'create' })
      const metadata = getFieldsMetadata()

      expect(metadata.active.isRequired).toBe(false)
      expect(metadata.adjustForMinimumWage.isRequired).toBe(false)
    })

    it('evaluates function predicates when data is provided', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, { mode: 'create' })

      const whenOn = getFieldsMetadata({ adjustForMinimumWage: true })
      expect(whenOn.minimumWageId.isRequired).toBe(true)

      const whenOff = getFieldsMetadata({ adjustForMinimumWage: false })
      expect(whenOff.minimumWageId.isRequired).toBe(false)
    })

    it('returns isRequired: false for function predicates when no data is provided', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, { mode: 'create' })
      const metadata = getFieldsMetadata()

      expect(metadata.minimumWageId.isRequired).toBe(false)
    })

    it('reflects partner overrides in metadata', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, {
        mode: 'update',
        requiredFields: ['firstName'],
      })
      const metadata = getFieldsMetadata()

      expect(metadata.firstName.isRequired).toBe(true)
    })

    it('partner override on function-required field shows isRequired: true', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, {
        mode: 'create',
        requiredFields: ['minimumWageId'],
      })
      const metadata = getFieldsMetadata({ adjustForMinimumWage: false })

      expect(metadata.minimumWageId.isRequired).toBe(true)
    })

    it('includes name property matching the field key', () => {
      const { getFieldsMetadata } = buildFormSchema(fields, { mode: 'create' })
      const metadata = getFieldsMetadata()

      for (const [key, value] of Object.entries(metadata)) {
        expect(value.name).toBe(key)
      }
    })
  })

  describe('combined: schema + metadata consistency', () => {
    const fields = {
      title: field(z.string().min(1), { required: 'create', errorCode: 'REQUIRED' }),
      toggle: field(z.boolean()),
      dependent: field(z.string().optional(), {
        required: (data: Record<string, unknown>) => Boolean(data.toggle),
        errorCode: 'DEP_REQUIRED',
      }),
    }

    it('schema rejects and metadata agrees when conditional field is required', () => {
      const { schema, getFieldsMetadata } = buildFormSchema(fields, { mode: 'create' })

      const data = { title: 'test', toggle: true, dependent: '' }
      const result = schema.safeParse(data)
      const metadata = getFieldsMetadata(data)

      expect(result.success).toBe(false)
      expect(metadata.dependent.isRequired).toBe(true)
    })

    it('schema accepts and metadata agrees when conditional field is not required', () => {
      const { schema, getFieldsMetadata } = buildFormSchema(fields, { mode: 'create' })

      const data = { title: 'test', toggle: false, dependent: '' }
      const result = schema.safeParse(data)
      const metadata = getFieldsMetadata(data)

      expect(result.success).toBe(true)
      expect(metadata.dependent.isRequired).toBe(false)
    })
  })
})
