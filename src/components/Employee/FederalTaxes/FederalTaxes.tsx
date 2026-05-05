import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormProps,
  type FederalTaxesFormData,
  type FilingStatusValue,
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
  /**
   * When true, renders a single "Continue" submit button and emits
   * `EMPLOYEE_FEDERAL_TAXES_DONE` after a successful save so the parent
   * onboarding flow can advance to the next step.
   *
   * When false (default — steady-state edit), renders Cancel + Save actions.
   * Cancel emits `CANCEL` so the parent can navigate away; Save submits the
   * form, surfaces a success alert, and keeps the user on the screen.
   * `EMPLOYEE_FEDERAL_TAXES_DONE` is not emitted in this mode.
   */
  isOnboarding?: boolean
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
  isOnboarding = false,
  onEvent,
}: FederalTaxesProps) {
  useI18n('Employee.FederalTaxes')
  useComponentDictionary('Employee.FederalTaxes', dictionary)

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

  return (
    <FederalTaxesReady
      federalTaxes={federalTaxes}
      onEvent={onEvent}
      isOnboarding={isOnboarding}
      className={className}
    >
      {children}
    </FederalTaxesReady>
  )
}

interface FederalTaxesReadyProps {
  federalTaxes: Extract<ReturnType<typeof useFederalTaxesForm>, { isLoading: false }>
  onEvent: (event: EventType, data?: unknown) => void
  isOnboarding: boolean
  className?: string
  children?: React.ReactNode
}

function FederalTaxesReady({
  federalTaxes,
  onEvent,
  isOnboarding,
  className,
  children,
}: FederalTaxesReadyProps) {
  const { t } = useTranslation('Employee.FederalTaxes')
  const Components = useComponentContext()
  const Fields = federalTaxes.form.Fields
  const [showSuccess, setShowSuccess] = useState(false)

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

  const handleSubmit = async () => {
    setShowSuccess(false)
    const result = await federalTaxes.actions.onSubmit()
    if (!result) return

    onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_UPDATED, result.data)
    if (isOnboarding) {
      onEvent(componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE)
    } else {
      setShowSuccess(true)
    }
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <section className={className}>
      <BaseLayout error={federalTaxes.errorHandling.errors}>
        <SDKFormProvider formHookResult={federalTaxes}>
          <Form onSubmit={handleSubmit}>
            {children ?? (
              <>
                {!isOnboarding && showSuccess && (
                  <Components.Alert
                    status="success"
                    label={t('successAlert')}
                    onDismiss={() => {
                      setShowSuccess(false)
                    }}
                  />
                )}

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

                {isOnboarding ? (
                  <ActionsLayout>
                    <Components.Button type="submit" isLoading={federalTaxes.status.isPending}>
                      {t('submitCta')}
                    </Components.Button>
                  </ActionsLayout>
                ) : (
                  <ActionsLayout>
                    <Components.Button variant="secondary" onClick={handleCancel}>
                      {t('cancelCta')}
                    </Components.Button>
                    <Components.Button type="submit" isLoading={federalTaxes.status.isPending}>
                      {t('saveCta')}
                    </Components.Button>
                  </ActionsLayout>
                )}
              </>
            )}
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
