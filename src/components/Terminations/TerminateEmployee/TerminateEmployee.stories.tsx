import { Suspense } from 'react'
import { fn } from 'storybook/test'
import { TerminateEmployeePresentation } from './TerminateEmployeePresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Terminations.TerminateEmployee')
  return <>{children}</>
}

export default {
  title: 'Domain/Terminations/TerminateEmployee',
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

export const Default = () => (
  <TerminateEmployeePresentation
    employeeName="John Doe"
    onSubmit={onSubmitAction}
    onCancel={onCancelAction}
    isLoading={false}
  />
)

export const Loading = () => (
  <TerminateEmployeePresentation
    employeeName="John Doe"
    onSubmit={onSubmitAction}
    onCancel={onCancelAction}
    isLoading={true}
  />
)
