import type { ComponentType } from 'react'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdatePaymentMethod } from '@gusto/embedded-api/models/components/payrollupdate'
import type { NormalizedWorkweek } from './payrollEditEmployeeHelpers'
import { TextInputField } from '@/components/Common/Fields/TextInputField/TextInputField'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { HookFieldProps } from '@/partner-hook-utils/types'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import { PayrollCategory } from '@/components/Payroll/payrollTypes'

/**
 * Presentation props accepted by a bound numeric field in the payroll editor.
 *
 * @remarks
 * The hook binds the react-hook-form `name` and forces `type="number"`
 * internally; the UI supplies copy and layout props (label, adornments,
 * `shouldVisuallyHideLabel`, required state).
 *
 * @public
 */
export type PayrollEditEmployeeFieldProps = Omit<
  TextInputProps,
  'name' | 'value' | 'onChange' | 'isInvalid' | 'type' | 'min'
>

/**
 * A numeric field component pre-bound by the hook to a specific form path.
 *
 * @public
 */
export type PayrollEditEmployeeFieldComponent = ComponentType<PayrollEditEmployeeFieldProps>

/**
 * Presentation props accepted by the bound payment-method field.
 *
 * @remarks
 * The hook binds the `name` and publishes the option values on
 * `fieldsMetadata.paymentMethod`; the UI passes `getOptionLabel` to translate
 * each {@link PayrollUpdatePaymentMethod} value, rather than passing `options`.
 *
 * @public
 */
export type PayrollEditEmployeePaymentMethodFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, PayrollUpdatePaymentMethod>
>

/**
 * The payment-method radio field component pre-bound by the hook.
 *
 * @public
 */
export type PayrollEditEmployeePaymentMethodField =
  ComponentType<PayrollEditEmployeePaymentMethodFieldProps>

/**
 * One hours input within the hours section.
 *
 * @remarks
 * `key` is an opaque, stable React key. `jobUuid`, `name`, and (when the pay
 * period is multi-workweek) `workweekStart` are reach-in handles the UI uses to
 * group and label entries. When the section is a flat array, `workweekStart` is
 * omitted (single-workweek degenerate case); when it is a `Record` keyed by
 * workweek start, each entry carries its `workweekStart`.
 *
 * @public
 */
export interface HourEntry {
  /** Opaque, stable React key. */
  key: string
  /** The job this hours line belongs to. */
  jobUuid: string
  /** The compensation name (e.g. the API hours-compensation name). */
  name: string
  /** The workweek start date (`YYYY-MM-DD`) when the section is workweek-keyed. */
  workweekStart?: string
  /** Field component pre-bound to this entry's form path. */
  Field: PayrollEditEmployeeFieldComponent
}

/**
 * One earning input, used by the additional-earnings section.
 *
 * @remarks
 * Same shape as {@link HourEntry}. Whether an earning feeds the overtime
 * (regular rate of pay) calculation is decided by the hook, which sorts it into
 * the workweek-breakdown additional-earnings section or the flat other
 * section. The UI just renders whichever section an entry appears in.
 *
 * @public
 */
export type EarningEntry = HourEntry

/**
 * One time-off or final-payout input.
 *
 * @remarks
 * Time off is never workweek-breakdown, so this section is always a flat array.
 *
 * @public
 */
export interface TimeOffEntry {
  /** Opaque, stable React key. */
  key: string
  /** The time-off policy compensation name. */
  name: string
  /** Field component pre-bound to this entry's form path. */
  Field: PayrollEditEmployeeFieldComponent
}

/**
 * One entry in the flat `other` section.
 *
 * @remarks
 * Intentionally opaque: `other` collects earnings that are not overtime-affecting
 * and whose input type the partner does not need to reason about. Render each
 * entry's `Field` keyed by `key`; use `id` as a reach-in handle for labeling.
 *
 * @public
 */
export interface OtherEntry {
  /** Opaque, stable React key. */
  key: string
  /** Reach-in handle identifying the underlying earning (its compensation name). */
  id: string
  /** Field component pre-bound to this entry's form path. */
  Field: PayrollEditEmployeeFieldComponent
}

/**
 * Per-job hours and additional-earnings sections.
 *
 * @remarks
 * An employee can hold multiple jobs, each with its own hourly and additional
 * earnings lines. Each section is either a flat `Entry[]` (single-workweek, or an
 * overtime-ineligible employee) OR a `Record<workweekStart, Entry[]>`
 * (multi-workweek and overtime-eligible). The value type is the signal — array is
 * flat, object is split by workweek; use {@link isSplitByWorkweek} to
 * discriminate. `title` is the job's display title (entity data, not copy) for
 * rendering a per-job heading.
 *
 * @public
 */
