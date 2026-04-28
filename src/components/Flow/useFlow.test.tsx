import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FlowContext, useFlow, type FlowContextInterface } from './useFlow'

describe('useFlow', () => {
  it('throws when used outside of a FlowContext.Provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useFlow())).toThrow('useFlow used outside provider')

    consoleErrorSpy.mockRestore()
  })

  it('returns the context value when used inside a FlowContext.Provider', () => {
    const onEvent = vi.fn()
    const TestComponent = () => null
    const value: FlowContextInterface = {
      component: TestComponent,
      onEvent,
      header: { type: 'minimal' },
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
    )

    const { result } = renderHook(() => useFlow(), { wrapper })

    expect(result.current).toBe(value)
    expect(result.current.component).toBe(TestComponent)
    expect(result.current.onEvent).toBe(onEvent)
    expect(result.current.header).toEqual({ type: 'minimal' })
  })

  it('preserves discriminated header variants in the returned context', () => {
    const onEvent = vi.fn()
    const value: FlowContextInterface = {
      component: () => null,
      onEvent,
      header: {
        type: 'breadcrumbs',
        currentBreadcrumbId: 'step-1',
        breadcrumbs: { 'step-1': [{ id: 'step-1', label: 'Step One' }] },
      },
    }

    const wrapper = ({ children }: { children: ReactNode }) => (
      <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
    )

    const { result } = renderHook(() => useFlow(), { wrapper })

    expect(result.current.header).toMatchObject({
      type: 'breadcrumbs',
      currentBreadcrumbId: 'step-1',
    })
  })
})
