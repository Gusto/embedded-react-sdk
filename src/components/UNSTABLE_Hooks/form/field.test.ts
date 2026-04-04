import { describe, it, expect, expectTypeOf } from 'vitest'
import { z } from 'zod'
import {
  field,
  evaluateRequired,
  isFieldConfigurable,
  isStaticRequired,
  type FieldDefWithRequired,
  type FieldDefStatic,
  type ConfigurableFieldName,
  type InferFormData,
  type InferErrorCode,
  type FieldDefs,
  type FieldConfig,
} from './field'

describe('field()', () => {
  it('creates a static field def when called with schema only', () => {
    const def = field(z.boolean())

    expect(def.schema).toBeDefined()
    expect(def.required).toBeUndefined()
    expect(def.errorCode).toBeUndefined()
  })

  it('creates a configurable field def with a static required preset', () => {
    const def = field(z.string(), {
      required: 'create',
      errorCode: 'REQUIRED',
    })

    expect(def.required).toBe('create')
    expect(def.errorCode).toBe('REQUIRED')
  })

  it('creates a configurable field def with a function required predicate', () => {
    const predicate = (data: Record<string, unknown>) => Boolean(data.toggle)
    const def = field(z.string(), {
      required: predicate,
      errorCode: 'REQUIRED',
    })

    expect(def.required).toBe(predicate)
    expect(def.errorCode).toBe('REQUIRED')
  })
})

describe('isFieldConfigurable()', () => {
  it('returns true for fields with required', () => {
    const def = field(z.string(), { required: 'create' })
    expect(isFieldConfigurable(def)).toBe(true)
  })

  it('returns false for static fields', () => {
    const def = field(z.boolean())
    expect(isFieldConfigurable(def)).toBe(false)
  })
})

describe('isStaticRequired()', () => {
  it('returns true for string presets', () => {
    expect(isStaticRequired('create')).toBe(true)
    expect(isStaticRequired('update')).toBe(true)
    expect(isStaticRequired('always')).toBe(true)
  })

  it('returns false for function predicates', () => {
    expect(isStaticRequired(() => true)).toBe(false)
  })
})

describe('evaluateRequired()', () => {
  it('returns true for "always" regardless of mode', () => {
    expect(evaluateRequired('always', 'create')).toBe(true)
    expect(evaluateRequired('always', 'update')).toBe(true)
  })

  it('returns true for "create" only in create mode', () => {
    expect(evaluateRequired('create', 'create')).toBe(true)
    expect(evaluateRequired('create', 'update')).toBe(false)
  })

  it('returns true for "update" only in update mode', () => {
    expect(evaluateRequired('update', 'create')).toBe(false)
    expect(evaluateRequired('update', 'update')).toBe(true)
  })

  it('evaluates function predicates with data and mode', () => {
    const predicate = (data: Record<string, unknown>, mode: string) =>
      mode === 'create' && Boolean(data.toggle)

    expect(evaluateRequired(predicate, 'create', { toggle: true })).toBe(true)
    expect(evaluateRequired(predicate, 'create', { toggle: false })).toBe(false)
    expect(evaluateRequired(predicate, 'update', { toggle: true })).toBe(false)
  })

  it('returns false for function predicates when no data is provided', () => {
    const predicate = () => true
    expect(evaluateRequired(predicate, 'create')).toBe(false)
  })
})

describe('type utilities', () => {
  const testFields = {
    firstName: field(z.string(), { required: 'create', errorCode: 'REQUIRED' as const }),
    lastName: field(z.string(), { required: 'always', errorCode: 'REQUIRED' as const }),
    email: field(z.string(), {
      required: (data: Record<string, unknown>) => Boolean(data.selfOnboarding),
      errorCode: 'EMAIL_REQUIRED' as const,
    }),
    middleName: field(z.string()),
    active: field(z.boolean()),
  } satisfies FieldDefs

  it('ConfigurableFieldName includes only fields with required', () => {
    expectTypeOf<ConfigurableFieldName<typeof testFields>>().toEqualTypeOf<
      'firstName' | 'lastName' | 'email'
    >()
  })

  it('InferFormData maps schema types correctly', () => {
    type Data = InferFormData<typeof testFields>

    expectTypeOf<Data['firstName']>().toEqualTypeOf<string>()
    expectTypeOf<Data['lastName']>().toEqualTypeOf<string>()
    expectTypeOf<Data['email']>().toEqualTypeOf<string>()
    expectTypeOf<Data['middleName']>().toEqualTypeOf<string>()
    expectTypeOf<Data['active']>().toEqualTypeOf<boolean>()
  })

  it('InferErrorCode extracts the union of all error codes', () => {
    expectTypeOf<InferErrorCode<typeof testFields>>().toEqualTypeOf<'REQUIRED' | 'EMAIL_REQUIRED'>()
  })

  it('field() overloads produce correct discriminated types', () => {
    const configurable = field(z.string(), { required: 'create', errorCode: 'REQUIRED' as const })
    const staticDef = field(z.boolean())

    expectTypeOf(configurable).toMatchTypeOf<FieldDefWithRequired>()
    expectTypeOf(staticDef).toMatchTypeOf<FieldDefStatic>()
  })

  it('FieldConfig enforces alignment between schemas and fields', () => {
    const schemas = {
      name: z.string(),
      active: z.boolean(),
    }

    const fields: FieldConfig<typeof schemas> = {
      name: field(schemas.name, { required: 'create' }),
      active: field(schemas.active),
    }

    expect(Object.keys(fields)).toEqual(['name', 'active'])
  })
})
