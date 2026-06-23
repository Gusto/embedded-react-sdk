import { useTranslation } from 'react-i18next'
import { EmployeeStateTaxesView, useEmployeeStateTaxesForm } from '../shared'
import { useOnboardingStateTaxesViewDictionary } from './useViewDictionary'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link StateTaxes}.
 *
 * @public
 */
export interface StateTaxesProps extends BaseComponentInterface<'Employee.StateTaxes'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Render admin-only questions and submit them. Defaults to `false`. */
  isAdmin?: boolean
  /** Event handler fired when the form is submitted successfully. */
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Onboarding step that collects an employee's per-state tax withholding
 * answers. The set of fields is driven by the API response for each state
 * on record.
 *
 * @remarks
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/stateTaxes/updated` | Form was submitted successfully | `{ employeeStateTaxesList: EmployeeStateTaxesList[] }` |
 * | `employee/stateTaxes/done` | Onboarding step has finished — emitted immediately after `updated` | — |
 *
 * @param props - The component props.
 * @public
 */
export function StateTaxes({ FallbackComponent, ...props }: StateTaxesProps) {
  return (
    <BaseBoundaries componentName="Employee.StateTaxes" FallbackComponent={FallbackComponent}>
      <StateTaxesRoot {...props} />
    </BaseBoundaries>
  )
}

function StateTaxesRoot({
  employeeId,
  className,
  dictionary,
  onEvent,
  isAdmin = false,
}: StateTaxesProps) {
  useI18n('Employee.StateTaxes')
  useComponentDictionary('Employee.StateTaxes', dictionary)

  const stateTaxes = useEmployeeStateTaxesForm({ employeeId, isAdmin })
  const onboardingStateTaxesDictionary = useOnboardingStateTaxesViewDictionary()

  if (stateTaxes.isLoading) {
    return <BaseLayout isLoading error={stateTaxes.errorHandling.errors} />
  }

  const handleSubmit = async () => {
    const result = await stateTaxes.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, {
      employeeStateTaxesList: result.data,
    })
    onEvent(componentEvents.EMPLOYEE_STATE_TAXES_DONE)
  }

  return (
    <EmployeeStateTaxesView
      stateTaxes={stateTaxes}
      onSubmit={handleSubmit}
      actions={<ContinueAction isPending={stateTaxes.status.isPending} />}
      className={className}
      dictionary={onboardingStateTaxesDictionary}
    />
  )
}

function ContinueAction({ isPending }: { isPending: boolean }) {
  const { t } = useTranslation('Employee.StateTaxes')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
