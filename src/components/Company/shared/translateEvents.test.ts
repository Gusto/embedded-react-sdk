import { describe, expect, it, vi } from 'vitest'
import { translateEvents } from './translateEvents'
import { componentEvents } from '@/shared/constants'

describe('translateEvents', () => {
  const mapping = {
    [componentEvents.COMPANY_INDUSTRY_SELECTED]:
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED,
  }

  it('forwards the original event first, then the mapped one', () => {
    const onEvent = vi.fn()

    translateEvents(onEvent, mapping)(componentEvents.COMPANY_INDUSTRY_SELECTED, { naics: '5415' })

    expect(onEvent.mock.calls).toEqual([
      [componentEvents.COMPANY_INDUSTRY_SELECTED, { naics: '5415' }],
      [componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED, { naics: '5415' }],
    ])
  })

  it('passes through an unmapped event exactly once', () => {
    const onEvent = vi.fn()

    translateEvents(onEvent, mapping)(componentEvents.COMPANY_LOCATION_DONE, null)

    expect(onEvent.mock.calls).toEqual([[componentEvents.COMPANY_LOCATION_DONE, null]])
  })
})
