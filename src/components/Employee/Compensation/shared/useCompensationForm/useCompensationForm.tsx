import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Compensation, PaymentUnit } from '@gusto/embedded-api/models/components/compensation'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateCompensation'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdateCompensation'
import { useLocationsGetMinimumWages } from '@gusto/embedded-api/react-query/locationsGetMinimumWages'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
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
}

export interface UseCompensationFormProps {
  employeeId?: string
  /** When updating, the parent job's UUID. Used to scope minimum wages and to derive `status.willDeleteSecondaryJobs`. */
  jobId?: string
  /** Present → update mode (PUT /v1/compensations/:id). Omitted → create mode (POST /v1/jobs/:jobId/compensations). */
  compensationId?: string
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  defaultValues?: Partial<CompensationFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
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
    /** The parent job (when `jobId` resolves), used for derived helpers. */
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

function findCompensation(
  job: Job | null,
  compensationId: string | undefined,
): Compensation | null {
  if (!job || !compensationId) return null
  return job.compensations?.find(c => c.uuid === compensationId) ?? null
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
}: UseCompensationFormProps): HookLoadingResult | UseCompensationFormReady {
  const jobsQuery = useJobsAndCompensationsGetJobs(
    { employeeId: employeeId ?? '' },
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

  const currentJob = useMemo<Job | null>(() => {
    if (!employeeJobs) return null
    if (jobId) return employeeJobs.find(j => j.uuid === jobId) ?? null
    return null
  }, [employeeJobs, jobId])

  const currentCompensation = useMemo(
    () => findCompensation(currentJob, compensationId),
    [currentJob, compensationId],
  )

  const otherJobsCount = useMemo(() => {
    if (!employeeJobs || !currentJob) return 0
    return employeeJobs.filter(j => j.uuid !== currentJob.uuid).length
  }, [employeeJobs, currentJob])

  // FLSA status of the employee's primary job's current compensation, when one
  // exists. Used as a fallback default when adding a *secondary* job/comp so the
  // multi-job classification stays consistent with the primary by default — the
  // user can still override it (when allowed). Null when there is no primary
  // job or it has no current compensation yet.
  const primaryFlsaStatus = useMemo<FlsaStatusType | null>(() => {
    if (!employeeJobs) return null
    for (const job of employeeJobs) {
      if (!job.primary) continue
      const compensation = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
      if (compensation?.flsaStatus) return compensation.flsaStatus
    }
    return null
  }, [employeeJobs])

  const hireDate = currentJob?.hireDate ?? null

  const futureCompensations = useMemo(() => {
    if (!currentJob?.compensations) return []
    const today = todayISO()
    return currentJob.compensations.filter(
      c => c.effectiveDate !== undefined && c.effectiveDate > today,
    )
  }, [currentJob])

  const hasPendingFutureCompensation = futureCompensations.length > 0
  const maximumEffectiveDate = useMemo(() => {
    if (futureCompensations.length === 0) return null
    return futureCompensations.reduce<string | null>((min, c) => {
      const d = c.effectiveDate
      if (!d) return min
      if (!min || d < min) return d
      return min
    }, null)
  }, [futureCompensations])

  const isCreateMode = !compensationId
  const mode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () => createCompensationSchema({ mode, optionalFieldsToRequire, hireDate }),
    [mode, optionalFieldsToRequire, hireDate],
  )

  const state = currentWorkAddress?.state

  // `flsaStatus` is intentionally allowed to be undefined so the field renders
  // an empty placeholder when nothing is provided — partners can choose to
  // seed it via `defaultValues.flsaStatus`. When a `compensation` is loaded we
  // seed from it; for a brand-new secondary job we inherit from the primary's
  // current compensation so multi-job classification stays consistent. The
  // schema enforces requiredness on submit in `create` mode (see
  // `requiredFieldsConfig` in compensationSchema.ts).
  const resolvedDefaults: CompensationFormData = useMemo(
    () => ({
      title: currentCompensation?.title ?? partnerDefaults?.title ?? '',
      flsaStatus:
        currentCompensation?.flsaStatus ??
        partnerDefaults?.flsaStatus ??
        primaryFlsaStatus ??
        undefined,
      rate: Number(currentCompensation?.rate ?? partnerDefaults?.rate ?? 0),
      adjustForMinimumWage:
        currentCompensation?.adjustForMinimumWage ?? partnerDefaults?.adjustForMinimumWage ?? false,
      minimumWageId:
        currentCompensation?.minimumWages?.[0]?.uuid ?? partnerDefaults?.minimumWageId ?? '',
      paymentUnit:
        currentCompensation?.paymentUnit ?? partnerDefaults?.paymentUnit ?? PAY_PERIODS.HOUR,
      effectiveDate: currentCompensation?.effectiveDate ?? partnerDefaults?.effectiveDate ?? null,
    }),
    [currentCompensation, partnerDefaults, primaryFlsaStatus],
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

  // Carve-out UX (matches gws-flows): when the user flips a Nonexempt primary
  // compensation to a non-Nonexempt status while secondary jobs exist, the
  // server only honors the change immediately — saving "deletes" the
  // secondary jobs. Mirror the screen UX by forcing `effectiveDate` to today
  // (so submits route through PUT-current rather than create-future) and
  // disabling the field. Snapshot the prior value so a revert (back to
  // Nonexempt before saving) restores what the user had selected.
  const currentCompensationFlsaStatus = currentCompensation?.flsaStatus
  const carveOutActiveRef = useRef(false)
  const priorEffectiveDateRef = useRef<string | null>(null)
  useEffect(() => {
    const carveOutBranch =
      !isCreateMode &&
      currentCompensationFlsaStatus === FlsaStatus.NONEXEMPT &&
      watchedFlsaStatus !== undefined &&
      watchedFlsaStatus !== FlsaStatus.NONEXEMPT &&
      otherJobsCount > 0

    if (carveOutBranch && !carveOutActiveRef.current) {
      priorEffectiveDateRef.current = getValues('effectiveDate') ?? null
      setValue('effectiveDate', todayISO(), { shouldDirty: true, shouldValidate: false })
      carveOutActiveRef.current = true
    } else if (!carveOutBranch && carveOutActiveRef.current) {
      setValue('effectiveDate', priorEffectiveDateRef.current ?? null, {
        shouldDirty: true,
        shouldValidate: false,
      })
      priorEffectiveDateRef.current = null
      carveOutActiveRef.current = false
    }
  }, [
    isCreateMode,
    currentCompensationFlsaStatus,
    watchedFlsaStatus,
    otherJobsCount,
    getValues,
    setValue,
  ])

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

  const isFlsaSelectionEnabled =
    watchedFlsaStatus !== FlsaStatus.NONEXEMPT || currentJob?.primary === true || isCreateMode

  const isAdjustMinimumWageEnabled =
    watchedFlsaStatus === FlsaStatus.NONEXEMPT &&
    minimumWages.length > 0 &&
    state !== undefined &&
    !TIP_CREDITS_UNSUPPORTED_STATES.includes(state)

  const minimumWageOptions = minimumWages.map(wage => ({
    value: wage.uuid,
    label: `${wage.wage} - ${wage.authority}: ${wage.notes ?? ''}`,
  }))

  // Carve-out branch — true when the form is currently positioned to delete
  // secondary jobs on submit. The hook locks `effectiveDate` to today and
  // disables the field while this is true (see effect above), so the flag
  // is also the trigger for an inline warning above the form.
  const willDeleteSecondaryJobs =
    !isCreateMode &&
    currentCompensationFlsaStatus === FlsaStatus.NONEXEMPT &&
    watchedFlsaStatus !== undefined &&
    watchedFlsaStatus !== FlsaStatus.NONEXEMPT &&
    otherJobsCount > 0

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    title: baseMetadata.title,
    effectiveDate: { ...baseMetadata.effectiveDate, isDisabled: willDeleteSecondaryJobs },
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

            const requestBodyBase = {
              rate: String(payload.rate),
              paymentUnit: payload.paymentUnit,
              flsaStatus: payload.flsaStatus,
              effectiveDate: payload.effectiveDate ?? undefined,
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
      minimumEffectiveDate: hireDate,
      maximumEffectiveDate,
      hasPendingFutureCompensation,
    },
    status: {
      isPending,
      mode: isCreateMode ? 'create' : 'update',
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
        EffectiveDate: EffectiveDateField,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseCompensationFormResult = HookLoadingResult | UseCompensationFormReady
export type CompensationFieldsMetadata = UseCompensationFormReady['form']['fieldsMetadata']
