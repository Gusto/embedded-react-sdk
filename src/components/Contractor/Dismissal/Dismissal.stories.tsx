import { Suspense } from 'react'
import { fn } from 'storybook/test'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { DismissalPresentation } from './DismissalPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Contractor.Dismissal')
  return <>{children}</>
}

export default {
  title: 'Domain/Contractor/Dismissal',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <Story />
        </I18nLoader>
      </Suspense>
    ),
  ],
}

const onSubmitAction = fn().mockName('onSubmit')
const onCancelAction = fn().mockName('onCancel')

function buildContractor(overrides: Partial<Contractor>): Contractor {
  return {
    uuid: 'contractor-123',
    companyUuid: 'company-123',
    wageType: 'Hourly',
    startDate: '2024-03-15',
    isActive: true,
    version: 'version-1',
    type: 'Individual',
    firstName: 'Ada',
    lastName: 'Lovelace',
    hasEin: false,
    hasSsn: true,
    email: 'ada.lovelace@example.com',
    onboarded: true,
    onboardingStatus: 'onboarding_completed',
    hourlyRate: '50.00',
    paymentMethod: 'Direct Deposit',
    ...overrides,
  } as Contractor
}

export const Default = () => (
  <DismissalPresentation
    contractor={buildContractor({})}
    onSubmit={onSubmitAction}
    onCancel={onCancelAction}
    isPending={false}
  />
)

export const BusinessContractor = () => (
  <DismissalPresentation
    contractor={buildContractor({
      type: 'Business',
      businessName: 'Pacific Design Co.',
      firstName: 'Mason',
      lastName: 'Park',
      wageType: 'Fixed',
    })}
    onSubmit={onSubmitAction}
    onCancel={onCancelAction}
    isPending={false}
  />
)

export const RecentStartDate = () => (
  <DismissalPresentation
    contractor={buildContractor({ startDate: new Date().toISOString().slice(0, 10) })}
    onSubmit={onSubmitAction}
    onCancel={onCancelAction}
    isPending={false}
  />
)

export const Submitting = () => (
  <DismissalPresentation
    contractor={buildContractor({})}
    onSubmit={onSubmitAction}
    onCancel={onCancelAction}
    isPending={true}
  />
)
