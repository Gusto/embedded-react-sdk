import { describe, expect, it } from 'vitest'
import { createEmployeeDetailsSchema, EmployeeDetailsErrorCodes } from './employeeDetailsSchema'

const parse = (values: Record<string, unknown>) => {
  const [schema] = createEmployeeDetailsSchema({ mode: 'create' })
  return schema.safeParse({ selfOnboarding: false, middleInitial: '', ...values })
}

const messageFor = (result: ReturnType<typeof parse>, field: string) =>
  result.success ? undefined : result.error.issues.find(i => i.path.includes(field))?.message

describe('createEmployeeDetailsSchema name fields', () => {
  it('trims surrounding whitespace from firstName/lastName instead of rejecting it', () => {
    const result = parse({ firstName: ' Jane ', lastName: 'Doe  ' })
    expect(result).toMatchObject({ success: true, data: { firstName: 'Jane', lastName: 'Doe' } })
  })

  it('reports REQUIRED for whitespace-only names', () => {
    const result = parse({ firstName: '   ', lastName: 'Doe' })
    expect(messageFor(result, 'firstName')).toBe(EmployeeDetailsErrorCodes.REQUIRED)
  })

  it('reports INVALID_NAME for malformed non-empty names', () => {
    const result = parse({ firstName: 'J4ne', lastName: 'Doe' })
    expect(messageFor(result, 'firstName')).toBe(EmployeeDetailsErrorCodes.INVALID_NAME)
  })
})
