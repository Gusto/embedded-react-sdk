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

export interface DeductionsEditFormProps extends CommonComponentInterface<'Employee.Management.Deductions'> {
  employeeId: string
  /** When provided, the form opens in edit mode pre-populated with the
   *  matching active deduction. Omit to open in add mode. */
  editingDeductionId?: string
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Standalone add/edit surface for a single deduction. Renders the shared
 * `DeductionsForm` with management's own translation dictionary so partner
 * overrides on `Employee.Management.Deductions` flow into the form text.
 * Looks up the row to edit by id and translates the form's `onSaved` /
 * `onCancel` callbacks into the management block's scoped events
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
        formDictionary={formDictionary}
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
