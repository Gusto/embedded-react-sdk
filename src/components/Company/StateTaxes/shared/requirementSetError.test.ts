import { describe, expect, it } from 'vitest'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'
import { parseRequirementSetErrors } from './requirementSetError'

const createMockHttpMeta = () => ({
  response: new Response('', { status: 422 }),
  request: new Request('https://api.gusto.com/test'),
  body: '{}',
})

describe('parseRequirementSetErrors', () => {
  it('extracts key and state from a requirement_sets nested_errors error', () => {
    const error = new UnprocessableEntityError(
      {
        errors: [
          {
            errorKey: 'requirement_sets',
            category: 'nested_errors',
            metadata: { key: 'registrations', state: 'CO' },
            errors: [],
          },
        ],
      },
      createMockHttpMeta(),
    )

    expect(parseRequirementSetErrors(error)).toEqual([
      { key: 'registrations', state: 'CO', effectiveFrom: undefined, valueErrors: [] },
    ])
  })

  const registrationsMetadata = { key: 'registrations', state: 'OH', effective_from: '2026-01-01' }

  it('extracts nested per-requirement value errors and effective date', () => {
    const error = new UnprocessableEntityError(
      {
        errors: [
          {
            errorKey: 'requirement_sets',
            category: 'nested_errors',
            metadata: registrationsMetadata,
            errors: [
              {
                errorKey: 'requirements',
                category: 'nested_errors',
                metadata: { key: 'req-uuid' },
                errors: [
                  {
                    errorKey: 'value',
                    category: 'invalid_attribute_value',
                    message: 'ID format is invalid.',
                  },
                ],
              },
            ],
          },
        ],
      },
      createMockHttpMeta(),
    )

    expect(parseRequirementSetErrors(error)).toEqual([
      {
        key: 'registrations',
        state: 'OH',
        effectiveFrom: '2026-01-01',
        valueErrors: [{ requirementKey: 'req-uuid', message: 'ID format is invalid.' }],
      },
    ])
  })

  it('returns an entry for every requirement set in the response', () => {
    const valueError = (key: string, message: string) => ({
      errorKey: 'requirements',
      category: 'nested_errors',
      metadata: { key },
      errors: [{ errorKey: 'value', category: 'invalid_attribute_value', message }],
    })
    const error = new UnprocessableEntityError(
      {
        errors: [
          {
            errorKey: 'requirement_sets',
            category: 'nested_errors',
            metadata: { key: 'registrations', state: 'OH' },
            errors: [valueError('reg-uuid', 'ID format is invalid.')],
          },
          {
            errorKey: 'requirement_sets',
            category: 'nested_errors',
            metadata: { key: 'taxrates', state: 'OH' },
            errors: [valueError('rate-uuid', 'Rate is out of range.')],
          },
        ],
      },
      createMockHttpMeta(),
    )

    expect(parseRequirementSetErrors(error)).toMatchObject([
      {
        key: 'registrations',
        valueErrors: [{ requirementKey: 'reg-uuid', message: 'ID format is invalid.' }],
      },
      {
        key: 'taxrates',
        valueErrors: [{ requirementKey: 'rate-uuid', message: 'Rate is out of range.' }],
      },
    ])
  })

  it('returns null when the error is not an UnprocessableEntityError', () => {
    expect(parseRequirementSetErrors(new Error('boom'))).toBeNull()
  })

  it('returns null when no entry matches the requirement_sets/nested_errors shape', () => {
    const error = new UnprocessableEntityError(
      {
        errors: [
          {
            errorKey: 'first_name',
            category: 'invalid_attribute_value',
            message: 'First name is required',
          },
        ],
      },
      createMockHttpMeta(),
    )

    expect(parseRequirementSetErrors(error)).toBeNull()
  })

  it('returns null when metadata has no key', () => {
    const error = new UnprocessableEntityError(
      {
        errors: [
          {
            errorKey: 'requirement_sets',
            category: 'nested_errors',
            metadata: { state: 'CO' },
            errors: [],
          },
        ],
      },
      createMockHttpMeta(),
    )

    expect(parseRequirementSetErrors(error)).toBeNull()
  })
})
