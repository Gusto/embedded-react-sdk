import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { confirmWireDetailsMachine } from './confirmWireDetailsStateMachine'
import type { ConfirmWireDetailsContextInterface } from './ConfirmWireDetailsComponents'
import { payrollWireEvents } from '@/shared/constants'

function createService() {
  const machine = createMachine(
    'banner',
    confirmWireDetailsMachine,
    (initialContext: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
      ...initialContext,
      component: null,
      companyId: 'test-company',
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('confirmWireDetailsMachine', () => {
  it('shows the confirmation alert on the banner after the form is submitted', () => {
    const service = createService()
    send(service, payrollWireEvents.PAYROLL_WIRE_START_TRANSFER)
    send(service, payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE, { selectedWireInId: 'wire-1' })

    send(service, payrollWireEvents.PAYROLL_WIRE_FORM_DONE, {
      confirmationAlert: { title: 'Wire submitted' },
    })

    expect(service.machine.current).toBe('banner')
    expect(service.context.confirmationAlert).toEqual({ title: 'Wire submitted' })
  })

  it('clears the previous confirmation alert when a new transfer starts', () => {
    const service = createService()
    send(service, payrollWireEvents.PAYROLL_WIRE_START_TRANSFER)
    send(service, payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE, { selectedWireInId: 'wire-1' })
    send(service, payrollWireEvents.PAYROLL_WIRE_FORM_DONE, {
      confirmationAlert: { title: 'Wire submitted' },
    })

    send(service, payrollWireEvents.PAYROLL_WIRE_START_TRANSFER)
    send(service, payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL)

    expect(service.machine.current).toBe('banner')
    expect(service.context.confirmationAlert).toBeUndefined()
  })
})
