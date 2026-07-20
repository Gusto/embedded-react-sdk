import type { PayrollReceipt } from '@gusto/embedded-api/models/components/payrollreceipt'
import { PayrollReceiptsPresentation } from './PayrollReceiptsPresentation'

export default {
  title: 'Domain/Payroll/PayrollReceipts',
}

const sampleReceiptData: PayrollReceipt = {
  payrollUuid: '781006e4-08f0-4bcb-b42a-5ec640f0e313',
  companyUuid: 'company-123',
  nameOfSender: 'Capture Inc.',
  nameOfRecipient: 'Payroll Recipients',
  recipientNotice:
    'Payroll recipients include the employees listed below plus the tax agencies for the taxes listed below.',
  debitDate: 'Sep 24, 2025',
  license:
    "ZenPayroll, Inc., dba Gusto is a licensed money transmitter. For more about Gusto's licenses and your state-specific rights to request information, submit complaints, dispute errors, or cancel transactions, visit our license page.",
  licenseUri: 'https://gusto.com/about/licenses',
  rightToRefund:
    'For information about your rights to request information, submit complaints, dispute errors, or cancel transactions, visit our license page.',
  liabilityOfLicensee: 'Gusto Inc. is liable for the performance of its licensed activities.',
  totals: {
    netPayDebit: '20567.85',
    reimbursementDebit: '0.00',
    childSupportDebit: '0.00',
    taxDebit: '8647.83',
    companyDebit: '29155.68',
  },
  taxes: [
    { name: 'Federal Income Tax', amount: '3421.05' },
    { name: 'Social Security', amount: '3335.92' },
    { name: 'Medicare', amount: '780.16' },
    { name: 'Additional Medicare', amount: '0.00' },
    { name: 'CA State Income Tax', amount: '1118.67' },
    { name: 'FUTA', amount: '28.52' },
    { name: 'CA SUI', amount: '161.62' },
    { name: 'CA ETT', amount: '4.76' },
    { name: 'CA SDI', amount: '332.84' },
  ],
  employeeCompensations: [
    {
      employeeUuid: 'emp-1',
      employeeFirstName: 'Hannah',
      employeeLastName: 'Arendt',
      paymentMethod: 'Direct Deposit',
      netPay: '2694.67',
      totalTax: '451.23',
      totalGarnishments: '0.00',
      childSupportGarnishment: '0.00',
      totalReimbursement: '0.00',
    },
    {
      employeeUuid: 'emp-2',
      employeeFirstName: 'Isaiah',
      employeeLastName: 'Berlin',
      paymentMethod: 'Direct Deposit',
      netPay: '180.75',
      totalTax: '30.25',
      totalGarnishments: '0.00',
      childSupportGarnishment: '0.00',
      totalReimbursement: '0.00',
    },
    {
      employeeUuid: 'emp-3',
      employeeFirstName: 'Ethan',
      employeeLastName: 'Caldwell',
      paymentMethod: 'Direct Deposit',
      netPay: '5209.83',
      totalTax: '871.64',
      totalGarnishments: '0.00',
      childSupportGarnishment: '0.00',
      totalReimbursement: '0.00',
    },
    {
      employeeUuid: 'emp-4',
      employeeFirstName: 'Naomi',
      employeeLastName: 'Carver',
      paymentMethod: 'Direct Deposit',
      netPay: '0.00',
      totalTax: '0.00',
      totalGarnishments: '0.00',
      childSupportGarnishment: '0.00',
      totalReimbursement: '0.00',
    },
  ],
  licensee: {
    name: 'Gusto, Zenpayroll Inc.',
    address: '525 20th St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    phoneNumber: '4157778888',
  },
}

export const Default = () => <PayrollReceiptsPresentation receiptData={sampleReceiptData} />

export const WithReimbursements = () => (
  <PayrollReceiptsPresentation
    receiptData={{
      ...sampleReceiptData,
      totals: {
        ...sampleReceiptData.totals!,
        reimbursementDebit: '500.00',
        companyDebit: '29655.68',
      },
      employeeCompensations: sampleReceiptData.employeeCompensations!.map((emp, index) =>
        index === 0 ? { ...emp, totalReimbursement: '500.00' } : emp,
      ),
    }}
  />
)

export const WithGarnishments = () => (
  <PayrollReceiptsPresentation
    receiptData={{
      ...sampleReceiptData,
      totals: {
        ...sampleReceiptData.totals!,
        childSupportDebit: '1200.00',
        companyDebit: '30355.68',
      },
      employeeCompensations: sampleReceiptData.employeeCompensations!.map((emp, index) =>
        index === 2
          ? { ...emp, childSupportGarnishment: '600.00', totalGarnishments: '600.00' }
          : index === 3
            ? { ...emp, childSupportGarnishment: '600.00', totalGarnishments: '600.00' }
            : emp,
      ),
    }}
  />
)

export const SmallPayroll = () => (
  <PayrollReceiptsPresentation
    receiptData={{
      payrollUuid: '123456789-abc-def-ghi-jklmnopqrst',
      companyUuid: 'company-small',
      nameOfSender: 'Small Business LLC',
      nameOfRecipient: 'Payroll Recipients',
      recipientNotice:
        'Payroll recipients include the employees listed below plus the tax agencies for the taxes listed below.',
      debitDate: 'Sep 15, 2025',
      license:
        "ZenPayroll, Inc., dba Gusto is a licensed money transmitter. For more about Gusto's licenses and your state-specific rights to request information, submit complaints, dispute errors, or cancel transactions, visit our license page.",
      licenseUri: 'https://gusto.com/about/licenses',
      rightToRefund:
        'For information about your rights to request information, submit complaints, dispute errors, or cancel transactions, visit our license page.',
      liabilityOfLicensee: 'Gusto Inc. is liable for the performance of its licensed activities.',
      totals: {
        netPayDebit: '7200.00',
        reimbursementDebit: '200.00',
        childSupportDebit: '0.00',
        taxDebit: '1100.00',
        companyDebit: '8500.00',
      },
      taxes: [
        { name: 'Federal Income Tax', amount: '600.00' },
        { name: 'Social Security', amount: '350.00' },
        { name: 'Medicare', amount: '150.00' },
      ],
      employeeCompensations: [
        {
          employeeUuid: 'emp-small-1',
          employeeFirstName: 'John',
          employeeLastName: 'Doe',
          paymentMethod: 'Direct Deposit',
          netPay: '2400.00',
          totalTax: '367.00',
          totalGarnishments: '0.00',
          childSupportGarnishment: '0.00',
          totalReimbursement: '200.00',
        },
        {
          employeeUuid: 'emp-small-2',
          employeeFirstName: 'Jane',
          employeeLastName: 'Smith',
          paymentMethod: 'Direct Deposit',
          netPay: '2400.00',
          totalTax: '367.00',
          totalGarnishments: '0.00',
          childSupportGarnishment: '0.00',
          totalReimbursement: '0.00',
        },
        {
          employeeUuid: 'emp-small-3',
          employeeFirstName: 'Bob',
          employeeLastName: 'Johnson',
          paymentMethod: 'Direct Deposit',
          netPay: '2400.00',
          totalTax: '366.00',
          totalGarnishments: '0.00',
          childSupportGarnishment: '0.00',
          totalReimbursement: '0.00',
        },
      ],
      licensee: {
        name: 'Gusto, Zenpayroll Inc.',
        address: '525 20th St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        phoneNumber: '4157778888',
      },
    }}
  />
)
