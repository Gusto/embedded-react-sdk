import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link PrintChecks}.
 *
 * @public
 */
export interface PrintChecksProps extends Omit<BaseComponentInterface<never>, 'onEvent'> {
  /** Identifier of the company that owns the payroll. */
  companyId: string
  /** Identifier of the payroll to generate printable checks for. */
  payrollId: string
  /** Callback invoked each time the component emits an event. */
  onEvent?: BaseComponentInterface['onEvent']
}
