import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import type { UseFormReturn } from 'react-hook-form'
import { createGetFormSubmissionValues } from './getFormSubmissionValues'

function createMockFormMethods(values: Record<string, unknown>) {
  return {
    getValues: vi.fn().mockReturnValue(values),
  } as unknown as UseFormReturn<Record<string, unknown>, unknown, Record<string, unknown>>
}

describe('createGetFormSubmissionValues', () => {
  it('returns the current form values parsed through the schema', () => {
    const schema = z.object({
      firstName: z.string(),
      lastName: z.string(),
    })

    const formMethods = createMockFormMethods({
      firstName: 'Jane',
      lastName: 'Doe',
    })

    const getFormSubmissionValues = createGetFormSubmissionValues(formMethods, schema)
    const result = getFormSubmissionValues()

    expect(result).toEqual({ firstName: 'Jane', lastName: 'Doe' })
    expect(formMethods.getValues).toHaveBeenCalledOnce()
  })

  it('applies Zod preprocessing transforms', () => {
    const schema = z.object({
      rate: z.preprocess(val => (Number.isNaN(val) ? undefined : val), z.number().optional()),
      active: z.preprocess(val => (typeof val === 'string' ? val === 'true' : val), z.boolean()),
    })

    const formMethods = createMockFormMethods({
      rate: 50000,
      active: 'true',
    })

    const getFormSubmissionValues = createGetFormSubmissionValues(formMethods, schema)
    const result = getFormSubmissionValues()

    expect(result).toEqual({ rate: 50000, active: true })
  })

  it('returns a fresh snapshot on each call', () => {
    const schema = z.object({ name: z.string() })

    let currentValues = { name: 'Alice' }
    const formMethods = {
      getValues: vi.fn().mockImplementation(() => ({ ...currentValues })),
    } as unknown as UseFormReturn<Record<string, unknown>, unknown, Record<string, unknown>>

    const getFormSubmissionValues = createGetFormSubmissionValues(formMethods, schema)

    expect(getFormSubmissionValues()).toEqual({ name: 'Alice' })

    currentValues = { name: 'Bob' }
    expect(getFormSubmissionValues()).toEqual({ name: 'Bob' })
  })

  it('returns undefined when the form data is invalid', () => {
    const schema = z.object({
      email: z.string().email(),
    })

    const formMethods = createMockFormMethods({ email: 'not-an-email' })

    const getFormSubmissionValues = createGetFormSubmissionValues(formMethods, schema)

    expect(getFormSubmissionValues()).toBeUndefined()
  })

  it('returns undefined for empty required fields', () => {
    const schema = z.object({
      name: z.string().min(1),
    })

    const formMethods = createMockFormMethods({ name: '' })

    const getFormSubmissionValues = createGetFormSubmissionValues(formMethods, schema)

    expect(getFormSubmissionValues()).toBeUndefined()
  })

  it('never throws regardless of input', () => {
    const schema = z.object({
      count: z.number(),
      required: z.string().min(1),
    })

    const formMethods = createMockFormMethods({ count: 'not-a-number', required: '' })

    const getFormSubmissionValues = createGetFormSubmissionValues(formMethods, schema)

    expect(() => getFormSubmissionValues()).not.toThrow()
    expect(getFormSubmissionValues()).toBeUndefined()
  })
})
