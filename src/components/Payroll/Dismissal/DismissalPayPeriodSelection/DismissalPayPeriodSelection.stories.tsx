import { useState } from 'react'
import { fn } from 'storybook/test'
import { DismissalPayPeriodSelectionPresentation } from './DismissalPayPeriodSelectionPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.Dismissal')
  return <>{children}</>
}

const payPeriodOptions = [
  { value: '0', label: 'Dec 1, 2024 – Dec 14, 2024 (Jane Doe)' },
  { value: '1', label: 'Dec 15, 2024 – Dec 28, 2024 (Jane Doe)' },
  { value: '2', label: 'Jan 1, 2025 – Jan 14, 2025 (John Smith)' },
]

export default {
  title: 'Domain/Payroll/DismissalPayPeriodSelection',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <Story />
      </I18nLoader>
    ),
  ],
}

export const Default = () => {
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<string | undefined>(undefined)
  const onSubmit = fn().mockName('onSubmit')

  return (
    <DismissalPayPeriodSelectionPresentation
      payPeriodOptions={payPeriodOptions}
      selectedPeriodIndex={selectedPeriodIndex}
      onSelectPeriod={setSelectedPeriodIndex}
      onSubmit={onSubmit}
      isPending={false}
    />
  )
}

export const WithSelection = () => {
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<string | undefined>('0')
  const onSubmit = fn().mockName('onSubmit')

  return (
    <DismissalPayPeriodSelectionPresentation
      payPeriodOptions={payPeriodOptions}
      selectedPeriodIndex={selectedPeriodIndex}
      onSelectPeriod={setSelectedPeriodIndex}
      onSubmit={onSubmit}
      isPending={false}
    />
  )
}

export const Submitting = () => (
  <DismissalPayPeriodSelectionPresentation
    payPeriodOptions={payPeriodOptions}
    selectedPeriodIndex="0"
    onSelectPeriod={() => {}}
    onSubmit={() => {}}
    isPending={true}
  />
)

export const EmptyState = () => (
  <DismissalPayPeriodSelectionPresentation
    payPeriodOptions={[]}
    selectedPeriodIndex={undefined}
    onSelectPeriod={() => {}}
    onSubmit={() => {}}
    isPending={false}
  />
)
