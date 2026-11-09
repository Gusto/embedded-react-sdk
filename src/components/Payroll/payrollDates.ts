import type { PayrollShow } from '@gusto/embedded-api/models/components/unprocessedpayroll'

type PayrollDisplayDates = {
  checkDate: PayrollShow['checkDate']
  submitBy: PayrollShow['payrollDeadline'] | string
}

/**
 * Resolves the displayed pay date and submit-by time for a payroll.
 *
 * @remarks
 * For unprocessed off-cycle payrolls, pairs the expected pay date with the expected
 * debit time, which the API constructs at the ACH cutoff hour. Otherwise uses the
 * stored check date and payroll deadline.
 *
 * @param payroll - The payroll being displayed.
 * @returns Expected dates for an unprocessed off-cycle payroll when both are available,
 * otherwise the stored check date and payroll deadline.
 * @internal
 */
export const getPayrollDisplayDates = (payroll: PayrollShow): PayrollDisplayDates => {
  const metadata = payroll.payrollStatusMeta

  if (
    payroll.offCycle &&
    !payroll.processed &&
    metadata?.expectedCheckDate &&
    metadata.expectedDebitTime
  ) {
    return {
      checkDate: metadata.expectedCheckDate,
      submitBy: metadata.expectedDebitTime,
    }
  }

  return { checkDate: payroll.checkDate, submitBy: payroll.payrollDeadline }
}
