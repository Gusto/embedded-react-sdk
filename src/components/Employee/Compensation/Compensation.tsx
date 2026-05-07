import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsGetJobsSuspense } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { type Job } from '@gusto/embedded-api/models/components/job'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import {
  InitialEditCompensationContextual,
  JobsListContextual,
  type CompensationFlowContextInterface,
} from './CompensationFlowComponents'
import { compensationStateMachine } from './compensationStateMachine'
import { JobsList } from './JobsList'
import { EditCompensation } from './EditCompensation'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { PAY_PERIODS } from '@/shared/constants'
import { FlsaStatus } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useFlow } from '@/components/Flow/useFlow'

type CompensationInitialState = 'initialEditJob' | 'viewJobs'

interface InitialFlowConfig {
  initialState: CompensationInitialState
  currentJobId: string | null
}

const INITIAL_COMPONENT_BY_STATE: Record<
  CompensationInitialState,
  React.ComponentType<CommonComponentInterface>
> = {
  initialEditJob: InitialEditCompensationContextual,
  viewJobs: JobsListContextual,
}

function deriveInitialFlowConfig(employeeJobs: Job[]): InitialFlowConfig {
  if (employeeJobs.length === 0) {
    return { initialState: 'initialEditJob', currentJobId: null }
  }

  const onlyJob = employeeJobs.length === 1 ? (employeeJobs[0] ?? null) : null
  const onlyJobCompensation = findCurrentCompensation(onlyJob)

  if (onlyJob && onlyJobCompensation?.flsaStatus !== FlsaStatus.NONEXEMPT) {
    return { initialState: 'initialEditJob', currentJobId: onlyJob.uuid }
  }

  return { initialState: 'viewJobs', currentJobId: null }
}

export type CompensationDefaultValues = RequireAtLeastOne<{
  rate?: Job['rate']
  title?: Job['title']
  paymentUnit?: (typeof PAY_PERIODS)[keyof typeof PAY_PERIODS]
  flsaStatus?: FlsaStatusType
}>

export interface CompensationProps extends BaseComponentInterface<'Employee.Compensation'> {
  employeeId: string
  startDate: string
  defaultValues?: CompensationDefaultValues
}

export function Compensation(props: CompensationProps) {
  return (
    <BaseComponent {...props}>
      <CompensationFlow {...props} />
    </BaseComponent>
  )
}

const findCurrentCompensation = (job?: Job | null) => {
  return job?.compensations?.find(comp => comp.uuid === job.currentCompensationUuid)
}

function CompensationFlow({
  employeeId,
  startDate,
  defaultValues,
  dictionary,
  onEvent,
}: CompensationProps) {
  useComponentDictionary('Employee.Compensation', dictionary)

  const { data: jobsData } = useJobsAndCompensationsGetJobsSuspense({ employeeId })

  const { initialState, currentJobId } = deriveInitialFlowConfig(jobsData.jobs ?? [])

  const manageCompensation = useMemo(
    () =>
      createMachine(
        initialState,
        compensationStateMachine,
        (initialContext: CompensationFlowContextInterface) => ({
          ...initialContext,
          component: INITIAL_COMPONENT_BY_STATE[initialState],
          employeeId,
          startDate,
          partnerDefaultValues: defaultValues,
          currentJobId,
        }),
      ),
    // `defaultValues` is intentionally omitted: it's a partner-supplied prop that may
    // arrive as a fresh object reference on every render. It seeds the form once at
    // initialization, so re-creating the machine on reference churn would only serve
    // to discard in-flight state. Genuine API state changes (different employee, a
    // change in the only-job FLSA status) flow through the scalar deps below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeeId, startDate, initialState, currentJobId],
  )

  return <Flow machine={manageCompensation} onEvent={onEvent} />
}

export const CompensationContextual = () => {
  const { employeeId, onEvent, startDate, defaultValues } = useFlow<OnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId || !startDate) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Compensation',
        param: !employeeId ? 'employeeId' : 'startDate',
        provider: 'FlowProvider',
      }),
    )
  }
  return (
    <Compensation
      employeeId={employeeId}
      startDate={startDate}
      onEvent={onEvent}
      defaultValues={defaultValues?.compensation}
    />
  )
}

Compensation.JobsList = JobsList
Compensation.EditCompensation = EditCompensation
