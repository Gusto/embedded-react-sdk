import { describe, it, expect } from 'vitest'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import { derivePrimaryFlsaStatus } from './derivePrimaryFlsaStatus'

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    uuid: 'job-1',
    employeeUuid: 'employee-1',
    primary: false,
    currentCompensationUuid: undefined,
    compensations: [],
    ...overrides,
  } as Job
}

describe('derivePrimaryFlsaStatus', () => {
  it('returns undefined for an empty job list', () => {
    expect(derivePrimaryFlsaStatus([])).toBeUndefined()
  })

  it('returns undefined when input is undefined', () => {
    expect(derivePrimaryFlsaStatus(undefined)).toBeUndefined()
  })

  it('returns undefined when no job is primary', () => {
    const jobs = [
      makeJob({
        uuid: 'job-1',
        primary: false,
        currentCompensationUuid: 'comp-1',
        compensations: [{ uuid: 'comp-1', flsaStatus: 'Exempt' }],
      }),
    ]
    expect(derivePrimaryFlsaStatus(jobs)).toBeUndefined()
  })

  it('returns undefined when the primary job has no resolvable current compensation', () => {
    const jobs = [
      makeJob({
        uuid: 'job-1',
        primary: true,
        currentCompensationUuid: 'missing-comp',
        compensations: [{ uuid: 'comp-1', flsaStatus: 'Exempt' }],
      }),
    ]
    expect(derivePrimaryFlsaStatus(jobs)).toBeUndefined()
  })

  it("returns the flsaStatus of the primary job's current compensation", () => {
    const jobs = [
      makeJob({
        uuid: 'job-1',
        primary: true,
        currentCompensationUuid: 'comp-1',
        compensations: [
          { uuid: 'comp-1', flsaStatus: 'Nonexempt' },
          { uuid: 'comp-0', flsaStatus: 'Exempt' },
        ],
      }),
    ]
    expect(derivePrimaryFlsaStatus(jobs)).toBe('Nonexempt')
  })

  it('ignores non-primary jobs and returns the primary one', () => {
    const jobs = [
      makeJob({
        uuid: 'job-secondary',
        primary: false,
        currentCompensationUuid: 'comp-2',
        compensations: [{ uuid: 'comp-2', flsaStatus: 'Salaried Nonexempt' }],
      }),
      makeJob({
        uuid: 'job-primary',
        primary: true,
        currentCompensationUuid: 'comp-1',
        compensations: [{ uuid: 'comp-1', flsaStatus: 'Nonexempt' }],
      }),
    ]
    expect(derivePrimaryFlsaStatus(jobs)).toBe('Nonexempt')
  })
})