export interface JobFields {
  /** The job identifier. */
  jobUuid: string
  /** The job's display title, when available, for a per-job heading. */
  title?: string
  /** Hours inputs for this job. */
  hours: HourEntry[] | Record<string, HourEntry[]>
  /** Overtime-affecting earnings for this job. */
  additionalEarnings: EarningEntry[] | Record<string, EarningEntry[]>
}

/**
 * The render-ready field collections exposed on `form.Fields`.
 *
 * @remarks
 * Job-scoped inputs (hours, additional earnings) are grouped under `jobs`, one
 * entry per job, so multi-job employees render correctly. Employee-scoped
 * sections (other earnings, time off, final payout, payment method) stay
 * top-level.
 *
 * @public
 */
export interface PayrollEditEmployeeFields {
  /** Per-job hours and additional-earnings sections; one entry per job. */
  jobs: JobFields[]
  /** Non-overtime earnings (e.g. tips), always flat; opaque render entries. */
  other: OtherEntry[]
  /** Time-off inputs (never workweek-breakdown). */
  timeOff: TimeOffEntry[]
  /** Final-payout inputs, present only for dismissal payrolls. */
  finalPayout?: TimeOffEntry[]
  /** Payment-method selector, present only when the employee has direct deposit set up. */
  paymentMethod?: PayrollEditEmployeePaymentMethodField
}

/**
 * Discriminates a workweek-breakdown section: `false` for the flat
 * (single-workweek) `Entry[]` form, `true` for the workweek-keyed
 * `Record<workweekStart, Entry[]>` form.
 *
 * @typeParam TEntry - The section's entry type.
 * @param section - A `form.Fields` section that may be flat or workweek-keyed.
 * @returns `true` when the section is keyed by workweek start date.
 * @public
 */
export function isSplitByWorkweek<TEntry>(
  section: TEntry[] | Record<string, TEntry[]>,
): section is Record<string, TEntry[]> {
  return !Array.isArray(section)
}

// ── Bound field factories ──────────────────────────────────────────────

function createNumberField(name: string): PayrollEditEmployeeFieldComponent {
  return function BoundNumberField(props: PayrollEditEmployeeFieldProps) {
    // name, type, and min are applied after the spread so callers can't override
    // the binding or the non-negative numeric contract via custom props.
    return <TextInputField {...props} name={name} type="number" min={0} />
  }
}

function createPaymentMethodField(): PayrollEditEmployeePaymentMethodField {
  return function BoundPaymentMethodField(props: PayrollEditEmployeePaymentMethodFieldProps) {
    return (
      <RadioGroupHookField<never, PayrollUpdatePaymentMethod> {...props} name="paymentMethod" />
    )
  }
}

// ── Builders ───────────────────────────────────────────────────────────

/** @internal */
export interface CreatePayrollEditEmployeeFieldsOptions {
  employeeCompensation: PayrollEmployeeCompensationsType | undefined
  /**
   * Fixed compensations to render, already merged with blank placeholders for
   * every company earning type (see `resolveEditableFixedCompensations`).
   */
  fixedCompensations: NonNullable<PayrollEmployeeCompensationsType['fixedCompensations']>
  workweeks: NormalizedWorkweek[]
  payrollCategory: PayrollCategory
  hasDirectDepositSetup: boolean
  /** Names of earning types included in the regular-rate-of-pay overtime calculation. */
  overtimeEarningNames: Set<string>
  /** Whether the employee is overtime-eligible (nonexempt family). Gates per-workweek splitting. */
  isOvertimeEligible: boolean
  /** Job title lookup by job UUID, for per-job section headings. */
  jobTitlesByUuid: Map<string, string>
}

function buildBreakdownSection(
  compensations: Array<{ jobUuid?: string; name?: string }>,
  workweeks: NormalizedWorkweek[],
  pathPrefix: 'hours' | 'additionalEarnings',
  isOvertimeEligible: boolean,
): HourEntry[] | Record<string, HourEntry[]> {
  const rows = compensations.filter(
    (compensation): compensation is { jobUuid: string; name: string } =>
      Boolean(compensation.jobUuid) && Boolean(compensation.name),
  )

  const toEntry = (
    row: { jobUuid: string; name: string },
    weekStart: string,
    includeWorkweek: boolean,
  ): HourEntry => ({
    key: includeWorkweek ? `${row.jobUuid}:${row.name}:${weekStart}` : `${row.jobUuid}:${row.name}`,
    jobUuid: row.jobUuid,
    name: row.name,
    ...(includeWorkweek ? { workweekStart: weekStart } : {}),
    Field: createNumberField(`${pathPrefix}.${row.jobUuid}.${row.name}.${weekStart}`),
  })

  // Split into per-workweek columns only for overtime-eligible employees; workweek
  // breakdowns exist solely to compute overtime premiums, so an ineligible
  // employee renders flat even on a multi-workweek payroll.
  if (workweeks.length > 1 && isOvertimeEligible) {
    const byWeek: Record<string, HourEntry[]> = {}
    for (const workweek of workweeks) {
      byWeek[workweek.startDate] = rows.map(row => toEntry(row, workweek.startDate, true))
    }
    return byWeek
  }

  const weekStart = workweeks[0]?.startDate ?? ''
  return rows.map(row => toEntry(row, weekStart, false))
}

