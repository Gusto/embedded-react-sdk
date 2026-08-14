import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { fn } from 'storybook/test'
import { PrintingFormat } from '@gusto/embedded-api/models/components/printablepayrollchecksbody'
import { PrintChecksModalPresentation } from './PrintChecksModalPresentation'
import type { PrintChecksFormValues, PrintChecksModalPhase } from './usePrintChecksModal'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.PrintChecksModal')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/PrintChecksModal',
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

function StoryWrapper({
  phase,
  printingFormat = PrintingFormat.Top,
  documentUrl = null,
  errorMessage = null,
}: {
  phase: PrintChecksModalPhase
  printingFormat?: PrintingFormat
  documentUrl?: string | null
  errorMessage?: string | null
}) {
  const formMethods = useForm<PrintChecksFormValues>({
    defaultValues: { printingFormat, startingCheckNumber: 0 },
  })

  return (
    <PrintChecksModalPresentation
      isOpen
      onClose={fn().mockName('onClose')}
      formMethods={formMethods}
      phase={phase}
      documentUrl={documentUrl}
      errorMessage={errorMessage}
      onSubmit={fn().mockName('onSubmit')}
      onRetry={fn().mockName('onRetry')}
    />
  )
}

export const Default = () => <StoryWrapper phase="form" printingFormat={PrintingFormat.Top} />

export const BlankCheckStockSelected = () => (
  <StoryWrapper phase="form" printingFormat={PrintingFormat.Bottom} />
)

export const Generating = () => (
  <StoryWrapper phase="generating" printingFormat={PrintingFormat.Bottom} />
)

export const Succeeded = () => (
  <StoryWrapper phase="succeeded" documentUrl="https://example.com/checks.pdf" />
)

export const Failed = () => (
  <StoryWrapper phase="failed" errorMessage="Cannot generate checks on an unprocessed payroll" />
)
