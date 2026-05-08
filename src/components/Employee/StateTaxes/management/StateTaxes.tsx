import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmployeeStateTaxesView, useEmployeeStateTaxesForm } from '../shared'
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

function StateTaxesRoot({ employeeId, className, dictionary, onEvent }: StateTaxesProps) {
  useI18n('Employee.StateTaxes')
  useComponentDictionary('Employee.StateTaxes', dictionary)
  const { t } = useTranslation('Employee.StateTaxes')
  const Components = useComponentContext()

  const stateTaxes = useEmployeeStateTaxesForm({ employeeId })
  const [showSuccess, setShowSuccess] = useState(false)

  if (stateTaxes.isLoading) {
    return <BaseLayout isLoading error={stateTaxes.errorHandling.errors} />
  }

  const handleSubmit = async () => {
    setShowSuccess(false)
    const result = await stateTaxes.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, {
      employeeStateTaxesList: result.data,
    })
    setShowSuccess(true)
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  const alert = showSuccess ? (
    <Components.Alert
      status="success"
      label={t('successAlert')}
      onDismiss={() => {
        setShowSuccess(false)
      }}
    />
  ) : undefined

  return (
    <EmployeeStateTaxesView
      stateTaxes={stateTaxes}
      onSubmit={handleSubmit}
      alert={alert}
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
    />
  )
}
