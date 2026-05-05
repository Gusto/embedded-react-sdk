import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FederalTaxesView } from '../shared/FederalTaxesView'
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormProps,
  type FederalTaxesFormData,
} from '../shared/useFederalTaxesForm'
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

export interface FederalTaxesProps extends CommonComponentInterface<'Employee.FederalTaxes'> {
  employeeId: string
  defaultValues?: Partial<FederalTaxesFormData>
  onEvent: BaseComponentInterface['onEvent']
}

export function FederalTaxes({
  FallbackComponent,
  ...props
}: FederalTaxesProps & Pick<BaseComponentInterface, 'FallbackComponent'>) {
  return (
    <BaseBoundaries componentName="Employee.FederalTaxes" FallbackComponent={FallbackComponent}>
      <FederalTaxesRoot {...props} />
    </BaseBoundaries>
  )
}

function FederalTaxesRoot({
  employeeId,
  className,
  children,
  dictionary,
  defaultValues,
  onEvent,
}: FederalTaxesProps) {
  useI18n('Employee.FederalTaxes')
  useComponentDictionary('Employee.FederalTaxes', dictionary)
  const { t } = useTranslation('Employee.FederalTaxes')
  const Components = useComponentContext()

  const federalTaxes = useFederalTaxesForm({
    employeeId,
    defaultValues,
    optionalFieldsToRequire: {
      update: ['twoJobs', 'dependentsAmount', 'otherIncome', 'deductions', 'extraWithholding'],
    },
  } satisfies UseFederalTaxesFormProps)

  const [showSuccess, setShowSuccess] = useState(false)

  if (federalTaxes.isLoading) {
    return <BaseLayout isLoading error={federalTaxes.errorHandling.errors} />
  }

  const handleSubmit = async () => {
    setShowSuccess(false)
    const result = await federalTaxes.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, result.data)
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
    <FederalTaxesView
      federalTaxes={federalTaxes}
      onSubmit={handleSubmit}
      alert={alert}
      actions={
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={handleCancel}>
            {t('cancelCta')}
          </Components.Button>
          <Components.Button type="submit" isLoading={federalTaxes.status.isPending}>
            {t('saveCta')}
          </Components.Button>
        </ActionsLayout>
      }
      className={className}
    >
      {children}
    </FederalTaxesView>
  )
}
