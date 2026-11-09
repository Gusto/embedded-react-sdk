import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import type { Job } from '@gusto/embedded-api/models/components/job'
import { describe, expect, it } from 'vitest'
import { getCompensationHistory } from './getCompensationHistory'
import { FlsaStatus } from '@/shared/constants'
import { assertDefined } from '@/test-utils/assertions'

const TODAY = new Date('2026-05-19T12:00:00')

const buildComp = (overrides: Partial<Compensation> = {}): Compensation => ({
  uuid: 'comp-current',
  version: 'v1',
  rate: '30.00',
  paymentUnit: 'Hour',
  flsaStatus: FlsaStatus.NONEXEMPT,
  effectiveDate: '2024-01-01',
  title: 'Cashier',
  adjustForMinimumWage: false,
  ...overrides,
})

const buildJob = (overrides: Partial<Job> = {}, compensations: Compensation[] = []): Job => ({
  uuid: 'job-1',
  title: 'Cashier',
  primary: true,
  currentCompensationUuid: 'comp-current',
  rate: '30.00',
  paymentUnit: 'Hour',
  compensations,
  ...overrides,
})

describe('getCompensationHistory', () => {
  it('returns [] when there are no jobs', () => {
    expect(getCompensationHistory(undefined, { today: TODAY })).toEqual([])
    expect(getCompensationHistory([], { today: TODAY })).toEqual([])
  })

  it('tags past, current and upcoming compensations and orders them newest first', () => {
    const job = buildJob({}, [
      buildComp({ uuid: 'comp-past', effectiveDate: '2024-01-01', rate: '25.00' }),
      buildComp({ uuid: 'comp-future', effectiveDate: '2026-09-01', rate: '40.00' }),
      buildComp({ uuid: 'comp-now', effectiveDate: '2025-06-01', rate: '30.00' }),
    ])

    const [history] = getCompensationHistory([job], { today: TODAY })
    assertDefined(history)

    expect(history.entries.map(entry => [entry.compensationId, entry.status])).toEqual([
      ['comp-future', 'upcoming'],
      ['comp-now', 'current'],
      ['comp-past', 'past'],
    ])
  })

  it('treats a compensation effective today as current', () => {
    const job = buildJob({}, [
      buildComp({ uuid: 'comp-today', effectiveDate: '2026-05-19' }),
      buildComp({ uuid: 'comp-past', effectiveDate: '2024-01-01' }),
    ])

    const [history] = getCompensationHistory([job], { today: TODAY })
    assertDefined(history)

    expect(history.entries.map(entry => [entry.compensationId, entry.status])).toEqual([
      ['comp-today', 'current'],
      ['comp-past', 'past'],
    ])
  })

  it('marks every entry upcoming for a job that has not started yet', () => {
    const job = buildJob({ title: 'Line cook' }, [
      buildComp({ uuid: 'comp-start', effectiveDate: '2026-07-01', title: 'Line cook' }),
      buildComp({ uuid: 'comp-raise', effectiveDate: '2026-10-01', title: 'Line cook' }),
    ])

    const [history] = getCompensationHistory([job], { today: TODAY })
    assertDefined(history)

    expect(history.entries.map(entry => entry.status)).toEqual(['upcoming', 'upcoming'])
    expect(history.jobTitle).toBe('Line cook')
  })

  it('reads title, rate, payment unit and FLSA status off each compensation', () => {
    const job = buildJob({ title: 'Stale job title' }, [
      buildComp({
        uuid: 'comp-now',
        effectiveDate: '2025-06-01',
        title: 'Shift supervisor',
        rate: '68000.00',
        paymentUnit: 'Year',
        flsaStatus: FlsaStatus.EXEMPT,
      }),
    ])

    const [history] = getCompensationHistory([job], { today: TODAY })
    assertDefined(history)

    expect(history).toMatchObject({
      jobId: 'job-1',
      isPrimary: true,
      jobTitle: 'Shift supervisor',
    })
    expect(history.entries[0]).toMatchObject({
      compensationId: 'comp-now',
      effectiveDate: '2025-06-01',
      title: 'Shift supervisor',
      rate: '68000.00',
      paymentUnit: 'Year',
      flsaStatus: FlsaStatus.EXEMPT,
      status: 'current',
    })
  })

  it('builds a separate history for each job', () => {
    const jobs = [
      buildJob({ uuid: 'job-primary', title: 'Server', primary: true }, [
        buildComp({ uuid: 'comp-a', effectiveDate: '2025-01-01', title: 'Server' }),
      ]),
      buildJob({ uuid: 'job-secondary', title: 'Bartender', primary: false }, [
        buildComp({ uuid: 'comp-b', effectiveDate: '2025-03-01', title: 'Bartender' }),
        buildComp({ uuid: 'comp-c', effectiveDate: '2024-03-01', title: 'Barback' }),
      ]),
    ]

    const history = getCompensationHistory(jobs, { today: TODAY })

    expect(history.map(entry => [entry.jobId, entry.isPrimary, entry.entries.length])).toEqual([
      ['job-primary', true, 1],
      ['job-secondary', false, 2],
    ])
  })

  it('skips jobs with no effective-dated compensations', () => {
    const jobs = [
      buildJob({ uuid: 'job-empty' }, []),
      buildJob({ uuid: 'job-undated' }, [buildComp({ effectiveDate: undefined })]),
      buildJob({ uuid: 'job-real' }, [buildComp({ uuid: 'comp-real' })]),
    ]

    expect(getCompensationHistory(jobs, { today: TODAY }).map(entry => entry.jobId)).toEqual([
      'job-real',
    ])
  })
})
