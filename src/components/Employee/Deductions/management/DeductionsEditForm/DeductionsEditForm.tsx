import { DeductionsForm } from '../../shared/DeductionsForm'
import { useDeductionsList } from '../../shared/useDeductionsList'
import { useManagementDeductionsFormDictionary } from './useFormDictionary'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link DeductionsEditForm}.
 *
 * @public
 */
export interface DeductionsEditFormProps extends CommonComponentInterface<'Employee.Management.Deductions'> {
  /** The associated employee identifier. */
  employeeId: string
  /** When provided, the form opens in edit mode pre-populated with the
   *  matching active deduction. Omit to open in add mode. */
  editingDeductionId?: string
  /** Callback invoked when the form emits an event. See the events table on {@link DeductionsEditForm} for the available event types and payloads. */
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Standalone add/edit surface for a single employee deduction.
 *
 * @remarks
 * Renders the inline form for a post-tax custom deduction or court-ordered garnishment. Looks up the row to edit by `editingDeductionId`; omit it to open in add mode. Resolves its text against the `Employee.Management.Deductions` translation namespace so partner overrides on that namespace flow into the form. For an orchestrated card-plus-form flow, use {@link Deductions}.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/deductions/editForm/created` | Fired after a new deduction is saved | The created `Garnishment` |
 * | `employee/management/deductions/editForm/updated` | Fired after an existing deduction is updated | The updated `Garnishment` |
 * | `employee/management/deductions/editForm/cancelled` | Fired when the user cancels the form | — |
 *
 * @param input - See {@link DeductionsEditFormProps}, plus a `FallbackComponent` override for the error boundary.
 * @returns The rendered add/edit form.
 * @public
 */
export function DeductionsEditForm({
  FallbackComponent,
  ...props
}: DeductionsEditFormProps & Pick<BaseComponentInterface, 'FallbackComponent'>) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.Deductions"
      FallbackComponent={FallbackComponent}
    >
      <DeductionsEditFormRoot {...props} />
    </BaseBoundaries>
  )
}

function DeductionsEditFormRoot({
  employeeId,
  editingDeductionId,
  dictionary,
  onEvent,
}: DeductionsEditFormProps) {
  useI18n('Employee.Management.Deductions')
  useComponentDictionary('Employee.Management.Deductions', dictionary)

  // React Query dedupes against any sibling consumer of this list, so this
  // is just a typed handle on the loaded row used to seed edit mode.
  const list = useDeductionsList({ employeeId })
  const formDictionary = useManagementDeductionsFormDictionary()

  if (list.isLoading) {
    return <BaseLayout isLoading error={list.errorHandling.errors} />
  }

  const deduction = editingDeductionId
    ? (list.data.deductions.find(d => d.uuid === editingDeductionId) ?? null)
    : null

  return (
    <BaseLayout error={list.errorHandling.errors}>
      <DeductionsForm
        employeeId={employeeId}
        deduction={deduction}
        dictionary={formDictionary}
        onSaved={(saved, mode) => {
          onEvent(
            mode === 'create'
              ? componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED
              : componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED,
            saved,
          )
        }}
        onCancel={() => {
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED)
        }}
      />
    </BaseLayout>
  )
}
