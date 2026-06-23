import { useTranslation } from 'react-i18next'
import { EmployeeStateTaxesView, useEmployeeStateTaxesForm } from '../shared'
import { useManagementStateTaxesViewDictionary } from './useViewDictionary'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link StateTaxesEditForm}.
 *
 * @public
 */
export interface StateTaxesEditFormProps extends BaseComponentInterface<'Employee.Management.StateTaxes'> {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Standalone edit screen for the state-tax management flow. Renders the shared
 * state-tax form against the `Employee.Management.StateTaxes` namespace and
 * emits scoped management events on submit and cancel, so partner copy
 * overrides on the management namespace do not leak into the onboarding flow.
 *
 * @remarks
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/stateTaxes/updated` | Form was submitted successfully | `{ employeeStateTaxesList: EmployeeStateTaxesList[] }` |
 * | `employee/management/stateTaxes/editCancelled` | Cancel button was clicked | — |
 *
 * @param props - The component props.
 * @public
 */
export function StateTaxesEditForm({ FallbackComponent, ...props }: StateTaxesEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.StateTaxes"
      FallbackComponent={FallbackComponent}
    >
      <StateTaxesEditFormRoot {...props} />
    </BaseBoundaries>
  )
}

function StateTaxesEditFormRoot({
  employeeId,
  className,
  dictionary,
  onEvent,
}: StateTaxesEditFormProps) {
  useI18n('Employee.Management.StateTaxes')
  useComponentDictionary('Employee.Management.StateTaxes', dictionary)
  const { t } = useTranslation('Employee.Management.StateTaxes')
  const Components = useComponentContext()

  const stateTaxes = useEmployeeStateTaxesForm({ employeeId })
  const managementStateTaxesDictionary = useManagementStateTaxesViewDictionary()

  if (stateTaxes.isLoading) {
    return <BaseLayout isLoading error={stateTaxes.errorHandling.errors} />
  }

  const handleSubmit = async () => {
    const result = await stateTaxes.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED, {
      employeeStateTaxesList: result.data,
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED)
  }

  return (
    <EmployeeStateTaxesView
      stateTaxes={stateTaxes}
      onSubmit={handleSubmit}
      actions={
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={handleCancel}>
            {t('cancelCta')}
          </Components.Button>
          <Components.Button type="submit" isLoading={stateTaxes.status.isPending}>
            {t('saveCta')}
          </Components.Button>
        </ActionsLayout>
      }
      className={className}
      dictionary={managementStateTaxesDictionary}
    />
  )
}
