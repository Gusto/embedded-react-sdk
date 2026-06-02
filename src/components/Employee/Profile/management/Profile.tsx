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

export interface ProfileProps extends CommonComponentInterface<'Employee.Profile.Management'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

function ProfileFlow({ employeeId, onEvent }: ProfileProps) {
  useI18n('Employee.Profile.Management')

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

export function Profile({
  dictionary,
  FallbackComponent,
  ...props
}: ProfileProps & BaseComponentInterface<'Employee.Profile.Management'>) {
  useComponentDictionary('Employee.Profile.Management', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Profile.Management"
      FallbackComponent={FallbackComponent}
    >
      <ProfileFlow {...props} />
    </BaseBoundaries>
  )
}
