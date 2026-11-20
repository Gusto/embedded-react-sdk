import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { EventPayloads, SignatoryContextInterface } from './SignatoryComponents'
import { SignatoryCardContextual, SignatoryEditScreenContextual } from './SignatoryComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the edit screen.
 *
 * @remarks
 * Uses this block's own `company/management/signatory/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. The edit screen is itself `Flow`-driven and `Flow` re-emits every
 * inner event to its parent.
 *
 * The assign-signatory screens are also submit-only — neither the direct-entry nor the invite
 * form has a Cancel — so this header is the only way back to the card.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.Signatory',
    event: componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_CANCELLED,
  },
}

const returnToCard = reduce((ctx: SignatoryContextInterface): SignatoryContextInterface => ({
  ...ctx,
  component: SignatoryCardContextual as ComponentType,
  header: null,
  successAlert: null,
}))

/**
 * Card to the assign-signatory screens and back.
 *
 * @remarks
 * The card's edit request carries the current `signatoryId`, which this machine threads into
 * context so the editor amends that record; assigning someone new from the empty state carries
 * no identifier and creates one.
 *
 * Returns on `company/management/signatory/updated`, which `SignatoryEditScreen` translates
 * from `company/signatory/assignSignatory/done`. The onboarding event itself stays absent:
 * `DocumentSigner`'s own assign-signatory step raises it too, and only saves made through this
 * surface should return here.
 *
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 *
 * @internal
 */
export const signatoryStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED,
      'editSignatory',
      reduce(
        (
          ctx: SignatoryContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED
          >,
        ): SignatoryContextInterface => ({
          ...ctx,
          component: SignatoryEditScreenContextual as ComponentType,
          header: editHeader,
          successAlert: null,
          signatoryId: ev.payload.signatoryId,
        }),
      ),
    ),
    transition(componentEvents.COMPANY_MANAGEMENT_SIGNATORY_ALERT_DISMISSED, 'card', returnToCard),
  ),
  editSignatory: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_SIGNATORY_UPDATED,
      'card',
      reduce((ctx: SignatoryContextInterface): SignatoryContextInterface => ({
        ...ctx,
        component: SignatoryCardContextual as ComponentType,
        header: null,
        successAlert: 'signatoryUpdated',
      })),
    ),
    transition(componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_CANCELLED, 'card', returnToCard),
  ),
}
