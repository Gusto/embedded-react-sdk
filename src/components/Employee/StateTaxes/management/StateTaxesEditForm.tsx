import { useTranslation } from 'react-i18next'
import { EmployeeStateTaxesView, useEmployeeStateTaxesForm } from '../shared'
import { useManagementStateTaxesViewDictionary } from './useViewDictionary'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type StateTaxesEditFormProps = Omit<
  CommonComponentInterface<'Employee.Management.StateTaxes'>,
  'children'
> & {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Standalone state-tax edit screen for the management flow. Wraps the shared
 * {@link useEmployeeStateTaxesForm} hook with scoped events and the
 * `Employee.Management.StateTaxes` namespace; the shared `EmployeeStateTaxesView`
 * resolves its text through `useManagementStateTaxesViewDictionary` so partner
 * overrides on the management namespace don't leak into onboarding.
 *
 * Emits `EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED` on a successful save and
 * `EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED` on Cancel. The orchestrator
 * (the block or the dashboard) handles both by returning to the card surface.
 */
export function StateTaxesEditForm({
  FallbackComponent,
  ...props
}: StateTaxesEditFormProps & Pick<BaseComponentInterface, 'FallbackComponent'>) {
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
