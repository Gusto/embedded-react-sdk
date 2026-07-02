import { useMemo, useState } from 'react'
import { createMachine } from 'robot3'
import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsGetJobsSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/jobsAndCompensationsGetJobs'
import { type Job } from '@gusto/embedded-api-v-2026-02-01/models/components/job'
import type { FlsaStatusType } from '@gusto/embedded-api-v-2026-02-01/models/components/flsastatustype'
import type { OnboardingContextInterface } from '../../OnboardingFlow/OnboardingFlowComponents'
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

/**
 * Default values for the compensation form fields.
 *
 * @remarks
 * At least one of the fields must be provided. If employee data is available
 * via the API, these values are overwritten.
 *
 * @public
 */
export type CompensationDefaultValues = RequireAtLeastOne<{
  /** The compensation rate (an amount in dollars). */
  rate?: Job['rate']
  /** The job title. */
  title?: Job['title']
  /** The pay period — one of `Hour`, `Week`, `Month`, `Year`, `Paycheck`. */
  paymentUnit?: (typeof PAY_PERIODS)[keyof typeof PAY_PERIODS]
  /** The FLSA classification — drives whether the role is treated as exempt, nonexempt, etc. */
  flsaStatus?: FlsaStatusType
}>

/**
 * Props for {@link Compensation}.
 *
 * @public
 */
export interface CompensationProps extends BaseComponentInterface<'Employee.Compensation'> {
  /** The associated employee identifier. */
  employeeId: string
  /** The date the employee will start work. */
  startDate: string
  /** Default values for the compensation form fields. If employee data is available via the API, these values are overwritten. */
  defaultValues?: CompensationDefaultValues
}

/**
 * Onboarding step for collecting an employee's role and compensation details.
 *
 * @remarks
 * Collects the job title, employee type (hourly, salary), compensation
 * amount, and pay period. For hourly employees, allows configuring multiple
 * roles. Automatically routes between editing the only job (when an employee
 * has zero or one non-Nonexempt job) and a jobs-list view (when multiple
 * roles need to be managed) on first mount; on subsequent refetches the user
 * stays on their current step.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/job/created` | Fired after a job is successfully created | {@link Job} |
 * | `employee/job/updated` | Fired after a job is successfully updated | {@link Job} |
 * | `employee/job/deleted` | Fired after a job is successfully deleted | — |
 * | `employee/compensation/updated` | Fired after compensation details are updated | {@link Compensation} |
 * | `employee/compensation/done` | Fired when compensation setup is complete and the parent flow can advance | — |
 *
 * @param props - See {@link CompensationProps}.
 * @returns The compensation onboarding step.
 * @public
 * @group Block Components
 *
 * @example
 * ```tsx
 * import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <EmployeeOnboarding.Compensation
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       startDate="2025-01-01"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
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

  // Capture the routing decision from the first jobsData snapshot only. Suspense
  // guarantees that snapshot is fresh on first render. Subsequent refetches (e.g.
  // the getJobs invalidation that fires between EditCompensation's awaited job +
  // compensation mutations) must NOT re-seat the machine and reset the user's
  // place in the flow. Callers needing to re-derive routing for a different
  // employee should remount via `key`, matching the contract used by
  // OnboardingFlow / PayrollExecutionFlow / DismissalFlow.
  const [{ initialState, currentJobId }] = useState<InitialFlowConfig>(() =>
    deriveInitialFlowConfig(jobsData.jobs ?? []),
  )

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
    // `defaultValues` is intentionally omitted: a partner-supplied prop that may
    // arrive as a fresh object reference each render and only seeds the form
    // once. `initialState` and `currentJobId` are stable values from useState
    // above, so they're listed here as honest deps but never trigger recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeeId, startDate, initialState, currentJobId],
  )

  return <Flow machine={manageCompensation} onEvent={onEvent} />
}

/** @internal */
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
