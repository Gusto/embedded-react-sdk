import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import { fn } from 'storybook/test'
import { AssignmentDepartmentStepPresentation } from './AssignmentDepartmentStepPresentation'
import { useI18n } from '@/i18n'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default { title: 'Domain/Company/PaySchedule/Management/AssignmentDepartmentStep' }

const schedules: PayScheduleShow[] = [
  { uuid: 'weekly', version: 'v1', frequency: 'Every week', customName: 'Weekly' },
  { uuid: 'monthly', version: 'v2', frequency: 'Monthly', customName: 'Monthly' },
]
const departments = [
  { uuid: 'engineering', title: 'Engineering' },
  { uuid: 'sales', title: 'Sales' },
]

function StoryWrapper({
  empty = false,
  longName = false,
}: {
  empty?: boolean
  longName?: boolean
}) {
  useI18n('Company.Management.PayScheduleAssignment')
  return (
    <GustoTestProvider>
      <AssignmentDepartmentStepPresentation
        departments={
          longName
            ? [
                { ...departments[0], title: 'Research, development, and international operations' },
                departments[1]!,
              ]
            : departments
        }
        schedules={empty ? [] : schedules}
        selection={{
          defaultPayScheduleUuid: empty ? '' : 'weekly',
          departments: departments.map(department => ({
            departmentUuid: department.uuid,
            payScheduleUuid: empty ? '' : 'weekly',
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
export const NoSchedules = () => <StoryWrapper empty />
export const LongDepartmentName = () => <StoryWrapper longName />