/**
 * Builds the render-ready {@link PayrollEditEmployeeFields} from the prepared
 * compensation.
 *
 * @remarks
 * Hours and overtime-affecting earnings are grouped per job into `jobs` (a job
 * appears if it has hourly lines or overtime-affecting earnings). Fixed
 * compensations are split by whether their earning type is included in the
 * regular-rate-of-pay overtime calculation (`overtimeEarningNames`): included
 * earnings become each job's additional earnings, the rest become the flat,
 * employee-level `other` section. Time off comes from the paid-time-off list,
 * final payout is added only for dismissal payrolls, and the payment-method
 * selector appears only when direct deposit is set up.
 *
 * @param options - The prepared compensation, normalized workweeks, payroll category, direct-deposit flag, overtime earning names, eligibility, and job titles.
 * @returns The populated field collections.
 * @internal
 */
export function createPayrollEditEmployeeFields({
  employeeCompensation,
  fixedCompensations,
  workweeks,
  payrollCategory,
  hasDirectDepositSetup,
  overtimeEarningNames,
  isOvertimeEligible,
  jobTitlesByUuid,
}: CreatePayrollEditEmployeeFieldsOptions): PayrollEditEmployeeFields {
  const hourlyCompensations = employeeCompensation?.hourlyCompensations ?? []
  const overtimeAffecting = fixedCompensations.filter(
    compensation => compensation.name != null && overtimeEarningNames.has(compensation.name),
  )
  const nonOvertime = fixedCompensations.filter(
    compensation => compensation.name == null || !overtimeEarningNames.has(compensation.name),
  )

  // A job appears if it has hourly lines or overtime-affecting earnings, in first
  // appearance order across those two sources.
  const jobUuids: string[] = []
  for (const compensation of [...hourlyCompensations, ...overtimeAffecting]) {
    if (compensation.jobUuid && !jobUuids.includes(compensation.jobUuid)) {
      jobUuids.push(compensation.jobUuid)
    }
  }

  const jobs: JobFields[] = jobUuids.map(jobUuid => ({
    jobUuid,
    title: jobTitlesByUuid.get(jobUuid),
    hours: buildBreakdownSection(
      hourlyCompensations.filter(compensation => compensation.jobUuid === jobUuid),
      workweeks,
      'hours',
      isOvertimeEligible,
    ),
    additionalEarnings: buildBreakdownSection(
      overtimeAffecting.filter(compensation => compensation.jobUuid === jobUuid),
      workweeks,
      'additionalEarnings',
      isOvertimeEligible,
    ),
  }))

  const other: OtherEntry[] = nonOvertime
    .filter(
      (compensation): compensation is { jobUuid: string; name: string } =>
        Boolean(compensation.jobUuid) && Boolean(compensation.name),
    )
    .map(compensation => ({
      key: `${compensation.jobUuid}:${compensation.name}`,
      id: compensation.name,
      Field: createNumberField(`other.${compensation.jobUuid}.${compensation.name}`),
    }))

  const timeOffRows = (employeeCompensation?.paidTimeOff ?? []).filter(entry => entry.name)
  const timeOff: TimeOffEntry[] = timeOffRows.map(entry => ({
    key: `timeOff:${entry.name!}`,
    name: entry.name!,
    Field: createNumberField(`timeOff.${entry.name!}`),
  }))

  const finalPayout =
    payrollCategory === PayrollCategory.Dismissal
      ? timeOffRows.map(entry => ({
          key: `finalPayout:${entry.name!}`,
          name: entry.name!,
          Field: createNumberField(`finalPayout.${entry.name!}`),
        }))
      : undefined

  return {
    jobs,
    other,
    timeOff,
    finalPayout,
    paymentMethod: hasDirectDepositSetup ? createPaymentMethodField() : undefined,
  }
}
