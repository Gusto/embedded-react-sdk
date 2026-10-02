import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { contractorListStateMachine } from './contractorListStateMachine'
import type { ContractorListFlowContextInterface } from './ContractorListFlowComponents'
import { componentEvents } from '@/shared/constants'

type ContractorListState = 'list' | 'dashboard' | 'dismiss'

function createTestMachine(initialState: ContractorListState = 'list') {
  return createMachine(
    initialState,
    contractorListStateMachine,
    (initialContext: ContractorListFlowContextInterface) => ({
      ...initialContext,
      component: () => null,
      companyId: 'company-123',
    }),
  )
}

function createService(initialState: ContractorListState = 'list') {
  const machine = createTestMachine(initialState)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('contractorListStateMachine', () => {
  it('transitions from list to dismiss on CONTRACTOR_DISMISS, clearing any stale successMessage', () => {
    const service = createService('list')
    service.context.successMessage = 'stale message'

    send(service, componentEvents.CONTRACTOR_DISMISS, { contractorId: 'contractor-123' })

    expect(service.machine.current).toBe('dismiss')
    expect(service.context.contractorId).toBe('contractor-123')
    expect(service.context.successMessage).toBeUndefined()
  })

  it('transitions from dismiss back to list with the success message on CONTRACTOR_DISMISSAL_SCHEDULED', () => {
    const service = createService('dismiss')
    service.context.contractorId = 'contractor-123'

    send(service, componentEvents.CONTRACTOR_DISMISSAL_SCHEDULED, {
      contractorId: 'contractor-123',
      endDate: '2026-09-01',
      message: 'Dismissal scheduled',
    })

    expect(service.machine.current).toBe('list')
    expect(service.context.successMessage).toBe('Dismissal scheduled')
    expect(service.context.contractorId).toBeUndefined()
  })

  it('transitions from dismiss back to list with no success message on CANCEL', () => {
    const service = createService('dismiss')
    service.context.contractorId = 'contractor-123'

    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('list')
    expect(service.context.successMessage).toBeUndefined()
    expect(service.context.contractorId).toBeUndefined()
  })

  it('transitions from dismiss back to list with no success message on CONTRACTOR_RETURN_TO_LIST', () => {
    const service = createService('dismiss')
    service.context.contractorId = 'contractor-123'

    send(service, componentEvents.CONTRACTOR_RETURN_TO_LIST)

    expect(service.machine.current).toBe('list')
    expect(service.context.successMessage).toBeUndefined()
  })
})
