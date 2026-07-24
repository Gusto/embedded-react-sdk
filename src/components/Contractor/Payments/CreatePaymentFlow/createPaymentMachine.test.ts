import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { createPaymentMachine, createPaymentBreadcrumbsNodes } from './createPaymentMachine'
import type { CreatePaymentFlowContextInterface } from './CreatePaymentFlowComponents'
import { componentEvents, payrollWireEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

function createTestMachine() {
  return createMachine(
    'createPayment',
    createPaymentMachine,
    (initialContext: CreatePaymentFlowContextInterface): CreatePaymentFlowContextInterface => ({
      ...initialContext,
      component: () => null,
      companyId: 'test-company',
      header: {
        type: 'breadcrumbs',
        breadcrumbs: buildBreadcrumbs(createPaymentBreadcrumbsNodes),
        currentBreadcrumbId: 'createPayment',
      },
    }),
  )
}

function createService() {
  const machine = createTestMachine()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = interpret(machine, () => {}, {} as any)
  return service
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

function currentBreadcrumbId(service: ReturnType<typeof createService>) {
  return service.context.header?.type === 'breadcrumbs'
    ? service.context.header.currentBreadcrumbId
    : undefined
}

describe('createPaymentMachine', () => {
  describe('createPayment state', () => {
    it('transitions to paymentSummary on CONTRACTOR_PAYMENT_CREATED with the created group id', () => {
      const service = createService()
      expect(service.machine.current).toBe('createPayment')

      send(service, componentEvents.CONTRACTOR_PAYMENT_CREATED, { uuid: 'group-456' })

      expect(service.machine.current).toBe('paymentSummary')
      expect(service.context.createdPaymentGroupId).toBe('group-456')
      expect(currentBreadcrumbId(service)).toBe('paymentSummary')
      expect(service.context.alerts).toBeUndefined()
    })
  })

  describe('paymentSummary state', () => {
    function toPaymentSummary(service: ReturnType<typeof createService>) {
      send(service, componentEvents.CONTRACTOR_PAYMENT_CREATED, { uuid: 'group-456' })
      expect(service.machine.current).toBe('paymentSummary')
    }

    it('sets a success alert on PAYROLL_WIRE_FORM_DONE and stays on paymentSummary', () => {
      const service = createService()
      toPaymentSummary(service)

      send(service, payrollWireEvents.PAYROLL_WIRE_FORM_DONE, {
        wireInRequest: {},
        confirmationAlert: { title: 'wireDetailsSubmitted', content: 'Wire submitted' },
      })

      expect(service.machine.current).toBe('paymentSummary')
      expect(service.context.alerts).toEqual([
        { type: 'success', title: 'wireDetailsSubmitted', content: 'Wire submitted' },
      ])
    })
  })
})
