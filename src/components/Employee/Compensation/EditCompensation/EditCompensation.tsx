import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { PaymentUnit } from '@gusto/embedded-api/models/components/compensation'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import type { CompensationDefaultValues } from '../Compensation'
import { useJobForm, type UseJobFormReady } from '../shared/useJobForm'
import { useCompensationForm, type UseCompensationFormReady } from '../shared/useCompensationForm'
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
  startDate: string
  currentJobId?: string | null
  title: string
  submitCtaLabel: string
  onCancel?: () => void
  partnerDefaultValues?: CompensationDefaultValues
  /**
   * Receives the broadcast events: `EMPLOYEE_JOB_CREATED` / `EMPLOYEE_JOB_UPDATED`
   * (with the saved `Job`), then `EMPLOYEE_COMPENSATION_UPDATED` (with the saved
   * `Compensation`) on a successful submit chain. Use `EMPLOYEE_COMPENSATION_UPDATED`
   * for "save complete" branching.
   */
  onEvent: OnEventType<EventType, unknown>
}

export function EditCompensation({ dictionary, ...props }: EditCompensationProps) {
  useComponentDictionary('Employee.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Compensation">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({
  employeeId,
  startDate,
  currentJobId,
  title,
  submitCtaLabel,
  onCancel,
  partnerDefaultValues,
  className,
  onEvent,
}: EditCompensationProps) {
  useI18n('Employee.Compensation')

  // Track jobId locally so a partial-failure submit chain (job POST succeeds,
  // comp PUT fails) doesn't re-POST and create a duplicate job on retry. We
  // initialize from the prop and only write back when the partner-supplied
  // `currentJobId` was nullish (i.e. add-job flow) — see the submit handler.
  const [resolvedJobId, setResolvedJobId] = useState<string | undefined>(currentJobId ?? undefined)

  const jobForm = useJobForm({
    employeeId,
    jobId: resolvedJobId,
    defaultValues: {
      title: partnerDefaultValues?.title ?? '',
      hireDate: startDate,
    },
    // The Compensation flow always shows a job title field, even when editing
    // an existing job. The hook's schema only requires `title` on create; we
    // require it on update too to preserve the existing UX.
    optionalFieldsToRequire: { update: ['title'] },
    shouldFocusError: false,
  })

  // Resolve the compensationId from the job we just loaded so the comp form can
  // seed from the existing comp on edit. While the job form is still loading we
  // pass undefined (compensation form starts in create mode); once the job
  // resolves the prop change re-renders the comp form into update mode with the
  // existing compensation as the seed.
  const resolvedCompensationId = jobForm.isLoading
    ? undefined
    : (jobForm.data.currentJob?.currentCompensationUuid ?? undefined)

  const compensationForm = useCompensationForm({
    employeeId,
    jobId: resolvedJobId,
    compensationId: resolvedCompensationId,
    // The Compensation flow always presents flsaStatus, rate, and paymentUnit
    // as required, even when editing an existing compensation. The hook's
    // schema marks them `'create'`-only by default; we promote them on update
    // here to preserve the existing UX (no "(optional)" labels).
    optionalFieldsToRequire: { update: ['flsaStatus', 'rate', 'paymentUnit'] },
    defaultValues: {
      flsaStatus: partnerDefaultValues?.flsaStatus,
      rate:
        typeof partnerDefaultValues?.rate === 'number'
          ? partnerDefaultValues.rate
          : partnerDefaultValues?.rate
            ? Number(partnerDefaultValues.rate)
            : undefined,
      paymentUnit: partnerDefaultValues?.paymentUnit,
      // The Compensation flow does not surface an effective-date field; seed
      // it from the job's hireDate (= startDate from props) so the comp form's
      // create-mode schema validates and so the PUT body sends a stable date
      // when the API auto-creates a stub.
      effectiveDate: startDate,
    },
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([jobForm, compensationForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    const jobResult = await jobForm.actions.onSubmit({ employeeId })
    if (!jobResult) return

    onEvent(
      jobResult.mode === 'create'
        ? componentEvents.EMPLOYEE_JOB_CREATED
        : componentEvents.EMPLOYEE_JOB_UPDATED,
      jobResult.data,
    )

    // Always thread through the freshly returned job's currentCompensationUuid +
    // its version so we PUT against the latest comp regardless of whether the job
    // POST just auto-created the stub or the job PUT bumped a version.
    const stubCompensation = jobResult.data.compensations?.find(
      c => c.uuid === jobResult.data.currentCompensationUuid,
    )

    const compensationResult = await compensationForm.actions.onSubmit({
      jobId: jobResult.data.uuid,
      compensationId: jobResult.data.currentCompensationUuid ?? undefined,
      compensationVersion: stubCompensation?.version ?? undefined,
    })
    if (!compensationResult) {
      if (!currentJobId) setResolvedJobId(jobResult.data.uuid)
      return
    }

    onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensationResult.data)
  })

  const errorHandling = composeErrorHandler([submitResult])

  const isPending = jobForm.status.isPending || compensationForm.status.isPending

  return (
    <section className={className}>
      <BaseLayout error={errorHandling.errors}>
        <Form onSubmit={submitResult.handleSubmit}>
          <FormBody
            jobForm={jobForm}
            compensationForm={compensationForm}
            title={title}
            submitCtaLabel={submitCtaLabel}
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
  title: string
  submitCtaLabel: string
  isPending: boolean
  onCancel?: () => void
}

function FormBody({
  jobForm,
  compensationForm,
  title,
  submitCtaLabel,
  isPending,
  onCancel,
}: FormBodyProps) {
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
          label={t('validations.classificationChangeNotification')}
          status="warning"
        />
      )}

      <JobFields.Title
        label={t('jobTitle')}
        validationMessages={{ REQUIRED: t('validations.title') }}
        formHookResult={jobForm}
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
        label={t('amount')}
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
        label={t('paymentUnitLabel')}
        description={t('paymentUnitDescription')}
        validationMessages={{ REQUIRED: t('validations.paymentUnit') }}
        getOptionLabel={(unit: PaymentUnit) => t(`paymentUnitOptions.${unit}`)}
        formHookResult={compensationForm}
      />

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
