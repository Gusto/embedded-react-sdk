import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { EarningTypeList } from '@gusto/embedded-api/models/components/earningtypelist'
import {
  PayrollUpdatePaymentMethod,
  type PayrollUpdateEmployeeCompensations,
} from '@gusto/embedded-api/models/components/payrollupdate'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type {
  PayrollEditEmployeeFormData,
  PayrollEditEmployeeFormOutputs,
} from './payrollEditEmployeeSchema'
import { PayrollCategory, isOffCyclePayroll } from '@/components/Payroll/payrollTypes'
import { cleanupReimbursements } from '@/components/Payroll/helpers'
import { SDKInternalError } from '@/types/sdkError'

/**
 * Internal normalized form of a workweek: the API exposes
 * `{ startDate?: RFCDate; endDate?: RFCDate }`, but the hook keys week-maps by
 * `YYYY-MM-DD` strings and builds breakdowns from them, so both boundaries are
 * required strings here. Not part of the public surface — partners read the raw
 * workweeks off `data.preparedPayroll.workweeks` (the API type).
 *
 * @internal
 */
export interface NormalizedWorkweek {
  startDate: string
  endDate: string
}

/**
 * Normalizes the prepared payroll's top-level `workweeks` into
 * {@link NormalizedWorkweek} boundary strings, falling back to a single
 * pay-period-spanning workweek when the API returns no workweek boundaries.
 *
 * @param workweeks - The prepared payroll's top-level `workweeks` (RFCDate boundaries), possibly `null`.
 * @param payPeriod - The prepared payroll's `payPeriod`, used as the single-workweek fallback.
 * @returns One entry per workweek; a single entry spanning the pay period when none are supplied.
 * @throws SDKInternalError when neither workweeks nor a pay period are present (a malformed prepared payroll).
 * @internal
 */
export function normalizeWorkweeks(
  workweeks: Array<{ startDate?: RFCDate; endDate?: RFCDate }> | null | undefined,
  payPeriod: { startDate?: string; endDate?: string } | undefined,
): NormalizedWorkweek[] {
  const normalized = (workweeks ?? []).flatMap(week =>
    week.startDate && week.endDate
      ? [{ startDate: week.startDate.toString(), endDate: week.endDate.toString() }]
      : [],
  )

  if (normalized.length > 0) {
    return normalized
  }

  if (payPeriod?.startDate && payPeriod.endDate) {
    return [{ startDate: payPeriod.startDate, endDate: payPeriod.endDate }]
  }

  // A prepared payroll always carries a pay period, so reaching here means the
  // response was malformed. Fail loud rather than build an empty, mis-keyed form
  // that could submit an employee's pay against a blank workweek.
  throw new SDKInternalError('Prepared payroll has no workweeks or pay period to derive from')
}

/**
 * Collects the names of earning types included in the regular-rate-of-pay
 * overtime calculation. These earnings render in the workweek-breakdown
 * additional-earnings section; all others fall into the flat `other` section.
 *
 * @param earningTypeList - The company's default and custom earning types.
 * @returns A set of earning-type names with `includedInOvertimePay` set.
 * @internal
 */
export function collectOvertimeEarningNames(
  earningTypeList: EarningTypeList | undefined,
): Set<string> {
  const names = new Set<string>()
  for (const earningType of [
    ...(earningTypeList?.default ?? []),
    ...(earningTypeList?.custom ?? []),
  ]) {
    if (earningType.name && earningType.includedInOvertimePay) {
      names.add(earningType.name)
    }
  }
  return names
}

/**
 * Trims an API decimal string (e.g. `"40.000"`, `"500.00"`) to a clean editable
 * value (`"40"`, `"500"`), preserving real fractional parts (`"40.5"`). A blank
 * or non-numeric value returns `''` (meaning "not provided").
 */
function formatAmountInput(value: string | null | undefined): string {
  if (value == null || value === '') return ''
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? '' : parsed.toString()
}

