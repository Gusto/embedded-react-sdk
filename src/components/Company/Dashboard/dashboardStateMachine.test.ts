import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { dashboardStateMachine } from './dashboardStateMachine'
import { DashboardViewContextual, type DashboardContextInterface } from './DashboardComponents'
import { componentEvents } from '@/shared/constants'

type DashboardState = keyof typeof dashboardStateMachine

function createService(initialState: DashboardState = 'index') {
  const machine = createMachine(
    initialState,
    dashboardStateMachine,
    (initialContext: DashboardContextInterface): DashboardContextInterface => ({
      ...initialContext,
      component: DashboardViewContextual,
      companyId: 'company-123',
    }),
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return interpret(machine, () => {}, {} as any)
}

function send(service: ReturnType<typeof createService>, type: string, payload?: unknown) {
  ;(service.send as SendFunction<string>)({ type, payload })
}

const spokes = [
  {
    state: 'industry' as const,
    enterEvent: componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED,
    doneEvent: componentEvents.COMPANY_INDUSTRY_SELECTED,
    alert: 'industryUpdated',
  },
  {
    state: 'locations' as const,
    enterEvent: componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_REQUESTED,
    doneEvent: componentEvents.COMPANY_LOCATION_DONE,
    alert: null,
  },
  {
    state: 'federalTaxes' as const,
    enterEvent: componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_REQUESTED,
    doneEvent: componentEvents.COMPANY_FEDERAL_TAXES_DONE,
    alert: 'federalTaxesUpdated',
  },
]

describe('dashboardStateMachine', () => {
  it.each(spokes)('enters $state from index and sets the back header', ({ state, enterEvent }) => {
    const service = createService('index')
    send(service, enterEvent, { companyId: 'company-123' })

    expect(service.machine.current).toBe(state)
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: { event: componentEvents.COMPANY_DASHBOARD_BACK, namespace: 'Company.Dashboard' },
    })
  })

  it.each(spokes)(
    'returns to index from $state on its done event, with the expected alert',
    ({ state, doneEvent, alert }) => {
      const service = createService(state)
      send(service, doneEvent)

      expect(service.machine.current).toBe('index')
      expect(service.context.header).toBeNull()
      expect(service.context.successAlert).toBe(alert)
    },
  )

  it.each(spokes)('returns to index from $state on COMPANY_DASHBOARD_BACK', ({ state }) => {
    const service = createService(state)
    send(service, componentEvents.COMPANY_DASHBOARD_BACK)

    expect(service.machine.current).toBe('index')
    expect(service.context.header).toBeNull()
    expect(service.context.successAlert).toBeNull()
  })

  // Flow re-emits every event upstream, so a CANCEL raised by a screen *inside* a
  // spoke must not pull the user out of that spoke. See `spokeHeader` in the machine.
  it.each(spokes)('ignores CANCEL while in $state', ({ state }) => {
    const service = createService(state)
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe(state)
  })

  it('stays in locations when a location is created or updated mid-flow', () => {
    const service = createService('locations')

    send(service, componentEvents.COMPANY_LOCATION_CREATE)
    expect(service.machine.current).toBe('locations')

    send(service, componentEvents.COMPANY_LOCATION_CREATED, { uuid: 'location-1' })
    expect(service.machine.current).toBe('locations')

    send(service, componentEvents.COMPANY_LOCATION_UPDATED, { uuid: 'location-1' })
    expect(service.machine.current).toBe('locations')
  })

  it('stays in federalTaxes on the updated event that precedes done', () => {
    const service = createService('federalTaxes')

    send(service, componentEvents.COMPANY_FEDERAL_TAXES_UPDATED)
    expect(service.machine.current).toBe('federalTaxes')
  })

  it('records the selected tab without leaving index', () => {
    const service = createService('index')
    send(service, componentEvents.COMPANY_DASHBOARD_TAB_CHANGE, { tab: 'taxes' })

    expect(service.machine.current).toBe('index')
    expect(service.context.selectedTab).toBe('taxes')
  })

  it('clears the success alert on dismissal', () => {
    const service = createService('industry')
    send(service, componentEvents.COMPANY_INDUSTRY_SELECTED)
    expect(service.context.successAlert).toBe('industryUpdated')

    send(service, componentEvents.COMPANY_DASHBOARD_ALERT_DISMISSED)
    expect(service.machine.current).toBe('index')
    expect(service.context.successAlert).toBeNull()
  })
})
