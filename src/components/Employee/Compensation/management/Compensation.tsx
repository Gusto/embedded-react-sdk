import { useMemo } from 'react'
import { createMachine } from 'robot3'
import {
  ListViewContextual,
  type ManagementCompensationFlowContextInterface,
} from './CompensationFlowComponents'
import { managementCompensationStateMachine } from './compensationStateMachine'
import { ListView } from './ListView'
import { EditCompensation } from './EditCompensation'
import { AddJob } from './AddJob'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface CompensationProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  /**
   * The employee's hire date. Used as the `hireDate` written to additional
   * jobs created through the Add another job flow so they align with the
   * employee record. The new compensation's `effectiveDate` is captured
   * separately via a visible field on the AddJob screen.
   */
  hireDate: string
  onEvent: OnEventType<EventType, unknown>
}

function CompensationFlow({ employeeId, hireDate, onEvent }: CompensationProps) {
  useI18n('Employee.Compensation')

  const machine = useMemo(
    () =>
      createMachine(
        'list',
        managementCompensationStateMachine,
        (ctx: ManagementCompensationFlowContextInterface) => ({
          ...ctx,
          component: ListViewContextual,
          employeeId,
          hireDate,
          currentJobId: null,
          currentCompensationId: null,
        }),
      ),
    [employeeId, hireDate],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function Compensation({
  dictionary,
  FallbackComponent,
  ...props
}: CompensationProps & BaseComponentInterface<'Employee.Compensation'>) {
  useComponentDictionary('Employee.Compensation', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Compensation.Management"
      FallbackComponent={FallbackComponent}
    >
      <CompensationFlow {...props} />
    </BaseBoundaries>
  )
}

Compensation.ListView = ListView
Compensation.EditCompensation = EditCompensation
Compensation.AddJob = AddJob