function buildWeekMap(
  workweeks: NormalizedWorkweek[],
  total: string | undefined,
  breakdowns: Array<{ startDate?: RFCDate; hours?: string; amount?: string }> | undefined,
  isSplit: boolean,
): Record<string, string> {
  const weekMap: Record<string, string> = {}

  // When the line is not split by workweek (single-workweek, or an
  // overtime-ineligible employee), it renders as one flat input bound to the
  // first workweek — seed the total there. When it is split, seed each week from
  // its breakdown, leaving cells blank (not zero) when there is no per-workweek
  // value: blank means "not provided", so submit resends the original total.
  workweeks.forEach((workweek, index) => {
    if (!isSplit) {
      weekMap[workweek.startDate] = index === 0 ? formatAmountInput(total) : ''
      return
    }
    const breakdown = breakdowns?.find(entry => entry.startDate?.toString() === workweek.startDate)
    weekMap[workweek.startDate] = formatAmountInput(breakdown?.hours ?? breakdown?.amount)
  })

  return weekMap
}

/**
 * Derives the form's default values from the employee's prepared compensation.
 *
 * @remarks
 * Hourly and additional earnings are expanded into per-workweek maps from each
 * compensation's `breakdowns` (or its total for the single-workweek case). Time
 * off, final payout, reimbursements, and payment method are read straight off
 * the compensation.
 *
 * @param employeeCompensation - The employee's prepared compensation, if loaded.
 * @param workweeks - Normalized workweeks for the pay period.
 * @returns Default {@link PayrollEditEmployeeFormData} for `useForm`.
 * @internal
 */
export function derivePayrollEditEmployeeDefaults(
  employeeCompensation: PayrollEmployeeCompensationsType | undefined,
  workweeks: NormalizedWorkweek[],
  hasDirectDepositSetup: boolean,
  overtimeEarningNames: Set<string>,
  isOvertimeEligible: boolean,
): PayrollEditEmployeeFormData {
  // Only overtime-eligible employees split hours/earnings by workweek; everyone
  // else renders (and seeds) flat, even on a multi-workweek payroll.
  const isSplit = workweeks.length > 1 && isOvertimeEligible

  const hours: PayrollEditEmployeeFormData['hours'] = {}
  for (const compensation of employeeCompensation?.hourlyCompensations ?? []) {
    if (!compensation.jobUuid || !compensation.name) continue
    const jobHours = (hours[compensation.jobUuid] ??= {})
    jobHours[compensation.name] = buildWeekMap(
      workweeks,
      compensation.hours,
      compensation.breakdowns,
      isSplit,
    )
  }

  // Earnings whose earning type is included in the regular-rate-of-pay overtime
  // calculation stay workweek-breakdown; the rest are flat and land in `other`.
  // The hook owns this bucketing so the UI just renders each section.
  const additionalEarnings: PayrollEditEmployeeFormData['additionalEarnings'] = {}
  const other: PayrollEditEmployeeFormData['other'] = {}
  for (const compensation of employeeCompensation?.fixedCompensations ?? []) {
    if (!compensation.jobUuid || !compensation.name) continue
    if (overtimeEarningNames.has(compensation.name)) {
      const jobEarnings = (additionalEarnings[compensation.jobUuid] ??= {})
      jobEarnings[compensation.name] = buildWeekMap(
        workweeks,
        compensation.amount,
        compensation.breakdowns,
        isSplit,
      )
    } else {
      const jobOther = (other[compensation.jobUuid] ??= {})
      jobOther[compensation.name] = formatAmountInput(compensation.amount)
    }
  }

  const timeOff: PayrollEditEmployeeFormData['timeOff'] = {}
  const finalPayout: PayrollEditEmployeeFormData['finalPayout'] = {}
  for (const entry of employeeCompensation?.paidTimeOff ?? []) {
    if (!entry.name) continue
    timeOff[entry.name] = formatAmountInput(entry.hours)
    finalPayout[entry.name] = formatAmountInput(entry.finalPayoutUnusedHoursInput)
  }

  const reimbursements: PayrollEditEmployeeFormData['reimbursements'] = (
    employeeCompensation?.reimbursements ?? []
  ).map(reimbursement => ({
    uuid: reimbursement.uuid ?? null,
    description: reimbursement.description ?? '',
    amount: reimbursement.amount,
    recurring: reimbursement.recurring ?? false,
  }))

  return {
    hours,
    additionalEarnings,
    other,
    timeOff,
    finalPayout,
    reimbursements,
    paymentMethod: resolvePaymentMethod(employeeCompensation?.paymentMethod, hasDirectDepositSetup),
  }
}

