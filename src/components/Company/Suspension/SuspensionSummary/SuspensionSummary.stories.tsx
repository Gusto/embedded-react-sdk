import type { CompanySuspension } from '@gusto/embedded-api/models/components/companysuspension'
import { SuspensionSummaryPresentation } from './SuspensionSummaryPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.Suspension.Summary')
  return <>{children}</>
}

const payTaxesSuspension: CompanySuspension = {
  uuid: 'suspension-1',
  companyUuid: 'company-1',
  effectiveDate: '2026-05-15',
  reason: 'shutting_down',
  reconcileTaxMethod: 'pay_taxes',
  fileQuarterlyForms: true,
  fileYearlyForms: true,
}

const refundTaxesSuspension: CompanySuspension = {
  uuid: 'suspension-2',
  companyUuid: 'company-1',
  effectiveDate: '2026-02-01',
  reason: 'switching_provider',
  reconcileTaxMethod: 'refund_taxes',
  fileQuarterlyForms: false,
  fileYearlyForms: false,
  taxRefunds: [
    { description: 'Federal Unemployment', amount: '100.00' },
    { description: 'State Unemployment', amount: '50.50' },
  ],
}

export default {
  title: 'Domain/Company/Suspension/SuspensionSummary',
}

export const PayTaxes = () => (
  <I18nLoader>
    <SuspensionSummaryPresentation suspension={payTaxesSuspension} onDone={() => {}} />
  </I18nLoader>
)

export const RefundTaxesWithRefunds = () => (
  <I18nLoader>
    <SuspensionSummaryPresentation suspension={refundTaxesSuspension} onDone={() => {}} />
  </I18nLoader>
)

export const NotFilingForms = () => (
  <I18nLoader>
    <SuspensionSummaryPresentation
      suspension={{ ...payTaxesSuspension, fileQuarterlyForms: false, fileYearlyForms: false }}
      onDone={() => {}}
    />
  </I18nLoader>
)
