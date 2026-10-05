import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorPaymentReceipt } from '@gusto/embedded-api/models/components/contractorpaymentreceipt'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { PaymentStatementPresentation } from './PaymentStatementPresentation'

export default {
  title: 'Domain/Contractor/Payments/PaymentStatement',
}

const sampleContractor: Contractor = {
  uuid: 'contractor-1',
  isActive: true,
  type: 'Individual',
  firstName: 'Jordan',
  lastName: 'Payee',
}

const sampleFundedPayment: ContractorPaymentForGroup = {
  uuid: 'payment-1',
  contractorUuid: 'contractor-1',
  wageType: 'Hourly',
  hourlyRate: '45.00',
  hours: '32',
  bonus: '200',
  reimbursement: '75',
  wageTotal: '1640.00',
  paymentMethod: 'Direct Deposit',
  status: 'Funded',
}

const sampleReceipt: ContractorPaymentReceipt = {
  contractorPaymentUuid: '781006e4-08f0-4bcb-b42a-5ec640f0e313',
  companyUuid: 'company-123',
  nameOfSender: 'Capture Inc.',
  nameOfRecipient: 'Jordan Payee',
  debitDate: new RFCDate('2025-09-24'),
  license:
    'Your payroll provider partners with Gusto Inc. for payments processing. Gusto Inc. is a licensed money transmitter. Learn more on our license page.',
  licenseUri: 'https://gusto.com/about/licenses',
  rightToRefund: 'https://gusto.com/about/licenses',
  liabilityOfLicensee: 'https://gusto.com/about/licenses',
  totals: { companyDebit: '1915.00' },
  licensee: {
    name: 'Gusto, Zenpayroll Inc.',
    address: '525 20th St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    phoneNumber: '4157778888',
  },
}

export const Default = () => (
  <PaymentStatementPresentation
    payment={sampleFundedPayment}
    contractor={sampleContractor}
    paymentReceipt={sampleReceipt}
    checkDate="2025-09-24"
  />
)

export const NoReceipt = () => (
  <PaymentStatementPresentation
    payment={{
      ...sampleFundedPayment,
      paymentMethod: 'Check',
      status: 'Unfunded',
    }}
    contractor={sampleContractor}
    checkDate="2025-09-24"
  />
)
