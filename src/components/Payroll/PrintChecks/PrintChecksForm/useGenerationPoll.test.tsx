import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGenerationPoll } from './useGenerationPoll'
import { usePollingTask } from '@/hooks/usePollingTask/usePollingTask'
import type * as PollingTaskModule from '@/hooks/usePollingTask/usePollingTask'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

vi.mock('@/hooks/usePollingTask/usePollingTask', async importOriginal => ({
  ...(await importOriginal<typeof PollingTaskModule>()),
  usePollingTask: vi.fn(() => ({ start: vi.fn(), stop: vi.fn(), isPolling: false })),
}))

describe('print checks deadline fallback', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    'javascript:alert(1)',
    'data:text/html,unsafe',
    'http://example.com/checks.pdf',
    'invalid',
    '/checks.pdf',
    '',
  ])('rejects an unsafe URL: %s', url => {
    const onSucceeded = vi.fn()
    const onFailed = vi.fn()
    renderHook(() => useGenerationPoll({ onSucceeded, onFailed }), { wrapper: GustoTestProvider })
    const options = vi.mocked(usePollingTask).mock.calls.at(-1)![0]
    options.onDeadline({ generatedDocument: { status: 'succeeded', documentUrls: [url] } })
    expect(onFailed).toHaveBeenCalledTimes(1)
    expect(onSucceeded).not.toHaveBeenCalled()
  })

  it('preserves a valid document when the deadline and generation completion coincide', () => {
    const onSucceeded = vi.fn()
    const onFailed = vi.fn()
    renderHook(() => useGenerationPoll({ onSucceeded, onFailed }), { wrapper: GustoTestProvider })
    const options = vi.mocked(usePollingTask).mock.calls.at(-1)![0]
    options.onDeadline({
      generatedDocument: { status: 'succeeded', documentUrls: ['https://example.com/checks.pdf'] },
    })
    expect(onSucceeded).toHaveBeenCalledWith('https://example.com/checks.pdf')
    expect(onFailed).not.toHaveBeenCalled()
  })
})
