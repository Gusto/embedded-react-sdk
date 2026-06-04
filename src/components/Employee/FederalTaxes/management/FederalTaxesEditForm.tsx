import { useTranslation } from 'react-i18next'
import { FederalTaxesView } from '../shared/FederalTaxesView'
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormProps,
  type FederalTaxesFormData,
} from '../shared/useFederalTaxesForm'
import { useManagementFederalTaxesViewDictionary } from './useViewDictionary'
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

export interface FederalTaxesEditFormProps extends CommonComponentInterface<'Employee.Management.FederalTaxes'> {
  employeeId: string
  defaultValues?: Partial<FederalTaxesFormData>
  onEvent: BaseComponentInterface['onEvent']
}

export function FederalTaxesEditForm({
  FallbackComponent,
  ...props
}: FederalTaxesEditFormProps & Pick<BaseComponentInterface, 'FallbackComponent'>) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.FederalTaxes"
      FallbackComponent={FallbackComponent}
    >
      <FederalTaxesEditFormRoot {...props} />
    </BaseBoundaries>
  )
}

function FederalTaxesEditFormRoot({
  employeeId,
  className,
  children,
  dictionary,
  defaultValues,
  onEvent,
}: FederalTaxesEditFormProps) {
  useI18n('Employee.Management.FederalTaxes')
  useComponentDictionary('Employee.Management.FederalTaxes', dictionary)
  const { t } = useTranslation('Employee.Management.FederalTaxes')
  const Components = useComponentContext()
  const viewDictionary = useManagementFederalTaxesViewDictionary()

  const federalTaxes = useFederalTaxesForm({
    employeeId,
    defaultValues,
    optionalFieldsToRequire: {
      update: ['twoJobs', 'dependentsAmount', 'otherIncome', 'deductions', 'extraWithholding'],
    },
  } satisfies UseFederalTaxesFormProps)

  if (federalTaxes.isLoading) {
    return <BaseLayout isLoading error={federalTaxes.errorHandling.errors} />
  }

  const handleSubmit = async () => {
    const result = await federalTaxes.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED, result.data)
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED)
  }

  return (
    <FederalTaxesView
      federalTaxes={federalTaxes}
      onSubmit={handleSubmit}
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
      dictionary={viewDictionary}
    >
      {children}
    </FederalTaxesView>
  )
}
