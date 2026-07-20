import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  FederalTaxesCardContextual,
  type FederalTaxesContextInterface,
} from './FederalTaxesComponents'
import { federalTaxesStateMachine } from './federalTaxesStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link FederalTaxes}.
 *
 * @public
 */
export interface FederalTaxesProps extends BaseComponentInterface<'Employee.Management.FederalTaxes'> {
  /** The associated employee identifier. */
  employeeId: string
}

function FederalTaxesFlow({ employeeId, onEvent }: FederalTaxesProps) {
  useI18n('Employee.Management.FederalTaxes')

  const machine = useMemo(
    () =>
      createMachine('card', federalTaxesStateMachine, (ctx: FederalTaxesContextInterface) => ({
        ...ctx,
        component: FederalTaxesCardContextual,
        employeeId,
        successAlert: null,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Self-contained block for viewing and editing an employee's federal tax (W-4) withholdings — the same experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome.
 *
 * @remarks
 * Renders a read-only card showing filing status, multiple-jobs flag, dependents, other income, deductions, and extra withholding, with an Edit CTA that swaps to the edit form. Submitting the form returns to the card; cancelling returns without saving. Wraps everything in error and suspense boundaries.
 *
 * The card and form surfaces ({@link FederalTaxesCard}, {@link FederalTaxesEditForm}) are also exported individually for cases where that orchestration is the wrong fit — for example, when the form needs to render in a modal or drawer, when the card needs to appear read-only with no edit affordance, or when the swap is driven by a router. Using them directly means owning the swap and any cross-component state yourself.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/federalTaxes/card/editRequested` | Fired when the card's Edit CTA is clicked; the block opens the edit form | `{ employeeId: string }` |
 * | `employee/management/federalTaxes/editForm/submitted` | Fired after the edit form is saved; the block returns to the card view | The updated `EmployeeFederalTax` entity |
 * | `employee/management/federalTaxes/editForm/cancelled` | Fired when the user cancels the edit form; the block returns to the card view | — |
 * | `employee/management/federalTaxes/alertDismissed` | Fired when the user dismisses an alert above the card | `null` |
 *
 * @param props - See {@link FederalTaxesProps}.
 * @returns The rendered federal taxes block.
 * @public
 * @group Block components
 */
export function FederalTaxes({ dictionary, FallbackComponent, ...props }: FederalTaxesProps) {
  useComponentDictionary('Employee.Management.FederalTaxes', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.FederalTaxes"
      FallbackComponent={FallbackComponent}
    >
      <FederalTaxesFlow {...props} />
    </BaseBoundaries>
  )
}
