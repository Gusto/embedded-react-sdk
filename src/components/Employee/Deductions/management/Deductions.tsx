import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { DeductionsCardContextual, type DeductionsContextInterface } from './DeductionsComponents'
import { deductionsStateMachine } from './deductionsStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link Deductions}.
 *
 * @public
 */
export interface DeductionsProps extends BaseComponentInterface<'Employee.Management.Deductions'> {
  /** The associated employee identifier. */
  employeeId: string
}

function DeductionsFlow({ employeeId, onEvent }: DeductionsProps) {
  useI18n('Employee.Management.Deductions')

  const machine = useMemo(
    () =>
      createMachine('card', deductionsStateMachine, (ctx: DeductionsContextInterface) => ({
        ...ctx,
        component: DeductionsCardContextual,
        employeeId,
        successAlert: null,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Self-contained block for viewing and managing an employee's post-tax deductions — the same experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome.
 *
 * @remarks
 * Renders a card listing the employee's active deductions with affordances to add a new deduction, edit an existing one, or delete one via a confirm dialog. Choosing to add or edit swaps the card for the deduction form; a successful save returns to the card and emits the corresponding event, and cancelling returns without saving. Wraps everything in error and suspense boundaries.
 *
 * The card and form surfaces ({@link DeductionsCard}, {@link DeductionsEditForm}) are also exported individually for cases where that orchestration is the wrong fit — for example, when the form needs to render in a modal or drawer, or when the swap is driven by a router. Using them directly means owning the swap, the alert, and any cross-component state yourself.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/deductions/card/addRequested` | Fired when the "Add deduction" CTA is clicked from the card; the block opens the edit form in add mode | `{ employeeId: string }` |
 * | `employee/management/deductions/card/editRequested` | Fired when an "Edit" CTA is clicked for a deduction; the block opens the edit form pre-populated with that deduction | The matching `Garnishment` |
 * | `employee/management/deductions/card/deleted` | Fired after a deduction is deleted via the confirm dialog; the block stays on the card | The deleted `Garnishment` |
 * | `employee/management/deductions/editForm/created` | Fired after a new deduction is saved from the edit form; the block returns to the card view | The created `Garnishment` |
 * | `employee/management/deductions/editForm/updated` | Fired after an existing deduction is updated from the edit form; the block returns to the card view | The updated `Garnishment` |
 * | `employee/management/deductions/editForm/cancelled` | Fired when the user cancels the edit form; the block returns to the card view | — |
 * | `employee/management/deductions/alertDismissed` | Fired when the user dismisses a success alert above the card | `null` |
 *
 * @param props - See {@link DeductionsProps}.
 * @returns The rendered deductions block.
 * @public
 * @group Block Components
 */
export function Deductions({ dictionary, FallbackComponent, ...props }: DeductionsProps) {
  useComponentDictionary('Employee.Management.Deductions', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Deductions"
      FallbackComponent={FallbackComponent}
    >
      <DeductionsFlow {...props} />
    </BaseBoundaries>
  )
}
