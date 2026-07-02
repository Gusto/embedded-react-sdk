import type { Job } from '@gusto/embedded-api-v-2026-02-01/models/components/job'
import type { Compensation } from '@gusto/embedded-api-v-2026-02-01/models/components/compensation'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'

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
  jobs: Job[]
  onBack?: () => void
}

export function CompensationHistory({ jobs, onBack }: CompensationHistoryProps) {
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={32}>
      {jobs.length === 0 ? (
        <EmptyCompensationHistory />
      ) : (
        jobs.map(job => <JobCompensationHistory key={job.uuid} job={job} />)
      )}
      {onBack && (
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={onBack}>
            Back
          </Components.Button>
        </ActionsLayout>
      )}
    </Flex>
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
        key: 'title',
        title: COLUMN_LABELS.jobTitle,
        render: compensation => compensation.title ?? job.title ?? '',
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
    emptyState: () => (
      <Flex flexDirection="column" alignItems="center" gap={8}>
        <Components.Text>There is no compensation history.</Components.Text>
      </Flex>
    ),
  })

  return (
    <Flex flexDirection="column" gap={16}>
      <Components.Heading as="h2">{jobTitle}</Components.Heading>
      <DataView label={`Compensation history for ${jobTitle}`} {...dataViewProps} />
    </Flex>
  )
}

function EmptyCompensationHistory() {
  const Components = useComponentContext()

  const dataViewProps = useDataView<Compensation>({
    data: [],
    columns: [
      { key: 'effectiveDate', title: COLUMN_LABELS.effectiveDate, render: () => '' },
      { key: 'title', title: COLUMN_LABELS.jobTitle, render: () => '' },
      { key: 'flsaStatus', title: COLUMN_LABELS.employeeType, render: () => '' },
      { key: 'rate', title: COLUMN_LABELS.wage, render: () => '' },
    ],
    emptyState: () => (
      <Flex flexDirection="column" alignItems="center" gap={8}>
        <Components.Text>There is no compensation history.</Components.Text>
      </Flex>
    ),
  })

  return (
    <Flex flexDirection="column" gap={16}>
      <Components.Heading as="h2">Compensation history</Components.Heading>
      <DataView label="Compensation history" {...dataViewProps} />
    </Flex>
  )
}
