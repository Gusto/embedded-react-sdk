import { Trans, useTranslation } from 'react-i18next'
import type { PaymentUnit } from '@gusto/embedded-api-v-2025-11-15/models/components/compensation'
import type { FlsaStatusType } from '@gusto/embedded-api-v-2025-11-15/models/components/flsastatustype'
import type { MinimumWage } from '@gusto/embedded-api-v-2025-11-15/models/components/minimumwage'
import type { UseJobFormReady } from './useJobForm'
import type { UseCompensationFormReady } from './useCompensationForm'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FLSA_OVERTIME_SALARY_LIMIT } from '@/shared/constants'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { ResourceDictionary } from '@/types/Helpers'

/**
 * Translation overrides for the shared add-compensation form body. The body
 * reads its copy from the onboarding `Employee.Compensation` namespace by
 * default; management surfaces resolve this dictionary from
 * `Employee.Management.Compensation` and pass it in so management copy renders
 * while the two surfaces stay isolated.
 */
export type AddCompensationFormDictionary = ResourceDictionary<'Employee.Compensation'>

export interface AddCompensationFormBodyProps {
  jobForm: UseJobFormReady
  compensationForm: UseCompensationFormReady
  title: string
  submitCtaLabel: string
  isPending: boolean
  onCancel?: () => void
  /** Per-surface translation overrides resolved against the consumer's namespace. */
  dictionary?: AddCompensationFormDictionary
}

/**
 * Renders the shared field layout used by both `EditCompensation` (onboarding) and
 * `CompensationAddAnotherJobForm` (management). Field visibility is driven entirely by the hook
 * configuration — `JobFields.HireDate` is only defined when `withHireDateField: true`,
 * and `CompFields.EffectiveDate` is only defined when `withEffectiveDateField: true` —
 * so this component renders the correct subset for each use case with no extra props.
 *
 * Copy resolves from the onboarding `Employee.Compensation` namespace by default; management
 * consumers inject a `dictionary` mapped from `Employee.Management.Compensation` to keep
 * onboarding and management strings independently overridable.
 */
export function AddCompensationFormBody({
  jobForm,
  compensationForm,
  title,
  submitCtaLabel,
  isPending,
  onCancel,
  dictionary,
}: AddCompensationFormBodyProps) {
  useI18n('Employee.Compensation')
  useComponentDictionary('Employee.Compensation', dictionary)
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()
  const format = useNumberFormatter('currency')

  const JobFields = jobForm.form.Fields
  const CompFields = compensationForm.form.Fields

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h2">{title}</Components.Heading>

      <Flex flexDirection="column" gap={20}>
        {JobFields.Title && (
          <JobFields.Title
            label={t('jobTitle')}
            validationMessages={{ REQUIRED: t('validations.title') }}
            formHookResult={jobForm}
          />
        )}

        {JobFields.HireDate && (
          <JobFields.HireDate
            label={t('hireDate')}
            validationMessages={{ REQUIRED: t('validations.hireDate') }}
            formHookResult={jobForm}
          />
        )}

        {CompFields.FlsaStatus && (
          <>
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
            {(compensationForm.status.showCommissionFederalMinimumPayAlert ||
              compensationForm.status.showCommissionMinimumWageAlert ||
              compensationForm.status.showOwnerSalaryAlert ||
              compensationForm.status.willDeleteSecondaryJobs) && (
              <Flex flexDirection="column" gap={0}>
                {compensationForm.status.willDeleteSecondaryJobs && (
                  <Components.Alert
                    label={t('validations.classificationChangeNotification')}
                    status="warning"
                  >
                    {t('validations.classificationChangeRemovesSecondaryJobs')}
                  </Components.Alert>
                )}
                {compensationForm.status.showCommissionFederalMinimumPayAlert && (
                  <Components.Alert
                    status="info"
                    label={t('commissionAlerts.federalMinimumPay.label')}
                    disableScrollIntoView
                  >
                    {t('commissionAlerts.federalMinimumPay.body')}
                  </Components.Alert>
                )}
                {compensationForm.status.showCommissionMinimumWageAlert && (
                  <Components.Alert
                    status="info"
                    label={t('commissionAlerts.minimumWage.label')}
                    disableScrollIntoView
                  >
                    <Trans
                      t={t}
                      i18nKey="commissionAlerts.minimumWage.body"
                      components={{
                        minimumWageLink: (
                          <Components.Link
                            href="https://support.gusto.com/article/112472520100000/manage-tip-wages-distributed-service-charges-and-tip-credits-in-gusto-for-admins"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}
                    />
                  </Components.Alert>
                )}
                {compensationForm.status.showOwnerSalaryAlert && (
                  <Components.Alert
                    status="info"
                    label={t('commissionAlerts.ownerSalary.label')}
                    disableScrollIntoView
                  />
                )}
              </Flex>
            )}
          </>
        )}

        {CompFields.Rate && (
          <CompFields.Rate
            label={t('wageLabel')}
            validationMessages={{
              REQUIRED: t('validations.rate'),
              RATE_MINIMUM: t('validations.nonZeroRate'),
              RATE_EXEMPT_THRESHOLD: t('validations.rateExemptThreshold', {
                limit: format(FLSA_OVERTIME_SALARY_LIMIT),
              }),
            }}
            formHookResult={compensationForm}
          />
        )}

        {CompFields.PaymentUnit && (
          <CompFields.PaymentUnit
            label={t('wageFrequencyLabel')}
            description={t('paymentUnitDescription')}
            validationMessages={{ REQUIRED: t('validations.paymentUnit') }}
            getOptionLabel={(unit: PaymentUnit) => t(`paymentUnitOptions.${unit}`)}
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

        {CompFields.EffectiveDate && (
          <CompFields.EffectiveDate
            label={t('effectiveDate')}
            validationMessages={{
              REQUIRED: t('validations.effectiveDate'),
              EFFECTIVE_DATE_BEFORE_HIRE: t('validations.effectiveDateBeforeHire'),
              EFFECTIVE_DATE_BEFORE_MIN: t('validations.effectiveDateBeforeMin'),
            }}
            formHookResult={compensationForm}
          />
        )}

        {JobFields.TwoPercentShareholder && (
          <JobFields.TwoPercentShareholder
            label={t('twoPercentStakeholderLabel')}
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
      </Flex>

      <ActionsLayout>
        {onCancel && (
          <Components.Button variant="secondary" onClick={onCancel} isDisabled={isPending}>
            {t('cancelNewJobCta')}
          </Components.Button>
        )}
        <Components.Button type="submit" isLoading={isPending}>
          {submitCtaLabel}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
