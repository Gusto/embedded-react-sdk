import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { StateTaxesCardContextual, type StateTaxesContextInterface } from './StateTaxesComponents'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link StateTaxes}.
 *
 * @public
 */
export interface StateTaxesProps extends BaseComponentInterface<'Employee.Management.StateTaxes'> {
  /** The associated employee identifier. */
  employeeId: string
}

function StateTaxesFlow({ employeeId, onEvent }: StateTaxesProps) {
  useI18n('Employee.Management.StateTaxes')

  const machine = useMemo(
    () =>
      createMachine('card', stateTaxesStateMachine, (ctx: StateTaxesContextInterface) => ({
        ...ctx,
        component: StateTaxesCardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Standalone state-tax management flow for a given employee. Renders the
 * read-only summary card and the edit form, switching between them as the
 * partner-emitted events from {@link StateTaxesCard} and {@link StateTaxesEditForm}
 * drive the internal state machine.
 *
 * @remarks
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/stateTaxes/editRequested` | Edit button on the summary card was clicked | `{ employeeId: string }` |
 * | `employee/management/stateTaxes/editCancelled` | Cancel button on the edit form was clicked | — |
 * | `employee/management/stateTaxes/updated` | Edit form was submitted successfully | `{ employeeStateTaxesList: EmployeeStateTaxesList[] }` |
 *
 * @param props - The component props.
 * @public
 */
export function StateTaxes({ dictionary, FallbackComponent, ...props }: StateTaxesProps) {
  useComponentDictionary('Employee.Management.StateTaxes', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.StateTaxes"
      FallbackComponent={FallbackComponent}
    >
      <StateTaxesFlow {...props} />
    </BaseBoundaries>
  )
}
