import { fn } from 'storybook/test'
import { AssignmentEmployeeStepPresentation } from './AssignmentEmployeeStepPresentation'
import { useI18n } from '@/i18n'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default { title: 'Domain/Company/PaySchedule/Management/AssignmentEmployeeStep' }

function StoryWrapper({
  noSchedules = false,
  empty = false,
  longName = false,
}: {
  noSchedules?: boolean
  empty?: boolean
  longName?: boolean
}) {
  useI18n('Company.Management.PayScheduleAssignment')
  const employees = empty
    ? []
    : Array.from({ length: 12 }, (_, index) => ({
        uuid: `employee-${index}`,
        paymentMethod: 'Check' as const,
        firstName: longName ? 'Alexandria Cassandra' : 'Employee',
        lastName: longName ? `Montgomery-Wellington ${index + 1}` : String(index + 1),
        department: 'Engineering',
        flsaStatus: index % 2 === 0 ? ('Nonexempt' as const) : ('Exempt' as const),
      }))
  return (
    <GustoTestProvider>
      <AssignmentEmployeeStepPresentation
        employees={employees}
        schedules={
          noSchedules
            ? []
            : [
                { uuid: 'weekly', version: 'v1', customName: 'Weekly', frequency: 'Every week' },
                { uuid: 'monthly', version: 'v2', customName: 'Monthly', frequency: 'Monthly' },
              ]
        }
        selection={{
          employees: employees.map(employee => ({
            employeeUuid: employee.uuid,
            payScheduleUuid: noSchedules ? '' : 'weekly',
          })),
        }}
        onBack={fn()}
        onAddPaySchedule={fn()}
        onContinue={fn()}
      />
    </GustoTestProvider>
  )
}
export const Default = () => <StoryWrapper />
export const NoSchedules = () => <StoryWrapper noSchedules />
export const NoEmployees = () => <StoryWrapper empty />
export const LongNames = () => <StoryWrapper longName />
