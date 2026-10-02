import { fn } from 'storybook/test'
import { AutoPilotDialogPresentation } from './AutoPilotDialogPresentation'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Company/PaySchedule/Management/AutoPilotDialog',
}

function StoryWrapper(props: Partial<Parameters<typeof AutoPilotDialogPresentation>[0]> = {}) {
  return (
    <GustoTestProvider>
      <AutoPilotDialogPresentation
        scheduleName="Weekly Schedule"
        blockers={[]}
        isEnableBlocked={false}
        nextEnabled={false}
        isSaving={false}
        hasGenericError={false}
        onToggle={fn().mockName('onToggle')}
        onSave={fn().mockName('onSave')}
        onClose={fn().mockName('onClose')}
        {...props}
      />
    </GustoTestProvider>
  )
}

export const Default = () => <StoryWrapper />

export const Enabled = () => <StoryWrapper nextEnabled />

export const Saving = () => <StoryWrapper nextEnabled isSaving />

export const BlockedByPreflightBlockers = () => (
  <StoryWrapper
    isEnableBlocked
    blockers={[
      { key: 'employees_not_on_direct_deposit' },
      { key: 'missing_state_tax_requirements' },
    ]}
  />
)

export const GenericErrorOnSave = () => <StoryWrapper nextEnabled hasGenericError />
