import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { documentSignerMachine } from './stateMachine'
import type { DocumentSignerContextInterface } from './useDocumentSigner'
import { componentEvents } from '@/shared/constants'

function createService(adoptsAssignedSignatory: boolean) {
  const machine = createMachine(
    'assignSignatory',
    documentSignerMachine,
    (initialContext: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
      ...initialContext,
      component: () => null,
      companyId: 'company-123',
      adoptsAssignedSignatory,
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

describe('documentSignerMachine', () => {
  it.each([
    { adoptsAssignedSignatory: true, expectedSignatoryId: 'signatory-new' },
    { adoptsAssignedSignatory: false, expectedSignatoryId: undefined },
  ])(
    'binds signing to the created signatory only when adoptsAssignedSignatory is $adoptsAssignedSignatory',
    ({ adoptsAssignedSignatory, expectedSignatoryId }) => {
      const service = createService(adoptsAssignedSignatory)

      ;(service.send as SendFunction<string>)({
        type: componentEvents.COMPANY_SIGNATORY_CREATED,
        payload: { uuid: 'signatory-new' },
      })

      expect(service.machine.current).toBe('documentList')
      expect(service.context.signatoryId).toBe(expectedSignatoryId)
    },
  )
})
