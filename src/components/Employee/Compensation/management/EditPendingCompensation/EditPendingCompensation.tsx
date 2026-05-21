import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useJobForm } from '../../shared/useJobForm'
import { useCompensationForm } from '../../shared/useCompensationForm'
import { ManagementCompensationFormBody } from '../ManagementCompensationFormBody'
import styles from './EditPendingCompensation.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary, useI18n } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { componentEvents, type EventType } from '@/shared/constants'

export interface EditPendingCompensationProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  jobId: string
  /** The UUID of the pending (future-dated) compensation to update. Always required — this
   *  component only operates in update mode. */
  compensationId: string
  onCancel?: () => void
  /** Called with `EMPLOYEE_COMPENSATION_UPDATED` then `EMPLOYEE_COMPENSATION_DONE` on a
   *  successful save. Use `EMPLOYEE_COMPENSATION_DONE` to trigger navigation. */
  onEvent: OnEventType<EventType, unknown>
}

export function EditPendingCompensation({ dictionary, ...props }: EditPendingCompensationProps) {
  useComponentDictionary('Employee.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Compensation.Management">
      <Root {...props} />
    </BaseBoundaries>
  )
}

type RootProps = Omit<EditPendingCompensationProps, 'dictionary'>

function Root({ employeeId, jobId, compensationId, onCancel, className, onEvent }: RootProps) {
  useI18n('Employee.Compensation')
  const { t } = useTranslation('Employee.Compensation')

  // Job form: update the non-effective-dated fields (2% shareholder, WA WC).
  // Title is suppressed because the compensation form owns it — title is
  // effective-dated alongside rate/unit/FLSA on the pending comp row.
  // Hire-date is suppressed because this surface never edits it.
  const jobForm = useJobForm({
    employeeId,
    jobId,
    withTitleField: false,
    withHireDateField: false,
    shouldFocusError: false,
  })

  // Compensation form: update mode (compensationId present) → PUT
  // /v1/compensations/:id, updating the existing pending comp in place.
  // No defaults loader needed — the hook resolves the comp directly from
  // its jobs query using compensationId, and pre-populates from it.
  // In update mode, rate/paymentUnit/flsaStatus/effectiveDate are optional by
  // default in the schema (they're only required on create). Promote them here
  // so the form validates them on submit and labels don't show "(optional)".
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

  // PUT job first (immediate mutation of 2% shareholder / WC), then PUT the
  // pending compensation. composeSubmitHandler validates both forms in
  // parallel and short-circuits before any network I/O if either fails.
  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    const jobResult = await jobForm.actions.onSubmit()
    if (!jobResult) return

    onEvent(componentEvents.EMPLOYEE_JOB_UPDATED, jobResult.data)

    const compensationResult = await compensationForm.actions.onSubmit()
    if (!compensationResult) return

    onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensationResult.data)
    onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE, compensationResult.data)
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
            title={t('management.editCompensationTitle')}
            submitCtaLabel={t('management.saveCta')}
            isPending={isPending}
            onCancel={onCancel}
          />
        </Form>
      </BaseLayout>
    </section>
  )
}
