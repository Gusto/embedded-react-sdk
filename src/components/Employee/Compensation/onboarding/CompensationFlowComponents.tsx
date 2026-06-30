import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api-v-2026-06-15/models/components/job'
import type { Compensation } from '@gusto/embedded-api-v-2026-06-15/models/components/compensation'
import type { CompensationDefaultValues } from './Compensation'
import { JobsList } from './JobsList'
import { EditCompensation } from './EditCompensation'
import type { OnEventType } from '@/components/Base/useBase'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'
import { componentEvents, FlsaStatus, type EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export type EventPayloads = {
  [componentEvents.EMPLOYEE_JOB_ADD]: undefined
  [componentEvents.EMPLOYEE_JOB_EDIT]: { uuid: string }
  [componentEvents.EMPLOYEE_JOB_CREATED]: Job
  [componentEvents.EMPLOYEE_JOB_UPDATED]: Job
  [componentEvents.EMPLOYEE_JOB_DELETED]: undefined
  [componentEvents.EMPLOYEE_COMPENSATION_UPDATED]: Compensation
  [componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST]: undefined
  [componentEvents.EMPLOYEE_COMPENSATION_CANCEL]: undefined
  [componentEvents.EMPLOYEE_COMPENSATION_DONE]: undefined
}

/** @internal */
export interface CompensationFlowContextInterface extends FlowContextInterface {
  employeeId: string
  startDate: string
  currentJobId?: string | null
  partnerDefaultValues?: CompensationDefaultValues
}

/** @internal */
export function JobsListContextual() {
  const { employeeId, onEvent } = useFlow<CompensationFlowContextInterface>()
  return <JobsList employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function InitialEditCompensationContextual() {
  const { employeeId, startDate, currentJobId, partnerDefaultValues, onEvent } =
    useFlow<CompensationFlowContextInterface>()
  useI18n('Employee.Compensation')
  const { t } = useTranslation('Employee.Compensation')

  const handleEvent: OnEventType<EventType, unknown> = (event, data) => {
    onEvent(event, data)
    if (event === componentEvents.EMPLOYEE_COMPENSATION_UPDATED) {
      const compensation = data as Compensation
      if (compensation.flsaStatus !== FlsaStatus.NONEXEMPT) {
        onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
      } else {
        onEvent(componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST)
      }
    }
  }

  return (
    <EditCompensation
      employeeId={ensureRequired(employeeId)}
      startDate={ensureRequired(startDate)}
      currentJobId={currentJobId}
      title={t('title')}
      submitCtaLabel={t('submitCta')}
      partnerDefaultValues={partnerDefaultValues}
      onEvent={handleEvent}
    />
  )
}

/** @internal */
export function EditCompensationContextual() {
  const { employeeId, startDate, currentJobId, partnerDefaultValues, onEvent } =
    useFlow<CompensationFlowContextInterface>()
  useI18n('Employee.Compensation')
  const { t } = useTranslation('Employee.Compensation')

  const handleEvent: OnEventType<EventType, unknown> = (event, data) => {
    onEvent(event, data)
    if (event === componentEvents.EMPLOYEE_COMPENSATION_UPDATED) {
      onEvent(componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST)
    }
  }

  return (
    <EditCompensation
      employeeId={ensureRequired(employeeId)}
      startDate={ensureRequired(startDate)}
      currentJobId={currentJobId}
      title={currentJobId ? t('editTitle') : t('addTitle')}
      submitCtaLabel={t('saveNewJobCta')}
      onCancel={() => {
        onEvent(componentEvents.EMPLOYEE_COMPENSATION_CANCEL)
      }}
      partnerDefaultValues={partnerDefaultValues}
      onEvent={handleEvent}
    />
  )
}
