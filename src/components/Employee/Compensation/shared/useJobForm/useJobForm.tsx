import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsUpdate'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsUpdateCompensation'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import { useFederalTaxDetailsGet } from '@gusto/embedded-api-v-2025-11-15/react-query/federalTaxDetailsGet'
import {
  createJobSchema,
  type JobOptionalFieldsToRequire,
  type JobFormData,
  type JobFormOutputs,
} from './jobSchema'
import {
  JobTitleField,
  HireDateField,
  TwoPercentShareholderField,
  StateWcCoveredField,
  StateWcClassCodeField,
} from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { WA_RISK_CLASS_CODES, type WARiskClassCode } from '@/models/WA_RISK_CODES'

/**
 * Submit-time overrides for `useJobForm.actions.onSubmit`. Use these when one or
 * more values aren't known at hook construction — typically because they're
 * produced earlier in the same submit chain (e.g. the employee's ID after a
 * preceding `useEmployeeDetailsForm` submit) or derived from external context
 * (e.g. an onboarding `startDate`).
 *
 * @public
 */
export interface JobSubmitOptions {
  /** Override the `employeeId` configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
  /**
   * Supply `hireDate` at submit time rather than via a rendered field. Use
   * with `withHireDateField: false` for screens that derive hireDate from
   * external context (e.g. the employee's `startDate` during onboarding).
   * Falls back to the loaded job's `hireDate` on update mode when omitted;
   * required (or sourced from a partner default) on create mode.
   */
  hireDate?: string
}

/**
 * Configuration options for {@link useJobForm}.
 *
 * @public
 */
export interface UseJobFormProps {
  /** UUID of the employee whose job is being created or updated. Optional when the ID is created later in the same submit chain — pass it via {@link JobSubmitOptions.employeeId} instead. */
  employeeId?: string
  /** Present → update mode (PUT /v1/jobs/:id with `version`). Omitted → create mode (POST /v1/employees/:id/jobs). */
  jobId?: string
  /** Promote otherwise-optional fields to required for a given mode. See {@link JobOptionalFieldsToRequire}. */
  optionalFieldsToRequire?: JobOptionalFieldsToRequire
  /** Pre-fill form values. Server data takes precedence on update mode. */
  defaultValues?: Partial<JobFormData>
  /** Passed through to react-hook-form's `mode`; defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Auto-focus the first invalid field on submit. Defaults to `true`; set to `false` when coordinating multiple forms through `composeSubmitHandler`. */
  shouldFocusError?: boolean
  /**
   * When `false`, hides `Fields.HireDate` (becomes `undefined`) and removes
   * `hireDate` from schema validation. Partners supply the value via
   * `JobSubmitOptions.hireDate` at submit time, or rely on the loaded job's
   * existing value on update. Use this when the date is driven by external
   * context rather than user input (e.g. the employee's `startDate`).
   * Defaults to `true`.
   */
  withHireDateField?: boolean
  /**
   * When `false`, hides `Fields.Title` (becomes `undefined`), removes
   * `title` from schema validation, and skips sending `title` on PUT/POST.
   * Use this when another form owns the title field — e.g. compensation
   * edit surfaces render the title via `CompFields.Title` because title
   * lives on compensation in the API (`job.title` is just a denormalized
   * snapshot of the primary comp's title). Defaults to `true` so the
   * standalone job-creation flow still gathers a title for the create
   * body.
   */
  withTitleField?: boolean
}

/**
 * Field components exposed by `useJobForm.form.Fields`. Each entry is either the
 * field component to render or `undefined` when the field doesn't apply to the
 * current company / employee context (e.g. `TwoPercentShareholder` is only
 * present for S-Corp companies). Check truthiness before rendering.
 *
 * @public
 */
