import { fn } from 'storybook/test'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { PayScheduleOverviewPresentation } from './PayScheduleOverviewPresentation'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Company/PaySchedule/Management/PayScheduleOverview',
}

const mockSchedule: PayScheduleShow = {
  uuid: 'pay-schedule-1',
  version: 'v1',
  frequency: 'Every week',
  customName: 'Weekly Schedule',
  autoPayroll: false,
  active: true,
}

function StoryWrapper({
  schedule,
  enableAutoPilot = true,
  enableMultipleSchedules = true,
}: {
  schedule: PayScheduleShow | undefined
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
}) {
  return (
    <GustoTestProvider>
      <PayScheduleOverviewPresentation
        schedule={schedule}
        enableAutoPilot={enableAutoPilot}
        enableMultipleSchedules={enableMultipleSchedules}
        onEditSchedule={fn().mockName('onEditSchedule')}
        onManageAssignment={fn().mockName('onManageAssignment')}
        onEditAutoPilot={fn().mockName('onEditAutoPilot')}
      />
    </GustoTestProvider>
  )
}

export const Default = () => <StoryWrapper schedule={mockSchedule} />

export const AutoPilotEnabled = () => (
  <StoryWrapper schedule={{ ...mockSchedule, autoPayroll: true }} />
)

export const AutoPilotDisabledForCompany = () => (
  <StoryWrapper schedule={mockSchedule} enableAutoPilot={false} />
)

export const SingleScheduleOnly = () => (
  <StoryWrapper schedule={mockSchedule} enableMultipleSchedules={false} />
)

export const Loading = () => <StoryWrapper schedule={undefined} />
