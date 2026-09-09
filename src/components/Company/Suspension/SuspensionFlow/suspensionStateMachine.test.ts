import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { suspensionMachine, suspensionInitialComponent } from './suspensionStateMachine'
import { SuspensionSummaryContextual } from './SuspensionFlowComponents'
import type { SuspensionFlowContextInterface } from './SuspensionFlowComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: 'form' | 'summary') {
  const machine = createMachine(
    initialState,
    suspensionMachine,
    (ctx: SuspensionFlowContextInterface) => ({
      ...ctx,
      component: suspensionInitialComponent[initialState],
      companyId: 'test-company',
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('suspensionStateMachine', () => {
  it('starts in the form state and swaps to the summary on COMPANY_SUSPENSION_CREATED', () => {
    const service = createService('form')
    expect(service.machine.current).toBe('form')

    send(service, componentEvents.COMPANY_SUSPENSION_CREATED, { uuid: 'suspension-1' })

    expect(service.machine.current).toBe('summary')
    expect(service.context.component).toBe(SuspensionSummaryContextual)
  })

  it('can start directly in the summary state for an already-suspended company', () => {
    const service = createService('summary')
    expect(service.machine.current).toBe('summary')
    expect(service.context.component).toBe(SuspensionSummaryContextual)
  })
})
