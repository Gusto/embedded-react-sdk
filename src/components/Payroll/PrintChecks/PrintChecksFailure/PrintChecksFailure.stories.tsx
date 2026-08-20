import { Suspense } from 'react'
import { fn } from 'storybook/test'
import { MockBaseProvider } from '../../../../../.storybook/helpers/MockBaseProvider'
import { PrintChecksFailure } from './PrintChecksFailure'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.PrintChecksFailure')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/PrintChecksFailure',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <MockBaseProvider>
            <Story />
          </MockBaseProvider>
        </I18nLoader>
      </Suspense>
    ),
  ],
}

export const Default = () => (
  <>
    <PrintChecksFailure
      errorMessage="Cannot generate checks on an unprocessed payroll"
      onEvent={fn().mockName('onEvent')}
    />
    <PrintChecksFailure.Footer onEvent={fn().mockName('onEvent')} />
  </>
)
