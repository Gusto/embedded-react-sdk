import { fn } from 'storybook/test'
import { FormProvider, useForm } from 'react-hook-form'
import type { TaxRequirementsState } from '@gusto/embedded-api/models/components/taxrequirementsstate'
import { StateTaxesFormPresentation } from './StateTaxesFormPresentation'

export default {
  title: 'Domain/Company/StateTax/StateTaxesForm',
}

const mockGeorgiaTaxRequirements: TaxRequirementsState = {
  companyUuid: 'company-123',
  state: 'GA',
  requirementSets: [
    {
      state: 'GA',
      key: 'registrations',
      label: 'Registrations',
      effectiveFrom: null,
      requirements: [
        {
          key: 'withholding-number',
          applicableIf: [],
          label: 'Withholding Number',
          description:
            'Find your withholding number on notices received from the Georgia Department of Revenue.',
          value: '1233214-AB',
          metadata: { type: 'text' },
        },
        {
          key: 'dol-account-number',
          applicableIf: [],
          label: 'DOL Account Number',
          description:
            'Find your DOL account number on notices received from the Georgia Department of Labor.',
          value: '474747-88',
          metadata: { type: 'text' },
        },
      ],
    },
    {
      state: 'GA',
      key: 'taxrates',
      label: 'Tax Rates',
      effectiveFrom: '2024-01-01',
      requirements: [
        {
          key: 'total-tax-rate',
          applicableIf: [],
          label: 'Total Tax Rate',
          description:
            "Enter your assigned SUI rate. Haven't received it yet? Use the new employer rate.",
          value: '0.05',
          metadata: {
            type: 'tax_rate',
            validation: { type: 'min_max', min: '0.0004', max: '0.081' },
          },
        },
      ],
    },
    {
      state: 'GA',
      key: 'depositschedules',
      label: 'Deposit Schedules',
      effectiveFrom: '2024-01-01',
      requirements: [
        {
          key: 'deposit-schedule',
          applicableIf: [],
          label: 'Deposit Schedule',
          description: 'Select your deposit schedule as assigned by the Georgia Dept. of Revenue.',
          value: 'Semi-weekly',
          metadata: {
            type: 'select',
            options: [
              { label: 'Semiweekly', value: 'Semi-weekly' },
              { label: 'Monthly', value: 'Monthly' },
              { label: 'Quarterly', value: 'Quarterly' },
            ],
          },
        },
      ],
    },
  ],
}

const mockWashingtonTaxRequirements: TaxRequirementsState = {
  companyUuid: 'company-123',
  state: 'WA',
  requirementSets: [
    {
      state: 'WA',
      key: 'registrations',
      label: 'Registrations',
      effectiveFrom: null,
      requirements: [
        {
          key: 'ubi',
          applicableIf: [],
          label: 'Unified Business ID',
          description: 'Your Washington Unified Business ID number.',
          value: '',
          metadata: { type: 'text' },
        },
        {
          key: 'pac',
          applicableIf: [],
          label: 'Participation Activation Code',
          description: 'Code received from Washington state.',
          value: '',
          metadata: { type: 'text' },
        },
      ],
    },
    {
      state: 'WA',
      key: 'taxrates',
      label: 'Tax Rates',
      effectiveFrom: '2024-01-01',
      requirements: [
        {
          key: 'sui-rate',
          applicableIf: [],
          label: 'Unemployment Insurance Rate',
          description: 'Your assigned SUI rate from Washington.',
          value: '',
          metadata: {
            type: 'percent',
          },
        },
      ],
    },
    {
      state: 'WA',
      key: 'workers_comp',
      label: "Workers' Compensation",
      effectiveFrom: '2024-01-01',
      requirements: [
        {
          key: 'hourly-rate',
          applicableIf: [],
          label: 'Hourly Rate',
          description: 'Workers compensation hourly rate.',
          value: '',
          metadata: {
            type: 'workers_compensation_rate',
            rateType: 'currency_per_hour',
            riskClassCode: '6204',
            riskClassDescription: 'Computer Programming',
          },
        },
        {
          key: 'employee-withholding',
          applicableIf: [],
          label: 'Employee Withholding',
          description: 'Employee portion of workers compensation.',
          value: '',
          metadata: {
            type: 'workers_compensation_rate',
            rateType: 'percent',
            riskClassCode: '6204',
            riskClassDescription: 'Computer Programming',
          },
        },
      ],
    },
  ],
}

const emptyTaxRequirements: TaxRequirementsState = {
  companyUuid: 'company-123',
  state: 'CA',
  requirementSets: [],
}

function FormWrapper({
  children,
  taxRequirements,
}: {
  children: React.ReactNode
  taxRequirements: TaxRequirementsState
}) {
  const defaultValues: Record<string, Record<string, string | boolean | number>> = {}
  taxRequirements.requirementSets?.forEach(set => {
    if (!set.key) return
    const values: Record<string, string | boolean | number> = {}
    set.requirements?.forEach(req => {
      if (!req.key) return
      if (req.metadata?.type === 'radio') {
        values[req.key] = typeof req.value === 'boolean' ? req.value : false
      } else {
        values[req.key] = req.value ? String(req.value) : ''
      }
    })
    defaultValues[set.key] = values
  })

  const methods = useForm({ defaultValues })

  return <FormProvider {...methods}>{children}</FormProvider>
}

export const Georgia = () => (
  <FormWrapper taxRequirements={mockGeorgiaTaxRequirements}>
    <StateTaxesFormPresentation
      stateTaxRequirements={mockGeorgiaTaxRequirements}
      isPending={false}
      state="GA"
      handleCancel={fn().mockName('handleCancel')}
    />
  </FormWrapper>
)

export const Washington = () => (
  <FormWrapper taxRequirements={mockWashingtonTaxRequirements}>
    <StateTaxesFormPresentation
      stateTaxRequirements={mockWashingtonTaxRequirements}
      isPending={false}
      state="WA"
      handleCancel={fn().mockName('handleCancel')}
    />
  </FormWrapper>
)

export const Submitting = () => (
  <FormWrapper taxRequirements={mockGeorgiaTaxRequirements}>
    <StateTaxesFormPresentation
      stateTaxRequirements={mockGeorgiaTaxRequirements}
      isPending={true}
      state="GA"
      handleCancel={fn().mockName('handleCancel')}
    />
  </FormWrapper>
)

export const EmptyRequirements = () => (
  <FormWrapper taxRequirements={emptyTaxRequirements}>
    <StateTaxesFormPresentation
      stateTaxRequirements={emptyTaxRequirements}
      isPending={false}
      state="CA"
      handleCancel={fn().mockName('handleCancel')}
    />
  </FormWrapper>
)
