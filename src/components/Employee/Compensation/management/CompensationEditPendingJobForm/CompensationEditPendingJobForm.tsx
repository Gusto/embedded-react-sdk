import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useJobForm } from '../../shared/useJobForm'
import { useCompensationForm } from '../../shared/useCompensationForm'
import { AddCompensationFormBody } from '../../shared/AddCompensationFormBody'
import { useManagementCompensationDictionary } from '../useManagementCompensationDictionary'
import styles from './CompensationEditPendingJobForm.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary, useI18n } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { componentEvents, type EventType } from '@/shared/constants'

export interface CompensationEditPendingJobFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  jobId: string
  /** The UUID of the pending (future-dated) compensation to update. Always required — this
   *  component only operates in update mode. */
  compensationId: string
  /**
   * True when the job has no current (on-or-before-today) compensation — i.e. it hasn't
   * started yet. Drives which date field is shown and how the submit syncs hire_date.
   */
  isNewJob: boolean
  /**
   * True when this is the employee's primary job. Combined with `isNewJob`, determines
   * whether to show a Hire date field (primary) or Effective date field (secondary/change).
   */
  isPrimaryJob: boolean
  /** Fires `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED` (with the saved
   *  `Compensation`) on a successful save, and
   *  `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED` when the user cancels. */
  onEvent: OnEventType<EventType, unknown>
}

export function CompensationEditPendingJobForm({
  dictionary,
  ...props
}: CompensationEditPendingJobFormProps) {
  useComponentDictionary('Employee.Management.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Management.Compensation">
      <Root {...props} />
    </BaseBoundaries>
  )
}

type RootProps = Omit<CompensationEditPendingJobFormProps, 'dictionary'>

function Root({
  employeeId,
  jobId,
  compensationId,
  isNewJob,
  isPrimaryJob,
  className,
  onEvent,
}: RootProps) {
  useI18n('Employee.Management.Compensation')
  const { t } = useTranslation('Employee.Management.Compensation')
  const formDictionary = useManagementCompensationDictionary('edit')

  // For a primary new job (hire date in the future, no current comp), the hire
  // date field is shown instead of the effective date field. This keeps
  // hire_date and comp effective_date in sync so the API doesn't auto-create a
  // second compensation when the initial comp moves off the hire date.
  const isPrimaryNewJob = isNewJob && isPrimaryJob

  // Title is owned by `useCompensationForm` here: title is stored on
  // compensation in the API (job.title is just a denormalized snapshot of
  // the primary comp's title), so writing it via PUT /v1/compensations is
  // the direct path. The dashboard row reads the title off the comp pointed
  // to by `currentCompensationUuid`, so the change surfaces immediately
  // whether the job is in effect today or still pending.
  const jobForm = useJobForm({
    employeeId,
    jobId,
    withTitleField: false,
    withHireDateField: isPrimaryNewJob,
    optionalFieldsToRequire: isPrimaryNewJob ? { update: ['hireDate'] } : undefined,
    shouldFocusError: false,
  })

  const compensationForm = useCompensationForm({
    employeeId,
    jobId,
    compensationId,
    // Primary new job: comp date is set via jobForm's hire date on submit —
    // hide it here to avoid showing two date fields.
    withEffectiveDateField: !isPrimaryNewJob,
    optionalFieldsToRequire: {
      update: isPrimaryNewJob
        ? ['title', 'flsaStatus', 'rate', 'paymentUnit']
        : ['title', 'flsaStatus', 'rate', 'paymentUnit', 'effectiveDate'],
    },
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([jobForm, compensationForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    // For a primary new job, the user edits the hire date field. We read it
    // back here and pass it to the comp submit so both the job's hire_date and
    // the comp's effective_date land on the same value — preventing the API
    // from auto-creating a second compensation to fill the gap at the old date.
    const hireDateOverride = isPrimaryNewJob
      ? (jobForm.form.hookFormInternals.formMethods.getValues('hireDate') ?? undefined)
      : undefined

    const jobResult = await jobForm.actions.onSubmit()
    if (!jobResult) return

    // When the hire date moves forward, the API auto-syncs the compensation's
    // effective_date to the new hire_date as part of the job PUT, which bumps
    // the compensation's version. Read it from the job response so the
    // subsequent compensation PUT doesn't send a stale version.
    const freshCompVersion = jobResult.data.compensations?.find(
      c => c.uuid === compensationId,
    )?.version

    const compensationResult = await compensationForm.actions.onSubmit({
      ...(hireDateOverride ? { effectiveDate: hireDateOverride } : {}),
      compensationVersion: freshCompVersion,
    })
    if (!compensationResult) return

    onEvent(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED,
      compensationResult.data,
    )
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
            title={t('editCompensationTitle')}
            submitCtaLabel={t('saveCta')}
            isPending={isPending}
            onCancel={() => {
              onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED)
            }}
            dictionary={formDictionary}
          />
        </Form>
      </BaseLayout>
    </section>
  )
}
