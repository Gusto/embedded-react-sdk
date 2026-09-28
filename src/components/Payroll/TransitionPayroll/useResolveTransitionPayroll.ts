import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'

const FUTURE_LOOKAHEAD_DAYS = 28

const TRANSITION_OFF_CYCLE_REASON = 'Transition from old pay schedule'

function getFutureEndDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + FUTURE_LOOKAHEAD_DAYS)
  return date.toISOString().split('T')[0]!
}

/**
 * Arguments describing the transition pay period to resolve.
 *
 * @internal
 */
export interface ResolveTransitionPayrollArgs {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
}

/**
 * Looks up an existing unprocessed transition payroll for the given pay period.
 *
 * @remarks
 * A transition payroll is an unprocessed off-cycle payroll whose `offCycleReason` is
 * `"Transition from old pay schedule"` and whose pay period matches the supplied
 * `startDate`, `endDate`, and `payScheduleUuid`. When the company changed its pay schedule
 * the platform creates exactly one such payroll for the coverage gap; this hook finds it so
 * the caller can resume it instead of creating a duplicate.
 *
 * Backed by a suspense query, so callers must render it under a suspense boundary.
 *
 * @param args - The pay period to match. See {@link ResolveTransitionPayrollArgs}.
 * @returns The matching payroll's UUID, or `undefined` when none exists yet.
 * @internal
 */
export function useResolveTransitionPayroll({
  companyId,
  startDate,
  endDate,
  payScheduleUuid,
}: ResolveTransitionPayrollArgs): string | undefined {
  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
    endDate: getFutureEndDate(),
    payrollTypes: [
      QueryParamPayrollTypes.Regular,
      QueryParamPayrollTypes.OffCycle,
      QueryParamPayrollTypes.External,
    ],
  })

  const match = payrollsData.payrollList?.find(payroll => {
    const period = payroll.payPeriod
    return (
      payroll.offCycleReason === TRANSITION_OFF_CYCLE_REASON &&
      period?.startDate === startDate &&
      period.endDate === endDate &&
      period.payScheduleUuid === payScheduleUuid
    )
  })

  return match?.payrollUuid
}
