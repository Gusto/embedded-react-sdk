import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { bankAccountBlockStateMachine } from './bankAccountBlockStateMachine'
import {
  BankAccountCardContextual,
  type BankAccountBlockContextInterface,
} from './BankAccountComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof bankAccountBlockStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    bankAccountBlockStateMachine,
    (initialContext: BankAccountBlockContextInterface): BankAccountBlockContextInterface => ({
      ...initialContext,
      component: BankAccountCardContextual,
      companyId: 'company-123',
      successAlert: null,
      pendingAlert: null,
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string) {
  ;(service.send as SendFunction<string>)({ type })
}

describe('bankAccountBlockStateMachine', () => {
  it('opens the editor on the card action and sets its own back header', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_REQUESTED)

    expect(service.machine.current).toBe('bankAccount')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.BankAccount',
        event: componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_CANCELLED,
      },
    })
  })

  it('stays in the editor across add and verify, recording the alert rather than showing it', () => {
    // Adding an account and verifying its micro-deposits are separate steps of one visit, so
    // returning to the card on the first would strand the user before the second.
    const service = createService('bankAccount')
    send(service, componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_UPDATED)

    expect(service.machine.current).toBe('bankAccount')
    expect(service.context.pendingAlert).toBe('bankAccountUpdated')
    expect(service.context.successAlert).toBeNull()
  })

  it('surfaces the recorded alert on the card once the user leaves', () => {
    const service = createService('bankAccount')
    send(service, componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_UPDATED)
    send(service, componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBe('bankAccountUpdated')
    expect(service.context.pendingAlert).toBeNull()
  })

  it('returns without an alert when nothing was saved during the visit', () => {
    const service = createService('bankAccount')
    send(service, componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBeNull()
  })

  it('ignores a generic CANCEL, which belongs to the sub-flow inside the editor', () => {
    // The sub-flow's own machine transitions on bare CANCEL to return the micro-deposit form
    // to the account view, and Flow re-emits that upward. A CANCEL transition here would
    // close the whole block whenever a user backed out of verification.
    const service = createService('bankAccount')
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('bankAccount')
  })

  it('ignores the onboarding save, cancel and completion events, which the editor translates', () => {
    const service = createService('bankAccount')
    send(service, componentEvents.COMPANY_BANK_ACCOUNT_CREATED)
    send(service, componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED)
    send(service, componentEvents.COMPANY_BANK_ACCOUNT_CANCEL)
    send(service, componentEvents.COMPANY_BANK_ACCOUNT_DONE)

    expect(service.machine.current).toBe('bankAccount')
    expect(service.context.pendingAlert).toBeNull()
  })
})
