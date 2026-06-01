import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import style from './CompensationHistory.module.scss'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import { ActionsLayout, DataView, Flex, FlexItem, useDataView } from '@/components/Common'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatCompensationRate } from '@/helpers/formattedStrings'
import { useComponentDictionary, useI18n } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

export interface CompensationHistoryProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  onBack?: () => void
}

export function CompensationHistory({ dictionary, ...props }: CompensationHistoryProps) {
  useComponentDictionary('Employee.Compensation', dictionary)
  return (
    <BaseBoundaries componentName="Employee.Compensation.Management.CompensationHistory">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({ employeeId, onBack }: Omit<CompensationHistoryProps, 'dictionary'>) {
  useI18n('Employee.Compensation')
  const { t } = useTranslation('Employee.Compensation')
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
          <Components.Text>{t('history.emptyState')}</Components.Text>
        ) : jobs.length === 1 && jobs[0] ? (
          <JobCompensationHistory job={jobs[0]} />
        ) : (
          <CombinedCompensationHistory jobs={jobs} />
        )}
        {onBack && (
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onBack}>
              {t('backCta')}
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

function JobCompensationHistory({ job }: { job: Job }) {
  const { t } = useTranslation('Employee.Compensation')
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
        title: t('history.effectiveDateColumn'),
        render: compensation => formatDateLongWithYear(compensation.effectiveDate),
      },
      {
        key: 'flsaStatus',
        title: t('history.employeeTypeColumn'),
        render: compensation =>
          compensation.flsaStatus !== undefined
            ? t(`flsaStatusLabels.${compensation.flsaStatus}`)
            : '',
      },
      {
        key: 'rate',
        title: t('history.wageColumn'),
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
      <DataView label={t('history.tableLabel', { jobTitle })} {...dataViewProps} />
    </Flex>
  )
}

type CombinedRow = {
  compensation: Compensation
  job: Job
}

function CombinedCompensationHistory({ jobs }: { jobs: Job[] }) {
  const { t } = useTranslation('Employee.Compensation')
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
    { value: 'all', label: t('history.allJobsOption') },
    ...jobs.map(job => ({ value: job.uuid, label: getJobTitle(job) })),
  ]

  const dataViewProps = useDataView<CombinedRow>({
    data: rows,
    columns: [
      {
        key: 'effectiveDate',
        title: t('history.effectiveDateColumn'),
        render: row => formatDateLongWithYear(row.compensation.effectiveDate),
      },
      {
        key: 'title',
        title: t('history.jobTitleColumn'),
        render: row => row.compensation.title ?? row.job.title ?? '',
      },
      {
        key: 'flsaStatus',
        title: t('history.employeeTypeColumn'),
        render: row =>
          row.compensation.flsaStatus !== undefined
            ? t(`flsaStatusLabels.${row.compensation.flsaStatus}`)
            : '',
      },
      {
        key: 'rate',
        title: t('history.wageColumn'),
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
          <FlexItem>
            <Components.Heading as="h2">{t('history.heading')}</Components.Heading>
          </FlexItem>
          <FlexItem>
            <div className={style.jobFilter}>
              <Components.Select
                label={t('history.jobFilterLabel')}
                shouldVisuallyHideLabel
                value={selectedJobUuid}
                onChange={value => {
                  setSelectedJobUuid(value)
                }}
                options={options}
              />
            </div>
          </FlexItem>
        </Flex>
        <DataView label={t('history.combinedTableLabel')} {...dataViewProps} />
      </Flex>
    </div>
  )
}
