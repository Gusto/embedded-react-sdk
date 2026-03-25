import { Suspense } from 'react'
import { expect, describe, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import type { PayrollReceipt } from '@gusto/embedded-api/models/components/payrollreceipt'
import { PayrollReceiptsPresentation } from './PayrollReceiptsPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const sampleReceiptData: PayrollReceipt = {
  payrollUuid: '781006e4-08f0-4bcb-b42a-5ec640f0e313',
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
  taxes: [
    { name: 'Federal Income Tax', amount: '3421.05' },
    { name: 'Social Security', amount: '3335.92' },
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

describe('PayrollReceiptsPresentation', () => {
  describe('mobile layout (default test breakpoint)', () => {
    it('renders employee breakdown footer with column labels', async () => {
      renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <PayrollReceiptsPresentation receiptData={sampleReceiptData} />
        </Suspense>,
      )

      await waitFor(() => {
        expect(screen.getByText('Hannah Arendt')).toBeInTheDocument()
      })

      const allDataCards = screen.getAllByTestId('data-cards')
      const employeeDataCards = allDataCards.find(el => el.textContent.includes('Hannah Arendt'))

      const footerItems = employeeDataCards?.querySelectorAll('[role="listitem"]') ?? []
      const footerCard = footerItems[footerItems.length - 1]

      expect(footerCard?.textContent).toContain('Child support')
      expect(footerCard?.textContent).toContain('Total taxes')
      expect(footerCard?.textContent).toContain('Net pay')
    })

    it('renders employee breakdown footer with reimbursement label when enabled', async () => {
      renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <PayrollReceiptsPresentation
            receiptData={{
              ...sampleReceiptData,
              totals: {
                ...sampleReceiptData.totals,
                reimbursementDebit: '500.00',
              },
              employeeCompensations: sampleReceiptData.employeeCompensations?.map((emp, index) =>
                index === 0 ? { ...emp, totalReimbursement: '500.00' } : emp,
              ),
            }}
            withReimbursements={true}
          />
        </Suspense>,
      )

      await waitFor(() => {
        expect(screen.getByText('Hannah Arendt')).toBeInTheDocument()
      })

      const allDataCards = screen.getAllByTestId('data-cards')
      const employeeDataCards = allDataCards.find(el => el.textContent.includes('Hannah Arendt'))

      const footerItems = employeeDataCards?.querySelectorAll('[role="listitem"]') ?? []
      const footerCard = footerItems[footerItems.length - 1]

      expect(footerCard?.textContent).toContain('Reimbursement')
      expect(footerCard?.textContent).toContain('Child support')
      expect(footerCard?.textContent).toContain('Total taxes')
      expect(footerCard?.textContent).toContain('Net pay')
    })
  })
})
