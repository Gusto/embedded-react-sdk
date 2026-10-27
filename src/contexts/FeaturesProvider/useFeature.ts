import { createContext, useContext } from 'react'

/**
 * Opt-out flags for released SDK functionality.
 *
 * @remarks
 * Pass to {@link GustoProvider} via the `features` prop. Every flag defaults to enabled when
 * omitted; set a flag to `false` to opt out and keep the behavior that preceded it. The
 * functionality behind each flag is ready for production use. Flags are temporary: each one is
 * removed in a future release, after which its functionality can no longer be turned off.
 *
 * @public
 * @page providers
 */
export interface Features {
  /**
   * Regular rate of pay (RRoP) support: per-workweek overtime in payroll editing, and the pay
   * schedule workweek start day it depends on.
   *
   * When `true`, `Payroll.PayrollEditEmployee` renders the RRoP editor, where adding overtime for an
   * overtime-eligible employee on a multi-workweek payroll splits hours and overtime-affecting
   * earnings into one column per workweek. `Payroll.PayrollConfiguration` shows each employee's
   * total pay as the gross pay returned by the API. `usePayScheduleForm` exposes
   * `Fields.WorkweekStartDay` and submits `workweekStartDay`, so the pay schedule forms in
   * `CompanyOnboarding.PaySchedule` and `CompanyManagement.PaySchedule` show the field.
   *
   * When `false`, `Payroll.PayrollEditEmployee` renders the previous editor, which edits total hours
   * for the whole pay period and sends no per-workweek breakdowns. `Payroll.PayrollConfiguration`
   * estimates total pay from hours and pay rates. `Fields.WorkweekStartDay` is `undefined` and
   * `workweekStartDay` is not submitted.
   *
   * Every flow that renders these screens follows the flag, including `Payroll.PayrollFlow`,
   * `Payroll.PayrollExecutionFlow`, `Payroll.OffCycleFlow`, `Payroll.DismissalFlow`,
   * `Payroll.TransitionFlow`, `Payroll.TransitionPayroll`, and `CompanyOnboarding.OnboardingFlow`.
   *
   * @defaultValue `true`
   */
  regularRateOfPay?: boolean
}

/**
 * React context backing {@link useFeature}.
 *
 * @internal
 */
export const FeaturesContext = createContext<Features>({})

/**
 * Reads whether `feature` is enabled via {@link GustoProvider}'s `features` prop.
 *
 * @remarks
 * Only an explicit `false` disables a flag, so omitting it — or rendering outside a
 * `GustoProvider` — leaves the functionality on.
 *
 * @param feature - The {@link Features} flag to read.
 * @returns `false` when `feature` is explicitly set to `false`, otherwise `true`.
 * @internal
 */
export const useFeature = (feature: keyof Features): boolean => {
  const features = useContext(FeaturesContext)
  return features[feature] !== false
}
