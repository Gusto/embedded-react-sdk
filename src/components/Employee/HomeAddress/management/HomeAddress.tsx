import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { CardContextual, type HomeAddressContextInterface } from './HomeAddressComponents'
import { homeAddressStateMachine } from './homeAddressStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link HomeAddress}.
 *
 * @public
 */
export interface HomeAddressProps extends BaseComponentInterface<'Employee.Management.HomeAddress'> {
  /** The associated employee identifier. */
  employeeId: string
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
 * @events
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
export function HomeAddress({ dictionary, FallbackComponent, ...props }: HomeAddressProps) {
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
