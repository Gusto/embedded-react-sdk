import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  CompensationCardContextual,
  type CompensationContextInterface,
} from './CompensationComponents'
import { compensationStateMachine } from './compensationStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link Compensation}.
 *
 * @public
 */
export interface CompensationProps extends BaseComponentInterface<'Employee.Management.Compensation'> {
  /** The associated employee identifier. */
  employeeId: string
}

function CompensationFlow({ employeeId, onEvent }: CompensationProps) {
  useI18n('Employee.Management.Compensation')

  const machine = useMemo(
    () =>
      createMachine('card', compensationStateMachine, (ctx: CompensationContextInterface) => ({
        ...ctx,
        component: CompensationCardContextual,
        employeeId,
        successAlert: null,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Self-contained block for viewing and managing an employee's jobs and compensation — the same experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome.
 *
 * @remarks
 * Renders a read-only card showing the employee's job(s), pay type, wage, and effective date, along with affordances to edit a job's compensation, add a first job from the empty state, add another job (when the primary job is Nonexempt), delete a non-primary job, and cancel a scheduled future-dated change. Choosing to edit or add a job swaps the card for the corresponding form; a successful add returns to the card with a dismissible "Job successfully added." alert, an edit returns to the card without an alert, and cancelling returns without saving. Wraps everything in error and suspense boundaries.
 *
 * The card and form surfaces ({@link CompensationCard}, {@link CompensationEditForm}, {@link CompensationAddJobForm}, {@link CompensationAddAnotherJobForm}) are also exported individually for cases where that orchestration is the wrong fit — for example, when a form needs to render in a modal or drawer, when the card needs to appear read-only with no edit/add affordances, or when the swap is driven by a router. Using them directly means owning the swap, the alert, and any cross-component state yourself.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/compensation/card/editRequested` | Fired when an "Edit" CTA is clicked for a job; the block opens the edit form for that job | `{ employeeId: string, jobId: string }` |
 * | `employee/management/compensation/card/addRequested` | Fired when the "Add job" CTA is clicked from the card's empty state; the block opens the add-first-job form | `{ employeeId: string }` |
 * | `employee/management/compensation/card/addAnotherRequested` | Fired when the "Add another job" CTA is clicked; the block opens the add-another-job form | `{ employeeId: string }` |
 * | `employee/management/compensation/card/jobDeleted` | Fired after a non-primary job is deleted via the card's confirm dialog; the block stays on the card | `{ employeeId: string, jobId: string }` |
 * | `employee/management/compensation/card/changeCancelled` | Fired after a scheduled future-dated change is cancelled from the card; the block stays on the card | `{ employeeId: string, compensationId: string }` |
 * | `employee/management/compensation/editForm/submitted` | Fired after an edit-compensation save completes; the block returns to the card view | Updated `Compensation` entity |
 * | `employee/management/compensation/editForm/cancelled` | Fired when the user cancels the edit form; the block returns to the card view | — |
 * | `employee/management/compensation/addJobForm/submitted` | Fired after the first job + compensation are saved; the block returns to the card and surfaces the "Job added" alert | Updated `Compensation` entity |
 * | `employee/management/compensation/addJobForm/cancelled` | Fired when the user cancels the add-job form; the block returns to the card view | — |
 * | `employee/management/compensation/addAnotherJobForm/submitted` | Fired after a secondary job + compensation are saved; the block returns to the card and surfaces the "Job added" alert | Updated `Compensation` entity |
 * | `employee/management/compensation/addAnotherJobForm/cancelled` | Fired when the user cancels the add-another-job form; the block returns to the card view | — |
 * | `employee/management/compensation/alertDismissed` | Fired when the user dismisses the "Job added" success alert above the card | `null` |
 *
 * @param props - See {@link CompensationProps}.
 * @returns The rendered compensation block.
 * @public
 * @group Block Components
 */
export function Compensation({ dictionary, FallbackComponent, ...props }: CompensationProps) {
  useComponentDictionary('Employee.Management.Compensation', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Compensation"
      FallbackComponent={FallbackComponent}
    >
      <CompensationFlow {...props} />
    </BaseBoundaries>
  )
}
