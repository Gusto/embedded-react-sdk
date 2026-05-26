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

export interface UseCompensationFormProps {
  employeeId?: string
  /** The parent job's UUID. Required in create mode (scopes `POST /v1/jobs/:jobId/compensations`). Optional in update mode — the parent job is derived from the loaded compensation. */
  jobId?: string
  /** Present → update mode (PUT /v1/compensations/:id). Omitted → create mode (POST /v1/jobs/:jobId/compensations). */
  compensationId?: string
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  defaultValues?: Partial<CompensationFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
  /**
   * When `false`, hides `Fields.EffectiveDate` (becomes `undefined`) and
   * removes `effectiveDate` from schema validation. In this mode the hook
   * does not read any form value at submit time — `effective_date` is
   * omitted from the request body unless explicitly supplied via
   * `CompensationSubmitOptions.effectiveDate`. This matches the
   * options-only convention of `useWorkAddressForm` /
   * `useHomeAddressForm` / `useJobForm`, and means the
   * `willDeleteSecondaryJobs` carve-out's form-state side effects do not
   * leak onto the wire (there is no field to render them in anyway).
   * Defaults to `true`.
   */
  withEffectiveDateField?: boolean
}

export interface CompensationFormFields {
  Title: typeof TitleField
  FlsaStatus: typeof FlsaStatusField | undefined
  Rate: typeof RateField
  PaymentUnit: typeof PaymentUnitField
  AdjustForMinimumWage: typeof AdjustForMinimumWageField | undefined
  MinimumWageId: typeof MinimumWageIdField | undefined
  EffectiveDate: typeof EffectiveDateField | undefined
}

export interface UseCompensationFormReady extends BaseFormHookReady<
  FieldsMetadata,
  CompensationFormData,
  CompensationFormFields
> {
  data: {
    /** The compensation row loaded for update; `null` in create mode. */
    compensation: Compensation | null
    /** The parent job. In update mode it's derived from the loaded compensation; in create mode it's looked up by `jobId`. `null` if neither resolves. */
    currentJob: Job | null
    minimumWages: MinimumWage[]
    /** Lower bound for `effectiveDate` (typically the parent job's hire date). */
    minimumEffectiveDate: string | null
    /** Upper bound for `effectiveDate` — the next scheduled future compensation's effective date, when one exists. */
    maximumEffectiveDate: string | null
    /** True when at least one future-dated compensation already exists for this job. */
    hasPendingFutureCompensation: boolean
  }
  status: {
    isPending: boolean
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
  }
  actions: {
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
    // Secondary jobs being created (AddAnotherJob) have no hireDate until the
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
  // `title` falls back to the parent job's title when the loaded compensation
  // row has none — a compensation only carries a non-null `title` when an
  // explicit title change has been scheduled on it. For steady-state edits
  // we want the input to show the employee's current title as the starting
  // value so the user can edit-in-place rather than re-typing.
  const resolvedDefaults: CompensationFormData = useMemo(
    () => ({
      title: currentCompensation?.title ?? currentJob?.title ?? partnerDefaults?.title ?? '',
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

  const { control, getValues, setValue } = formMethods
  const watchedFlsaStatus = useWatch({ control, name: 'flsaStatus' })
  const watchedAdjustForMinimumWage = useWatch({
    control,
    name: 'adjustForMinimumWage',
  })

  useEffect(() => {
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
  }, [watchedFlsaStatus, setValue, resolvedDefaults.paymentUnit])

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
  }, [isAdjustMinimumWageEnabled, getValues, setValue])

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
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Title: TitleField,
        FlsaStatus: isFlsaSelectionEnabled ? FlsaStatusField : undefined,
        Rate: RateField,
        PaymentUnit: PaymentUnitField,
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

export type UseCompensationFormResult = HookLoadingResult | UseCompensationFormReady
export type CompensationFieldsMetadata = UseCompensationFormReady['form']['fieldsMetadata']
