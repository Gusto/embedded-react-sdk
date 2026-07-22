import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { viewHistoryMachine, viewHistoryBreadcrumbsNodes } from './viewHistoryMachine'
import type { ViewHistoryFlowContextInterface } from './ViewHistoryFlowComponents'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { ensureRequired } from '@/helpers/ensureRequired'

function createTestMachine() {
  return createMachine(
    'history',
    viewHistoryMachine,
    (initialContext: ViewHistoryFlowContextInterface): ViewHistoryFlowContextInterface => ({
      ...initialContext,
      component: () => null,
      currentPaymentId: 'payment-123',
      header: {
        type: 'breadcrumbs',
        breadcrumbs: buildBreadcrumbs(viewHistoryBreadcrumbsNodes),
        currentBreadcrumbId: 'history',
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

describe('viewHistoryMachine', () => {
  describe('history state', () => {
    it('transitions to statement on CONTRACTOR_PAYMENT_VIEW_DETAILS with contractor and payment ids', () => {
      const service = createService()
      const contractor = { uuid: 'contractor-789', firstName: 'Ada', lastName: 'Lovelace' }

      send(service, componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS, {
        contractor,
        paymentGroupId: 'group-456',
      })

      expect(service.machine.current).toBe('statement')
      expect(service.context.currentContractorUuid).toBe('contractor-789')
      expect(service.context.currentPaymentId).toBe('group-456')
      expect(currentBreadcrumbId(service)).toBe('statement')
    })
  })

  describe('statement state', () => {
    function toStatement(service: ReturnType<typeof createService>) {
      send(service, componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS, {
        contractor: { uuid: 'contractor-789', firstName: 'Ada', lastName: 'Lovelace' },
        paymentGroupId: 'group-456',
      })
      expect(service.machine.current).toBe('statement')
    }

    it('transitions to history on BREADCRUMB_NAVIGATE with history key', () => {
      const service = createService()
      toStatement(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, {
        key: 'history',
        onNavigate: ensureRequired(viewHistoryBreadcrumbsNodes.history).item.onNavigate,
      })

      expect(service.machine.current).toBe('history')
    })

    it('ignores BREADCRUMB_NAVIGATE with an unrelated key', () => {
      const service = createService()
      toStatement(service)

      send(service, componentEvents.BREADCRUMB_NAVIGATE, { key: 'landing' })

      expect(service.machine.current).toBe('statement')
    })
  })
})
