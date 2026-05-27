import { describe, expect, it } from 'vitest'
import { createHomeAddressSchema, HomeAddressErrorCodes } from './homeAddressSchema'

describe('createHomeAddressSchema', () => {
  const validAddress = {
    street1: '100 5th Ave',
    street2: '',
    city: 'New York',
    state: 'NY',
    zip: '10011',
    courtesyWithholding: false,
    effectiveDate: '2026-01-01',
  }

  it('treats effectiveDate as required in create mode when the field is included', () => {
    const [schema, { getFieldsMetadata }] = createHomeAddressSchema({
      mode: 'create',
      withEffectiveDateField: true,
    })

    expect(getFieldsMetadata()).toMatchObject({
      effectiveDate: { name: 'effectiveDate', isRequired: true },
    })

    const result = schema.safeParse({ ...validAddress, effectiveDate: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['effectiveDate'],
          message: HomeAddressErrorCodes.REQUIRED,
        }),
      )
    }
  })

  it('accepts a populated effectiveDate in create mode', () => {
    const [schema] = createHomeAddressSchema({ mode: 'create', withEffectiveDateField: true })

    const result = schema.safeParse(validAddress)
    expect(result.success).toBe(true)
  })

  it('excludes effectiveDate from validation when withEffectiveDateField is false', () => {
    const [schema, { getFieldsMetadata }] = createHomeAddressSchema({
      mode: 'update',
      withEffectiveDateField: false,
    })

    expect(Object.keys(getFieldsMetadata()).sort()).toEqual(
      ['city', 'courtesyWithholding', 'state', 'street1', 'street2', 'zip'].sort(),
    )

    const { effectiveDate: _omit, ...rest } = validAddress
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
  })
})
