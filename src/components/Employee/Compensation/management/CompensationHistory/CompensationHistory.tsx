import { useTranslation } from 'react-i18next'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import { BaseBoundaries, BaseLayout, type CommonComponentInterface } from '@/components/Base'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
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
        {jobs.map(job => (
          <JobCompensationHistory key={job.uuid} job={job} />
        ))}
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

function JobCompensationHistory({ job }: { job: Job }) {
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()
  const formatCompensationRate = useFormatCompensationRate()

  const currentComp = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
  const jobTitle = currentComp?.title ?? job.title ?? ''

  const sortedCompensations = [...(job.compensations ?? [])].sort((a, b) => {
    const aDate = a.effectiveDate ?? ''
    const bDate = b.effectiveDate ?? ''
    return bDate.localeCompare(aDate)
  })

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
