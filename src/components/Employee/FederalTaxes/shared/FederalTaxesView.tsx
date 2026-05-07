import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { type useFederalTaxesForm, type FilingStatusValue } from './useFederalTaxesForm'
import { BaseLayout } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { Flex } from '@/components/Common/Flex'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type ReadyFederalTaxesForm = Extract<ReturnType<typeof useFederalTaxesForm>, { isLoading: false }>

export interface FederalTaxesViewProps {
  federalTaxes: ReadyFederalTaxesForm
  onSubmit: () => void | Promise<void>
  actions: ReactNode
  alert?: ReactNode
  className?: string
  children?: ReactNode
}

export function FederalTaxesView({
  federalTaxes,
  onSubmit,
  actions,
  alert,
  className,
  children,
}: FederalTaxesViewProps) {
  const { t } = useTranslation('Employee.FederalTaxes')
  const Components = useComponentContext()
  const Fields = federalTaxes.form.Fields

  const filingStatusLabel = (value: FilingStatusValue): string => {
    switch (value) {
      case 'Single':
        return t('filingStatusSingle')
      case 'Married':
        return t('filingStatusMarried')
      case 'Head of Household':
        return t('filingStatusHeadOfHousehold')
      case 'Exempt from withholding':
        return t('filingStatusExemptFromWithholding')
    }
  }

  return (
    <section className={className}>
      <BaseLayout error={federalTaxes.errorHandling.errors}>
        <SDKFormProvider formHookResult={federalTaxes}>
          <Form onSubmit={onSubmit}>
            {children ?? (
              <>
                {alert}
                <Flex flexDirection="column" gap={32}>
                  <Flex flexDirection="column" gap={4}>
                    <Components.Heading as="h2">{t('federalTaxesTitle')}</Components.Heading>
                    <Components.Text variant="supporting">
                      <Trans
                        i18nKey="irsCalculator"
                        t={t}
                        components={{
                          IrsCalculatorLink: <Components.Link />,
                          HelpCenterLink: <Components.Link />,
                        }}
                      />
                    </Components.Text>
                  </Flex>
                  <Flex flexDirection="column" gap={20}>
                    <Fields.FilingStatus
                      label={t('federalFilingStatus1c')}
                      placeholder={t('federalFilingStatusPlaceholder')}
                      description={t('selectWithholdingDescription')}
                      validationMessages={{ REQUIRED: t('validations.federalFilingStatus') }}
                      getOptionLabel={filingStatusLabel}
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
                  </Flex>

                  {actions}
                </Flex>
              </>
            )}
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
