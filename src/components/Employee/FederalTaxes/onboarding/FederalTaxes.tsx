import { useTranslation } from 'react-i18next'
import { FederalTaxesView } from '../shared/FederalTaxesView'
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormProps,
  type FederalTaxesFormData,
} from '../shared/useFederalTaxesForm'
import { useOnboardingFederalTaxesViewDictionary } from './useViewDictionary'
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
  const viewDictionary = useOnboardingFederalTaxesViewDictionary()

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

    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, result.data)
    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
  }

  return (
    <FederalTaxesView
      federalTaxes={federalTaxes}
      onSubmit={handleSubmit}
      actions={<ContinueAction isPending={federalTaxes.status.isPending} />}
      className={className}
      dictionary={viewDictionary}
    >
      {children}
    </FederalTaxesView>
  )
}

function ContinueAction({ isPending }: { isPending: boolean }) {
  const { t } = useTranslation('Employee.FederalTaxes')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
