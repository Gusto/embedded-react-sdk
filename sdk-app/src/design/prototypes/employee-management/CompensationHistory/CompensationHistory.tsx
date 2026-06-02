import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidjobs'
import { CompensationHistory as CompensationHistoryView } from '../../../components/employee/management/CompensationHistory/CompensationHistory'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

export interface CompensationHistoryProps {
  employeeId: string
  onBack?: () => void
}

export function CompensationHistory(props: CompensationHistoryProps) {
  return (
    <BaseBoundaries componentName="CompensationHistory">
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({ employeeId, onBack }: CompensationHistoryProps) {
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
      <CompensationHistoryView jobs={jobs} onBack={onBack} />
    </BaseLayout>
  )
}
