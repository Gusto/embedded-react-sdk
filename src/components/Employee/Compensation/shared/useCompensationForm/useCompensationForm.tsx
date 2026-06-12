import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  Compensation,
  PaymentUnit,
} from '@gusto/embedded-api-v-2025-11-15/models/components/compensation'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import type { FlsaStatusType } from '@gusto/embedded-api-v-2025-11-15/models/components/flsastatustype'
import type { MinimumWage } from '@gusto/embedded-api-v-2025-11-15/models/components/minimumwage'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidjobs'
import { useJobsAndCompensationsCreateCompensationMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsCreateCompensation'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsUpdateCompensation'
import { useLocationsGetMinimumWages } from '@gusto/embedded-api-v-2025-11-15/react-query/locationsGetMinimumWages'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import {
  createCompensationSchema,
  type CompensationOptionalFieldsToRequire,
  type CompensationFormData,
  type CompensationFormOutputs,
} from './compensationSchema'
import {
  TitleField,
  FlsaStatusField,
  RateField,
  PaymentUnitField,
  AdjustForMinimumWageField,
  MinimumWageIdField,
  EffectiveDateField,
} from './fields'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { FlsaStatus, PAY_PERIODS, TIP_CREDITS_UNSUPPORTED_STATES } from '@/shared/constants'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { addDays, formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Optional values supplied to {@link useCompensationForm}'s `actions.onSubmit` at submit time.
 *
 * @remarks
 * Use these to override hook-construction props when an ID isn't known at
 * mount — most commonly the **onboarding stub-fill** chain, where `useJobForm`
 * creates the parent job and returns the auto-created stub compensation, and
 * the IDs and version are threaded into this hook's `onSubmit` to PUT the
 * stub.
 *
 * @public
 */
export interface CompensationSubmitOptions {
  /** Override jobId — required when creating a compensation if not configured at hook construction (e.g. when the parent job was just created in the same submit chain). */
  jobId?: string
  /** Override compensationId — when present, forces update (PUT) routing regardless of hook construction. */
  compensationId?: string
  /**
   * Compensation version for optimistic locking on PUT. Required when forcing
   * update routing post-create (e.g. updating the auto-created stub returned
   * from `POST /v1/employees/:id/jobs`). When omitted, the hook reads the
   * version from its cached `currentCompensation`.
   */
  compensationVersion?: string
  /**
   * Supply `effectiveDate` at submit time. When `withEffectiveDateField`
   * is `true`, this overrides the form's value. When `withEffectiveDateField`
   * is `false`, this is the only way to put `effective_date` on the wire —
   * the form value is not read in that mode (matching the options-only
   * convention of `useWorkAddressForm` / `useHomeAddressForm` / `useJobForm`).
   */
  effectiveDate?: string
}

/**
 * Configuration options for {@link useCompensationForm}.
 *
 * @remarks
 * Presence or absence of `compensationId` selects the API verb — see the
 * `compensationId` field description. `employeeId` is optional so the hook
 * can be composed alongside an employee-creation step. `jobId` is optional in
 * update mode (derived from the loaded compensation) and required in create
 * mode (scopes the POST); supply it at submit time via
 * {@link CompensationSubmitOptions.jobId} when the parent job is created in
 * the same submit chain.
 *
 * @public
 */
export interface UseCompensationFormProps {
  /** UUID of the employee whose compensation is being created or edited. Drives data fetching for derived helpers (jobs list, work address, minimum wages). May be omitted when composing alongside an employee-creation step. */
  employeeId?: string
  /** The parent job's UUID. Required in create mode (scopes `POST /v1/jobs/:jobId/compensations`). Optional in update mode — the parent job is derived from the loaded compensation. */
  jobId?: string
  /** Present → update mode (PUT /v1/compensations/:id). Omitted → create mode (POST /v1/jobs/:jobId/compensations). */
  compensationId?: string
  /** Override fields that are optional on a given mode to be required. See {@link CompensationOptionalFieldsToRequire}. */
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence on update mode. */
  defaultValues?: Partial<CompensationFormData>
  /** Passed through to react-hook-form. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler` so submit-time focus is coordinated across multiple forms. Defaults to `true`. */
  shouldFocusError?: boolean
  /**
   * When `false`, hides `Fields.EffectiveDate` (becomes `undefined`) and
   * removes `effectiveDate` from schema validation. In this mode the hook
   * does not read any form value at submit time — `effective_date` is
   * omitted from the request body unless explicitly supplied via
   * {@link CompensationSubmitOptions.effectiveDate}. This matches the
   * options-only convention of other form hooks, and means the
   * `willDeleteSecondaryJobs` carve-out's form-state side effects do not
   * leak onto the wire (there is no field to render them in anyway).
   * Defaults to `true`.
   */
  withEffectiveDateField?: boolean
}

/**
 * Pre-bound field components exposed on `useCompensationForm().form.Fields`.
 *
 * @remarks
 * Each property is either the field component or `undefined`. A field is
 * `undefined` when conditions for rendering it aren't met — see each member
 * for its visibility rule. Always null-check conditional fields (e.g.
 * `{Fields.FlsaStatus && <Fields.FlsaStatus ... />}`) before rendering.
 *
 * @public
 */
export interface CompensationFormFields {
  /** Title text input. Always available. Optional in both modes unless `optionalFieldsToRequire` requires it. */
  Title: typeof TitleField
  /** FLSA classification select. `undefined` when the status is not user-editable (e.g. secondary jobs that must match the primary). */
  FlsaStatus: typeof FlsaStatusField | undefined
  /** Compensation amount input. `undefined` for commission-only FLSA statuses, which don't accept a partner-supplied rate. */
  Rate: typeof RateField | undefined
  /** Payment unit select. `undefined` for commission-only FLSA statuses (the hook forces `paymentUnit=Year`). */
  PaymentUnit: typeof PaymentUnitField | undefined
  /** Minimum-wage adjustment checkbox. `undefined` unless `flsaStatus === Nonexempt`, the employee's work location has minimum wages, and the state supports tip credits. */
  AdjustForMinimumWage: typeof AdjustForMinimumWageField | undefined
  /** Minimum-wage selection. `undefined` unless `Fields.AdjustForMinimumWage` is rendered and checked. */
  MinimumWageId: typeof MinimumWageIdField | undefined
  /** Effective-date picker. `undefined` when `withEffectiveDateField: false`; supply the value via `CompensationSubmitOptions.effectiveDate` in that mode. */
  EffectiveDate: typeof EffectiveDateField | undefined
}

/**
 * Ready-state shape returned by {@link useCompensationForm} once data has loaded.
 *
 * @remarks
 * Discriminated by `isLoading: false`. Extends {@link BaseFormHookReady} with
 * the compensation-specific `data`, `status`, `actions`, and `form.Fields`
 * shape. Static, entity-derived values live under `data.*`; reactive values
 * that flip with form input live under `status.*`.
 *
 * @public
 */
export interface UseCompensationFormReady extends BaseFormHookReady<
  FieldsMetadata,
  CompensationFormData,
  CompensationFormFields
> {
  /** Compensation-specific data payload: the loaded compensation, the parent job, available minimum wages, and effective-date bounds. */
  data: {
    /** The compensation row loaded for update; `null` in create mode. */
    compensation: Compensation | null
    /** The parent job. In update mode it's derived from the loaded compensation; in create mode it's looked up by `jobId`. `null` if neither resolves. */
    currentJob: Job | null
    /** Minimum wages available at the employee's active work location. Empty when no location is set or no minimums are defined. */
    minimumWages: MinimumWage[]
    /** Lower bound for `effectiveDate` (typically the parent job's hire date). */
    minimumEffectiveDate: string | null
    /** Upper bound for `effectiveDate` — the next scheduled future compensation's effective date, when one exists. */
    maximumEffectiveDate: string | null
    /** True when at least one future-dated compensation already exists for this job. */
    hasPendingFutureCompensation: boolean
  }
  /** Submission state and reactive flags derived from current form input. `isPending` is `true` while a create/update mutation is in flight; `mode` reflects whether the next submit will create or update; the `show*Alert` flags drive FLSA-specific inline warnings. */
  status: {
    /** `true` while a create or update mutation is in flight. */
    isPending: boolean
    /** Reflects whether the next submit will POST a new compensation or PUT an existing one. */
    mode: 'create' | 'update'
    /**
     * True when submitting the form right now would delete the employee's
     * secondary jobs server-side (the "carve-out" branch). Reactive:
     * derived from the current `flsaStatus` form value, the loaded
     * compensation, and the other-jobs count, so this flips as you change
     * inputs.
     *
     * Conditions: update mode, the loaded compensation is Nonexempt, the
     * form's `flsaStatus` has been changed to a non-Nonexempt value, and
     * the employee has at least one secondary job.
     *
     * While this flag is true the hook also takes the `effectiveDate`
     * field over: it forces the form value to today (so submits route
     * through a PUT that immediately deletes secondaries) and exposes
     * `fieldsMetadata.effectiveDate.isDisabled = true` so `Fields.EffectiveDate`
     * renders as disabled. On revert (FLSA back to Nonexempt) the prior
     * `effectiveDate` is restored. Render an inline warning keyed off
     * this flag — no separate confirmation step is needed.
     */
    willDeleteSecondaryJobs: boolean
    /**
     * True when the current `flsaStatus` is `COMMISSION_ONLY_EXEMPT`
     * (Commission Only/No Overtime). Render the federal-minimum-pay
     * warning alert when this flag is true. While this flag is true,
     * `Fields.Rate` and `Fields.PaymentUnit` are also `undefined` (the
     * hook forces `rate=0`, `paymentUnit=YEAR` on the form values).
     */
    showCommissionFederalMinimumPayAlert: boolean
    /**
     * True when the current `flsaStatus` is `COMMISSION_ONLY_NONEXEMPT`
     * (Commission Only/Eligible for overtime). Render the local-minimum-wage
     * warning alert when this flag is true. While this flag is true,
     * `Fields.Rate` and `Fields.PaymentUnit` are also `undefined` (the
     * hook forces `rate=0`, `paymentUnit=YEAR` on the form values).
     */
    showCommissionMinimumWageAlert: boolean
    /**
     * True when the current `flsaStatus` is `OWNER` (Owner's draw). Render
     * an informational alert noting that the IRS requires S-corp owners to
     * pay themselves a reasonable salary for similar work before taking
     * distributions.
     */
    showOwnerSalaryAlert: boolean
  }
  /** Submit actions exposed by the hook. */
  actions: {
    /** Validates the form, runs the appropriate create/update mutation, and resolves to a {@link HookSubmitResult} containing the saved compensation. Resolves to `undefined` on validation failure or mutation error. Accepts {@link CompensationSubmitOptions} for threading IDs/version into the onboarding stub-fill chain. */
    onSubmit: (
      options?: CompensationSubmitOptions,
    ) => Promise<HookSubmitResult<Compensation> | undefined>
  }
}

function resolveCompAndJob(
  jobs: Job[] | undefined,
  compensationId: string | undefined,
  jobId: string | undefined,
): { compensation: Compensation | null; job: Job | null } {
  if (!jobs) return { compensation: null, job: null }
  if (compensationId) {
    for (const job of jobs) {
      const compensation = job.compensations?.find(c => c.uuid === compensationId)
      if (compensation) return { compensation, job }
    }
    // If the comp isn't in any job's compensations list, still try to resolve
    // the job by jobId so callers can check job metadata (e.g. job.primary).
    const fallbackJob = jobId ? (jobs.find(j => j.uuid === jobId) ?? null) : null
    return { compensation: null, job: fallbackJob }
  }
  if (jobId) return { compensation: null, job: jobs.find(j => j.uuid === jobId) ?? null }
  return { compensation: null, job: null }
}

function findPrimaryFlsaStatus(jobs: Job[] | undefined): FlsaStatusType | null {
  if (!jobs) return null
  for (const job of jobs) {
    if (!job.primary) continue
    const compensation = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
    if (compensation?.flsaStatus) return compensation.flsaStatus
  }
  return null
}

function findFutureCompensations(job: Job | null): Compensation[] {
  if (!job?.compensations) return []
  const today = todayISO()
  return job.compensations.filter(c => c.effectiveDate !== undefined && c.effectiveDate > today)
}

function earliestEffectiveDate(comps: Compensation[]): string | null {
  if (comps.length === 0) return null
  return comps.reduce<string | null>((min, c) => {
    const d = c.effectiveDate
    if (!d) return min
    if (!min || d < min) return d
    return min
  }, null)
}

const flsaStatusEntries: FlsaStatusType[] = [
  FlsaStatus.EXEMPT,
  FlsaStatus.SALARIED_NONEXEMPT,
  FlsaStatus.NONEXEMPT,
  FlsaStatus.OWNER,
  FlsaStatus.COMMISSION_ONLY_EXEMPT,
  FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
]

const flsaOptions = flsaStatusEntries.map(status => ({ value: status, label: status }))

const paymentUnitEntries: PaymentUnit[] = [
  PAY_PERIODS.HOUR,
  PAY_PERIODS.WEEK,
  PAY_PERIODS.MONTH,
  PAY_PERIODS.YEAR,
  PAY_PERIODS.PAYCHECK,
]

const paymentUnitOptions = paymentUnitEntries.map(unit => ({ value: unit, label: unit }))

function todayISO(): string {
  return new Date().toISOString().split('T')[0]!
}

/**
 * Headless hook for creating or updating a compensation row on a job — FLSA classification, pay rate, payment unit, effective date, and optional minimum-wage adjustment.
 *
 * @remarks
 * Companion hook to `useJobForm`. Jobs and their compensations are separate
 * entities in the Gusto API and this hook focuses exclusively on the
 * compensation side. Presence of `compensationId` selects the verb:
 *
 * | Hook config / submit options | Mode | API call |
 * | ---------------------------- | ---- | -------- |
 * | `{ jobId, compensationId }` | update | `PUT /v1/compensations/:compensationId` (with `version`) |
 * | `{ jobId }` (no `compensationId`) | create | `POST /v1/jobs/:jobId/compensations` |
 * | `{ employeeId }` + submit `{ jobId, compensationId, compensationVersion }` | update | `PUT /v1/compensations/:compensationId` (with the supplied `version`) |
 * | `{ employeeId }` + submit `{ jobId }` (no `compensationId`) | create | `POST /v1/jobs/:options.jobId/compensations` |
 *
 * Use the submit-options form for the **onboarding stub-fill** chain: after
 * `useJobForm.actions.onSubmit()` creates a job, capture the auto-created
 * compensation's UUID and version from the response, and pass them as
 * `{ jobId, compensationId, compensationVersion }` to this hook's `onSubmit`
 * to PUT the stub.
 *
 * The hook exposes several derived helpers for driving UX — static
 * entity-derived values under `data.*` (effective-date bounds, pending
 * future compensations) and reactive flags under `status.*` (the
 * `willDeleteSecondaryJobs` carve-out, plus FLSA-specific alerts for
 * commission-only and owner classifications). When
 * `willDeleteSecondaryJobs` is `true` in update mode, the hook also locks
 * the `effectiveDate` field (forces to today, renders disabled) until the
 * FLSA selection is reverted.
 *
 * @param input - {@link UseCompensationFormProps} — `employeeId`, `jobId`, `compensationId` (toggle create/update), required-field overrides, default values, and which fields the hook renders.
 * @returns A {@link HookLoadingResult} while data is loading, or a {@link UseCompensationFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import { useCompensationForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
 *
 * function CompensationForm({ employeeId, jobId }: { employeeId: string; jobId: string }) {
 *   const comp = useCompensationForm({ employeeId, jobId })
 *   if (comp.isLoading) return null
 *
 *   const { Fields } = comp.form
 *   return (
 *     <form onSubmit={e => { e.preventDefault(); comp.actions.onSubmit() }}>
 *       <SDKFormProvider formHookResult={comp}>
 *         {Fields.FlsaStatus && <Fields.FlsaStatus label="Employee type" />}
 *         <Fields.Rate label="Compensation amount" />
 *         <Fields.PaymentUnit label="Payment unit" />
 *         {Fields.EffectiveDate && <Fields.EffectiveDate label="Effective date" />}
 *       </SDKFormProvider>
 *       {comp.status.willDeleteSecondaryJobs && (
 *         <p>Saving will remove this employee's secondary jobs.</p>
 *       )}
 *       <button type="submit" disabled={comp.status.isPending}>Save</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useCompensationForm({
  employeeId,
  jobId,
  compensationId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  withEffectiveDateField = true,
}: UseCompensationFormProps): HookLoadingResult | UseCompensationFormReady {
  const jobsQuery = useJobsAndCompensationsGetJobs(
    {
      employeeId: employeeId ?? '',
      // Fetch all effective-dated compensations when editing an existing one so
      // resolveCompAndJob can find the target comp (future-dated comps are
      // omitted from the default response, which only returns the current comp).
      include: compensationId
        ? GetV1EmployeesEmployeeIdJobsQueryParamInclude.AllCompensations
        : undefined,
    },
    { enabled: !!employeeId },
  )
  const addressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )
  const employeeQuery = useEmployeesGet({ employeeId: employeeId ?? '' }, { enabled: !!employeeId })

  const employeeJobs = jobsQuery.data?.jobs
  const workAddresses = addressesQuery.data?.employeeWorkAddressesList
  const currentWorkAddress = workAddresses?.find(address => address.active)
  const locationUuid = currentWorkAddress?.locationUuid
  const employee = employeeQuery.data?.employee

  const minWagesQuery = useLocationsGetMinimumWages(
    { locationUuid: locationUuid ?? '' },
    { enabled: !!locationUuid },
  )

  const minimumWages = minWagesQuery.data?.minimumWageList ?? []

  const { compensation: currentCompensation, job: currentJob } = resolveCompAndJob(
    employeeJobs,
    compensationId,
    jobId,
  )

  const otherJobsCount =
    employeeJobs && currentJob ? employeeJobs.filter(j => j.uuid !== currentJob.uuid).length : 0

  // Snapshot — written exactly once, on the first render where `employeeJobs`
  // is defined (i.e., the initial `getJobs` query has resolved) — capturing
  // whether the employee already had a primary job at that moment.
  //
  // Used to ignore the API-generated stub primary (FLSA Nonexempt, rate "0.00")
  // that briefly appears between the chained job POST and comp PUT during
  // onboarding: `getJobs` invalidates between the two mutations and
  // momentarily includes the stub, which would otherwise flip
  // `isAddingSecondaryJob` to true and hide `Fields.FlsaStatus` mid-submit.
  //
  // In steady-state flows (edit primary, edit secondary, add secondary), the
  // real primary already exists when the query first resolves, so the snapshot
  // is `true` and live `employeeJobs` continues to drive `primaryFlsaStatus`.
  // Recovery for the rare case where a partner mounts before any jobs exist
  // and a primary is created externally mid-form is to remount the hook
  // (e.g., via a `key` change).
  const hadPrimaryAtMountRef = useRef<boolean | null>(null)
  if (hadPrimaryAtMountRef.current === null && employeeJobs !== undefined) {
    hadPrimaryAtMountRef.current = employeeJobs.some(job => job.primary)
  }
  const hadPrimaryAtMount = hadPrimaryAtMountRef.current === true

  // FLSA status of the employee's primary job's current compensation, when one
  // exists. Used as a fallback default when adding a *secondary* job/comp so the
  // multi-job classification stays consistent with the primary by default — the
  // user can still override it (when allowed). Null when there was no primary
  // job at the moment the hook first observed `employeeJobs`, or when the
  // primary has no current compensation yet.
  const primaryFlsaStatus = hadPrimaryAtMount ? findPrimaryFlsaStatus(employeeJobs) : null

  const hireDate =
    currentJob?.hireDate ??
    // Secondary jobs being created (CompensationAddAnotherJobForm) have no hireDate until the
    // job POST completes. Fall back to the primary job's hireDate so the schema
    // can enforce EFFECTIVE_DATE_BEFORE_HIRE during that window.
    employeeJobs?.find(j => j.primary)?.hireDate ??
    null

  // In update mode, exclude the compensation being edited so it doesn't
  // bound `maximumEffectiveDate` to its own current date — that would prevent
  // the user from pushing the pending effective date further out.
  const futureCompensations = findFutureCompensations(currentJob).filter(
    c => c.uuid !== compensationId,
  )
  const hasPendingFutureCompensation = futureCompensations.length > 0
  const maximumEffectiveDate = earliestEffectiveDate(futureCompensations)

  const isCreateMode = !compensationId
  const mode = isCreateMode ? 'create' : 'update'
  // Adding a secondary job (the employee already has a primary). The Gusto API
  // only allows secondaries when the primary's current FLSA is Nonexempt, and
  // the secondary itself must match — so the FLSA field is not user-editable
  // in this branch. We force the form value to the primary's FLSA below and
  // hide `Fields.FlsaStatus`.
  // True when adding a brand-new secondary job (not when scheduling a future
  // comp for the primary). The distinction matters: for the primary's future
  // comp, FLSA should be editable; for a secondary, it must match the primary.
  const isAddingSecondaryJob =
    isCreateMode && primaryFlsaStatus === FlsaStatus.NONEXEMPT && currentJob?.primary !== true

  // Derive the effective-date floor internally so consumers don't need to wire
  // it up. Rules by mode and job type:
  //   create (any job): tomorrow — new comp must be future-dated
  //   update, primary: undefined — the carve-out (willDeleteSecondaryJobs) can
  //     force effectiveDate to today on a disabled field; enforcing a floor here
  //     would produce a spurious EFFECTIVE_DATE_BEFORE_MIN on submit.
  //   update, secondary: tomorrow — must be in the future
  // The hire-date lower bound is handled separately in the schema via the
  // `hireDate` option (→ EFFECTIVE_DATE_BEFORE_HIRE), which fires alongside
  // this check so each violation gets its own error message.
  const internalMinEffectiveDate = useMemo(() => {
    if (!withEffectiveDateField) return undefined
    if (!isCreateMode && currentJob?.primary === true) return undefined

    return formatDateToStringDate(addDays(new Date(), 1)) ?? undefined
  }, [isCreateMode, currentJob?.primary, withEffectiveDateField])

  const [schema, metadataConfig] = useMemo(
    () =>
      createCompensationSchema({
        mode,
        optionalFieldsToRequire,
        hireDate,
        minEffectiveDate: internalMinEffectiveDate,
        withEffectiveDateField,
      }),
    [mode, optionalFieldsToRequire, hireDate, internalMinEffectiveDate, withEffectiveDateField],
  )

  const state = currentWorkAddress?.state

  // `flsaStatus` is intentionally allowed to be undefined so the field renders
  // an empty placeholder when nothing is provided — partners can choose to
  // seed it via `defaultValues.flsaStatus`. When a `compensation` is loaded we
  // seed from it; for a brand-new secondary job we inherit from the primary's
  // current compensation so multi-job classification stays consistent. The
  // schema enforces requiredness on submit in `create` mode (see
  // `requiredFieldsConfig` in compensationSchema.ts).
  //
  // `title` lives on compensation in the API — `job.title` is a denormalized
  // snapshot of the primary comp's title that can lag behind comp-level edits
  // on secondaries. Seed directly from the loaded compensation so editing in
  // place can't silently re-introduce a stale title from the job record.
  const resolvedDefaults: CompensationFormData = useMemo(
    () => ({
      title: currentCompensation?.title ?? partnerDefaults?.title ?? '',
      // When adding a secondary, the FLSA must match the primary's — force it
      // here (overriding any partner default) so the form submits the right
      // value even though `Fields.FlsaStatus` is hidden.
      flsaStatus: isAddingSecondaryJob
        ? primaryFlsaStatus
        : (currentCompensation?.flsaStatus ??
          partnerDefaults?.flsaStatus ??
          primaryFlsaStatus ??
          undefined),
      rate: Number(currentCompensation?.rate ?? partnerDefaults?.rate ?? 0),
      adjustForMinimumWage:
        currentCompensation?.adjustForMinimumWage ?? partnerDefaults?.adjustForMinimumWage ?? false,
      minimumWageId:
        currentCompensation?.minimumWages?.[0]?.uuid ?? partnerDefaults?.minimumWageId ?? '',
      paymentUnit:
        currentCompensation?.paymentUnit ?? partnerDefaults?.paymentUnit ?? PAY_PERIODS.HOUR,
      effectiveDate: currentCompensation?.effectiveDate ?? partnerDefaults?.effectiveDate ?? null,
    }),
    [currentCompensation, currentJob, partnerDefaults, primaryFlsaStatus, isAddingSecondaryJob],
  )

  const formMethods = useForm<CompensationFormData, unknown, CompensationFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const { control, getValues, setValue, clearErrors } = formMethods
  const watchedFlsaStatus = useWatch({ control, name: 'flsaStatus' })
  const watchedAdjustForMinimumWage = useWatch({
    control,
    name: 'adjustForMinimumWage',
  })

  // Validation rules for `paymentUnit` and `rate` are FLSA-driven, so any
  // prior error on those fields is stale once FLSA changes. RHF doesn't clear
  // them on its own (`setValue` without `shouldValidate` skips the resolver,
  // and reValidate is per-field) — clear eagerly and let the next blur/submit
  // re-establish the error if it still applies.
  useEffect(() => {
    clearErrors(['paymentUnit', 'rate'])
    if (watchedFlsaStatus === FlsaStatus.OWNER) {
      setValue('paymentUnit', PAY_PERIODS.PAYCHECK)
    } else if (
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('paymentUnit', PAY_PERIODS.YEAR)
      setValue('rate', 0)
    } else {
      setValue('paymentUnit', resolvedDefaults.paymentUnit)
    }
  }, [watchedFlsaStatus, setValue, clearErrors, resolvedDefaults.paymentUnit])

  // The FLSA status that represents the employee's current classification.
  // In update mode this is the compensation being edited. In create mode
  // `currentCompensation` is null, so fall back to the job's active
  // compensation (identified by currentCompensationUuid) — this lets the
  // secondary-job warning fire even when scheduling a future-dated change.
  const currentJobActiveComp = currentJob
    ? currentJob.compensations?.find(c => c.uuid === currentJob.currentCompensationUuid)
    : undefined
  const effectiveBaseFlsaStatus =
    currentCompensation?.flsaStatus ?? currentJobActiveComp?.flsaStatus ?? null

  // True when the user is changing FLSA away from Nonexempt on a job that has
  // secondary jobs — those secondaries will be deleted by the API when the
  // new classification takes effect (immediately in update mode, at the chosen
  // effective date in create mode). Drives the warning and, in update mode
  // only, the effectiveDate-lock side effect below.
  const willDeleteSecondaryJobs =
    effectiveBaseFlsaStatus === FlsaStatus.NONEXEMPT &&
    watchedFlsaStatus !== undefined &&
    watchedFlsaStatus !== FlsaStatus.NONEXEMPT &&
    otherJobsCount > 0

  // Carve-out UX — update mode only: while willDeleteSecondaryJobs is active
  // the server deletes secondaries immediately on PUT. Mirror this by forcing
  // `effectiveDate` to today and disabling the field. In create mode the
  // deletion happens at the chosen future date, so we show the warning but
  // leave the date field editable.
  const carveOutActiveRef = useRef(false)
  const priorEffectiveDateRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isCreateMode && willDeleteSecondaryJobs && !carveOutActiveRef.current) {
      priorEffectiveDateRef.current = getValues('effectiveDate') ?? null
      setValue('effectiveDate', todayISO(), { shouldDirty: true, shouldValidate: false })
      carveOutActiveRef.current = true
    } else if (!isCreateMode && !willDeleteSecondaryJobs && carveOutActiveRef.current) {
      setValue('effectiveDate', priorEffectiveDateRef.current ?? null, {
        shouldDirty: true,
        shouldValidate: false,
      })
      priorEffectiveDateRef.current = null
      carveOutActiveRef.current = false
    }
  }, [isCreateMode, willDeleteSecondaryJobs, getValues, setValue])

  const updateCompensationMutation = useJobsAndCompensationsUpdateCompensationMutation()
  const createCompensationMutation = useJobsAndCompensationsCreateCompensationMutation()

  const isPending = updateCompensationMutation.isPending || createCompensationMutation.isPending

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('CompensationForm')

  const queriesForErrors = employeeId
    ? [jobsQuery, addressesQuery, employeeQuery, minWagesQuery]
    : []
  const errorHandling = composeErrorHandler(queriesForErrors, { submitError, setSubmitError })

  const isCommissionOnly =
    watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
    watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
  const isOwner = watchedFlsaStatus === FlsaStatus.OWNER

  // Hide `Fields.FlsaStatus` when the user has no meaningful choice:
  // - update mode editing a secondary whose comp is already Nonexempt
  //   (must keep matching the primary), and
  // - create mode while adding a secondary (must inherit primary's FLSA).
  // The first job's create flow and primary-job edits keep the field exposed.
  const isFlsaSelectionEnabled =
    !isAddingSecondaryJob &&
    (watchedFlsaStatus !== FlsaStatus.NONEXEMPT || currentJob?.primary === true || isCreateMode)

  const isAdjustMinimumWageEnabled =
    watchedFlsaStatus === FlsaStatus.NONEXEMPT &&
    minimumWages.length > 0 &&
    state !== undefined &&
    !TIP_CREDITS_UNSUPPORTED_STATES.includes(state)

  // Min-wage adjustment is only valid for Nonexempt FLSA (and a state that
  // allows tip credit). When the gate flips off — typically because the user
  // changed FLSA away from Nonexempt — `Fields.AdjustForMinimumWage` and
  // `Fields.MinimumWageId` stop rendering, but the underlying form values
  // persist in react-hook-form state. That would leak an
  // `adjust_for_minimum_wage: true` + `minimum_wages: [...]` body on submit
  // (server rejects with "Minimum wage adjustments only valid for
  // flsa_status: Nonexempt"). Reset both values to safe defaults so the
  // submitted payload always matches what the user can actually see.
  useEffect(() => {
    if (isAdjustMinimumWageEnabled) return
    if (getValues('adjustForMinimumWage')) {
      setValue('adjustForMinimumWage', false, { shouldDirty: true, shouldValidate: false })
    }
    if (getValues('minimumWageId')) {
      setValue('minimumWageId', '', { shouldDirty: true, shouldValidate: false })
    }
    // Both fields stop rendering once the gate closes — clear errors so a
    // stale one doesn't silently fail the next submit with no visible UI to fix.
    clearErrors(['adjustForMinimumWage', 'minimumWageId'])
  }, [isAdjustMinimumWageEnabled, getValues, setValue, clearErrors])

  const minimumWageOptions = minimumWages.map(wage => ({
    value: wage.uuid,
    label: `${wage.wage} - ${wage.authority}: ${wage.notes ?? ''}`,
  }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const effectiveDateMinDate = useMemo(
    () =>
      [internalMinEffectiveDate, hireDate]
        .filter((d): d is string => !!d)
        .reduce<string | null>((max, d) => (!max || d > max ? d : max), null),
    [internalMinEffectiveDate, hireDate],
  )
  const fieldsMetadata = {
    title: baseMetadata.title,
    effectiveDate: {
      ...baseMetadata.effectiveDate,
      isDisabled: willDeleteSecondaryJobs && !isCreateMode,
      minDate: effectiveDateMinDate,
      maxDate: maximumEffectiveDate,
    },
    flsaStatus: withOptions<FlsaStatusType>(
      baseMetadata.flsaStatus,
      flsaOptions,
      flsaStatusEntries,
    ),
    rate: { ...baseMetadata.rate, isDisabled: isCommissionOnly },
    paymentUnit: withOptions<PaymentUnit>(
      { ...baseMetadata.paymentUnit, isDisabled: isOwner || isCommissionOnly },
      paymentUnitOptions,
      paymentUnitEntries,
    ),
    adjustForMinimumWage: {
      ...baseMetadata.adjustForMinimumWage,
      isDisabled: !isAdjustMinimumWageEnabled,
    },
    minimumWageId: withOptions<MinimumWage>(
      baseMetadata.minimumWageId,
      minimumWageOptions,
      minimumWages,
    ),
  }

  const onSubmit = async (
    options?: CompensationSubmitOptions,
  ): Promise<HookSubmitResult<Compensation> | undefined> => {
    let submitResult: HookSubmitResult<Compensation> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: CompensationFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedJobId = options?.jobId ?? jobId
            const resolvedCompensationId = options?.compensationId ?? compensationId
            const resolvedMode = resolvedCompensationId ? 'update' : 'create'

            // When the field is rendered, the validated payload value wins
            // unless an explicit submit-time override is supplied. When the
            // field is hidden (`withEffectiveDateField: false`) we are
            // strictly options-only — matching `useWorkAddressForm` and the
            // hidden-field behavior of `useHomeAddressForm` / `useJobForm`.
            // The carve-out's form-state side effect (force value to today)
            // is therefore inert in the hidden-field path; partners who
            // need a specific date there must supply it via
            // `CompensationSubmitOptions.effectiveDate`.
            const resolvedEffectiveDate = withEffectiveDateField
              ? (options?.effectiveDate ?? payload.effectiveDate ?? undefined)
              : (options?.effectiveDate ?? undefined)

            const requestBodyBase = {
              rate: String(payload.rate),
              paymentUnit: payload.paymentUnit,
              flsaStatus: payload.flsaStatus,
              effectiveDate: resolvedEffectiveDate,
              title: payload.title || undefined,
              adjustForMinimumWage: payload.adjustForMinimumWage,
              minimumWages: payload.adjustForMinimumWage ? [{ uuid: payload.minimumWageId }] : [],
            }

            let result: Compensation | undefined

            if (resolvedMode === 'create') {
              if (!resolvedJobId) {
                throw new SDKInternalError(
                  'jobId is required to create a compensation. Pass it as a hook prop or via submit options.',
                )
              }
              // Schema's `requiredFieldsConfig` guarantees `flsaStatus` is set
              // on create-mode submit; the runtime guard appeases the API
              // request-body type (which requires a non-undefined value on
              // POST, vs. the optional PUT body).
              if (!payload.flsaStatus) {
                throw new SDKInternalError('flsaStatus is required to create a compensation.')
              }
              const createResponse = await createCompensationMutation.mutateAsync({
                request: {
                  jobId: resolvedJobId,
                  compensationsRequestBody: { ...requestBodyBase, flsaStatus: payload.flsaStatus },
                },
              })
              result = createResponse.compensation
              if (!result) throw new SDKInternalError('Compensation creation failed')
            } else {
              if (!resolvedCompensationId) {
                throw new SDKInternalError(
                  'compensationId is required to update a compensation. Pass it as a hook prop or via submit options.',
                )
              }
              const resolvedVersion =
                options?.compensationVersion ?? (currentCompensation?.version as string | undefined)
              if (!resolvedVersion) {
                throw new SDKInternalError(
                  'compensation version is required to update a compensation. Pass it via submit options when threading post-create, or ensure the compensation is loaded.',
                )
              }
              const updateResponse = await updateCompensationMutation.mutateAsync({
                request: {
                  compensationId: resolvedCompensationId,
                  compensationsUpdateRequestBody: {
                    version: resolvedVersion,
                    ...requestBodyBase,
                  },
                },
              })
              result = updateResponse.compensation
              if (!result) throw new SDKInternalError('Compensation update failed')
            }

            submitResult = { mode: resolvedMode, data: result }
          })
          resolve()
        },
        () => {
          resolve()
        },
      )()
    })

    return submitResult
  }

  const isDataLoading = employeeId
    ? jobsQuery.isLoading ||
      addressesQuery.isLoading ||
      employeeQuery.isLoading ||
      minWagesQuery.isLoading
    : false

  const hookFormInternals = useHookFormInternals(formMethods)

  if (isDataLoading || (employeeId && (!employeeJobs || !employee))) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      compensation: currentCompensation,
      currentJob,
      minimumWages,
      minimumEffectiveDate: effectiveDateMinDate,
      maximumEffectiveDate,
      hasPendingFutureCompensation,
    },
    status: {
      isPending,
      mode,
      willDeleteSecondaryJobs,
      showCommissionFederalMinimumPayAlert: watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT,
      showCommissionMinimumWageAlert: watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
      showOwnerSalaryAlert: watchedFlsaStatus === FlsaStatus.OWNER,
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Title: TitleField,
        FlsaStatus: isFlsaSelectionEnabled ? FlsaStatusField : undefined,
        Rate: isCommissionOnly ? undefined : RateField,
        PaymentUnit: isCommissionOnly ? undefined : PaymentUnitField,
        AdjustForMinimumWage: isAdjustMinimumWageEnabled ? AdjustForMinimumWageField : undefined,
        MinimumWageId:
          isAdjustMinimumWageEnabled && watchedAdjustForMinimumWage
            ? MinimumWageIdField
            : undefined,
        EffectiveDate: withEffectiveDateField ? EffectiveDateField : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link useCompensationForm} — either the loading state or the ready state.
 *
 * @remarks
 * Use this type when threading the hook result through helpers (e.g.
 * presentational components). Discriminate on `isLoading` to narrow to
 * {@link UseCompensationFormReady}.
 *
 * @public
 */
export type UseCompensationFormResult = HookLoadingResult | UseCompensationFormReady

/**
 * Metadata for each {@link useCompensationForm} field, exposed on `form.fieldsMetadata`.
 *
 * @remarks
 * Includes per-field `isDisabled`, `isRequired`, and the dynamic option list
 * for select fields (`flsaStatus`, `paymentUnit`, `minimumWageId`).
 * `effectiveDate` additionally carries `minDate` / `maxDate` derived from
 * the parent job's hire date and any pending future compensation.
 *
 * @public
 */
export type CompensationFieldsMetadata = UseCompensationFormReady['form']['fieldsMetadata']
