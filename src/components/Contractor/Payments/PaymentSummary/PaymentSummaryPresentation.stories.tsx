import { fn } from 'storybook/test'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { PaymentSummaryPresentation } from './PaymentSummaryPresentation'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

export default {
  title: 'Domain/Contractor/Payments/PaymentSummary',
}

const mockContractors: Contractor[] = [
  {
    uuid: 'contractor-1',
    firstName: 'John',
    lastName: 'Doe',
    type: 'Individual',
    wageType: 'Hourly',
    hourlyRate: '50.00',
    isActive: true,
    paymentMethod: 'Direct Deposit',
    onboardingStatus: 'onboarding_completed',
  },
  {
    uuid: 'contractor-2',
    firstName: 'Jane',
    lastName: 'Smith',
    type: 'Individual',
    wageType: 'Fixed',
    isActive: true,
    paymentMethod: 'Check',
    onboardingStatus: 'onboarding_completed',
  },
  {
    uuid: 'contractor-3',
    businessName: 'Acme Consulting LLC',
    type: 'Business',
    wageType: 'Fixed',
    isActive: true,
    paymentMethod: 'Direct Deposit',
    onboardingStatus: 'onboarding_completed',
  },
]

const mockContractorPaymentGroup: ContractorPaymentGroup = {
  uuid: 'group-1',
  companyUuid: 'company-123',
  checkDate: '2025-04-15',
  debitDate: '2025-04-13',
  status: 'Funded',
  totals: {
    amount: '10725.00',
    debitAmount: '10725.00',
  },
  contractorPayments: [
    {
      uuid: 'payment-1',
      contractorUuid: 'contractor-1',
      paymentMethod: 'Direct Deposit',
      wageType: 'Hourly',
      hourlyRate: '50.00',
      hours: '40',
      wage: '2000',
      bonus: '100',
      reimbursement: '50',
      wageTotal: '2150.00',
    },
    {
      uuid: 'payment-2',
      contractorUuid: 'contractor-2',
      paymentMethod: 'Check',
      wageType: 'Fixed',
      wage: '2500',
      bonus: '0',
      reimbursement: '75',
      wageTotal: '2575.00',
    },
    {
      uuid: 'payment-3',
      contractorUuid: 'contractor-3',
      paymentMethod: 'Direct Deposit',
      wageType: 'Fixed',
      wage: '5000',
      bonus: '500',
      reimbursement: '0',
      wageTotal: '5500.00',
    },
  ],
}

const mockBankAccount = {
  uuid: 'bank-1',
  hiddenAccountNumber: '****1234',
  routingNumber: '121000358',
  verificationType: 'bank_deposits' as const,
}

const defaultProps = {
  companyId: 'company-123',
  onEvent: fn().mockName('onEvent'),
  onDone: fn().mockName('onDone'),
}

export const Default = () => (
  <GustoTestProvider>
    <PaymentSummaryPresentation
      {...defaultProps}
      contractorPaymentGroup={mockContractorPaymentGroup}
      contractors={mockContractors}
      bankAccount={mockBankAccount}
    />
  </GustoTestProvider>
)

export const SingleContractor = () => {
  const singlePaymentGroup: ContractorPaymentGroup = {
    ...mockContractorPaymentGroup,
    totals: { amount: '2150.00', debitAmount: '2150.00' },
    contractorPayments: [mockContractorPaymentGroup.contractorPayments![0]!],
  }

  return (
    <GustoTestProvider>
      <PaymentSummaryPresentation
        {...defaultProps}
        contractorPaymentGroup={singlePaymentGroup}
        contractors={mockContractors}
        bankAccount={mockBankAccount}
      />
    </GustoTestProvider>
  )
}

export const NoContractorPayments = () => {
  const emptyPaymentGroup: ContractorPaymentGroup = {
    ...mockContractorPaymentGroup,
    totals: { amount: '0', debitAmount: '0' },
    contractorPayments: [],
  }

  return (
    <GustoTestProvider>
      <PaymentSummaryPresentation
        {...defaultProps}
        contractorPaymentGroup={emptyPaymentGroup}
        contractors={[]}
      />
    </GustoTestProvider>
  )
}

export const NoBankAccount = () => (
  <GustoTestProvider>
    <PaymentSummaryPresentation
      {...defaultProps}
      contractorPaymentGroup={mockContractorPaymentGroup}
      contractors={mockContractors}
    />
  </GustoTestProvider>
)

export const WithAlerts = () => (
  <GustoTestProvider>
    <PaymentSummaryPresentation
      {...defaultProps}
      contractorPaymentGroup={mockContractorPaymentGroup}
      contractors={mockContractors}
      bankAccount={mockBankAccount}
      alerts={[
        {
          type: 'success',
          title: 'wireDetailsSubmitted',
          content: 'wireDetailsSubmitted',
        },
      ]}
    />
  </GustoTestProvider>
)
