import { describe, it, expect } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { documentSignerMachine } from './stateMachine'
import type { DocumentSignerContextInterface } from './documentSignerStateMachine'
import { componentEvents } from '@/shared/constants'

function createTestMachine() {
  return createMachine(
    'index',
    documentSignerMachine,
    (initialContext: DocumentSignerContextInterface) => ({
      ...initialContext,
      component: () => null,
      employeeId: 'test-employee',
    }),
  )
}

function createService() {
  const machine = createTestMachine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

describe('documentSignerMachine', () => {
  // Regression test for SDK-1169: `done` used to be a robot3 final state (no
  // transitions out) reached from `index` on EMPLOYEE_FORMS_DONE. A host that kept
  // this component mounted past that signal was left with a document list whose
  // "view form to sign" controls could never fire another transition.
  // EMPLOYEE_FORMS_DONE now has no transition at all: the machine stays in `index`,
  // and Flow re-emits the event to the parent regardless.
  it('SDK-1169: keeps handling EMPLOYEE_VIEW_FORM_TO_SIGN after DONE fires', () => {
    const service = createService()

    send(service, componentEvents.EMPLOYEE_FORMS_DONE)
    expect(service.machine.current).toBe('index')

    send(service, componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, {
      uuid: 'form-1',
      name: 'some_form',
    })
    expect(service.machine.current).toBe('signatureForm')
    expect(service.context.formId).toBe('form-1')

    send(service, componentEvents.CANCEL)
    expect(service.machine.current).toBe('index')

    send(service, componentEvents.EMPLOYEE_FORMS_DONE)
    expect(service.machine.current).toBe('index')

    send(service, componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, {
      uuid: 'form-2',
      name: 'another_form',
    })
    expect(service.machine.current).toBe('signatureForm')
    expect(service.context.formId).toBe('form-2')
  })
})
