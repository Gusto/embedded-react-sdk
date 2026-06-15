import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { CardContextual, type ProfileContextInterface } from './ProfileComponents'
import { profileStateMachine } from './profileStateMachine'
import { Flow } from '@/components/Flow/Flow'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link Profile}.
 *
 * @public
 */
export interface ProfileProps extends CommonComponentInterface<'Employee.Management.Profile'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired on flow state changes. */
  onEvent: OnEventType<EventType, unknown>
}

function ProfileFlow({ employeeId, onEvent }: ProfileProps) {
  useI18n('Employee.Management.Profile')

  const machine = useMemo(
    () =>
      createMachine('card', profileStateMachine, (ctx: ProfileContextInterface) => ({
        ...ctx,
        component: CardContextual,
        employeeId,
        successAlert: null,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Management surface for viewing and editing an employee's basic profile details after onboarding.
 *
 * @remarks
 * Drives the read-view card and edit form via an internal state machine.
 * Emits events on the supplied `onEvent` handler when the user requests an
 * edit, saves changes, or cancels.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/profile/editRequested` | Fired when the user clicks Edit on the read-view card | `{ employeeId: string }` |
 * | `employee/management/profile/updated` | Fired after the profile is successfully saved | {@link Employee} |
 * | `employee/management/profile/editCancelled` | Fired when the user cancels editing | — |
 *
 * @param props - See {@link ProfileProps}.
 * @returns The employee profile management surface.
 * @public
 */
export function Profile({
  dictionary,
  FallbackComponent,
  ...props
}: ProfileProps & BaseComponentInterface<'Employee.Management.Profile'>) {
  useComponentDictionary('Employee.Management.Profile', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Profile"
      FallbackComponent={FallbackComponent}
    >
      <ProfileFlow {...props} />
    </BaseBoundaries>
  )
}
