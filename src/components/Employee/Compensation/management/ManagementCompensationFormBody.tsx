import { Trans, useTranslation } from 'react-i18next'
import type { PaymentUnit } from '@gusto/embedded-api-v-2025-11-15/models/components/compensation'
import type { FlsaStatusType } from '@gusto/embedded-api-v-2025-11-15/models/components/flsastatustype'
import type { MinimumWage } from '@gusto/embedded-api-v-2025-11-15/models/components/minimumwage'
import type { UseJobFormReady } from '../shared/useJobForm'
import type { UseCompensationFormReady } from '../shared/useCompensationForm'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FLSA_OVERTIME_SALARY_LIMIT } from '@/shared/constants'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { addDays } from '@/helpers/dateFormatting'

export interface ManagementCompensationFormBodyProps {
  jobForm: UseJobFormReady
  compensationForm: UseCompensationFormReady
  title: string
  submitCtaLabel: string
  isPending: boolean
  onCancel?: () => void
  /** Override the minimum selectable date for the Effective date field. Defaults to tomorrow.
   *  Used by EditPendingCompensation for secondary new jobs where the floor is the job's hire date. */
  minEffectiveDate?: Date
}

/**
 * Renders the shared field layout used by both `EditCompensation` (schedule a future comp
 * change for a present job) and `EditPendingCompensation` (update an existing future comp).
 * Field visibility is driven entirely by hook configuration — the hooks expose `undefined`
 * for fields that should not render — so this component renders the correct subset for each
 * use case without extra conditional props.
 */
export function ManagementCompensationFormBody({
  jobForm,
  compensationForm,
  title,
  submitCtaLabel,
  isPending,
  onCancel,
  minEffectiveDate,
}: ManagementCompensationFormBodyProps) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()
  const format = useNumberFormatter('currency')

  const JobFields = jobForm.form.Fields
  const CompFields = compensationForm.form.Fields

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h2">{title}</Components.Heading>

      {compensationForm.status.willDeleteSecondaryJobs && (
        <Components.Alert
          label={t('management.scheduledClassificationChangeNotification')}
          status="warning"
        />
      )}

      <CompFields.Title
        label={t('management.jobTitleLabel')}
        validationMessages={{ REQUIRED: t('validations.jobTitleSentence') }}
        formHookResult={compensationForm}
      />

      {JobFields.HireDate && (
        <JobFields.HireDate
          label={t('management.hireDateLabel')}
          validationMessages={{
            REQUIRED: t('validations.hireDate'),
          }}
          formHookResult={jobForm}
        />
      )}

      {CompFields.FlsaStatus && (
        <CompFields.FlsaStatus
          label={t('employeeClassification')}
          description={
            <Trans
              t={t}
              i18nKey="classificationLink"
              components={{ ClassificationLink: <Components.Link /> }}
            />
          }
          validationMessages={{
            REQUIRED: t('validations.exemptThreshold', {
              limit: format(FLSA_OVERTIME_SALARY_LIMIT),
            }),
          }}
          getOptionLabel={(status: FlsaStatusType) => t(`flsaStatusLabels.${status}`)}
          formHookResult={compensationForm}
        />
      )}

      <CompFields.Rate
        label={t('management.wageLabel')}
        validationMessages={{
          REQUIRED: t('validations.rate'),
          RATE_MINIMUM: t('validations.nonZeroRate'),
          RATE_EXEMPT_THRESHOLD: t('validations.rateExemptThreshold', {
            limit: format(FLSA_OVERTIME_SALARY_LIMIT),
          }),
        }}
        formHookResult={compensationForm}
      />

      <CompFields.PaymentUnit
        label={t('management.wageFrequencyLabel')}
        description={t('paymentUnitDescription')}
        validationMessages={{ REQUIRED: t('validations.paymentUnit') }}
        getOptionLabel={(unit: PaymentUnit) =>
          t(`management.wageFrequencyOptions.${unit}` as const)
        }
        formHookResult={compensationForm}
      />

      {CompFields.EffectiveDate && (
        <CompFields.EffectiveDate
          label={t('effectiveDateLabel')}
          minDate={minEffectiveDate ?? addDays(new Date(), 1)}
          maxDate={
            compensationForm.data.maximumEffectiveDate
              ? new Date(compensationForm.data.maximumEffectiveDate)
              : undefined
          }
          validationMessages={{
            REQUIRED: t('validations.effectiveDate'),
            EFFECTIVE_DATE_BEFORE_HIRE: t('validations.effectiveDateBeforeHire'),
          }}
          formHookResult={compensationForm}
        />
      )}

      {CompFields.AdjustForMinimumWage && (
        <CompFields.AdjustForMinimumWage
          label={t('adjustForMinimumWage')}
          description={t('adjustForMinimumWageDescription')}
          formHookResult={compensationForm}
        />
      )}

      {CompFields.MinimumWageId && (
        <CompFields.MinimumWageId
          label={t('minimumWageLabel')}
          description={t('minimumWageDescription')}
          validationMessages={{ REQUIRED: t('validations.minimumWage') }}
          getOptionLabel={(wage: MinimumWage) =>
            `${format(Number(wage.wage))} - ${wage.authority}: ${wage.notes ?? ''}`
          }
          formHookResult={compensationForm}
        />
      )}

      {JobFields.TwoPercentShareholder && (
        <JobFields.TwoPercentShareholder
          label={t('management.twoPercentShareholderLabel')}
          formHookResult={jobForm}
        />
      )}

      {JobFields.StateWcCovered && (
        <JobFields.StateWcCovered
          label={t('stateWcCoveredLabel')}
          description={
            <Trans
              t={t}
              i18nKey="stateWcCoveredDescription"
              components={{
                wcLink: (
                  <Components.Link
                    href="https://www.lni.wa.gov/insurance/rates-risk-classes/risk-classes-for-workers-compensation/risk-class-lookup#/"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
          }
          getOptionLabel={(covered: boolean) =>
            covered ? t('stateWcCoveredOptions.yes') : t('stateWcCoveredOptions.no')
          }
          formHookResult={jobForm}
        />
      )}

      {JobFields.StateWcClassCode && (
        <JobFields.StateWcClassCode
          label={t('stateWcClassCodeLabel')}
          description={t('stateWcClassCodeDescription')}
          placeholder={t('stateWcClassCodeLabel')}
          validationMessages={{ REQUIRED: t('validations.stateWcClassCode') }}
          formHookResult={jobForm}
        />
      )}

      <ActionsLayout>
        {onCancel && (
          <Components.Button variant="secondary" onClick={onCancel} isDisabled={isPending}>
            {t('cancelCta')}
          </Components.Button>
        )}
        <Components.Button type="submit" isLoading={isPending}>
          {submitCtaLabel}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
