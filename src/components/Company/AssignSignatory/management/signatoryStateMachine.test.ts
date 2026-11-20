import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { signatoryStateMachine } from './signatoryStateMachine'
import { SignatoryCardContextual, type SignatoryContextInterface } from './SignatoryComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof signatoryStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    signatoryStateMachine,
    (initialContext: SignatoryContextInterface): SignatoryContextInterface => ({
      ...initialContext,
      component: SignatoryCardContextual,
      companyId: 'company-123',
      successAlert: null,
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('signatoryStateMachine', () => {
  it('threads the signatory id from the card so the editor amends that record', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED, {
      companyId: 'company-123',
      signatoryId: 'signatory-1',
    })

    expect(service.machine.current).toBe('editSignatory')
    expect(service.context.signatoryId).toBe('signatory-1')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.Signatory',
        event: componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_CANCELLED,
      },
    })
  })

  it('carries no identifier when assigning someone new from the empty state', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED, {
      companyId: 'company-123',
      signatoryId: undefined,
    })

    expect(service.machine.current).toBe('editSignatory')
    expect(service.context.signatoryId).toBeUndefined()
  })

  it('returns to the card with an alert once a signatory is saved', () => {
    const service = createService('editSignatory')
    send(service, componentEvents.COMPANY_MANAGEMENT_SIGNATORY_UPDATED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBe('signatoryUpdated')
    expect(service.context.header).toBeNull()
  })

  it('ignores a generic CANCEL while editing, so an inner cancel cannot close the block', () => {
    const service = createService('editSignatory')
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('editSignatory')
  })

  it('ignores the onboarding completion event, which the edit screen translates instead', () => {
    // company/signatory/assignSignatory/done is raised by DocumentSigner's own
    // assign-signatory step too. Only saves routed through SignatoryEditScreen raise the
    // management event, so only those return here.
    const service = createService('editSignatory')
    send(service, componentEvents.COMPANY_ASSIGN_SIGNATORY_DONE)

    expect(service.machine.current).toBe('editSignatory')
  })

  it('ignores the mid-flow mode switch between the direct-entry and invite forms', () => {
    const service = createService('editSignatory')
    send(service, componentEvents.COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED)

    expect(service.machine.current).toBe('editSignatory')
  })
})
