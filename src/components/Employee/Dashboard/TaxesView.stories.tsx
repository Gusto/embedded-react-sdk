import { fn } from 'storybook/test'
import type { EmployeeFederalTaxRev2020 } from '@gusto/embedded-api-v-2025-11-15/models/components/employeefederaltaxrev2020'
import { TaxesView } from './TaxesView'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/Employee/Dashboard/TaxesView',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEditFederalTaxes = fn().mockName('onEditFederalTaxes')

const federalTaxes: EmployeeFederalTaxRev2020 = {
  version: '1',
  w4DataType: 'rev_2020_w4',
  filingStatus: 'Single',
  twoJobs: false,
  dependentsAmount: null,
  otherIncome: null,
  deductions: null,
  extraWithholding: null,
}

export const Loading = () => <TaxesView isLoading />

export const WithFederalTaxes = () => (
  <TaxesView federalTaxes={federalTaxes} onEditFederalTaxes={onEditFederalTaxes} />
)

export const Empty = () => <TaxesView onEditFederalTaxes={onEditFederalTaxes} />
