import { useState } from 'react'
import classNames from 'classnames'
import type { CompensationDefaultValues } from '../Compensation'
import { useJobForm } from '../../shared/useJobForm'
import { useCompensationForm } from '../../shared/useCompensationForm'
import { AddCompensationFormBody } from '../../shared/AddCompensationFormBody'
import styles from './EditCompensation.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary, useI18n } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { componentEvents, type EventType } from '@/shared/constants'

/** @internal */
export interface EditCompensationProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  /**
   * When provided, the hire date is pre-filled from this value and the hire
   * date field is hidden. When absent (add-job from empty state), the hire
   * date field is rendered so the user can set it explicitly.
   */
  startDate?: string
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

/** @internal */
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

  // When startDate is provided (onboarding), hide the hire date field and derive
  // it from the prop at submit time. When absent (add-job from dashboard empty
  // state), render the field so the user can set it explicitly.
  const withHireDateField = !startDate

  // Track jobId locally so a partial-failure submit chain (job POST succeeds,
  // comp PUT fails) doesn't re-POST and create a duplicate job on retry. We
  // initialize from the prop and only write back when the partner-supplied
  // `currentJobId` was nullish (i.e. add-job flow) — see the submit handler.
  const [resolvedJobId, setResolvedJobId] = useState<string | undefined>(currentJobId ?? undefined)

  const jobForm = useJobForm({
    employeeId,
    jobId: resolvedJobId,
    withHireDateField,
    defaultValues: {
      title: partnerDefaultValues?.title ?? '',
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
    // No effective-date field is surfaced, and no `effectiveDate` is
    // threaded into `actions.onSubmit` either: the server initializes
    // `effective_date` on the auto-stub created by the parent job POST,
    // and subsequent updates omit it from the PUT body so the existing
    // value is preserved (e.g. a deliberately-set future-dated comp
    // wouldn't be silently overwritten on an unrelated edit).
    withEffectiveDateField: false,
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
    },
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([jobForm, compensationForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    const jobResult = await jobForm.actions.onSubmit({
      employeeId,
      hireDate: startDate ?? undefined,
    })
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
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={errorHandling.errors}>
        <Form onSubmit={submitResult.handleSubmit}>
          <AddCompensationFormBody
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
