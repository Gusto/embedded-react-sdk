import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import type { Job } from '@gusto/embedded-api/models/components/job'
import { describe, expect, it } from 'vitest'
import { getPendingCompensationChanges } from './getPendingCompensationChanges'
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

describe('getPendingCompensationChanges', () => {
  it('returns [] when no jobs are provided', () => {
    expect(getPendingCompensationChanges(undefined, { today: TODAY })).toEqual([])
    expect(getPendingCompensationChanges([], { today: TODAY })).toEqual([])
  })

  it('returns [] when no future-dated compensations exist', () => {
    const job = buildJob({}, [buildComp({ effectiveDate: '2024-01-01' })])
    expect(getPendingCompensationChanges([job], { today: TODAY })).toEqual([])
  })

  it('emits payChange when only rate differs', () => {
    const current = buildComp()
    const future = buildComp({
      uuid: 'comp-future',
      rate: '35.00',
      effectiveDate: '2026-06-01',
    })
    const job = buildJob({}, [current, future])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      compensationUuid: 'comp-future',
      jobUuid: 'job-1',
      effectiveDate: '2026-06-01',
      jobTitle: 'Cashier',
      details: [{ kind: 'payChange', rate: 35, paymentUnit: 'Hour' }],
    })
  })

  it('emits payChange when only paymentUnit differs', () => {
    const current = buildComp({ paymentUnit: 'Hour', rate: '30.00' })
    const future = buildComp({
      uuid: 'comp-future',
      paymentUnit: 'Year',
      rate: '30.00',
      effectiveDate: '2026-06-01',
    })
    const job = buildJob({}, [current, future])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result[0]).toMatchObject({
      details: [{ kind: 'payChange', rate: 30, paymentUnit: 'Year' }],
    })
  })

  it('emits a single payChange when both rate and paymentUnit differ', () => {
    const current = buildComp({ paymentUnit: 'Hour', rate: '30.00' })
    const future = buildComp({
      uuid: 'comp-future',
      paymentUnit: 'Year',
      rate: '60000.00',
      effectiveDate: '2026-06-01',
    })
    const job = buildJob({}, [current, future])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result[0]).toMatchObject({
      details: [{ kind: 'payChange', rate: 60000, paymentUnit: 'Year' }],
    })
  })

  it('emits titleChange when only title differs', () => {
    const current = buildComp({ title: 'Cashier' })
    const future = buildComp({
      uuid: 'comp-future',
      title: 'Senior Cashier',
      effectiveDate: '2026-06-01',
    })
    const job = buildJob({}, [current, future])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result[0]).toMatchObject({
      details: [{ kind: 'titleChange', title: 'Senior Cashier' }],
    })
  })

  it('emits both titleChange and payChange when both differ', () => {
    const current = buildComp({ title: 'Cashier', rate: '30.00' })
    const future = buildComp({
      uuid: 'comp-future',
      title: 'Senior Cashier',
      rate: '35.00',
      effectiveDate: '2026-06-01',
    })
    const job = buildJob({}, [current, future])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result[0]).toMatchObject({
      details: [
        { kind: 'titleChange', title: 'Senior Cashier' },
        { kind: 'payChange', rate: 35, paymentUnit: 'Hour' },
      ],
    })
  })

  it('emits flsaChange carrying the new FlsaStatus enum value', () => {
    const current = buildComp({ flsaStatus: FlsaStatus.NONEXEMPT })
    const future = buildComp({
      uuid: 'comp-future',
      flsaStatus: FlsaStatus.EXEMPT,
      effectiveDate: '2026-06-01',
    })
    const job = buildJob({}, [current, future])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result[0]).toMatchObject({
      details: expect.arrayContaining([{ kind: 'flsaChange', flsaStatus: FlsaStatus.EXEMPT }]),
    })
  })

  describe('minimum wage adjustment', () => {
    it('off → on with wage emits minWageEnabled carrying the wage string', () => {
      const current = buildComp({ adjustForMinimumWage: false })
      const future = buildComp({
        uuid: 'comp-future',
        adjustForMinimumWage: true,
        minimumWages: [{ uuid: 'mw-1', wage: '16.50' }],
        effectiveDate: '2026-06-01',
      })
      const job = buildJob({}, [current, future])

      const result = getPendingCompensationChanges([job], { today: TODAY })

      expect(result[0]).toMatchObject({
        details: expect.arrayContaining([{ kind: 'minWageEnabled', wage: '16.50' }]),
      })
    })

    it('off → on without minimumWages entry emits minWageEnabled with wage=null', () => {
      const current = buildComp({ adjustForMinimumWage: false })
      const future = buildComp({
        uuid: 'comp-future',
        adjustForMinimumWage: true,
        minimumWages: [],
        effectiveDate: '2026-06-01',
      })
      const job = buildJob({}, [current, future])

      const result = getPendingCompensationChanges([job], { today: TODAY })

      expect(result[0]).toMatchObject({
        details: expect.arrayContaining([{ kind: 'minWageEnabled', wage: null }]),
      })
    })

    it('on → off emits minWageDisabled', () => {
      const current = buildComp({
        adjustForMinimumWage: true,
        minimumWages: [{ uuid: 'mw-1', wage: '16.50' }],
      })
      const future = buildComp({
        uuid: 'comp-future',
        adjustForMinimumWage: false,
        minimumWages: [],
        effectiveDate: '2026-06-01',
      })
      const job = buildJob({}, [current, future])

      const result = getPendingCompensationChanges([job], { today: TODAY })

      expect(result[0]).toMatchObject({
        details: expect.arrayContaining([{ kind: 'minWageDisabled' }]),
      })
    })

    it('on → on with a different minimum wage entry emits minWageChanged', () => {
      const current = buildComp({
        adjustForMinimumWage: true,
        minimumWages: [{ uuid: 'mw-1', wage: '16.50' }],
      })
      const future = buildComp({
        uuid: 'comp-future',
        adjustForMinimumWage: true,
        minimumWages: [{ uuid: 'mw-2', wage: '17.25' }],
        effectiveDate: '2026-06-01',
      })
      const job = buildJob({}, [current, future])

      const result = getPendingCompensationChanges([job], { today: TODAY })

      expect(result[0]).toMatchObject({
        details: expect.arrayContaining([{ kind: 'minWageChanged', wage: '17.25' }]),
      })
    })

    it('on → on with the same minimum wage entry emits no min-wage bullet', () => {
      const current = buildComp({
        adjustForMinimumWage: true,
        minimumWages: [{ uuid: 'mw-1', wage: '16.50' }],
      })
      const future = buildComp({
        uuid: 'comp-future',
        adjustForMinimumWage: true,
        minimumWages: [{ uuid: 'mw-1', wage: '16.50' }],
        rate: '35.00',
        effectiveDate: '2026-06-01',
      })
      const job = buildJob({}, [current, future])

      const result = getPendingCompensationChanges([job], { today: TODAY })

      expect(result[0]).toMatchObject({
        details: [{ kind: 'payChange', rate: 35, paymentUnit: 'Hour' }],
      })
    })
  })

  it('treats a job whose currentCompensationUuid is unresolved as a new job', () => {
    const future = buildComp({
      uuid: 'comp-future',
      title: 'Stock Associate',
      rate: '22.00',
      effectiveDate: '2026-06-01',
    })
    const job = buildJob(
      { uuid: 'job-2', title: 'Stock Associate', currentCompensationUuid: undefined },
      [future],
    )

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result[0]).toMatchObject({
      details: [{ kind: 'newJob', title: 'Stock Associate', rate: 22, paymentUnit: 'Hour' }],
    })
  })

  it('treats a job whose currentCompensationUuid points at a future comp as a new job', () => {
    const future = buildComp({
      uuid: 'comp-future',
      title: 'Stock Associate',
      rate: '22.00',
      effectiveDate: '2026-06-01',
    })
    const job = buildJob({ currentCompensationUuid: 'comp-future' }, [future])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result[0]).toMatchObject({ details: [{ kind: 'newJob' }] })
  })

  it('returns stacked future comps in ascending effectiveDate order with diff baselined to the previous comp', () => {
    const current = buildComp({ rate: '30.00' })
    const futureA = buildComp({
      uuid: 'comp-future-a',
      rate: '32.00',
      effectiveDate: '2026-06-01',
    })
    const futureB = buildComp({
      uuid: 'comp-future-b',
      rate: '35.00',
      effectiveDate: '2026-09-01',
    })
    const job = buildJob({}, [current, futureB, futureA])

    const result = getPendingCompensationChanges([job], { today: TODAY })

    expect(result.map(r => r.compensationUuid)).toEqual(['comp-future-a', 'comp-future-b'])
    expect(result[0]).toMatchObject({
      details: [{ kind: 'payChange', rate: 32, paymentUnit: 'Hour' }],
    })
    expect(result[1]).toMatchObject({
      details: [{ kind: 'payChange', rate: 35, paymentUnit: 'Hour' }],
    })
  })

  it('flattens pending changes across multiple jobs and sorts globally by effectiveDate', () => {
    const jobA = buildJob({ uuid: 'job-a' }, [
      buildComp({ uuid: 'curr-a', rate: '30.00' }),
      buildComp({
        uuid: 'future-a',
        rate: '32.00',
        effectiveDate: '2026-09-01',
      }),
    ])
    const jobB = buildJob({ uuid: 'job-b', currentCompensationUuid: 'curr-b', title: 'Cleaner' }, [
      buildComp({ uuid: 'curr-b', rate: '20.00', title: 'Cleaner' }),
      buildComp({
        uuid: 'future-b',
        rate: '25.00',
        title: 'Cleaner',
        effectiveDate: '2026-07-15',
      }),
    ])

    const result = getPendingCompensationChanges([jobA, jobB], { today: TODAY })

    expect(result.map(r => r.compensationUuid)).toEqual(['future-b', 'future-a'])

    const [first, second] = result
    assertDefined(first)
    assertDefined(second)
    expect(first.jobUuid).toBe('job-b')
    expect(second.jobUuid).toBe('job-a')
  })

  it('ignores a compensation whose effectiveDate is exactly today (strict > semantics)', () => {
    const todayISO = '2026-05-19'
    const current = buildComp({ rate: '30.00' })
    const sameDayComp = buildComp({
      uuid: 'comp-same-day',
      rate: '35.00',
      effectiveDate: todayISO,
    })
    const job = buildJob({}, [current, sameDayComp])

    expect(getPendingCompensationChanges([job], { today: TODAY })).toEqual([])
  })

  it('ignores compensations missing an effectiveDate', () => {
    const current = buildComp({ rate: '30.00' })
    const noDateComp = buildComp({
      uuid: 'comp-no-date',
      rate: '35.00',
      effectiveDate: undefined,
    })
    const job = buildJob({}, [current, noDateComp])

    expect(getPendingCompensationChanges([job], { today: TODAY })).toEqual([])
  })
})
