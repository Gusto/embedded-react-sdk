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

/** @internal */
export interface ManagementCompensationFormBodyProps {
  jobForm: UseJobFormReady
  compensationForm: UseCompensationFormReady
  title: string
  submitCtaLabel: string
  isPending: boolean
  onCancel?: () => void
}

/**
 * Renders the shared field layout used by both `EditCompensation` (schedule a future comp
 * change for a present job) and `EditPendingCompensation` (update an existing future comp).
 * Field visibility is driven entirely by hook configuration — the hooks expose `undefined`
 * for fields that should not render — so this component renders the correct subset for each
 * use case without extra conditional props.
 *
 * @internal
 */
export function ManagementCompensationFormBody({
  jobForm,
  compensationForm,
  title,
  submitCtaLabel,
  isPending,
  onCancel,
}: ManagementCompensationFormBodyProps) {
  const { t } = useTranslation('Employee.Management.Compensation')
  const Components = useComponentContext()
  const format = useNumberFormatter('currency')

  const JobFields = jobForm.form.Fields
  const CompFields = compensationForm.form.Fields

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h2">{title}</Components.Heading>

      <Flex flexDirection="column" gap={20}>
        <CompFields.Title
          label={t('jobTitleLabel')}
          validationMessages={{ REQUIRED: t('validations.jobTitleSentence') }}
          formHookResult={compensationForm}
        />

        {JobFields.HireDate && (
          <JobFields.HireDate
            label={t('hireDateLabel')}
            validationMessages={{
              REQUIRED: t('validations.hireDate'),
            }}
            formHookResult={jobForm}
          />
        )}

        {CompFields.FlsaStatus && (
          <>
            <CompFields.FlsaStatus
              label={t('employeeClassification')}
              placeholder={t('flsaStatusPlaceholder')}
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
            placeholder={t('paymentUnitPlaceholder')}
            description={t('paymentUnitDescription')}
            validationMessages={{ REQUIRED: t('validations.paymentUnit') }}
            getOptionLabel={(unit: PaymentUnit) => t(`paymentUnitOptions.${unit}` as const)}
            formHookResult={compensationForm}
          />
        )}

        {CompFields.EffectiveDate && (
          <CompFields.EffectiveDate
            label={t('effectiveDateLabel')}
            validationMessages={{
              REQUIRED: t('validations.effectiveDate'),
              EFFECTIVE_DATE_BEFORE_HIRE: t('validations.effectiveDateBeforeHire'),
              EFFECTIVE_DATE_BEFORE_MIN: t('validations.effectiveDateBeforeMin'),
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
            placeholder={t('minimumWagePlaceholder')}
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
            label={t('twoPercentShareholderLabel')}
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
