import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { CardContextual, type ProfileContextInterface } from './ProfileComponents'
import { profileStateMachine } from './profileStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link Profile}.
 *
 * @public
 */
export interface ProfileProps extends BaseComponentInterface<'Contractor.Management.Profile'> {
  /** The associated contractor identifier. */
  contractorId: string
}

function ProfileFlow({ contractorId, onEvent }: ProfileProps) {
  useI18n('Contractor.Management.Profile')

  const machine = useMemo(
    () =>
      createMachine('card', profileStateMachine, (ctx: ProfileContextInterface) => ({
        ...ctx,
        component: CardContextual,
        contractorId,
        successAlert: null,
      })),
    [contractorId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Management surface for viewing and editing a contractor's basic profile details after onboarding.
 *
 * @remarks
 * Drives the read-view card and edit form via an internal state machine.
 * Emits events on the supplied `onEvent` handler when the user requests an
 * edit, saves changes, or cancels.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/profile/editRequested` | Fired when the user clicks Edit on the read-view card | `{ contractorId: string }` |
 * | `contractor/management/profile/updated` | Fired after the profile is successfully saved | {@link APIModels.Contractor} |
 * | `contractor/management/profile/editCancelled` | Fired when the user cancels editing | — |
 *
 * @param props - See {@link ProfileProps}.
 * @returns The contractor profile management surface.
 * @public
 */
export function Profile({ dictionary, FallbackComponent, ...props }: ProfileProps) {
  useComponentDictionary('Contractor.Management.Profile', dictionary)
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Profile"
      FallbackComponent={FallbackComponent}
    >
      <ProfileFlow {...props} />
    </BaseBoundaries>
  )
}