/**
 * Resolves the default payment method, mirroring the stable component (#2683):
 * an employee with no direct deposit set up defaults to (and is forced to)
 * `Check`, even when the prepared payroll carried `Direct Deposit` or nothing.
 * `Historical` is treated as unset. The result is always `Direct Deposit` or
 * `Check` — never `Historical` — since those are the only values the update
 * endpoint accepts.
 */
function resolvePaymentMethod(
  paymentMethod: string | null | undefined,
  hasDirectDepositSetup: boolean,
): PayrollUpdatePaymentMethod {
  if (paymentMethod === PayrollUpdatePaymentMethod.Check) return PayrollUpdatePaymentMethod.Check
  if (paymentMethod === PayrollUpdatePaymentMethod.DirectDeposit && hasDirectDepositSetup) {
    return PayrollUpdatePaymentMethod.DirectDeposit
  }
  return hasDirectDepositSetup
    ? PayrollUpdatePaymentMethod.DirectDeposit
    : PayrollUpdatePaymentMethod.Check
}

function originalTotals<T extends { jobUuid?: string; name?: string }>(
  compensations: T[] | undefined,
  selectTotal: (compensation: T) => string | null | undefined,
): Map<string, string> {
  const totals = new Map<string, string>()
  for (const compensation of compensations ?? []) {
    if (!compensation.jobUuid || !compensation.name) continue
    totals.set(`${compensation.jobUuid}|${compensation.name}`, selectTotal(compensation) ?? '')
  }
  return totals
}

// Precision of the per-workweek values being summed: dollar amounts carry cents,
// hours up to six places.
const AMOUNT_DECIMALS = 2
const HOURS_DECIMALS = 6

/**
 * Sums per-workweek input values in integer minor units, then scales back.
 *
 * @remarks
 * Each value is already bounded to `decimals` places, so scaling it to an
 * integer (cents for amounts, millionths for hours) and summing those integers
 * is exact. Float-accumulating the decimals directly and rounding at the end
 * would instead leak binary error into the wire value (e.g. `0.1 + 0.2` →
 * `"0.30000000000000004"`), which the payroll API should never receive.
 */
function sumWeekValues(
  weekMap: Record<string, string>,
  workweeks: NormalizedWorkweek[],
  decimals: number,
): string {
  const factor = 10 ** decimals
  const totalMinorUnits = workweeks.reduce((total, workweek) => {
    const value = parseFloat(weekMap[workweek.startDate] ?? '0') || 0
    return total + Math.round(value * factor)
  }, 0)
  return String(totalMinorUnits / factor)
}

/**
 * Builds the `PayrollUpdate` employee-compensation payload from form values.
 *
 * @remarks
 * When the pay period spans a single workweek, totals are sent without
 * `breakdowns`. When it spans multiple workweeks, each hourly and additional
 * earning carries `breakdowns` tiling every workweek exactly (no gaps or
 * overlaps), with the total equal to the sum of the per-workweek values.
 *
 * @param formData - Current parsed form values.
 * @param employeeCompensation - The prepared compensation, for identifying metadata (`version`, `employeeUuid`).
 * @param workweeks - Normalized workweeks for the pay period.
 * @param payrollCategory - The payroll category, gating itemized vs. off-cycle reimbursements.
 * @returns The employee-compensation entry for the `PayrollUpdate` request body.
 * @internal
 */
