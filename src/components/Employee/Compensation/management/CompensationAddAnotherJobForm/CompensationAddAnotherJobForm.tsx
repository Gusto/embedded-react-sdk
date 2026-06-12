import { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useJobForm } from '../../shared/useJobForm'
import { useCompensationForm } from '../../shared/useCompensationForm'
import { AddCompensationFormBody } from '../../shared/AddCompensationFormBody'
import { useManagementCompensationDictionary } from '../useManagementCompensationDictionary'
import styles from './CompensationAddAnotherJobForm.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary, useI18n } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { componentEvents, type EventType } from '@/shared/constants'

/**
 * Props for {@link CompensationAddAnotherJobForm}.
 *
 * @public
 */
export interface CompensationAddAnotherJobFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Callback invoked when the form emits an event. See the events table on {@link CompensationAddAnotherJobForm} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone form for adding a secondary job and compensation to an employee from the management surface.
 *
 * @remarks
 * Routed from {@link CompensationCard}'s `employee/management/compensation/card/addAnotherRequested` event. Emits its own scoped `submitted` and `cancelled` events — both are your cue to return to the card. {@link Compensation} bundles the card, this form, and the swap and alert wiring as a single drop-in; reach for this form directly only when that orchestration is the wrong fit.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/compensation/addAnotherJobForm/submitted` | Fired after the secondary job and compensation are saved; use it to return to the card | Saved `Compensation` entity |
 * | `employee/management/compensation/addAnotherJobForm/cancelled` | Fired when the user clicks Cancel; use it to return to the card | — |
 *
 * @param props - See {@link CompensationAddAnotherJobFormProps}.
 * @returns The rendered add-another-job form.
 * @public
 * @group Block Components
 */
export function CompensationAddAnotherJobForm({
  dictionary,
  ...props
}: CompensationAddAnotherJobFormProps) {
  useComponentDictionary('Employee.Management.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Management.Compensation">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({
  employeeId,
  className,
  onEvent,
}: Omit<CompensationAddAnotherJobFormProps, 'dictionary'>) {
  useI18n('Employee.Management.Compensation')
  const { t } = useTranslation('Employee.Management.Compensation')
  const formDictionary = useManagementCompensationDictionary()

  // Track jobId locally so a partial-failure submit chain (job POST succeeds,
  // comp PUT fails) doesn't re-POST and create a duplicate job on retry.
  const [resolvedJobId, setResolvedJobId] = useState<string | undefined>(undefined)

  const jobForm = useJobForm({
    employeeId,
    jobId: resolvedJobId,
    withHireDateField: false,
    optionalFieldsToRequire: { update: ['title'] },
    shouldFocusError: false,
  })

  const resolvedCompensationId = jobForm.isLoading
    ? undefined
    : (jobForm.data.currentJob?.currentCompensationUuid ?? undefined)

  const compensationForm = useCompensationForm({
    employeeId,
    jobId: resolvedJobId,
    compensationId: resolvedCompensationId,
    withEffectiveDateField: true,
    optionalFieldsToRequire: { update: ['flsaStatus', 'rate', 'paymentUnit'] },
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) {
    const loadingErrorHandling = composeErrorHandler([jobForm, compensationForm])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  // The API defaults a secondary job's hire_date to the primary job's hire_date
  // when omitted. We pass it explicitly to satisfy the SDK hook's requirement
  // and mirror the API's own default behavior. React Query dedupes this query
  // since useJobForm has already loaded it.
  const primaryHireDate = jobForm.data.jobs?.find(j => j.primary)?.hireDate ?? undefined

  const submitResult = composeSubmitHandler([jobForm, compensationForm], async () => {
    const jobResult = await jobForm.actions.onSubmit({ employeeId, hireDate: primaryHireDate })
    if (!jobResult) return

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

    onEvent(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_SUBMITTED,
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
            title={t('addAnotherJobTitle')}
            submitCtaLabel={t('saveNewJobCta')}
            isPending={isPending}
            onCancel={() => {
              onEvent(
                componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_CANCELLED,
              )
            }}
            dictionary={formDictionary}
          />
        </Form>
      </BaseLayout>
    </section>
  )
}
