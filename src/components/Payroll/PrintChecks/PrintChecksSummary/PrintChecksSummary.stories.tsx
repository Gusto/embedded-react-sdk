import { Suspense } from 'react'
import { fn } from 'storybook/test'
import { MockBaseProvider } from '../../../../../.storybook/helpers/MockBaseProvider'
import { PrintChecksSummary } from './PrintChecksSummary'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.PrintChecksSummary')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/PrintChecksSummary',
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
    <PrintChecksSummary
      documentUrl="https://example.com/checks.pdf"
      onEvent={fn().mockName('onEvent')}
    />
    <PrintChecksSummary.Footer onEvent={fn().mockName('onEvent')} />
  </>
)
