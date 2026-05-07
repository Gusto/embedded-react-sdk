import { useTranslation } from 'react-i18next'
import { EmployeeStateTaxesView, useEmployeeStateTaxesForm } from './shared'
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

export type StateTaxesProps = Omit<CommonComponentInterface<'Employee.StateTaxes'>, 'children'> & {
  employeeId: string
  /** Render admin-only questions and submit them. Defaults to `false`. */
  isAdmin?: boolean
  onEvent: BaseComponentInterface['onEvent']
}

export function StateTaxes({
  FallbackComponent,
  ...props
}: StateTaxesProps & Pick<BaseComponentInterface, 'FallbackComponent'>) {
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
