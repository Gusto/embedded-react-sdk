import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { companyFormsBlockStateMachine } from './companyFormsBlockStateMachine'
import {
  CompanyFormsCardContextual,
  type CompanyFormsBlockContextInterface,
} from './CompanyFormsComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof companyFormsBlockStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    companyFormsBlockStateMachine,
    (initialContext: CompanyFormsBlockContextInterface): CompanyFormsBlockContextInterface => ({
      ...initialContext,
      component: CompanyFormsCardContextual,
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

describe('companyFormsBlockStateMachine', () => {
  it('opens the document surface on the card manage request and sets its own back header', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_REQUESTED)

    expect(service.machine.current).toBe('companyForms')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.CompanyForms',
        event: componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_CANCELLED,
      },
    })
  })

  it('stays on the surface as forms are signed, recording the alert rather than showing it', () => {
    // A company signs its forms one at a time, so returning to the card on the first would
    // eject the user before the rest are signed.
    const service = createService('companyForms')
    send(service, componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_UPDATED)

    expect(service.machine.current).toBe('companyForms')
    expect(service.context.pendingAlert).toBe('formsSigned')
    expect(service.context.successAlert).toBeNull()
  })

  it('surfaces the recorded alert on the card once the user leaves', () => {
    const service = createService('companyForms')
    send(service, componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_UPDATED)
    send(service, componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBe('formsSigned')
    expect(service.context.pendingAlert).toBeNull()
  })

  it('returns without an alert when nothing was signed during the visit', () => {
    const service = createService('companyForms')
    send(service, componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBeNull()
  })

  it('stays on the surface when the signatory is reassigned from inside it', () => {
    // The surface contains an assign-signatory screen that raises this. Changing the signatory
    // mid-review should return the user to the document list, which the inner machine already
    // does — not to the card.
    const service = createService('companyForms')
    send(service, componentEvents.COMPANY_ASSIGN_SIGNATORY_DONE)

    expect(service.machine.current).toBe('companyForms')
  })

  it('ignores a generic CANCEL and the inner back, which belong to the surface', () => {
    const service = createService('companyForms')
    send(service, componentEvents.CANCEL)
    send(service, componentEvents.COMPANY_SIGN_FORM_BACK)

    expect(service.machine.current).toBe('companyForms')
  })

  it('ignores the onboarding signature and completion events, which the surface translates', () => {
    const service = createService('companyForms')
    send(service, componentEvents.COMPANY_SIGN_FORM)
    send(service, componentEvents.COMPANY_FORMS_DONE)

    expect(service.machine.current).toBe('companyForms')
    expect(service.context.pendingAlert).toBeNull()
  })
})
