import { Suspense } from 'react'
import { fn } from 'storybook/test'
import { TerminationSummaryPresentation } from './TerminationSummaryPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Employee.Terminations.TerminationSummary')
  return <>{children}</>
}

export default {
  title: 'Domain/Employee/Terminations/TerminationSummary',
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

const noop = fn().mockName('action')

const defaultProps = {
  employeeName: 'John Doe',
  effectiveDate: '2025-03-15',
  isLoading: false,
  isCancelDialogOpen: false,
  onDialogClose: noop,
  onDialogConfirm: noop,
  isCancelling: false,
  onCancelClick: noop,
  onEditDismissal: noop,
  onRunDismissalPayroll: noop,
  onRunOffCyclePayroll: noop,
}

export const WithCancelAndEdit = () => (
  <TerminationSummaryPresentation
    {...defaultProps}
    canCancel={true}
    canEdit={true}
    showRunPayroll={false}
    showRunOffCyclePayroll={false}
    showSuccessAlert={true}
  />
)

export const WithRunPayroll = () => (
  <TerminationSummaryPresentation
    {...defaultProps}
    canCancel={false}
    canEdit={true}
    showRunPayroll={true}
    showRunOffCyclePayroll={false}
    showSuccessAlert={true}
  />
)

export const WithRunOffCyclePayroll = () => (
  <TerminationSummaryPresentation
    {...defaultProps}
    canCancel={true}
    canEdit={true}
    showRunPayroll={false}
    showRunOffCyclePayroll={true}
    showSuccessAlert={true}
  />
)

export const PastTermination = () => (
  <TerminationSummaryPresentation
    {...defaultProps}
    effectiveDate="2024-01-15"
    canCancel={false}
    canEdit={false}
    showRunPayroll={false}
    showRunOffCyclePayroll={false}
    showSuccessAlert={false}
  />
)

export const NonCancelable = () => (
  <TerminationSummaryPresentation
    {...defaultProps}
    canCancel={false}
    canEdit={true}
    showRunPayroll={true}
    showRunOffCyclePayroll={false}
    showSuccessAlert={true}
  />
)

export const CancelDialogOpen = () => (
  <TerminationSummaryPresentation
    {...defaultProps}
    canCancel={true}
    canEdit={true}
    showRunPayroll={false}
    showRunOffCyclePayroll={false}
    isCancelDialogOpen={true}
    showSuccessAlert={true}
  />
)
