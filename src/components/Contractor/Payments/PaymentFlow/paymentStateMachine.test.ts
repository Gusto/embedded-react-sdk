import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { paymentMachine, paymentFlowBreadcrumbsNodes } from './paymentStateMachine'
import type { PaymentFlowContextInterface } from './PaymentFlowComponents'
import { componentEvents, informationRequestEvents, payrollWireEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { ensureRequired } from '@/helpers/ensureRequired'

function createTestMachine() {
  return createMachine(
    'landing',
    paymentMachine,
    (initialContext: PaymentFlowContextInterface): PaymentFlowContextInterface => ({
      ...initialContext,
      component: () => null,
      companyId: 'test-company',
      header: {
        type: 'breadcrumbs',
        breadcrumbs: buildBreadcrumbs(paymentFlowBreadcrumbsNodes),
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

function navigateToLanding(service: ReturnType<typeof createService>) {
  send(service, componentEvents.BREADCRUMB_NAVIGATE, {
    key: 'landing',
    onNavigate: ensureRequired(paymentFlowBreadcrumbsNodes.landing).item.onNavigate,
  })
}

describe('paymentMachine', () => {
  describe('landing state', () => {
    it('transitions to createPayment on CONTRACTOR_PAYMENT_CREATE', () => {
      const service = createService()
      expect(service.machine.current).toBe('landing')

      send(service, componentEvents.CONTRACTOR_PAYMENT_CREATE)

      expect(service.machine.current).toBe('createPayment')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to history on CONTRACTOR_PAYMENT_VIEW with paymentId from event', () => {
      const service = createService()

      send(service, componentEvents.CONTRACTOR_PAYMENT_VIEW, { paymentId: 'payment-123' })

      expect(service.machine.current).toBe('history')
      expect(service.context.currentPaymentId).toBe('payment-123')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to informationRequests on CONTRACTOR_PAYMENT_RFI_RESPOND', () => {
      const service = createService()

      send(service, componentEvents.CONTRACTOR_PAYMENT_RFI_RESPOND)

      expect(service.machine.current).toBe('informationRequests')
    })

    it('sets a success alert on PAYROLL_WIRE_FORM_DONE and stays on landing', () => {
      const service = createService()

      send(service, payrollWireEvents.PAYROLL_WIRE_FORM_DONE, {
        wireInRequest: {},
        confirmationAlert: { title: 'wireDetailsSubmitted', content: 'Wire submitted' },
      })

      expect(service.machine.current).toBe('landing')
      expect(service.context.alerts).toEqual([
        { type: 'success', title: 'wireDetailsSubmitted', content: 'Wire submitted' },
      ])
    })
  })

  describe('createPayment state', () => {
    function toCreatePayment(service: ReturnType<typeof createService>) {
      send(service, componentEvents.CONTRACTOR_PAYMENT_CREATE)
      expect(service.machine.current).toBe('createPayment')
    }

    it('stays active for the full lifetime of the CreatePaymentFlow spoke (no internal transitions)', () => {
      const service = createService()
      toCreatePayment(service)

      expect(service.context.component).toBeDefined()
    })

    it('transitions to landing on CONTRACTOR_PAYMENT_EXIT bubbled from the spoke', () => {
      const service = createService()
      toCreatePayment(service)

      send(service, componentEvents.CONTRACTOR_PAYMENT_EXIT, { uuid: 'group-456' })

      expect(service.machine.current).toBe('landing')
      expect(service.context.alerts).toBeUndefined()
    })

    it('transitions to landing on the bubbled landing BREADCRUMB_NAVIGATE', () => {
      const service = createService()
      toCreatePayment(service)

      navigateToLanding(service)

      expect(service.machine.current).toBe('landing')
    })
  })

  describe('history state', () => {
    function toHistory(service: ReturnType<typeof createService>) {
      send(service, componentEvents.CONTRACTOR_PAYMENT_VIEW, { paymentId: 'payment-123' })
      expect(service.machine.current).toBe('history')
    }

    it('transitions to landing with a success alert on CONTRACTOR_PAYMENT_CANCEL bubbled from the spoke', () => {
      const service = createService()
      toHistory(service)

      send(service, componentEvents.CONTRACTOR_PAYMENT_CANCEL, { paymentId: 'payment-123' })

      expect(service.machine.current).toBe('landing')
      expect(service.context.alerts).toEqual([
        { type: 'success', title: 'paymentCancelledSuccessfully' },
      ])
    })

    it('transitions to landing on the bubbled landing BREADCRUMB_NAVIGATE', () => {
      const service = createService()
      toHistory(service)

      navigateToLanding(service)

      expect(service.machine.current).toBe('landing')
    })
  })

  describe('informationRequests state', () => {
    function toInformationRequests(service: ReturnType<typeof createService>) {
      send(service, componentEvents.CONTRACTOR_PAYMENT_RFI_RESPOND)
      expect(service.machine.current).toBe('informationRequests')
    }

    it('transitions to landing on INFORMATION_REQUEST_FORM_DONE', () => {
      const service = createService()
      toInformationRequests(service)

      send(service, informationRequestEvents.INFORMATION_REQUEST_FORM_DONE)

      expect(service.machine.current).toBe('landing')
    })

    it('transitions to landing on INFORMATION_REQUEST_FORM_CANCEL', () => {
      const service = createService()
      toInformationRequests(service)

      send(service, informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL)

      expect(service.machine.current).toBe('landing')
    })
  })
})
