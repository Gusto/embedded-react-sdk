/* eslint-disable no-console */
import type { Contractor } from '@gusto/embedded-api-v-2026-06-15/models/components/contractor'
import { HistoricalPaymentSummary } from '../../../components/contractor/payments/HistoricalPaymentSummary/HistoricalPaymentSummary'
import {
  emptyPaymentFor,
  type ContractorOption,
  type HistoricalContractorPayment,
} from '../../../components/contractor/payments/types'
import type { PrototypeComponent } from '../../prototypeTypes'
import { ConfigurationHarness, SelectContractorsHarness } from './StateHarnesses'

export function toContractorOptions(contractors: Contractor[]): ContractorOption[] {
  return contractors
    .filter(c => c.isActive && c.onboarded)
    .map(c => ({
      id: c.uuid,
      name:
        c.type === 'Business'
          ? (c.businessName ?? '')
          : `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
      type: (c.type ?? 'Individual') as ContractorOption['type'],
      wageType: (c.wageType ?? 'Fixed') as ContractorOption['wageType'],
      hourlyRate: c.hourlyRate,
    }))
}

const mixedContractors: ContractorOption[] = [
  { id: 'c-1', name: 'Alex Kim', type: 'Individual', wageType: 'Hourly', hourlyRate: '45' },
  { id: 'c-2', name: 'Riley Chen', type: 'Individual', wageType: 'Fixed' },
  { id: 'c-3', name: 'Studio Bloom LLC', type: 'Business', wageType: 'Fixed' },
  { id: 'c-4', name: 'Jordan Patel', type: 'Individual', wageType: 'Hourly', hourlyRate: '60' },
]

const populatedPayments: HistoricalContractorPayment[] = [
  { contractorId: 'c-1', hours: '32', wage: '0', bonus: '100', reimbursement: '25' },
  { contractorId: 'c-2', hours: '0', wage: '2500', bonus: '0', reimbursement: '0' },
  { contractorId: 'c-3', hours: '0', wage: '1800', bonus: '0', reimbursement: '50' },
]

export const components: PrototypeComponent[] = [
  {
    slug: 'select-contractors',
    name: 'SelectContractors',
    description: 'Pick a paid date and which contractors are included in the payment group.',
    configurations: [
      {
        slug: 'populated',
        name: 'Mixed contractors',
        description: 'A handful of active contractors of mixed wage types.',
        render: () => <SelectContractorsHarness initialContractors={mixedContractors} />,
      },
      {
        slug: 'with-date',
        name: 'Date prefilled',
        description: 'The paid date is already set; ready to pick contractors.',
        render: () => (
          <SelectContractorsHarness
            initialContractors={mixedContractors}
            initialDate="2026-05-12"
          />
        ),
      },
      {
        slug: 'empty',
        name: 'No active contractors',
        description: 'Empty state when no contractors are available.',
        render: () => <SelectContractorsHarness initialContractors={[]} />,
      },
    ],
  },
  {
    slug: 'historical-payment-configuration',
    name: 'HistoricalPaymentConfiguration',
    description:
      'Enter hours, wages, bonuses, and reimbursements per contractor. Per-row edit modal.',
    configurations: [
      {
        slug: 'populated',
        name: 'Mixed wage types, partially filled',
        description: 'Three contractors selected with some values already entered.',
        render: () => (
          <ConfigurationHarness
            contractors={mixedContractors.slice(0, 3)}
            initialPayments={populatedPayments}
          />
        ),
      },
      {
        slug: 'all-empty',
        name: 'Empty rows',
        description: 'Selected contractors but no payment values entered yet.',
        render: () => (
          <ConfigurationHarness
            contractors={mixedContractors.slice(0, 3)}
            initialPayments={mixedContractors.slice(0, 3).map(emptyPaymentFor)}
          />
        ),
      },
      {
        slug: 'single-hourly',
        name: 'Single hourly contractor',
        description: 'One contractor, hourly — exercises the hours-only row layout.',
        render: () => (
          <ConfigurationHarness
            contractors={[mixedContractors[0]!]}
            initialPayments={[
              { contractorId: 'c-1', hours: '20', wage: '0', bonus: '50', reimbursement: '0' },
            ]}
          />
        ),
      },
    ],
  },
  {
    slug: 'historical-payment-summary',
    name: 'HistoricalPaymentSummary',
    description: 'Review and submit screen with the per-contractor table and totals breakdown.',
    configurations: [
      {
        slug: 'populated',
        name: 'Ready to submit',
        description: 'Three contractors with realistic amounts entered.',
        render: () => (
          <HistoricalPaymentSummary
            contractors={mixedContractors.slice(0, 3)}
            payments={populatedPayments}
            paidDate="2026-05-12"
            onSubmit={() => {
              console.log('submit historical payment')
            }}
          />
        ),
      },
      {
        slug: 'single-contractor',
        name: 'Single contractor',
        description: 'Just one row in the summary table.',
        render: () => (
          <HistoricalPaymentSummary
            contractors={[mixedContractors[1]!]}
            payments={[
              { contractorId: 'c-2', hours: '0', wage: '3000', bonus: '0', reimbursement: '100' },
            ]}
            paidDate="2026-04-30"
            onSubmit={() => {
              console.log('submit historical payment')
            }}
          />
        ),
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'Nothing to submit — empty state.',
        render: () => (
          <HistoricalPaymentSummary
            contractors={[]}
            payments={[]}
            paidDate="2026-05-12"
            onSubmit={() => {
              console.log('submit')
            }}
          />
        ),
      },
    ],
  },
]
