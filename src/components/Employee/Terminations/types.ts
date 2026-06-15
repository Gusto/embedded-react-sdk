/**
 * How an employee's final paycheck is processed during {@link TerminationFlow}.
 *
 * @remarks
 * - `dismissalPayroll` — Run a dismissal payroll. The most guided option: the
 *   employee's last regular payroll is swapped into a dismissal payroll with
 *   the termination date as the pay-period end and a default PTO payout
 *   recommendation. A termination created with this option cannot be cancelled.
 * - `regularPayroll` — Include the final pay in the next scheduled regular
 *   payroll. The termination can still be cancelled after the fact.
 * - `anotherWay` — Handle final pay outside of Gusto. Triggers the off-cycle
 *   payroll creation flow and removes the employee from unprocessed future
 *   payrolls. The termination can still be cancelled after the fact.
 *
 * @public
 */
export type PayrollOption = 'dismissalPayroll' | 'regularPayroll' | 'anotherWay'
