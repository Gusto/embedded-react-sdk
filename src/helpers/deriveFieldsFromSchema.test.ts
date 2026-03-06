import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { deriveFieldsFromSchema } from './deriveFieldsFromSchema'

describe('deriveFieldsFromSchema', () => {
  it('derives required text fields', () => {
    const schema = z.object({
      firstName: z.string().min(1),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.firstName).toEqual({ isRequired: true, type: 'text', hasRedactedValue: false })
  })

  it('derives optional fields', () => {
    const schema = z.object({
      middleInitial: z.string().optional(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.middleInitial).toEqual({
      isRequired: false,
      type: 'text',
      hasRedactedValue: false,
    })
  })

  it('derives email fields from z.string().email()', () => {
    const schema = z.object({
      email: z.string().email(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.email).toEqual({ isRequired: true, type: 'email', hasRedactedValue: false })
  })

  it('derives email fields from z.email()', () => {
    const schema = z.object({
      email: z.email(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.email).toEqual({ isRequired: true, type: 'email', hasRedactedValue: false })
  })

  it('derives date fields from z.iso.date()', () => {
    const schema = z.object({
      birthday: z.iso.date(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.birthday).toEqual({ isRequired: true, type: 'date', hasRedactedValue: false })
  })

  it('derives enum fields with auto-extracted options', () => {
    const schema = z.object({
      title: z.enum(['owner', 'president', 'treasurer']),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.title).toEqual({
      isRequired: true,
      type: 'enum',
      hasRedactedValue: false,
      options: ['owner', 'president', 'treasurer'],
    })
  })

  it('derives date fields', () => {
    const schema = z.object({
      birthday: z.string().date(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.birthday).toEqual({ isRequired: true, type: 'date', hasRedactedValue: false })
  })

  it('derives number fields', () => {
    const schema = z.object({
      age: z.number(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.age).toEqual({ isRequired: true, type: 'number', hasRedactedValue: false })
  })

  it('derives boolean fields', () => {
    const schema = z.object({
      isActive: z.boolean(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.isActive).toEqual({ isRequired: true, type: 'boolean', hasRedactedValue: false })
  })

  it('derives array fields', () => {
    const schema = z.object({
      tags: z.array(z.string()),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.tags).toEqual({ isRequired: true, type: 'array', hasRedactedValue: false })
  })

  it('derives file fields from z.file()', () => {
    const schema = z.object({
      document: z.file(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.document).toEqual({ isRequired: true, type: 'file', hasRedactedValue: false })
  })

  it('handles fields with refine', () => {
    const schema = z.object({
      zip: z.string().refine(val => /^\d{5}$/.test(val)),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.zip).toEqual({ isRequired: true, type: 'text', hasRedactedValue: false })
  })

  it('warns and defaults to text for unsupported types', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const schema = z.object({
      metadata: z.record(z.string(), z.string()),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(fields.metadata).toEqual({ isRequired: true, type: 'text', hasRedactedValue: false })
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unsupported type'))

    warnSpy.mockRestore()
  })

  it('handles a complete form schema', () => {
    const schema = z.object({
      firstName: z.string().min(1),
      middleInitial: z.string().optional(),
      email: z.string().email(),
      title: z.enum(['owner', 'president']),
      birthday: z.string().date(),
      isActive: z.boolean(),
      tags: z.array(z.string()),
      document: z.file(),
    })

    const fields = deriveFieldsFromSchema(schema)

    expect(Object.keys(fields)).toHaveLength(8)
    expect(fields.firstName).toMatchObject({ isRequired: true, type: 'text' })
    expect(fields.middleInitial).toMatchObject({ isRequired: false, type: 'text' })
    expect(fields.email).toMatchObject({ isRequired: true, type: 'email' })
    expect(fields.title).toMatchObject({
      isRequired: true,
      type: 'enum',
      options: ['owner', 'president'],
    })
    expect(fields.birthday).toMatchObject({ isRequired: true, type: 'date' })
    expect(fields.isActive).toMatchObject({ isRequired: true, type: 'boolean' })
    expect(fields.tags).toMatchObject({ isRequired: true, type: 'array' })
    expect(fields.document).toMatchObject({ isRequired: true, type: 'file' })
  })
})
