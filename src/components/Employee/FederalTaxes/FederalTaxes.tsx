import { Trans, useTranslation } from 'react-i18next'
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormProps,
  type FederalTaxesFormData,
} from './shared/useFederalTaxesForm'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
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

  const federalTaxes = useFederalTaxesForm({
    employeeId,
    defaultValues,
  } satisfies UseFederalTaxesFormProps)

  if (federalTaxes.isLoading) {
    return <BaseLayout isLoading error={federalTaxes.errorHandling.errors} />
  }

  return (
    <FederalTaxesReady federalTaxes={federalTaxes} onEvent={onEvent} className={className}>
      {children}
    </FederalTaxesReady>
  )
}

interface FederalTaxesReadyProps {
  federalTaxes: Extract<ReturnType<typeof useFederalTaxesForm>, { isLoading: false }>
  onEvent: (event: EventType, data?: unknown) => void
  className?: string
  children?: React.ReactNode
}

function FederalTaxesReady({
  federalTaxes,
  onEvent,
  className,
  children,
}: FederalTaxesReadyProps) {
  const { t } = useTranslation('Employee.FederalTaxes')
  const Components = useComponentContext()
  const Fields = federalTaxes.form.Fields

  const handleSubmit = async () => {
    const result = await federalTaxes.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, result.data)
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
    }
  }

  return (
    <section className={className}>
      <BaseLayout error={federalTaxes.errorHandling.errors}>
        <SDKFormProvider formHookResult={federalTaxes}>
          <Form onSubmit={handleSubmit}>
            {children ?? (
              <>
                <Components.Heading as="h1">{t('federalTaxesTitle')}</Components.Heading>
                <Components.Text>
                  <Trans
                    i18nKey="irsCalculator"
                    t={t}
                    components={{
                      IrsCalculatorLink: <Components.Link />,
                      HelpCenterLink: <Components.Link />,
                    }}
                  />
                </Components.Text>

                <Fields.FilingStatus
                  label={t('federalFilingStatus1c')}
                  placeholder={t('federalFilingStatusPlaceholder')}
                  description={t('selectWithholdingDescription')}
                  validationMessages={{ REQUIRED: t('validations.federalFilingStatus') }}
                />
                <Fields.TwoJobs
                  label={t('multipleJobs2c')}
                  description={
                    <Trans
                      i18nKey="includesSpouseExplanation"
                      t={t}
                      components={{
                        IrsLink: <Components.Link />,
                      }}
                    />
                  }
                  validationMessages={{ REQUIRED: t('validations.federalTwoJobs') }}
                  getOptionLabel={value => (value ? t('twoJobYesLabel') : t('twoJobNoLabel'))}
                />
                <Fields.DependentsAmount
                  label={t('dependentsTotalIfApplicable')}
                  validationMessages={{ REQUIRED: t('fieldIsRequired') }}
                />
                <Fields.OtherIncome
                  label={t('otherIncome')}
                  validationMessages={{ REQUIRED: t('fieldIsRequired') }}
                />
                <Fields.Deductions
                  label={t('deductions')}
                  validationMessages={{ REQUIRED: t('fieldIsRequired') }}
                />
                <Fields.ExtraWithholding
                  label={t('extraWithholding')}
                  validationMessages={{ REQUIRED: t('fieldIsRequired') }}
                />

                <ActionsLayout>
                  <Components.Button type="submit" isLoading={federalTaxes.status.isPending}>
                    {t('submitCta')}
                  </Components.Button>
                </ActionsLayout>
              </>
            )}
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
