import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type { PayrollReceipt } from '@gusto/embedded-api/models/components/payrollreceipt'
import { PayrollReceipts } from './PayrollReceipts'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const sampleReceiptData: PayrollReceipt = {
  payrollUuid: 'payroll-uuid',
  companyUuid: 'company-123',
  nameOfSender: 'Capture Inc.',
  nameOfRecipient: 'Payroll Recipients',
  recipientNotice: 'Payroll recipients include the employees listed below.',
  debitDate: 'Sep 24, 2025',
  license: 'Licensed money transmitter.',
  totals: {
    netPayDebit: '20567.85',
    reimbursementDebit: '0.00',
    childSupportDebit: '0.00',
    taxDebit: '8647.83',
    companyDebit: '29155.68',
  },
  taxes: [],
  employeeCompensations: [],
  licensee: {
    name: 'Gusto, Zenpayroll Inc.',
    address: '525 20th St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    phoneNumber: '4157778888',
  },
}

vi.mock('@gusto/embedded-api/react-query/payrollsGetReceipt', () => ({
  usePayrollsGetReceiptSuspense: () => ({
    data: { payrollReceipt: sampleReceiptData },
  }),
}))

describe('PayrollReceipts', () => {
  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <PayrollReceipts payrollId="payroll-uuid" onEvent={vi.fn()} className="custom-class" />,
    )

    await screen.findByText('Capture Inc.')
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
