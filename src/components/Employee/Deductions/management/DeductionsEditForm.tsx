import { DeductionsForm } from '../onboarding/DeductionsForm/DeductionsForm'
import { useDeductionsList } from '../shared/useDeductionsList'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface DeductionsEditFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
  /** When provided, the form opens in edit mode pre-populated with the
   *  matching active deduction. Omit to open in add mode. */
  editingDeductionId?: string
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Standalone add/edit surface for a single deduction. Wraps the shared
 * `DeductionsForm` (which is also used by the onboarding flow), looks up
 * the row to edit by id, and translates the form's `onSaved` / `onCancel`
 * callbacks into the management block's scoped events
 * (`EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED` / `_UPDATED` /
 * `_CANCELLED`).
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
  useI18n('Employee.Deductions')
  useComponentDictionary('Employee.Deductions', dictionary)

  // React Query dedupes against any sibling consumer of this list, so this
  // is just a typed handle on the loaded row used to seed edit mode.
  const list = useDeductionsList({ employeeId })

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
