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
import {
  COMPENSATION_NAME_DOUBLE_OVERTIME,
  COMPENSATION_NAME_OVERTIME,
  EXCLUDED_ADDITIONAL_EARNINGS,
  FlsaStatus,
} from '@/shared/constants'

/** One fixed-compensation line off the prepared compensation. */
type FixedCompensationEntry = NonNullable<
  PayrollEmployeeCompensationsType['fixedCompensations']
>[number]

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
 * Merges the employee's existing fixed compensations with a blank placeholder for
 * every payroll fixed-compensation type they don't yet have, mirroring the stable editor
 * (`getAdditionalEarningsCompensations`). This is what lets the editor surface an
 * empty input for Bonus, Commission, etc. even when the prepared payroll carries
 * no fixed compensations. Placeholders attach to the primary job and carry no
 * amount (blank), so an untouched earning submits as zero without altering pay.
 *
 * @remarks
 * Owners (FLSA status `Owner`) never receive placeholders. Earning types that are
 * handled elsewhere or never shown as additional earnings
 * ({@link EXCLUDED_ADDITIONAL_EARNINGS}) and inactive types are skipped. The
 * result is sorted alphabetically by name. The regular-rate-of-pay split between
 * additional earnings and `other` happens downstream via `overtimeEarningNames`;
 * this helper only decides which earning lines exist.
 *
 * @param existingFixedCompensations - The prepared compensation's fixed compensations.
 * @param fixedCompensationTypes - The prepared payroll's `fixedCompensationTypes` (the same source the stable editor uses).
 * @param primaryJobUuid - The employee's primary job UUID; placeholders attach here.
 * @param flsaStatus - The employee's FLSA status; owners get no placeholders.
 * @returns The merged, filtered, alphabetically sorted fixed-compensation lines.
 * @internal
 */
