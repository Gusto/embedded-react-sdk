import { useState } from 'react'
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
import styles from './AddJob.module.scss'
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

export interface AddJobProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  /**
   * Hire date written to the new job. Steady-state additional jobs use the
   * employee's existing hire date so the new job aligns with the rest of their
   * record. The compensation's `effectiveDate` is captured separately via a
   * visible field.
   */
  hireDate: string
  onCancel?: () => void
  /**
   * Receives:
   * - `EMPLOYEE_JOB_CREATED` with the saved `Job`
   * - `EMPLOYEE_COMPENSATION_UPDATED` with the saved `Compensation`
   * Use `EMPLOYEE_COMPENSATION_UPDATED` to branch on "save complete".
   */
  onEvent: OnEventType<EventType, unknown>
}

export function AddJob({ dictionary, ...props }: AddJobProps) {
  useComponentDictionary('Employee.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Compensation.Management.AddJob">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({ employeeId, hireDate, onCancel, className, onEvent }: AddJobProps) {
  useI18n('Employee.Compensation')

  // Mirror the onboarding EditCompensation create-mode pattern: if the job
  // POST succeeds but the compensation POST fails, remember the new jobId so
  // a retry-submit doesn't double-create the job.
  const [resolvedJobId, setResolvedJobId] = useState<string | undefined>(undefined)

  // Title lives on the job hook here because we're creating both job and its
  // first compensation in one shot — there's no "effective-dated title change"
  // scenario for a brand-new job. Hire date is suppressed; we thread the
  // employee's hire date in via submit options.
  const jobForm = useJobForm({
    employeeId,
    jobId: resolvedJobId,
    withHireDateField: false,
    shouldFocusError: false,
  })

  const resolvedCompensationId = jobForm.isLoading
    ? undefined
    : (jobForm.data.currentJob?.currentCompensationUuid ?? undefined)

  // Effective date IS surfaced for steady-state add: the user explicitly picks
  // when this new job's pay schedule starts.
  const compensationForm = useCompensationForm({
    employeeId,
    jobId: resolvedJobId,
    compensationId: resolvedCompensationId,
    withEffectiveDateField: true,
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([jobForm, compensationForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    const jobResult = await jobForm.actions.onSubmit({ employeeId, hireDate })
    if (!jobResult) return

    onEvent(
      jobResult.mode === 'create'
        ? componentEvents.EMPLOYEE_JOB_CREATED
        : componentEvents.EMPLOYEE_JOB_UPDATED,
      jobResult.data,
    )

    const stubCompensation = jobResult.data.compensations?.find(
      c => c.uuid === jobResult.data.currentCompensationUuid,
    )

    const compensationResult = await compensationForm.actions.onSubmit({
      jobId: jobResult.data.uuid,
      compensationId: jobResult.data.currentCompensationUuid ?? undefined,
      compensationVersion: stubCompensation?.version ?? undefined,
    })
    if (!compensationResult) {
      setResolvedJobId(jobResult.data.uuid)
      return
    }

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
      <Components.Heading as="h2">{t('management.addJobTitle')}</Components.Heading>

      {JobFields.Title && (
        <JobFields.Title
          label={t('management.jobTitleLabel')}
          validationMessages={{ REQUIRED: t('validations.title') }}
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
          {t('management.addJobCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
