import { Trans, useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { useCompensationForm } from './useCompensationForm'
import type { UseCompensationFormProps } from './useCompensationForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { componentEvents, FLSA_OVERTIME_SALARY_LIMIT } from '@/shared/constants'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'

export interface CompensationFormProps extends UseCompensationFormProps {
  onEvent?: (event: string, data?: unknown) => void
}

function CompensationFormRoot({ onEvent, ...hookProps }: CompensationFormProps) {
  useI18n('UNSTABLE.CompensationForm')
  const { t } = useTranslation('UNSTABLE.CompensationForm')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')
  const comp = useCompensationForm(hookProps)

  if (comp.isLoading) {
    return <BaseLayout isLoading />
  }

  const { Fields } = comp.form

  const handleSubmit = async () => {
    const result = await comp.actions.onSubmit({
      onJobCreated: job => onEvent?.(componentEvents.EMPLOYEE_JOB_CREATED, job),
      onJobUpdated: job => onEvent?.(componentEvents.EMPLOYEE_JOB_UPDATED, job),
      onCompensationUpdated: compensation =>
        onEvent?.(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensation),
    })
    if (result && onEvent) {
      onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
    }
  }

  return (
    <BaseLayout error={comp.errors}>
      <SDKFormProvider errors={comp.errors} form={comp.form}>
        <Form
          onSubmit={e => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <Components.Heading as="h2">
            {comp.status.mode === 'create' ? t('addTitle') : t('editTitle')}
          </Components.Heading>

          <Fields.JobTitle
            label={t('jobTitle')}
            validationMessages={{
              REQUIRED: t('fieldValidations.jobTitle.REQUIRED'),
            }}
          />

          {Fields.FlsaStatus && (
            <Fields.FlsaStatus
              label={t('employeeClassification')}
              description={
                <Trans
                  t={t}
                  i18nKey="classificationLink"
                  components={{
                    ClassificationLink: <Components.Link />,
                  }}
                />
              }
              getOptionLabel={status => t(`flsaStatusLabels.${status}`, status)}
              validationMessages={{
                REQUIRED: t('fieldValidations.flsaStatus.REQUIRED'),
              }}
            />
          )}

          <Fields.Rate
            label={t('amount')}
            validationMessages={{
              REQUIRED: t('fieldValidations.rate.REQUIRED'),
              RATE_MINIMUM: t('fieldValidations.rate.RATE_MINIMUM'),
              RATE_EXEMPT_THRESHOLD: t('fieldValidations.rate.RATE_EXEMPT_THRESHOLD', {
                limit: formatCurrency(FLSA_OVERTIME_SALARY_LIMIT),
              }),
            }}
          />

          <Fields.PaymentUnit
            label={t('paymentUnitLabel')}
            description={t('paymentUnitDescription')}
            getOptionLabel={unit => t(`paymentUnitOptions.${unit}`, unit)}
            validationMessages={{
              REQUIRED: t('fieldValidations.paymentUnit.REQUIRED'),
            }}
          />

          {Fields.AdjustForMinimumWage && (
            <Fields.AdjustForMinimumWage
              label={t('adjustForMinimumWage')}
              description={t('adjustForMinimumWageDescription')}
            />
          )}

          {Fields.MinimumWageId && (
            <Fields.MinimumWageId
              label={t('minimumWageLabel')}
              description={t('minimumWageDescription')}
              validationMessages={{
                REQUIRED: t('fieldValidations.minimumWageId.REQUIRED'),
              }}
            />
          )}

          {Fields.TwoPercentShareholder && (
            <Fields.TwoPercentShareholder label={t('twoPercentStakeholderLabel')} />
          )}

          {Fields.StateWcCovered && (
            <Fields.StateWcCovered
              label={t('stateWcCoveredLabel')}
              description={t('stateWcCoveredDescription')}
              getOptionLabel={key =>
                key === 'yes' ? t('stateWcCoveredYes') : t('stateWcCoveredNo')
              }
            />
          )}

          {Fields.StateWcClassCode && (
            <Fields.StateWcClassCode
              label={t('stateWcClassCodeLabel')}
              description={t('stateWcClassCodeDescription')}
              validationMessages={{
                REQUIRED: t('fieldValidations.stateWcClassCode.REQUIRED'),
              }}
            />
          )}

          <ActionsLayout>
            <Components.Button type="submit" isLoading={comp.status.isPending}>
              {t('saveNewJobCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

export function CompensationForm(props: CompensationFormProps) {
  return (
    <BaseBoundaries>
      <CompensationFormRoot {...props} />
    </BaseBoundaries>
  )
}
