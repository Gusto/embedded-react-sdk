import { fn } from 'storybook/test'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'
import { TaxPaymentDetailPresentation } from './TaxPaymentDetailPresentation'

export default {
  title: 'Domain/Payroll/TaxPayments/TaxPaymentDetail',
}

const payment: TaxPayment = {
  uuid: 'tax-payment-1',
  companyUuid: 'company-1',
  agencyName: 'Internal Revenue Service',
  jurisdiction: 'US',
  periodStart: new RFCDate('2026-09-01'),
  periodEnd: new RFCDate('2026-09-30'),
  dueDate: new RFCDate('2026-10-15'),
  paymentSentOn: null,
  amount: '14661.36',
  amountPaid: '0.00',
  lineItems: [
    { payrollUuid: 'payroll-1', uniqueTaxId: '00-000-0000-FIT-000', amount: '2980.27' },
    { payrollUuid: 'payroll-1', uniqueTaxId: '00-000-0000-FICA-000', amount: '1762.91' },
    { payrollUuid: 'payroll-2', uniqueTaxId: '00-000-0000-FIT-000', amount: '2980.27' },
    { payrollUuid: 'payroll-2', uniqueTaxId: '00-000-0000-FICA-000', amount: '1762.90' },
  ],
}

const payPeriodsByPayrollId = {
  'payroll-1': { startDate: '2026-08-22', endDate: '2026-09-04' },
  'payroll-2': { startDate: '2026-09-05', endDate: '2026-09-18' },
}

export const Scheduled = () => (
  <TaxPaymentDetailPresentation
    payment={payment}
    status="scheduled"
    payPeriodsByPayrollId={payPeriodsByPayrollId}
    onBack={fn().mockName('onBack')}
  />
)

export const Overdue = () => (
  <TaxPaymentDetailPresentation
    payment={{ ...payment, dueDate: new RFCDate('2026-09-15') }}
    status="overdue"
    payPeriodsByPayrollId={payPeriodsByPayrollId}
    onBack={fn().mockName('onBack')}
  />
)

export const Paid = () => (
  <TaxPaymentDetailPresentation
    payment={{ ...payment, paymentSentOn: new RFCDate('2026-10-14'), amountPaid: payment.amount }}
    status="paid"
    payPeriodsByPayrollId={payPeriodsByPayrollId}
    onBack={fn().mockName('onBack')}
  />
)

export const NoLiabilities = () => (
  <TaxPaymentDetailPresentation
    payment={{ ...payment, jurisdiction: 'CA', lineItems: [] }}
    status="scheduled"
    payPeriodsByPayrollId={{}}
    onBack={fn().mockName('onBack')}
  />
)
