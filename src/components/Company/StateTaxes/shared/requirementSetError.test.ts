import { describe, expect, it } from 'vitest'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'
import { parseRequirementSetError } from './requirementSetError'

const createMockHttpMeta = () => ({
  response: new Response('', { status: 422 }),
  request: new Request('https://api.gusto.com/test'),
  body: '{}',
})

describe('parseRequirementSetError', () => {
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

    expect(parseRequirementSetError(error)).toEqual({ key: 'registrations', state: 'CO' })
  })

  it('returns null when the error is not an UnprocessableEntityError', () => {
    expect(parseRequirementSetError(new Error('boom'))).toBeNull()
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

    expect(parseRequirementSetError(error)).toBeNull()
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

    expect(parseRequirementSetError(error)).toBeNull()
  })
})