export function resolveEditableFixedCompensations(
  existingFixedCompensations: FixedCompensationEntry[] | undefined,
  fixedCompensationTypes: Array<{ name?: string | null }> | undefined,
  primaryJobUuid: string | undefined,
  flsaStatus: string | undefined,
): FixedCompensationEntry[] {
  const merged: FixedCompensationEntry[] = [...(existingFixedCompensations ?? [])]

  if (flsaStatus !== FlsaStatus.OWNER && primaryJobUuid) {
    for (const compensationType of fixedCompensationTypes ?? []) {
      const name = compensationType.name
      if (!name) continue
      if (EXCLUDED_ADDITIONAL_EARNINGS.includes(name)) continue
      const exists = merged.some(entry => entry.name?.toLowerCase() === name.toLowerCase())
      if (!exists) merged.push({ name, jobUuid: primaryJobUuid })
    }
  }

  return merged
    .filter(entry => entry.name && !EXCLUDED_ADDITIONAL_EARNINGS.includes(entry.name))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

/**
 * Whether the employee's prepared compensation already carries non-zero
 * Overtime or Double-overtime hours.
 *
 * @remarks
 * One of the two inputs to the initial `withOvertime` state: an employee who
 * already has real overtime hours starts with overtime on (per-workweek columns,
 * visible Overtime/Double-overtime rows) rather than requiring an "Add overtime"
 * click to see data that's already there. See also
 * {@link hasBreakdownsMatchingWorkweeks}.
 *
 * @param hourlyCompensations - The prepared compensation's hourly lines.
 * @returns `true` when any Overtime or Double-overtime line has hours greater than zero.
 * @internal
 */
export function hasExistingOvertimeHours(
  hourlyCompensations: PayrollEmployeeCompensationsType['hourlyCompensations'] | undefined,
): boolean {
  return (hourlyCompensations ?? []).some(
    compensation =>
      (compensation.name === COMPENSATION_NAME_OVERTIME ||
        compensation.name === COMPENSATION_NAME_DOUBLE_OVERTIME) &&
      parseFloat(compensation.hours ?? '0') > 0,
  )
}

/** A single per-workweek breakdown entry off a prepared compensation line. */
type CompensationBreakdown = {
  startDate?: RFCDate
  endDate?: RFCDate
  hours?: string
  amount?: string
}

/**
 * Whether a line's `breakdowns` tile the pay period's workweeks exactly: for
 * every workweek there is a breakdown whose start date matches and whose end
 * date lines up.
 */
function breakdownsMatchWorkweeks(
  breakdowns: CompensationBreakdown[] | undefined,
  workweeks: NormalizedWorkweek[],
): boolean {
  if (!breakdowns || breakdowns.length === 0) return false
  return workweeks.every(workweek =>
    breakdowns.some(
      breakdown =>
        breakdown.startDate?.toString() === workweek.startDate &&
        breakdown.endDate?.toString() === workweek.endDate,
    ),
  )
}

/**
 * Whether any of the employee's hourly lines already carries `breakdowns` whose
 * start dates match the current pay period's workweeks (with matching end dates).
 *
 * @remarks
 * The second input to the initial `withOvertime` state (see
 * {@link hasExistingOvertimeHours}). When an employee already has per-workweek
 * breakdowns for this pay period, overtime starts on and each week cell is seeded
 * from its breakdown value, rather than collapsing real per-week data behind an
 * "Add overtime" click.
 *
 * @param hourlyCompensations - The prepared compensation's hourly lines.
 * @param workweeks - Normalized workweeks for the pay period.
 * @returns `true` when at least one hourly line's breakdowns tile every workweek.
 * @internal
 */
export function hasBreakdownsMatchingWorkweeks(
  hourlyCompensations: PayrollEmployeeCompensationsType['hourlyCompensations'] | undefined,
  workweeks: NormalizedWorkweek[],
): boolean {
  return (hourlyCompensations ?? []).some(compensation =>
    breakdownsMatchWorkweeks(compensation.breakdowns, workweeks),
  )
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
  breakdowns: CompensationBreakdown[] | undefined,
  isSplit: boolean,
): Record<string, string> {
  const weekMap: Record<string, string> = {}

  // Collapsed (overtime off, or a single-workweek / overtime-ineligible line):
  // the line renders as one flat input bound to the first workweek. Emit ONLY
  // that single key holding the total — not empty keys for the other workweeks —
  // so a collapsed row has exactly one cell and the per-row "some filled, some
  // blank" validation is a natural no-op (see payrollEditEmployeeSchema).
  if (!isSplit) {
    const firstWorkweekStart = workweeks[0]?.startDate
    if (firstWorkweekStart != null) {
      weekMap[firstWorkweekStart] = formatAmountInput(total)
    }
    return weekMap
  }

  // Split with real per-workweek breakdowns that tile the pay period: seed each
  // week from its breakdown value.
  if (breakdownsMatchWorkweeks(breakdowns, workweeks)) {
    for (const workweek of workweeks) {
      const breakdown = breakdowns!.find(
        entry => entry.startDate?.toString() === workweek.startDate,
      )
      weekMap[workweek.startDate] = formatAmountInput(breakdown?.hours ?? breakdown?.amount)
    }
    return weekMap
  }

  // Split without matching breakdowns: put the line's total in its first cell and
  // leave every other cell blank. No even split, no distribution — per-row
  // validation then forces the user to fill the remaining cells before submit.
  workweeks.forEach((workweek, index) => {
    weekMap[workweek.startDate] = index === 0 ? formatAmountInput(total) : ''
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
 * Population per hourly/overtime-affecting line, when split, is decided by that
 * line's own breakdowns: a line whose breakdowns tile the workweeks is seeded
 * from them; any other line puts its total in the first workweek cell and leaves
 * the rest blank. No even split or redistribution is ever applied.
 *
 * @param employeeCompensation - The employee's prepared compensation, if loaded.
 * @param workweeks - Normalized workweeks for the pay period.
 * @param withOvertime - Whether overtime mode is on (see {@link hasExistingOvertimeHours}, {@link hasBreakdownsMatchingWorkweeks}, `actions.addOvertime`). Gates splitting alongside `isOvertimeEligible`.
 * @returns Default {@link PayrollEditEmployeeFormData} for `useForm`.
 * @internal
 */
export function derivePayrollEditEmployeeDefaults(
  employeeCompensation: PayrollEmployeeCompensationsType | undefined,
  workweeks: NormalizedWorkweek[],
  hasDirectDepositSetup: boolean,
  overtimeEarningNames: Set<string>,
  isOvertimeEligible: boolean,
  withOvertime: boolean,
  fixedCompensations: FixedCompensationEntry[] = employeeCompensation?.fixedCompensations ?? [],
): PayrollEditEmployeeFormData {
  // Only overtime-eligible employees split hours/earnings by workweek, and only
  // when overtime mode is on; everyone else renders (and seeds) flat, even on a
  // multi-workweek payroll.
  const isSplit = workweeks.length > 1 && isOvertimeEligible && withOvertime

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
  for (const compensation of fixedCompensations) {
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
    reimbursementDraft: { description: '', amount: '' },
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
 * @param isOvertimeEligible - Whether the employee is overtime-eligible (nonexempt family).
 * @param withOvertime - Whether overtime mode is on. A collapsed line always submits its flat total; a split line submits breakdowns only when every workweek cell is filled, otherwise (all cells blank) it resends the original flat total.
 * @returns The employee-compensation entry for the `PayrollUpdate` request body.
 * @internal
 */
export function buildPayrollUpdateEmployeeCompensation(
  formData: PayrollEditEmployeeFormOutputs,
  employeeCompensation: PayrollEmployeeCompensationsType | undefined,
  workweeks: NormalizedWorkweek[],
  payrollCategory: PayrollCategory,
  isOvertimeEligible: boolean,
  withOvertime: boolean,
): PayrollUpdateEmployeeCompensations {
  // Breakdowns are emitted only when the line is actually split by workweek:
  // multiple workweeks, an overtime-eligible employee, and overtime mode on.
  // This must match the field builder's gate so what renders and what submits
  // never drift.
  const isSplit = workweeks.length > 1 && isOvertimeEligible && withOvertime
  const hasValue = (value: string | undefined) => value != null && value !== ''
  const originalHours = originalTotals(
    employeeCompensation?.hourlyCompensations,
    comp => comp.hours,
  )
  const originalAmounts = originalTotals(
    employeeCompensation?.fixedCompensations,
    comp => comp.amount,
  )

  // Breakdowns are decided PER LINE. A split line whose every workweek cell is
  // filled submits real breakdowns tiling every workweek, its total the sum of
  // the cells. A line left entirely blank (or any collapsed line) submits nothing
  // new: it resends its original flat total with no breakdowns, no fabricated 0.
  // A partial line (some cells filled, some blank) can't reach submit — the
  // schema's per-row REQUIRED_WORKWEEK rule blocks it.
  const allCellsFilled = (weekMap: Record<string, string>) =>
    workweeks.every(workweek => hasValue(weekMap[workweek.startDate]))
  const flatTotal = (
    original: Map<string, string>,
    jobUuid: string,
    name: string,
    weekMap: Record<string, string>,
  ) => {
    const single = weekMap[workweeks[0]?.startDate ?? '']
    return hasValue(single) ? single : (original.get(`${jobUuid}|${name}`) ?? '0')
  }

  const hourlyCompensations = Object.entries(formData.hours).flatMap(([jobUuid, names]) =>
    Object.entries(names).map(([name, weekMap]) =>
      isSplit && allCellsFilled(weekMap)
        ? {
            jobUuid,
            name,
            hours: sumWeekValues(weekMap, workweeks, HOURS_DECIMALS),
            breakdowns: workweeks.map(workweek => ({
              startDate: new RFCDate(workweek.startDate),
              endDate: new RFCDate(workweek.endDate),
              hours: weekMap[workweek.startDate]!,
            })),
          }
        : { jobUuid, name, hours: flatTotal(originalHours, jobUuid, name, weekMap) },
    ),
  )

  const breakdownEarnings = Object.entries(formData.additionalEarnings).flatMap(
    ([jobUuid, names]) =>
      Object.entries(names).map(([name, weekMap]) =>
        isSplit && allCellsFilled(weekMap)
          ? {
              jobUuid,
              name,
              amount: sumWeekValues(weekMap, workweeks, AMOUNT_DECIMALS),
              breakdowns: workweeks.map(workweek => ({
                startDate: new RFCDate(workweek.startDate),
                endDate: new RFCDate(workweek.endDate),
                amount: weekMap[workweek.startDate]!,
              })),
            }
          : { jobUuid, name, amount: flatTotal(originalAmounts, jobUuid, name, weekMap) },
      ),
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
