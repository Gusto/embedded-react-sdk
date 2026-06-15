import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  WorkAddressCardContextual,
  type WorkAddressContextInterface,
} from './WorkAddressComponents'
import { workAddressStateMachine } from './workAddressStateMachine'
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
 * Props for {@link WorkAddress}.
 *
 * @public
 */
export interface WorkAddressProps extends CommonComponentInterface<'Employee.Management.WorkAddress'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired on flow state changes. */
  onEvent: OnEventType<EventType, unknown>
}

function WorkAddressFlow({ employeeId, onEvent }: WorkAddressProps) {
  useI18n('Employee.Management.WorkAddress')

  const machine = useMemo(
    () =>
      createMachine('card', workAddressStateMachine, (ctx: WorkAddressContextInterface) => ({
        ...ctx,
        component: WorkAddressCardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Standalone employee work address management flow.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/workAddress/editRequested` | Manage button on the work address card clicked | `{ employeeId: string }` |
 * | `employee/management/workAddress/editCancelled` | User backed out of the edit form | — |
 * | `employee/management/workAddress/created` | A new work address was created | {@link EmployeeWorkAddress} |
 * | `employee/management/workAddress/updated` | An existing work address was updated | {@link EmployeeWorkAddress} |
 * | `employee/management/workAddress/deleted` | A work address was deleted | {@link EmployeeWorkAddress} |
 *
 * @public
 */
export function WorkAddress({
  dictionary,
  FallbackComponent,
  ...props
}: WorkAddressProps & BaseComponentInterface<'Employee.Management.WorkAddress'>) {
  useComponentDictionary('Employee.Management.WorkAddress', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.WorkAddress"
      FallbackComponent={FallbackComponent}
    >
      <WorkAddressFlow {...props} />
    </BaseBoundaries>
  )
}
