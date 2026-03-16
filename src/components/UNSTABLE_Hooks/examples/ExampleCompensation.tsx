import { useTranslation } from 'react-i18next'
import { Form } from '../Form'
import {
  useCompensationForm,
  CompensationFormProvider,
  type CompensationFormReady,
} from '../hooks/useCompensation'
import { ActionsLayout, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { useI18n } from '@/i18n'

const I18N_NS = 'UNSTABLE_Compensation' as const

const exampleCompensationEvents = {
  COMPENSATION_CREATED: 'compensation_created',
  COMPENSATION_UPDATED: 'compensation_updated',
} as const

type ExampleCompensationEvent =
  (typeof exampleCompensationEvents)[keyof typeof exampleCompensationEvents]

interface ExampleCompensationProps {
  employeeId: string
  startDate?: string
  onEvent?: (event: ExampleCompensationEvent, data?: unknown) => void
}

export function ExampleCompensation({ employeeId, startDate, onEvent }: ExampleCompensationProps) {
  return (
    <BaseBoundaries>
      <ExampleCompensationRoot employeeId={employeeId} startDate={startDate} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function ExampleCompensationRoot({ employeeId, startDate, onEvent }: ExampleCompensationProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const compensationForm = useCompensationForm({ employeeId, startDate })
  const Components = useComponentContext()

  if (compensationForm.isLoading) {
    return <BaseLayout isLoading />
  }

  const { onSubmit, isPending, errors } = compensationForm

  const handleSubmit = async () => {
    const result = await onSubmit()
    if (result) {
      const event =
        result.mode === 'create'
          ? exampleCompensationEvents.COMPENSATION_CREATED
          : exampleCompensationEvents.COMPENSATION_UPDATED
      onEvent?.(event, result.data)
    }
  }

  return (
    <BaseLayout error={errors.error} fieldErrors={errors.fieldErrors}>
      <Form onSubmit={handleSubmit}>
        <Components.Heading as="h2">{t('formTitle')}</Components.Heading>
        <Components.Text>{t('description')}</Components.Text>
        <CompensationFormFields form={compensationForm} />
        <ActionsLayout>
          <Components.Button type="submit" isLoading={isPending}>
            {t('submit')}
          </Components.Button>
        </ActionsLayout>
      </Form>
    </BaseLayout>
  )
}

export interface CompensationFormFieldsProps {
  form: CompensationFormReady
}

export function CompensationFormFields({ form }: CompensationFormFieldsProps) {
  const { t } = useTranslation(I18N_NS)

  const { Fields } = form

  return (
    <CompensationFormProvider form={form}>
      <Grid gap={20}>
        <Fields.JobTitle
          label={t('jobTitle')}
          validationMessages={{
            REQUIRED: t('fieldValidations.jobTitle.REQUIRED'),
          }}
        />
        {Fields.FlsaStatus && (
          <Fields.FlsaStatus
            label={t('employeeClassification')}
            description={t('classificationDescription')}
            getOptionLabel={value => t(`flsaStatusLabels.${value}`)}
            validationMessages={{
              REQUIRED: t('fieldValidations.flsaStatus.REQUIRED'),
            }}
          />
        )}
        <Fields.Rate
          label={t('amount')}
          validationMessages={{
            RATE_MINIMUM: t('fieldValidations.rate.RATE_MINIMUM'),
            RATE_EXEMPT_THRESHOLD: t('fieldValidations.rate.RATE_EXEMPT_THRESHOLD'),
          }}
        />
        <Fields.PaymentUnit
          label={t('paymentUnitLabel')}
          description={t('paymentUnitDescription')}
          getOptionLabel={value => t(`paymentUnitOptions.${value}`)}
          validationMessages={{
            REQUIRED: t('fieldValidations.paymentUnit.REQUIRED'),
          }}
        />
      </Grid>
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
        <Fields.TwoPercentShareholder label={t('twoPercentShareholderLabel')} />
      )}
      {Fields.StateWcCovered && (
        <Fields.StateWcCovered
          label={t('stateWcCoveredLabel')}
          description={t('stateWcCoveredDescription')}
          getOptionLabel={value => (value ? t('stateWcCoveredYes') : t('stateWcCoveredNo'))}
        />
      )}
      {Fields.StateWcClassCode && (
        <Fields.StateWcClassCode
          label={t('stateWcClassCodeLabel')}
          description={t('stateWcClassCodeDescription')}
          placeholder={t('stateWcClassCodeLabel')}
          validationMessages={{
            REQUIRED: t('fieldValidations.stateWcClassCode.REQUIRED'),
          }}
        />
      )}
    </CompensationFormProvider>
  )
}
