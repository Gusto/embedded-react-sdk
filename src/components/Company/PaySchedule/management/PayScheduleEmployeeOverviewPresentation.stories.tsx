import { fn } from 'storybook/test'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import type { PayScheduleEmployeeRow } from './PayScheduleEmployeeOverviewPresentation'
import { PayScheduleEmployeeOverviewPresentation } from './PayScheduleEmployeeOverviewPresentation'
import { useI18n } from '@/i18n'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Company/PaySchedule/Management/PayScheduleEmployeeOverview',
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

const separateSchedules: PayScheduleEmployeeRow[] = [
  { employeeCount: 10, schedule: salariedSchedule },
  { employeeCount: 1, schedule: hourlySchedule },
]

function StoryWrapper({
  rows = separateSchedules,
  accessDenied = false,
  enableAutoPilot = true,
  enableMultipleSchedules = true,
}: {
  rows?: PayScheduleEmployeeRow[]
  accessDenied?: boolean
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
}) {
  useI18n('Company.Management.PaySchedule')
  return (
    <GustoTestProvider>
      <PayScheduleEmployeeOverviewPresentation
        rows={rows}
        accessDenied={accessDenied}
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

export const NoEmployees = () => <StoryWrapper rows={[]} />

export const AutoPilotDisabledForCompany = () => <StoryWrapper enableAutoPilot={false} />

export const SingleScheduleOnly = () => <StoryWrapper enableMultipleSchedules={false} />

export const UnresolvedScheduleDropped = () => (
  <StoryWrapper rows={[{ employeeCount: 10, schedule: salariedSchedule }]} />
)

export const LargeEmployeeCount = () => (
  <StoryWrapper
    rows={[
      {
        employeeCount: 1000,
        schedule: salariedSchedule,
      },
    ]}
  />
)

export const MissingEmployeeAccess = () => <StoryWrapper accessDenied />
