import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type { Payroll } from '@gusto/embedded-api/models/components/payrollshow'
import { OffCycleReasonType } from '@gusto/embedded-api/models/components/payrollshow'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import type { UseDateRangeFilterResult } from '@/hooks/useDateRangeFilter/useDateRangeFilter'

const mockRegularPayroll: Payroll = {
  payrollUuid: 'payroll-1',
  processed: true,
  checkDate: '2025-01-15',
  external: false,
  offCycle: false,
  payPeriod: {
    startDate: '2025-01-01',
    endDate: '2025-01-15',
    payScheduleUuid: 'schedule-1',
  },
  totals: { netPay: '2500.00', grossPay: '3200.00' },
}

// Tax reconciliation payrolls are created by Gusto, not run by the partner. They always come
// back processed with no pay period, but a real check date (SDK-1356).
const mockTaxReconciliationPayroll: Payroll = {
  payrollUuid: 'payroll-2',
  processed: true,
  checkDate: '2026-09-30',
  external: false,
  offCycle: true,
  offCycleReason: OffCycleReasonType.TaxReconciliation,
  payPeriod: undefined,
  totals: { netPay: '-26.00', grossPay: '0.00' },
}

const mockWireInRequests: WireInRequest[] = []

const mockDateRangeFilter: UseDateRangeFilterResult = {
  startDate: null,
  endDate: null,
  isModified: false,
  handleStartDateChange: vi.fn(),
  handleEndDateChange: vi.fn(),
  handleClearFilter: vi.fn(),
  getApiDateParams: () => ({}),
  getMaxEndDate: () => undefined,
  getMinStartDate: () => undefined,
}

const defaultProps = {
  wireInRequests: mockWireInRequests,
  pagination: {
    handleFirstPage: vi.fn(),
    handlePreviousPage: vi.fn(),
    handleNextPage: vi.fn(),
    handleLastPage: vi.fn(),
    handleItemsPerPageChange: vi.fn(),
    currentPage: 1,
    totalPages: 1,
  },
  onViewSummary: vi.fn(),
  onViewReceipt: vi.fn(),
  onCancelPayroll: vi.fn(),
  cancelDialogItem: null,
  onCancelDialogOpen: vi.fn(),
  onCancelDialogClose: vi.fn(),
  dateRangeFilter: mockDateRangeFilter,
}

describe('PayrollHistoryPresentation', () => {
  describe('tax reconciliation payrolls', () => {
    it('shows the check date in the pay period column instead of a blank cell', async () => {
      renderWithProviders(
        <PayrollHistoryPresentation
          {...defaultProps}
          payrollHistory={[mockTaxReconciliationPayroll]}
        />,
      )

      // Appears twice: the "Pay period" column falls back to it, and the "Pay date"
      // column already reads it directly.
      expect((await screen.findAllByText('Sep 30, 2026')).length).toBe(2)
    })

    it('labels the row as Tax Reconciliation', async () => {
      renderWithProviders(
        <PayrollHistoryPresentation
          {...defaultProps}
          payrollHistory={[mockTaxReconciliationPayroll]}
        />,
      )

      expect(await screen.findByText('Tax Reconciliation')).toBeInTheDocument()
    })

    it('shows the pay-period range for a regular payroll alongside a reconciliation row', async () => {
      renderWithProviders(
        <PayrollHistoryPresentation
          {...defaultProps}
          payrollHistory={[mockRegularPayroll, mockTaxReconciliationPayroll]}
        />,
      )

      expect(await screen.findByText('January 1–January 15, 2025')).toBeInTheDocument()
      expect(screen.getAllByText('Sep 30, 2026').length).toBe(2)
    })
  })
})