export interface JobFormFields {
  /** Text input for the job title. `undefined` when `withTitleField: false`. */
  Title: typeof JobTitleField | undefined
  /** Date picker for the hire date. `undefined` when `withHireDateField: false`. */
  HireDate: typeof HireDateField | undefined
  /** Checkbox for the S-Corp 2% shareholder flag. `undefined` when the company is not taxable as an S-Corp. */
  TwoPercentShareholder: typeof TwoPercentShareholderField | undefined
  /** Radio group for Washington state workers' comp coverage. `undefined` when the employee's active work address is not in WA. */
  StateWcCovered: typeof StateWcCoveredField | undefined
  /** Select for the Washington state workers' comp risk class code. `undefined` when WA WC doesn't apply or when `stateWcCovered` is `false`. */
  StateWcClassCode: typeof StateWcClassCodeField | undefined
}

/**
 * The ready (non-loading) branch of the `useJobForm` return value. Carries the
 * loaded job and supporting entities, the bound field components, submission
 * action, and `errorHandling` aggregated across the hook's underlying queries.
 *
 * @public
 */
export interface UseJobFormReady extends BaseFormHookReady<
  FieldsMetadata,
  JobFormData,
  JobFormFields
> {
  /** Loaded entities backing the form, plus derived booleans for conditional field rendering. */
  data: {
    /** The job row loaded for update; `null` in create mode. */
    currentJob: Job | null
    /** All jobs for the employee, when employeeId is set. Useful for screen-level cross-checks across jobs. */
    jobs: Job[] | undefined
    /** The employee whose job is being edited. */
    employee: Employee | null
    /** The employee's active work address, used to determine state-specific fields. */
    currentWorkAddress: EmployeeWorkAddress | null
    /** True when the company is taxable as an S-Corp; partners use this to decide whether to render `TwoPercentShareholder`. */
    showTwoPercentShareholder: boolean
    /**
     * True when the active work-address state is WA; partners use this to decide whether to render
     * `StateWcCovered`. `Fields.StateWcClassCode` is additionally gated on `stateWcCovered === true`,
     * so partners typically only need to check `Fields.StateWcCovered` / `Fields.StateWcClassCode`
     * truthiness rather than this flag directly.
     */
    showStateWc: boolean
  }
  /** Submission status. `isPending` covers both the primary create/update and any post-PUT corrective work on secondary compensations. `mode` reports the current verb. */
  status: { isPending: boolean; mode: 'create' | 'update' }
  /** Action callbacks; `onSubmit` validates and PUTs/POSTs the job, returning the saved entity. */
  actions: {
    onSubmit: (options?: JobSubmitOptions) => Promise<HookSubmitResult<Job> | undefined>
  }
}

function findJob(jobs: Job[] | undefined, jobId: string | undefined): Job | null {
  if (!jobs || !jobId) return null
  return jobs.find(j => j.uuid === jobId) ?? null
}

