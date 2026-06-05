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

export interface CompensationAddAnotherJobFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  onCancel?: () => void
  onEvent: OnEventType<EventType, unknown>
}

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
  onCancel,
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

    onEvent(componentEvents.EMPLOYEE_JOB_CREATED, jobResult.data)

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
          <AddCompensationFormBody
            jobForm={jobForm}
            compensationForm={compensationForm}
            title={t('addAnotherJobTitle')}
            submitCtaLabel={t('saveNewJobCta')}
            isPending={isPending}
            onCancel={onCancel}
            dictionary={formDictionary}
          />
        </Form>
      </BaseLayout>
    </section>
  )
}
