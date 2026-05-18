import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import type { PaymentUnit } from '@gusto/embedded-api/models/components/compensation'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { useJobForm, type UseJobFormReady } from '../../shared/useJobForm'
import {
  useCompensationForm,
  type UseCompensationFormReady,
} from '../../shared/useCompensationForm'
import styles from './EditCompensation.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { componentEvents, FLSA_OVERTIME_SALARY_LIMIT, type EventType } from '@/shared/constants'
import useNumberFormatter from '@/hooks/useNumberFormatter'

export interface EditCompensationProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  jobId: string
  compensationId: string
  onCancel?: () => void
  /**
   * Receives `EMPLOYEE_JOB_UPDATED` (with the saved `Job`) and then
   * `EMPLOYEE_COMPENSATION_UPDATED` (with the saved `Compensation`) on a
   * successful submit chain. Use `EMPLOYEE_COMPENSATION_UPDATED` for
   * "save complete" branching.
   */
  onEvent: OnEventType<EventType, unknown>
}

export function EditCompensation({ dictionary, ...props }: EditCompensationProps) {
  useComponentDictionary('Employee.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Compensation.Management">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({
  employeeId,
  jobId,
  compensationId,
  onCancel,
  className,
  onEvent,
}: EditCompensationProps) {
  useI18n('Employee.Compensation')

  // Job form handles the non-effective-dated fields: 2% shareholder + WA WC.
  // Title is suppressed here because the compensation form owns title
  // (effective-dated alongside rate/unit/FLSA on the future-dated row).
  // Hire-date is suppressed because this surface never edits it.
  const jobForm = useJobForm({
    employeeId,
    jobId,
    withTitleField: false,
    withHireDateField: false,
    shouldFocusError: false,
  })

  // Compensation form runs in update mode (compensationId set) → PUT
  // /v1/compensations/:id. Matches the steady-state edit pattern in
  // docs/hooks/jobs-and-compensations.md.
  //
  // Title belongs here so a "promotion + raise" change is effective-dated
  // atomically with the rest of the comp fields.
  //
  // Required-on-update mirrors the onboarding form's UX: no "(optional)"
  // labels on the fields that the user expects to enter.
  const compensationForm = useCompensationForm({
    employeeId,
    jobId,
    compensationId,
    withEffectiveDateField: true,
    optionalFieldsToRequire: {
      update: ['title', 'flsaStatus', 'rate', 'paymentUnit', 'effectiveDate'],
    },
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([jobForm, compensationForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  // PUT job first (immediate mutation of 2% shareholder / WC), then PUT
  // compensation (the effective-dated change). composeSubmitHandler validates
  // both forms in parallel and short-circuits before any network I/O if
  // either fails.
  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    const jobResult = await jobForm.actions.onSubmit()
    if (!jobResult) return

    onEvent(componentEvents.EMPLOYEE_JOB_UPDATED, jobResult.data)

    const compensationResult = await compensationForm.actions.onSubmit()
    if (!compensationResult) return

    onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensationResult.data)
  })

  const errorHandling = composeErrorHandler([submitResult])
  const isPending = jobForm.status.isPending || compensationForm.status.isPending

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={errorHandling.errors}>
        <Form onSubmit={submitResult.handleSubmit}>
          <FormBody
            jobForm={jobForm}
            compensationForm={compensationForm}
            isPending={isPending}
            onCancel={onCancel}
          />
        </Form>
      </BaseLayout>
    </section>
  )
}

interface FormBodyProps {
  jobForm: UseJobFormReady
  compensationForm: UseCompensationFormReady
  isPending: boolean
  onCancel?: () => void
}

function FormBody({ jobForm, compensationForm, isPending, onCancel }: FormBodyProps) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()
  const format = useNumberFormatter('currency')

  const JobFields = jobForm.form.Fields
  const CompFields = compensationForm.form.Fields

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h2">{t('management.editCompensationTitle')}</Components.Heading>

      {compensationForm.status.willDeleteSecondaryJobs && (
        <Components.Alert
          label={t('validations.classificationChangeNotification')}
          status="warning"
        />
      )}

      <CompFields.Title
        label={t('management.jobTitleLabel')}
        validationMessages={{ REQUIRED: t('validations.jobTitleSentence') }}
        formHookResult={compensationForm}
      />

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
        <Flex flexDirection="column" gap={16}>
          <CompFields.EffectiveDate
            label={t('effectiveDateLabel')}
            validationMessages={{
              REQUIRED: t('validations.effectiveDate'),
              EFFECTIVE_DATE_BEFORE_HIRE: t('validations.effectiveDateBeforeHire'),
            }}
            formHookResult={compensationForm}
          />
          <Components.Alert label={t('management.effectiveDateWarning')} status="warning" />
        </Flex>
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
          {t('management.saveCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
