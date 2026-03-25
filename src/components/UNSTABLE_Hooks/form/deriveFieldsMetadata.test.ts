import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { deriveFieldsMetadata } from './deriveFieldsMetadata'
import { requiredIf } from '@/helpers/requiredIf'

describe('deriveFieldsMetadata', () => {
  it('derives isRequired: true for required string fields', () => {
    const schema = z.object({
      firstName: z.string().min(1),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.firstName).toEqual({
      name: 'firstName',
      isRequired: true,
    })
  })

  it('derives isRequired: false for optional fields', () => {
    const schema = z.object({
      middleName: z.string().optional(),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.middleName).toEqual({
      name: 'middleName',
      isRequired: false,
    })
  })

  it('derives name matching the schema key for each field', () => {
    const schema = z.object({
      street1: z.string(),
      street2: z.string().optional(),
      city: z.string(),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.street1.name).toBe('street1')
    expect(metadata.street2.name).toBe('street2')
    expect(metadata.city.name).toBe('city')
  })

  it('handles a mixed schema with various field types', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().optional(),
      active: z.boolean(),
      age: z.number(),
      state: z.enum(['CA', 'NY', 'TX']),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.name.isRequired).toBe(true)
    expect(metadata.email.isRequired).toBe(false)
    expect(metadata.active.isRequired).toBe(true)
    expect(metadata.age.isRequired).toBe(true)
    expect(metadata.state.isRequired).toBe(true)
  })

  it('derives isRequired: true for fields with superRefine', () => {
    const schema = z.object({
      zip: z.string().superRefine((val, ctx) => {
        if (!val) ctx.addIssue({ code: 'custom', message: 'REQUIRED' })
      }),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.zip.isRequired).toBe(true)
  })

  it('derives isRequired: false for optional enums', () => {
    const schema = z.object({
      state: z.enum(['CA', 'NY']).optional(),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.state.isRequired).toBe(false)
  })

  it('derives isRequired: true for requiredIf(validator, true)', () => {
    const schema = z.object({
      email: requiredIf(z.email(), true),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.email.isRequired).toBe(true)
  })

  it('derives isRequired: false for requiredIf(validator, false)', () => {
    const schema = z.object({
      email: requiredIf(z.email(), false),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.email.isRequired).toBe(false)
  })

  it('handles mixed requiredIf and standard fields', () => {
    const schema = z.object({
      firstName: requiredIf(z.string().min(1), true),
      middleName: requiredIf(z.string(), false),
      lastName: z.string().min(1),
      email: requiredIf(z.email(), false),
      active: z.boolean(),
    })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.firstName.isRequired).toBe(true)
    expect(metadata.middleName.isRequired).toBe(false)
    expect(metadata.lastName.isRequired).toBe(true)
    expect(metadata.email.isRequired).toBe(false)
    expect(metadata.active.isRequired).toBe(true)
  })

  it('works on schemas with superRefine applied', () => {
    const schema = z
      .object({
        email: requiredIf(z.email(), false),
        notify: z.boolean(),
      })
      .superRefine((data, ctx) => {
        if (data.notify && !data.email) {
          ctx.addIssue({ code: 'custom', path: ['email'], message: 'required' })
        }
      })

    const metadata = deriveFieldsMetadata(schema)

    expect(metadata.email.isRequired).toBe(false)
    expect(metadata.notify.isRequired).toBe(true)
  })

  it('returns metadata for all fields in the schema', () => {
    const schema = z.object({
      street1: z.string().min(1),
      street2: z.string().optional(),
      city: z.string().min(1),
      state: z.enum(['CA', 'NY']),
      zip: z.string().min(1),
      courtesyWithholding: z.boolean(),
    })

    const metadata = deriveFieldsMetadata(schema)
    const fieldNames = Object.keys(metadata)

    expect(fieldNames).toEqual([
      'street1',
      'street2',
      'city',
      'state',
      'zip',
      'courtesyWithholding',
    ])
  })
})
