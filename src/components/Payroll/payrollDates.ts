import type { PayrollShow } from '@gusto/embedded-api/models/components/unprocessedpayroll'

/**
 * Resolves the pay date and submission deadline displayed before payroll submission.
 *
 * @param payroll - The payroll being displayed.
 * @returns Expected dates for an unprocessed off-cycle payroll when both are available,
 * otherwise the stored check date and payroll deadline.
 * @internal
 */
export const getPayrollDisplayDates = (payroll: PayrollShow) => {
  const metadata = payroll.payrollStatusMeta

  if (
    payroll.offCycle &&
    !payroll.processed &&
    metadata?.expectedCheckDate &&
    metadata.expectedDebitTime
  ) {
    return {
      checkDate: metadata.expectedCheckDate,
      payrollDeadline: metadata.expectedDebitTime,
    }
  }

  return { checkDate: payroll.checkDate, payrollDeadline: payroll.payrollDeadline }
}
