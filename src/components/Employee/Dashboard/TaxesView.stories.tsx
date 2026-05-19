import { Suspense } from 'react'
import { fn } from 'storybook/test'
import type { EmployeeFederalTaxRev2020 } from '@gusto/embedded-api/models/components/employeefederaltaxrev2020'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import { TaxesView } from './TaxesView'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Employee.Dashboard')
  return <>{children}</>
}

export default {
  title: 'Domain/Employee/Dashboard/TaxesView',
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

const onEditFederalTaxes = fn().mockName('onEditFederalTaxes')
const onEditStateTaxes = fn().mockName('onEditStateTaxes')

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

const stateTaxes: EmployeeStateTaxesList[] = [
  {
    state: 'CA',
    questions: [
      {
        label: 'Filing Status',
        description: null,
        key: 'filing_status',
        isQuestionForAdminOnly: false,
        inputQuestionFormat: {
          type: 'Select',
          options: [
            { value: 'Single', label: 'Single' },
            { value: 'Married', label: 'Married (or RDP)' },
            { value: 'Head of Household', label: 'Head of Household' },
          ],
        },
        answers: [{ value: 'Single' }],
      },
      {
        label: 'Withholding Allowances',
        description: null,
        key: 'withholding_allowance',
        isQuestionForAdminOnly: false,
        inputQuestionFormat: { type: 'Number' },
        answers: [{ value: 0 }],
      },
      {
        label: 'Additional Withholding',
        description: null,
        key: 'additional_withholding',
        isQuestionForAdminOnly: false,
        inputQuestionFormat: { type: 'Currency' },
        answers: [{ value: 0 }],
      },
    ],
  },
]

export const Loading = () => <TaxesView isLoading />

export const WithFederalAndStateTaxes = () => (
  <TaxesView
    federalTaxes={federalTaxes}
    stateTaxes={stateTaxes}
    onEditFederalTaxes={onEditFederalTaxes}
    onEditStateTaxes={onEditStateTaxes}
  />
)

export const WithFederalOnly = () => (
  <TaxesView
    federalTaxes={federalTaxes}
    stateTaxes={[]}
    onEditFederalTaxes={onEditFederalTaxes}
    onEditStateTaxes={onEditStateTaxes}
  />
)

export const Empty = () => (
  <TaxesView onEditFederalTaxes={onEditFederalTaxes} onEditStateTaxes={onEditStateTaxes} />
)
