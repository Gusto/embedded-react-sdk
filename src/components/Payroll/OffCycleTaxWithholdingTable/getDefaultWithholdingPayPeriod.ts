import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'

/**
 * Resolves a withholding frequency, defaulting to every other week when it is absent.
 *
 * @param frequency - The saved payroll frequency or selected pay schedule frequency.
 * @returns The frequency to use when initializing withholding settings.
 * @internal
 */
export function getDefaultWithholdingPayPeriod(
  frequency: WithholdingPayPeriod | null | undefined,
): WithholdingPayPeriod {
  return frequency ?? WithholdingPayPeriod.EveryOtherWeek
}
