import { describe, expect, it } from 'vitest'
import { createMachine, interpret, type SendFunction } from 'robot3'
import { locationsBlockStateMachine } from './locationsBlockStateMachine'
import { LocationsCardContextual, type LocationsBlockContextInterface } from './LocationsComponents'
import { componentEvents } from '@/shared/constants'

function createService(initialState: keyof typeof locationsBlockStateMachine = 'card') {
  const machine = createMachine(
    initialState,
    locationsBlockStateMachine,
    (initialContext: LocationsBlockContextInterface): LocationsBlockContextInterface => ({
      ...initialContext,
      component: LocationsCardContextual,
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

describe('locationsBlockStateMachine', () => {
  it('opens the editor on the card manage request and sets its own back header', () => {
    const service = createService()
    send(service, componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_REQUESTED)

    expect(service.machine.current).toBe('locations')
    expect(service.context.header).toMatchObject({
      type: 'minimal',
      back: {
        labelKey: 'header.backCta',
        namespace: 'Company.Management.Locations',
        event: componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_CANCELLED,
      },
    })
  })

  it('stays in the editor as addresses are saved, recording the alert rather than showing it', () => {
    const service = createService('locations')
    send(service, componentEvents.COMPANY_MANAGEMENT_LOCATIONS_UPDATED)

    expect(service.machine.current).toBe('locations')
    expect(service.context.pendingAlert).toBe('locationsUpdated')
    expect(service.context.successAlert).toBeNull()
  })

  it('surfaces the recorded alert on the card once the user leaves', () => {
    const service = createService('locations')
    send(service, componentEvents.COMPANY_MANAGEMENT_LOCATIONS_UPDATED)
    send(service, componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBe('locationsUpdated')
    expect(service.context.pendingAlert).toBeNull()
  })

  it('returns without an alert when nothing was saved during the visit', () => {
    const service = createService('locations')
    send(service, componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_CANCELLED)

    expect(service.machine.current).toBe('card')
    expect(service.context.successAlert).toBeNull()
  })

  it('ignores a generic CANCEL, which belongs to the address sub-flow inside the editor', () => {
    // The sub-flow's own machine transitions on bare CANCEL to return its add/edit form to
    // the list, and Flow re-emits that upward. A CANCEL transition here would close the whole
    // block whenever a user cancelled a single address form.
    const service = createService('locations')
    send(service, componentEvents.CANCEL)

    expect(service.machine.current).toBe('locations')
  })

  it('ignores the onboarding save and completion events, which the editor translates instead', () => {
    const service = createService('locations')
    send(service, componentEvents.COMPANY_LOCATION_CREATED)
    send(service, componentEvents.COMPANY_LOCATION_UPDATED)
    send(service, componentEvents.COMPANY_LOCATION_DONE)

    expect(service.machine.current).toBe('locations')
    expect(service.context.pendingAlert).toBeNull()
  })
})
