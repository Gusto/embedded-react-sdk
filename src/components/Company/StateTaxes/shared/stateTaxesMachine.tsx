import { createMachine, reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { StateTaxesContextInterface } from './stateTaxesComponents'
import { StateTaxesFormContextual, TaxRateManagementContextual } from './stateTaxesComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.COMPANY_STATE_TAX_UPDATED]: undefined
  [componentEvents.COMPANY_STATE_TAX_EDIT]: { state: string }
  [componentEvents.COMPANY_STATE_TAX_MANAGE_RATES]: { state: string }
}

/** @internal */
export interface StateTaxesMachineContext {
  /** UUID of the company whose state taxes are being managed. */
  companyId: string
  /** Controls visibility of the Continue button in list screens that offer one. */
  showContinueButton?: boolean
}

/**
 * Builds the list → requirements form / tax rate history machine around a given list screen.
 *
 * @remarks
 * The onboarding and management journeys share every screen except the state list, so the
 * list is the only thing that varies: the machine opens on `listComponent` and every
 * transition back to the list lands on it again.
 *
 * @param listComponent - The state list screen this machine opens on and returns to.
 * @param context - Initial machine context. See {@link StateTaxesMachineContext}.
 * @returns A robot3 machine seeded with `listComponent` as its current screen.
 * @internal
 */
export function createStateTaxesMachine(
  listComponent: ComponentType,
  { companyId, showContinueButton }: StateTaxesMachineContext,
) {
  const returnToList = reduce((ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
    ...ctx,
    component: listComponent,
    state: undefined,
  }))

  const states = {
    viewStateTaxes: state<MachineTransition>(
      transition(
        componentEvents.COMPANY_STATE_TAX_EDIT,
        'editStateTaxes',
        reduce(
          (
            ctx: StateTaxesContextInterface,
            ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_STATE_TAX_EDIT>,
          ): StateTaxesContextInterface => ({
            ...ctx,
            component: StateTaxesFormContextual,
            state: ev.payload.state,
          }),
        ),
      ),
      transition(
        componentEvents.COMPANY_STATE_TAX_MANAGE_RATES,
        'manageTaxRates',
        reduce(
          (
            ctx: StateTaxesContextInterface,
            ev: MachineEventType<
              EventPayloads,
              typeof componentEvents.COMPANY_STATE_TAX_MANAGE_RATES
            >,
          ): StateTaxesContextInterface => ({
            ...ctx,
            component: TaxRateManagementContextual,
            state: ev.payload.state,
          }),
        ),
      ),
    ),
    editStateTaxes: state<MachineTransition>(
      transition(componentEvents.COMPANY_STATE_TAX_UPDATED, 'viewStateTaxes', returnToList),
      transition(componentEvents.CANCEL, 'viewStateTaxes', returnToList),
    ),
    manageTaxRates: state<MachineTransition>(
      transition(componentEvents.CANCEL, 'viewStateTaxes', returnToList),
    ),
  }

  return createMachine('viewStateTaxes', states, (initialContext: StateTaxesContextInterface) => ({
    ...initialContext,
    component: listComponent,
    companyId,
    showContinueButton,
  }))
}
