import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Page } from '@playwright/test'
import type { Result as AxeViolation } from 'axe-core'
import { createA11yEventCollector } from './a11yEventCollector'
import { getAxeViolations } from './a11y'

vi.mock('./a11y', () => ({
  getAxeViolations: vi.fn(),
}))

type ExposedFn = (eventType: string) => void

function createFakePage() {
  let exposed: ExposedFn | undefined
  const page = {
    exposeFunction: vi.fn(async (_name: string, fn: ExposedFn) => {
      exposed = fn
    }),
  } as unknown as Page

  const trigger = (eventType: string) => exposed?.(eventType)
  return { page, trigger }
}

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

describe('createA11yEventCollector', () => {
  beforeEach(() => {
    vi.mocked(getAxeViolations).mockReset()
  })

  it('exposes __e2eOnSdkEvent on the page', async () => {
    const { page } = createFakePage()

    await createA11yEventCollector(page)

    expect(page.exposeFunction).toHaveBeenCalledWith('__e2eOnSdkEvent', expect.any(Function))
  })

  it('records no violations when the axe check passes', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([])
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('runPayroll/calculated')
    await collector.awaitPending()

    expect(collector.getViolations()).toEqual([])
  })

  it('collects a violation with its originating event', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([makeViolation()])
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('runPayroll/calculated')
    await collector.awaitPending()

    expect(collector.getViolations()).toMatchObject([
      {
        ruleId: 'heading-order',
        target: '#_r_78_',
        firstSeenEvent: 'runPayroll/calculated',
        recurredOnEvents: [],
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
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('screen/one')
    trigger('screen/two')
    await collector.awaitPending()

    expect(collector.getViolations()).toHaveLength(1)
    expect(collector.getViolations()[0]).toMatchObject({
      firstSeenEvent: 'screen/one',
      recurredOnEvents: ['screen/two'],
    })
  })

  it('does not dedupe genuinely different violations', async () => {
    vi.mocked(getAxeViolations)
      .mockResolvedValueOnce([makeViolation({ id: 'heading-order' })])
      .mockResolvedValueOnce([makeViolation({ id: 'label' })])
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('screen/one')
    trigger('screen/two')
    await collector.awaitPending()

    expect(collector.getViolations()).toHaveLength(2)
    expect(collector.getViolations().map(v => v.ruleId)).toEqual(['heading-order', 'label'])
  })

  it('does not add the same event twice to recurredOnEvents', async () => {
    vi.mocked(getAxeViolations).mockResolvedValue([makeViolation()])
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('same/event')
    trigger('same/event')
    await collector.awaitPending()

    expect(collector.getViolations()).toHaveLength(1)
    expect(collector.getViolations()[0]?.recurredOnEvents).toEqual([])
  })

  it('serializes overlapping events so axe checks never run concurrently', async () => {
    const order: string[] = []
    vi.mocked(getAxeViolations).mockImplementation(async () => {
      order.push('start')
      await new Promise(resolve => setTimeout(resolve, 0))
      order.push('end')
      return []
    })
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('event/one')
    trigger('event/two')
    await collector.awaitPending()

    expect(order).toEqual(['start', 'end', 'start', 'end'])
  })

  it('swallows errors from getAxeViolations instead of crashing the queue', async () => {
    vi.mocked(getAxeViolations).mockRejectedValueOnce(new Error('page closed'))
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('event/one')
    await expect(collector.awaitPending()).resolves.toBeUndefined()
    expect(collector.getViolations()).toEqual([])
  })

  it('format() produces a human-readable dump including recurrence info', async () => {
    vi.mocked(getAxeViolations)
      .mockResolvedValueOnce([makeViolation()])
      .mockResolvedValueOnce([makeViolation()])
    const { page, trigger } = createFakePage()
    const collector = await createA11yEventCollector(page)

    trigger('screen/one')
    trigger('screen/two')
    await collector.awaitPending()

    const formatted = collector.format()
    expect(formatted).toContain('heading-order (moderate)')
    expect(formatted).toContain('first seen on event: screen/one')
    expect(formatted).toContain('also on: screen/two')
  })
})
