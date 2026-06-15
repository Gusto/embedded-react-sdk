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

/**
 * Props for {@link HomeAddress}.
 *
 * @public
 */
export interface HomeAddressProps extends CommonComponentInterface<'Employee.Management.HomeAddress'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired on flow state changes. */
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

/**
 * Standalone employee home address management flow.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/homeAddress/editRequested` | Manage button on the home address card clicked | `{ employeeId: string }` |
 * | `employee/management/homeAddress/editCancelled` | User backed out of the edit form | — |
 * | `employee/management/homeAddress/created` | A new home address was created | {@link EmployeeAddress} |
 * | `employee/management/homeAddress/updated` | An existing home address was updated | {@link EmployeeAddress} |
 * | `employee/management/homeAddress/deleted` | A home address was deleted | {@link EmployeeAddress} |
 *
 * @public
 */
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
