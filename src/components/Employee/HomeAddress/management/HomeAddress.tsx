import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { CardContextual, type HomeAddressContextInterface } from './HomeAddressComponents'
import { homeAddressStateMachine } from './homeAddressStateMachine'
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

export interface HomeAddressProps extends CommonComponentInterface<'Employee.Management.HomeAddress'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

function HomeAddressFlow({ employeeId, onEvent }: HomeAddressProps) {
  useI18n('Employee.Management.HomeAddress')

  const machine = useMemo(
    () =>
      createMachine('card', homeAddressStateMachine, (ctx: HomeAddressContextInterface) => ({
        ...ctx,
        component: CardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function HomeAddress({
  dictionary,
  FallbackComponent,
  ...props
}: HomeAddressProps & BaseComponentInterface<'Employee.Management.HomeAddress'>) {
  useComponentDictionary('Employee.Management.HomeAddress', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.HomeAddress"
      FallbackComponent={FallbackComponent}
    >
      <HomeAddressFlow {...props} />
    </BaseBoundaries>
  )
}
