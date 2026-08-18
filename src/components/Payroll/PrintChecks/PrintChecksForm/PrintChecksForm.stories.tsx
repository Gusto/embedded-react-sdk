import { Suspense } from 'react'
import { fn } from 'storybook/test'
import { PrintChecksForm } from './PrintChecksForm'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { FlowContext } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.PrintChecksForm')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/PrintChecksForm',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <GustoTestProvider>
            <Story />
          </GustoTestProvider>
        </I18nLoader>
      </Suspense>
    ),
  ],
}

export const Default = () => (
  <FlowContext.Provider value={{ component: null, onEvent: fn().mockName('onEvent') }}>
    <PrintChecksForm payrollId="payroll-1" onEvent={fn().mockName('onEvent')} />
    <PrintChecksForm.Footer onEvent={fn().mockName('onEvent')} />
  </FlowContext.Provider>
)