export function buildPayrollUpdateEmployeeCompensation(
  formData: PayrollEditEmployeeFormOutputs,
  employeeCompensation: PayrollEmployeeCompensationsType | undefined,
  workweeks: NormalizedWorkweek[],
  payrollCategory: PayrollCategory,
  isOvertimeEligible: boolean,
): PayrollUpdateEmployeeCompensations {
  // Breakdowns are emitted only when the line is actually split by workweek:
  // multiple workweeks AND an overtime-eligible employee. This must match the
  // field builder's gate so what renders and what submits never drift.
  const isSplit = workweeks.length > 1 && isOvertimeEligible
  const hasValue = (value: string | undefined) => value != null && value !== ''
  const originalHours = originalTotals(
    employeeCompensation?.hourlyCompensations,
    comp => comp.hours,
  )
  const originalAmounts = originalTotals(
    employeeCompensation?.fixedCompensations,
    comp => comp.amount,
  )

  // The API requires per-job all-or-nothing breakdowns that tile every workweek.
  // So the split decision is per JOB: a job "activates" as soon as the user enters
  // any value in any of its cells. Once active, every line emits breakdowns for
  // every week (an entered cell keeps its value, a blank cell becomes 0), which
  // satisfies the all-or-nothing rule and persists partial entries. A fully
  // untouched job (no cell entered) sends totals only with no breakdowns, so an
  // unedited multi-workweek Save never zeroes anyone's pay.
  const isJobActive = (names: Record<string, Record<string, string>>) =>
    isSplit &&
    Object.values(names).some(weekMap =>
      workweeks.some(workweek => hasValue(weekMap[workweek.startDate])),
    )
  const weekValue = (weekMap: Record<string, string>, startDate: string) =>
    hasValue(weekMap[startDate]) ? weekMap[startDate]! : '0'
  const flatTotal = (jobUuid: string, name: string, weekMap: Record<string, string>) => {
    const single = isSplit ? undefined : weekMap[workweeks[0]?.startDate ?? '']
    return hasValue(single) ? single! : (originalHours.get(`${jobUuid}|${name}`) ?? '0')
  }

  const hourlyCompensations = Object.entries(formData.hours).flatMap(([jobUuid, names]) => {
    const jobActive = isJobActive(names)
    return Object.entries(names).map(([name, weekMap]) =>
      jobActive
        ? {
            jobUuid,
            name,
            hours: sumWeekValues(weekMap, workweeks, HOURS_DECIMALS),
            breakdowns: workweeks.map(workweek => ({
              startDate: new RFCDate(workweek.startDate),
              endDate: new RFCDate(workweek.endDate),
              hours: weekValue(weekMap, workweek.startDate),
            })),
          }
        : { jobUuid, name, hours: flatTotal(jobUuid, name, weekMap) },
    )
  })

  const breakdownEarnings = Object.entries(formData.additionalEarnings).flatMap(
    ([jobUuid, names]) => {
      const jobActive = isJobActive(names)
      return Object.entries(names).map(([name, weekMap]) => {
        if (jobActive) {
          return {
            jobUuid,
            name,
            amount: sumWeekValues(weekMap, workweeks, AMOUNT_DECIMALS),
            breakdowns: workweeks.map(workweek => ({
              startDate: new RFCDate(workweek.startDate),
              endDate: new RFCDate(workweek.endDate),
              amount: weekValue(weekMap, workweek.startDate),
            })),
          }
        }
        const single = isSplit ? undefined : weekMap[workweeks[0]?.startDate ?? '']
        return {
          jobUuid,
          name,
          amount: hasValue(single) ? single! : (originalAmounts.get(`${jobUuid}|${name}`) ?? '0'),
        }
      })
    },
  )

  // Non-overtime earnings never carry breakdowns; they are sent as flat totals.
  const flatEarnings = Object.entries(formData.other).flatMap(([jobUuid, names]) =>
    Object.entries(names).map(([name, amount]) => ({
      jobUuid,
      name,
      amount: hasValue(amount) ? amount : (originalAmounts.get(`${jobUuid}|${name}`) ?? '0'),
    })),
  )

  const fixedCompensations = [...breakdownEarnings, ...flatEarnings]

  const isDismissal = payrollCategory === PayrollCategory.Dismissal
  const paidTimeOff = Object.entries(formData.timeOff).map(([name, value]) => ({
    name,
    hours: value || '0',
    ...(isDismissal && formData.finalPayout[name] != null
      ? { finalPayoutUnusedHoursInput: formData.finalPayout[name] || '0' }
      : {}),
  }))

  const usesItemizedReimbursements = !isOffCyclePayroll(payrollCategory)

  return {
    employeeUuid: employeeCompensation?.employeeUuid,
    version: employeeCompensation?.version as string | undefined,
    excluded: employeeCompensation?.excluded,
    memo: employeeCompensation?.memo || undefined,
    ...(formData.paymentMethod ? { paymentMethod: formData.paymentMethod } : {}),
    hourlyCompensations,
    fixedCompensations,
    paidTimeOff,
    ...(usesItemizedReimbursements
      ? { reimbursements: cleanupReimbursements(formData.reimbursements) }
      : {}),
  }
}