/**
 * Headless form hook for creating or updating an employee's job — title, hire date,
 * S-Corp 2% shareholder flag, and Washington state workers' compensation fields.
 * Companion hook to `useCompensationForm`; jobs and their compensations are separate
 * entities in the Gusto API and this hook focuses exclusively on the job side.
 *
 * @remarks
 * Auto-routes between create and update based on `jobId`: present →
 * `PUT /v1/jobs/:jobId` (with `version`); absent → `POST /v1/employees/:employeeId/jobs`.
 * Creating a job auto-creates a stub compensation; on the onboarding stub-fill chain,
 * capture `currentCompensationUuid` and the comp's `version` from the submit result
 * and thread them into `useCompensationForm.actions.onSubmit` as `jobId`,
 * `compensationId`, and `compensationVersion` to update the stub.
 *
 * @param input - Configuration options for the form. See {@link UseJobFormProps}.
 * @returns A {@link HookLoadingResult} while underlying queries load, or a
 *   {@link UseJobFormReady} once data is ready with bound `Fields`, `actions.onSubmit`,
 *   and `errorHandling`.
 * @public
 *
 * @example
 * ```tsx
 * import { useJobForm, SDKFormProvider, type UseJobFormReady } from '@gusto/embedded-react-sdk'
 *
 * function JobPage({ employeeId, jobId }: { employeeId: string; jobId?: string }) {
 *   const job = useJobForm({ employeeId, jobId })
 *   if (job.isLoading) return <div>Loading...</div>
 *   return <JobFormReady job={job} />
 * }
 *
 * function JobFormReady({ job }: { job: UseJobFormReady }) {
 *   const { Fields } = job.form
 *   return (
 *     <SDKFormProvider formHookResult={job}>
 *       <form
 *         onSubmit={async e => {
 *           e.preventDefault()
 *           await job.actions.onSubmit()
 *         }}
 *       >
 *         {Fields.Title && (
 *           <Fields.Title label="Job title" validationMessages={{ REQUIRED: 'Job title is required' }} />
 *         )}
 *         {Fields.HireDate && (
 *           <Fields.HireDate label="Hire date" validationMessages={{ REQUIRED: 'Hire date is required' }} />
 *         )}
 *         {Fields.TwoPercentShareholder && (
 *           <Fields.TwoPercentShareholder label="Employee is a 2% shareholder" />
 *         )}
 *         {Fields.StateWcCovered && <Fields.StateWcCovered label="Workers' compensation coverage" />}
 *         {Fields.StateWcClassCode && (
 *           <Fields.StateWcClassCode
 *             label="Risk class code"
 *             validationMessages={{ REQUIRED: 'Please select a risk class code' }}
 *           />
 *         )}
 *         <button type="submit" disabled={job.status.isPending}>
 *           {job.status.mode === 'create' ? 'Add job' : 'Save job'}
 *         </button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useJobForm({
  employeeId,
  jobId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
  withHireDateField = true,
  withTitleField = true,
}: UseJobFormProps): HookLoadingResult | UseJobFormReady {
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
  const currentWorkAddress = workAddresses?.find(address => address.active) ?? null
  const employee = employeeQuery.data?.employee ?? null
  const companyUuid = employee?.companyUuid

  const taxQuery = useFederalTaxDetailsGet(
    { companyId: companyUuid ?? '' },
    { enabled: !!companyUuid },
  )
  const federalTaxDetails = taxQuery.data?.federalTaxDetails
  const showTwoPercentShareholder = federalTaxDetails?.taxableAsScorp === true
  const showStateWc = currentWorkAddress?.state === 'WA'

  const currentJob = useMemo(() => findJob(employeeJobs, jobId), [employeeJobs, jobId])
  const isCreateMode = !jobId
  const mode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () => createJobSchema({ mode, optionalFieldsToRequire, withHireDateField, withTitleField }),
    [mode, optionalFieldsToRequire, withHireDateField, withTitleField],
  )

  const resolvedDefaults: JobFormData = useMemo(
    () => ({
      title: currentJob?.title ?? partnerDefaults?.title ?? '',
      hireDate: currentJob?.hireDate ?? partnerDefaults?.hireDate ?? null,
      twoPercentShareholder:
        currentJob?.twoPercentShareholder ?? partnerDefaults?.twoPercentShareholder ?? false,
      stateWcCovered: currentJob?.stateWcCovered ?? partnerDefaults?.stateWcCovered ?? false,
      stateWcClassCode: currentJob?.stateWcClassCode ?? partnerDefaults?.stateWcClassCode ?? '',
    }),
    [currentJob, partnerDefaults],
  )

  const formMethods = useForm<JobFormData, unknown, JobFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const watchedStateWcCovered = useWatch({ control: formMethods.control, name: 'stateWcCovered' })

  const createJobMutation = useJobsAndCompensationsCreateJobMutation()
  const updateJobMutation = useJobsAndCompensationsUpdateMutation()
  const updateSecondaryCompMutation = useJobsAndCompensationsUpdateCompensationMutation()
  // Tracks the post-primary-PUT corrective block (jobs refetch + parallel
  // secondary comp PUTs). No single mutation hook reports `isPending` for the
  // whole window — the refetch isn't a mutation, and `Promise.all` over one
  // mutation hook makes its `isPending` track the latest-settled call — so we
  // OR this in to keep the spinner solid through it.
  const [isCorrectingSecondaries, setIsCorrectingSecondaries] = useState(false)
  const isPending =
    createJobMutation.isPending ||
    updateJobMutation.isPending ||
    updateSecondaryCompMutation.isPending ||
    isCorrectingSecondaries

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('JobForm')

  const queriesForErrors = employeeId ? [jobsQuery, addressesQuery, employeeQuery, taxQuery] : []
  const errorHandling = composeErrorHandler(queriesForErrors, { submitError, setSubmitError })

  const stateWcClassCodeOptions = WA_RISK_CLASS_CODES.map(({ code, description }) => ({
    value: code,
    label: `${code}: ${description}`,
  }))

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    title: baseMetadata.title,
    hireDate: baseMetadata.hireDate,
    twoPercentShareholder: {
      ...baseMetadata.twoPercentShareholder,
      isDisabled: !showTwoPercentShareholder,
    },
    stateWcCovered: withOptions<boolean>(
      { ...baseMetadata.stateWcCovered, isDisabled: !showStateWc },
      [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      [true, false],
    ),
    stateWcClassCode: withOptions<WARiskClassCode>(
      { ...baseMetadata.stateWcClassCode, isDisabled: !showStateWc },
      stateWcClassCodeOptions,
      WA_RISK_CLASS_CODES,
    ),
  }

  const onSubmit = async (
    options?: JobSubmitOptions,
  ): Promise<HookSubmitResult<Job> | undefined> => {
    let submitResult: HookSubmitResult<Job> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: JobFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const resolvedEmployeeId = options?.employeeId ?? employeeId
            if (!resolvedEmployeeId) {
              throw new SDKInternalError('employeeId is required to submit a job')
            }

            const stateWcClassCode = payload.stateWcCovered ? payload.stateWcClassCode : null

            // Mirror the work/home address pattern: when the field is rendered
            // the payload value wins; when it isn't, fall back to a submit-time
            // override (`options.hireDate`), then to the loaded job's existing
            // value on update mode. Create mode requires a resolved value —
            // hireDate is mandatory on POST /v1/employees/:id/jobs.
            const resolvedHireDate =
              withHireDateField && payload.hireDate
                ? payload.hireDate
                : (options?.hireDate ?? currentJob?.hireDate ?? null)

            // When the title field is suppressed (steady-state edits drive
            // title through useCompensationForm), omit it from the body so
            // the server preserves the existing value rather than clobbering
            // it with whatever sat in form state.
            const titleToSend = withTitleField ? payload.title : undefined

            // When a primary job's hire_date is PUT and the value actually
            // changes, the API unconditionally overwrites every secondary's
            // current-compensation effective_date to match the new hire_date —
            // even when the secondary's original effective_date was already on
            // or after the new hire_date. Read those originals now so we can
            // PUT them back below; by the time we re-fetch they'll be gone.
            const shouldCorrectSecondaries =
              !isCreateMode &&
              currentJob?.primary === true &&
              !!resolvedHireDate &&
              resolvedHireDate !== currentJob.hireDate
            const secondaryJobEffectiveDates = shouldCorrectSecondaries
              ? (employeeJobs ?? [])
                  .filter(j => !j.primary && j.currentCompensationUuid)
                  .map(j => ({
                    compId: j.currentCompensationUuid!,
                    effectiveDate: j.compensations?.find(c => c.uuid === j.currentCompensationUuid)
                      ?.effectiveDate,
                  }))
              : []

            let updatedJob: Job

            if (isCreateMode) {
              if (!resolvedHireDate) {
                throw new SDKInternalError(
                  withHireDateField
                    ? 'hireDate is required to create a job'
                    : 'hireDate is required to create a job. Pass it via JobSubmitOptions when withHireDateField is false.',
                )
              }
              if (titleToSend === undefined) {
                throw new SDKInternalError(
                  'title is required to create a job. Set withTitleField: true (the default) on useJobForm for create flows.',
                )
              }
              const result = await createJobMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  jobsCreateRequestBody: {
                    title: titleToSend,
                    hireDate: resolvedHireDate,
                    twoPercentShareholder: payload.twoPercentShareholder,
                    stateWcCovered: payload.stateWcCovered,
                    stateWcClassCode,
                  },
                },
              })
              if (!result.job) {
                throw new SDKInternalError('Job creation failed')
              }
              updatedJob = result.job
            } else {
              if (!currentJob) {
                throw new SDKInternalError('Cannot update job: no matching job on file')
              }
              const result = await updateJobMutation.mutateAsync({
                request: {
                  jobId: currentJob.uuid,
                  jobsUpdateRequestBody: {
                    version: currentJob.version as string,
                    title: titleToSend,
                    hireDate: resolvedHireDate ?? undefined,
                    twoPercentShareholder: payload.twoPercentShareholder,
                    stateWcCovered: payload.stateWcCovered,
                    stateWcClassCode,
                  },
                },
              })
              if (!result.job) {
                throw new SDKInternalError('Job update failed')
              }
              updatedJob = result.job

              // The primary PUT above clobbered each secondary's
              // current-compensation effective_date. Refetch jobs for the
              // bumped versions, then PUT each secondary back to
              // max(originalEffectiveDate, newHireDate) in parallel — the
              // requests are independent (different compensation_id, separate
              // versions), and `Promise.all` still surfaces the first
              // rejection through the surrounding baseSubmitHandler's catch.
              if (shouldCorrectSecondaries && secondaryJobEffectiveDates.length > 0) {
                setIsCorrectingSecondaries(true)
                try {
                  const refreshed = await jobsQuery.refetch()
                  const freshComps = (refreshed.data?.jobs ?? []).flatMap(
                    j => j.compensations ?? [],
                  )
                  await Promise.all(
                    secondaryJobEffectiveDates.flatMap(entry => {
                      const freshComp = freshComps.find(c => c.uuid === entry.compId)
                      if (!freshComp?.version) return []

                      const desired =
                        !entry.effectiveDate || entry.effectiveDate < resolvedHireDate
                          ? resolvedHireDate
                          : entry.effectiveDate

                      return [
                        updateSecondaryCompMutation.mutateAsync({
                          request: {
                            compensationId: entry.compId,
                            compensationsUpdateRequestBody: {
                              version: freshComp.version,
                              effectiveDate: desired,
                            },
                          },
                        }),
                      ]
                    }),
                  )
                } finally {
                  setIsCorrectingSecondaries(false)
                }
              }
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: updatedJob,
            }
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
    ? jobsQuery.isLoading || addressesQuery.isLoading || employeeQuery.isLoading
    : false

  const hookFormInternals = useHookFormInternals(formMethods)

  if (isDataLoading || (employeeId && (!employeeJobs || !employee))) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      currentJob,
      jobs: employeeJobs,
      employee,
      currentWorkAddress,
      showTwoPercentShareholder,
      showStateWc,
    },
    status: {
      isPending,
      mode: isCreateMode ? 'create' : 'update',
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        Title: withTitleField ? JobTitleField : undefined,
        HireDate: withHireDateField ? HireDateField : undefined,
        TwoPercentShareholder: showTwoPercentShareholder ? TwoPercentShareholderField : undefined,
        StateWcCovered: showStateWc ? StateWcCoveredField : undefined,
        StateWcClassCode: showStateWc && watchedStateWcCovered ? StateWcClassCodeField : undefined,
      },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Discriminated union returned by {@link useJobForm}: either a loading state or
 * a fully-loaded {@link UseJobFormReady}. Narrow on `isLoading` to access form
 * data and actions.
 *
 * @public
 */
export type UseJobFormResult = HookLoadingResult | UseJobFormReady

/**
 * Per-field metadata exposed by `useJobForm.form.fieldsMetadata` — `isRequired`,
 * `isDisabled`, validation rules, and options for choice fields. Drives the
 * bound `Fields.*` components but also available directly for custom field
 * renderings.
 *
 * @public
 */
export type JobFieldsMetadata = UseJobFormReady['form']['fieldsMetadata']
