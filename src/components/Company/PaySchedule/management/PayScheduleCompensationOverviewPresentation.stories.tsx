import { fn } from 'storybook/test'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import type { PayScheduleCompensationRow } from './PayScheduleCompensationOverviewPresentation'
import { PayScheduleCompensationOverviewPresentation } from './PayScheduleCompensationOverviewPresentation'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Company/PaySchedule/Management/PayScheduleCompensationOverview',
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

const separateSchedules: PayScheduleCompensationRow[] = [
  { compensationType: 'salaried', schedule: salariedSchedule },
  { compensationType: 'hourly', schedule: hourlySchedule },
]

function StoryWrapper({
  rows = separateSchedules,
  enableAutoPilot = true,
  enableMultipleSchedules = true,
}: {
  rows?: PayScheduleCompensationRow[]
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
}) {
  return (
    <GustoTestProvider>
      <PayScheduleCompensationOverviewPresentation
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
      { compensationType: 'salaried', schedule: salariedSchedule },
      { compensationType: 'hourly', schedule: salariedSchedule },
    ]}
  />
)

export const AutoPilotDisabledForCompany = () => <StoryWrapper enableAutoPilot={false} />

export const SingleScheduleOnly = () => <StoryWrapper enableMultipleSchedules={false} />

export const UnresolvedScheduleDropped = () => (
  <StoryWrapper rows={[{ compensationType: 'salaried', schedule: salariedSchedule }]} />
)
