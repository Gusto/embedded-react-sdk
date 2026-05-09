import { Suspense } from 'react'
import { fn } from 'storybook/test'
import { EditEmployeeBalanceModal } from './EditEmployeeBalanceModal'

export default {
  title: 'Domain/TimeOff/EditEmployeeBalanceModal',
  // DIAGNOSTIC: testing whether disabling a11y for this story fixes the
  // visual smoke test hang in CI. Will be reverted once we know.
  parameters: { a11y: { test: 'off' } },
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <Story />
      </Suspense>
    ),
  ],
}

export const Default = () => (
  <EditEmployeeBalanceModal
    isOpen
    onClose={fn().mockName('onClose')}
    employeeName="Alexander Hamilton"
    currentBalance={80}
    onConfirm={fn().mockName('onConfirm')}
    isPending={false}
  />
)

export const Loading = () => (
  <EditEmployeeBalanceModal
    isOpen
    onClose={fn().mockName('onClose')}
    employeeName="Alexander Hamilton"
    currentBalance={80}
    onConfirm={fn().mockName('onConfirm')}
    isPending
  />
)

export const ZeroBalance = () => (
  <EditEmployeeBalanceModal
    isOpen
    onClose={fn().mockName('onClose')}
    employeeName="Friedrich Nietzsche"
    currentBalance={0}
    onConfirm={fn().mockName('onConfirm')}
    isPending={false}
  />
)
