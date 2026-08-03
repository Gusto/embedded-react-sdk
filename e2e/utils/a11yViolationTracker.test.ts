import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Page } from '@playwright/test'
import type { Result as AxeViolation } from 'axe-core'
import { A11yViolationTracker } from './a11yViolationTracker'
import { getAxeViolations } from './a11y'

vi.mock('./a11y', () => ({
  getAxeViolations: vi.fn(),
}))

const FAKE_PAGE = {} as Page

function makeViolation(overrides: Partial<AxeViolation> = {}): AxeViolation {
  return {
    id: 'heading-order',
    impact: 'moderate',
    help: 'Heading levels should only increase by one',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.12/heading-order',
    tags: [],
    description: '',
    nodes: [
      {
        target: ['#_r_78_'],
        html: '<h6 id="_r_78_">label</h6>',
        impact: 'moderate',
        any: [],
        all: [],
        none: [],
      },
    ],
    ...overrides,
  } as AxeViolation
}

describe('A11yViolationTracker', () => {
  let tracker: A11yViolationTracker

  beforeEach(() => {
    tracker = new A11yViolationTracker()
    vi.mocked(getAxeViolations).mockReset()
  })

  it('records no violations when the axe check passes', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([])

    await tracker.check(FAKE_PAGE, 'page load')

    expect(tracker.getViolations()).toEqual([])
  })

  it('collects a violation with its originating location', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([makeViolation()])

    await tracker.check(FAKE_PAGE, 'createAndSubmitOffCycleBonus (payrollFlowDrivers.ts:203)')

    expect(tracker.getViolations()).toMatchObject([
      {
        ruleId: 'heading-order',
        target: '#_r_78_',
        firstSeenAt: 'createAndSubmitOffCycleBonus (payrollFlowDrivers.ts:203)',
        recurredAt: [],
      },
    ])
  })

  it('dedupes the same rule+target recurring across different screens despite different auto-generated ids', async () => {
    vi.mocked(getAxeViolations)
      .mockResolvedValueOnce([
        makeViolation({ nodes: [{ ...makeViolation().nodes[0]!, target: ['#_r_0_'] }] }),
      ])
      .mockResolvedValueOnce([
        makeViolation({ nodes: [{ ...makeViolation().nodes[0]!, target: ['#_r_hg_'] }] }),
      ])

    await tracker.check(FAKE_PAGE, 'screen one')
    await tracker.check(FAKE_PAGE, 'screen two')

    expect(tracker.getViolations()).toHaveLength(1)
    expect(tracker.getViolations()[0]).toMatchObject({
      firstSeenAt: 'screen one',
      recurredAt: ['screen two'],
    })
  })

  it('does not dedupe genuinely different violations', async () => {
    vi.mocked(getAxeViolations)
      .mockResolvedValueOnce([makeViolation({ id: 'heading-order' })])
      .mockResolvedValueOnce([makeViolation({ id: 'label' })])

    await tracker.check(FAKE_PAGE, 'screen one')
    await tracker.check(FAKE_PAGE, 'screen two')

    expect(tracker.getViolations()).toHaveLength(2)
    expect(tracker.getViolations().map(v => v.ruleId)).toEqual(['heading-order', 'label'])
  })

  it('does not add the same location twice to recurredAt', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([makeViolation()])

    await tracker.check(FAKE_PAGE, 'same location')
    await tracker.check(FAKE_PAGE, 'same location')

    expect(tracker.getViolations()).toHaveLength(1)
    expect(tracker.getViolations()[0]?.recurredAt).toEqual([])
  })

  it('swallows errors from getAxeViolations instead of throwing', async () => {
    vi.mocked(getAxeViolations).mockRejectedValueOnce(new Error('page closed'))

    await expect(tracker.check(FAKE_PAGE, 'screen one')).resolves.toBeUndefined()
    expect(tracker.getViolations()).toEqual([])
  })

  it('reset() clears collected violations', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([makeViolation()])
    await tracker.check(FAKE_PAGE, 'screen one')
    expect(tracker.getViolations()).toHaveLength(1)

    tracker.reset()

    expect(tracker.getViolations()).toEqual([])
  })

  it('reset() allows a violation seen before the reset to be recorded fresh afterward', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([makeViolation()])
    await tracker.check(FAKE_PAGE, 'screen one')
    tracker.reset()

    await tracker.check(FAKE_PAGE, 'screen one')

    expect(tracker.getViolations()).toHaveLength(1)
    expect(tracker.getViolations()[0]?.recurredAt).toEqual([])
  })

  it('format() produces a human-readable dump including recurrence info', async () => {
    vi.mocked(getAxeViolations)
      .mockResolvedValueOnce([makeViolation()])
      .mockResolvedValueOnce([makeViolation()])

    await tracker.check(FAKE_PAGE, 'screen one')
    await tracker.check(FAKE_PAGE, 'screen two')

    const formatted = tracker.format()
    expect(formatted).toContain('heading-order (moderate)')
    expect(formatted).toContain('first seen at: screen one')
    expect(formatted).toContain('also at: screen two')
  })
})
