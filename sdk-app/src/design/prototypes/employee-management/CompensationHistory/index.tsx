import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import type { EntityIds } from '../../../../useEntities'
import style from './CompensationHistory.module.scss'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

const FLSA_STATUS_LABELS: Record<string, string> = {
  'Commission Only Exempt': 'Commission Only/No Overtime',
  'Commission Only Nonexempt': 'Commission Only/Eligible for overtime',
  Exempt: 'Salary/No overtime',
  Nonexempt: 'Paid by the hour',
  Owner: "Owner's draw",
  'Salaried Nonexempt': 'Salary/Eligible for overtime',
}

const COLUMN_LABELS = {
  effectiveDate: 'Effective date',
  employeeType: 'Employee type',
  wage: 'Wage',
  jobTitle: 'Job title',
}

export interface CompensationHistoryProps {
  employeeId?: string
  onBack?: () => void
}

export function CompensationHistory(props: CompensationHistoryProps = {}) {
  const outletContext = useOutletContext<{ entities: EntityIds } | null>()
  const employeeId = props.employeeId ?? outletContext?.entities.employeeId ?? ''

  if (!employeeId) {
    return (
      <p>
        No employee ID is configured. Set <code>VITE_EMPLOYEE_ID</code> or pick an employee from the
        entity panel to view this prototype.
      </p>
    )
  }

  return (
    <BaseBoundaries componentName="CompensationHistory">
      <Root employeeId={employeeId} onBack={props.onBack} />
    </BaseBoundaries>
  )
}

function Root({ employeeId, onBack }: { employeeId: string; onBack?: () => void }) {
  const Components = useComponentContext()

  const jobsQuery = useJobsAndCompensationsGetJobs(
    {
      employeeId,
      include: GetV1EmployeesEmployeeIdJobsQueryParamInclude.AllCompensations,
    },
    { enabled: !!employeeId },
  )

  const errorHandling = composeErrorHandler([jobsQuery])

  if (jobsQuery.isLoading || !jobsQuery.data) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  const jobs = jobsQuery.data.jobs ?? []

  return (
    <BaseLayout error={errorHandling.errors}>
      <Flex flexDirection="column" gap={32}>
        {jobs.length === 0 ? (
          <Components.Text>No compensation history yet.</Components.Text>
        ) : jobs.length === 1 && jobs[0] ? (
          <JobCompensationHistory job={jobs[0]} />
        ) : (
          <CombinedCompensationHistory jobs={jobs} />
        )}
        {onBack && (
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onBack}>
              Back
            </Components.Button>
          </ActionsLayout>
        )}
      </Flex>
    </BaseLayout>
  )
}

function getJobTitle(job: Job): string {
  const currentComp = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
  return currentComp?.title ?? job.title ?? ''
}

function formatFlsaStatus(status: string | undefined): string {
  if (!status) return ''
  return FLSA_STATUS_LABELS[status] ?? status
}

function JobCompensationHistory({ job }: { job: Job }) {
  const Components = useComponentContext()
  const formatCompensationRate = useFormatCompensationRate()

  const jobTitle = getJobTitle(job)

  const sortedCompensations = [...(job.compensations ?? [])].sort((a, b) =>
    (b.effectiveDate ?? '').localeCompare(a.effectiveDate ?? ''),
  )

  const dataViewProps = useDataView<Compensation>({
    data: sortedCompensations,
    columns: [
      {
        key: 'effectiveDate',
        title: COLUMN_LABELS.effectiveDate,
        render: compensation => formatDateLongWithYear(compensation.effectiveDate),
      },
      {
        key: 'flsaStatus',
        title: COLUMN_LABELS.employeeType,
        render: compensation => formatFlsaStatus(compensation.flsaStatus),
      },
      {
        key: 'rate',
        title: COLUMN_LABELS.wage,
        render: compensation => {
          const rate = Number(compensation.rate)
          if (!compensation.paymentUnit || Number.isNaN(rate)) return ''
          return formatCompensationRate(rate, compensation.paymentUnit)
        },
      },
    ],
  })

  return (
    <Flex flexDirection="column" gap={16}>
      <Components.Heading as="h2">{jobTitle}</Components.Heading>
      <DataView label={`Compensation history for ${jobTitle}`} {...dataViewProps} />
    </Flex>
  )
}

type CombinedRow = {
  compensation: Compensation
  job: Job
}

function CombinedCompensationHistory({ jobs }: { jobs: Job[] }) {
  const Components = useComponentContext()
  const formatCompensationRate = useFormatCompensationRate()
  const [selectedJobUuid, setSelectedJobUuid] = useState<string>('all')
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('small')

  const visibleJobs =
    selectedJobUuid === 'all' ? jobs : jobs.filter(job => job.uuid === selectedJobUuid)

  const rows: CombinedRow[] = visibleJobs
    .flatMap(job => (job.compensations ?? []).map(compensation => ({ compensation, job })))
    .sort((a, b) =>
      (b.compensation.effectiveDate ?? '').localeCompare(a.compensation.effectiveDate ?? ''),
    )

  const options = [
    { value: 'all', label: 'All jobs' },
    ...jobs.map(job => ({ value: job.uuid, label: getJobTitle(job) })),
  ]

  const dataViewProps = useDataView<CombinedRow>({
    data: rows,
    columns: [
      {
        key: 'effectiveDate',
        title: COLUMN_LABELS.effectiveDate,
        render: row => formatDateLongWithYear(row.compensation.effectiveDate),
      },
      {
        key: 'title',
        title: COLUMN_LABELS.jobTitle,
        render: row => row.compensation.title ?? row.job.title ?? '',
      },
      {
        key: 'flsaStatus',
        title: COLUMN_LABELS.employeeType,
        render: row => formatFlsaStatus(row.compensation.flsaStatus),
      },
      {
        key: 'rate',
        title: COLUMN_LABELS.wage,
        render: row => {
          const rate = Number(row.compensation.rate)
          if (!row.compensation.paymentUnit || Number.isNaN(rate)) return ''
          return formatCompensationRate(rate, row.compensation.paymentUnit)
        },
      },
    ],
  })

  return (
    <div ref={containerRef} className={style.container}>
      <Flex flexDirection="column" gap={16}>
        <Flex
          flexDirection={isDesktop ? 'row' : 'column'}
          justifyContent={isDesktop ? 'space-between' : 'normal'}
          alignItems={isDesktop ? 'center' : 'stretch'}
          gap={isDesktop ? 0 : 16}
        >
          <Components.Heading as="h2">Compensation history</Components.Heading>
          <div className={style.jobFilter}>
            <Components.Select
              label="Filter by job"
              shouldVisuallyHideLabel
              value={selectedJobUuid}
              onChange={value => {
                setSelectedJobUuid(value)
              }}
              options={options}
            />
          </div>
        </Flex>
        <DataView label="Compensation history across all jobs" {...dataViewProps} />
      </Flex>
    </div>
  )
}
