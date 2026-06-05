import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsGetJobs'
import { useJobForm } from '../../shared/useJobForm'
import { useCompensationForm, type CompensationFormData } from '../../shared/useCompensationForm'
import { ManagementCompensationFormBody } from '../ManagementCompensationFormBody'
import styles from './CompensationEditJobForm.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary, useI18n } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { componentEvents, type EventType } from '@/shared/constants'

export interface CompensationEditJobFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  jobId: string
  /** Fires `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED` (with the saved
   *  `Compensation`) on a successful save, and
   *  `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED` when the user cancels. */
  onEvent: OnEventType<EventType, unknown>
}

export function CompensationEditJobForm({ dictionary, ...props }: CompensationEditJobFormProps) {
  useComponentDictionary('Employee.Management.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Management.Compensation">
      <CompensationDefaultsLoader {...props} />
    </BaseBoundaries>
  )
}

type LoaderProps = Omit<CompensationEditJobFormProps, 'dictionary'>

// Fetches the current job's compensation data to pre-populate the form as
// defaultValues before rendering Root. Uses the same non-suspense query that
// useCompensationForm uses internally — React Query dedupes the request so no
// extra network call is made once Root mounts.
// defaultValues from CommonComponentInterface (unknown) is excluded from the
// spread so it doesn't conflict with Root's typed defaultValues prop.
function CompensationDefaultsLoader({
  employeeId,
  jobId,
  defaultValues: _baseDefaults,
  ...rest
}: LoaderProps) {
  const jobsQuery = useJobsAndCompensationsGetJobs({ employeeId }, { enabled: !!employeeId })

  if (jobsQuery.isLoading || !jobsQuery.data) {
    const errorHandling = composeErrorHandler([jobsQuery])
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  const job = jobsQuery.data.jobs?.find(j => j.uuid === jobId)
  const currentComp = job?.compensations?.find(c => c.uuid === job.currentCompensationUuid)

  const defaultValues: Partial<CompensationFormData> | undefined = currentComp
    ? {
        // Title lives on compensation in the API — `job.title` can lag
        // behind comp-level edits on secondaries, so seed directly from
        // the comp.
        title: currentComp.title ?? undefined,
        flsaStatus: currentComp.flsaStatus ?? undefined,
        rate: Number(currentComp.rate),
        paymentUnit: currentComp.paymentUnit ?? undefined,
        adjustForMinimumWage: currentComp.adjustForMinimumWage ?? false,
        minimumWageId: currentComp.minimumWages?.[0]?.uuid ?? '',
        // effectiveDate intentionally omitted — user must choose a future date
      }
    : undefined

  return <Root employeeId={employeeId} jobId={jobId} defaultValues={defaultValues} {...rest} />
}

interface RootProps extends LoaderProps {
  defaultValues?: Partial<CompensationFormData>
}

function Root({ employeeId, jobId, defaultValues, className, onEvent }: RootProps) {
  useI18n('Employee.Management.Compensation')
  const { t } = useTranslation('Employee.Management.Compensation')

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

  // Compensation form runs in create mode (no compensationId) → POST
  // /v1/jobs/:jobId/compensations, creating a new future-dated compensation.
  // The form is pre-populated with the current comp's values via defaultValues
  // (fetched by CompensationDefaultsLoader) so the user can edit from the
  // current state, and picks a future effectiveDate to schedule the change.
  const compensationForm = useCompensationForm({
    employeeId,
    jobId,
    defaultValues,
    withEffectiveDateField: true,
    optionalFieldsToRequire: {
      create: ['title'],
    },
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([jobForm, compensationForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  // PUT job first (immediate mutation of 2% shareholder / WC), then POST
  // the new compensation (the future-dated change). composeSubmitHandler
  // validates both forms in parallel and short-circuits before any network
  // I/O if either fails.
  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    const jobResult = await jobForm.actions.onSubmit()
    if (!jobResult) return

    const compensationResult = await compensationForm.actions.onSubmit()
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
          <ManagementCompensationFormBody
            jobForm={jobForm}
            compensationForm={compensationForm}
            title={t('editCompensationTitle')}
            submitCtaLabel={t('saveCta')}
            isPending={isPending}
            onCancel={() => {
              onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED)
            }}
          />
        </Form>
      </BaseLayout>
    </section>
  )
}
