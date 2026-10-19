import { fn } from 'storybook/test'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import type { PayScheduleDepartmentRow } from './PayScheduleDepartmentOverviewPresentation'
import { PayScheduleDepartmentOverviewPresentation } from './PayScheduleDepartmentOverviewPresentation'
import { useI18n } from '@/i18n'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Company/PaySchedule/Management/PayScheduleDepartmentOverview',
}

const salariedSchedule: PayScheduleShow = {
  uuid: 'pay-schedule-salaried',
  version: 'v1',
  frequency: 'Twice per month',
  customName: 'Salaried Team',
  autoPayroll: true,
  active: true,
}

const hourlySchedule: PayScheduleShow = {
  uuid: 'pay-schedule-hourly',
  version: 'v2',
  frequency: 'Every week',
  customName: 'Hourly Team',
  autoPayroll: false,
  active: true,
}

const separateSchedules: PayScheduleDepartmentRow[] = [
  { departmentName: 'Uncategorized employees', schedule: salariedSchedule },
  { departmentName: 'Engineering', schedule: salariedSchedule },
  { departmentName: 'Sales', schedule: hourlySchedule },
]

function StoryWrapper({
  rows = separateSchedules,
  enableAutoPilot = true,
  enableMultipleSchedules = true,
}: {
  rows?: PayScheduleDepartmentRow[]
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
}) {
  useI18n('Company.Management.PaySchedule')
  return (
    <GustoTestProvider>
      <PayScheduleDepartmentOverviewPresentation
        rows={rows}
        enableAutoPilot={enableAutoPilot}
        enableMultipleSchedules={enableMultipleSchedules}
        onEditSchedule={fn().mockName('onEditSchedule')}
        onManageAssignment={fn().mockName('onManageAssignment')}
        onEditAutoPilot={fn().mockName('onEditAutoPilot')}
      />
    </GustoTestProvider>
  )
}

export const Default = () => <StoryWrapper />

export const SameScheduleForBoth = () => (
  <StoryWrapper
    rows={[
      { departmentName: 'Engineering', schedule: salariedSchedule },
      { departmentName: 'Sales', schedule: salariedSchedule },
    ]}
  />
)

export const AutoPilotDisabledForCompany = () => <StoryWrapper enableAutoPilot={false} />

export const SingleScheduleOnly = () => <StoryWrapper enableMultipleSchedules={false} />

export const UnresolvedScheduleDropped = () => (
  <StoryWrapper rows={[{ departmentName: 'Engineering', schedule: salariedSchedule }]} />
)

export const LongDepartmentName = () => (
  <StoryWrapper
    rows={[
      {
        departmentName: 'Research, development, and international operations',
        schedule: salariedSchedule,
      },
    ]}
  />
)
