import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdate'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useFederalTaxDetailsGet } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
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

export interface JobSubmitOptions {
  /** Override the `employeeId` configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
}

export interface UseJobFormProps {
  employeeId?: string
  /** Present → update mode (PUT /v1/jobs/:id with `version`). Omitted → create mode (POST /v1/employees/:id/jobs). */
  jobId?: string
  optionalFieldsToRequire?: JobOptionalFieldsToRequire
  defaultValues?: Partial<JobFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

export interface JobFormFields {
  Title: typeof JobTitleField
  HireDate: typeof HireDateField
  TwoPercentShareholder: typeof TwoPercentShareholderField | undefined
  StateWcCovered: typeof StateWcCoveredField | undefined
  StateWcClassCode: typeof StateWcClassCodeField | undefined
}

export interface UseJobFormReady extends BaseFormHookReady<
  FieldsMetadata,
  JobFormData,
  JobFormFields
> {
  data: {
    /** The job row loaded for update; `null` in create mode. */
    currentJob: Job | null
    /** All jobs for the employee, when employeeId is set. Useful for screen-level cross-checks across jobs. */
    jobs: Job[] | undefined
    employee: Employee | null
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
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: {
    onSubmit: (options?: JobSubmitOptions) => Promise<HookSubmitResult<Job> | undefined>
  }
}

function findJob(jobs: Job[] | undefined, jobId: string | undefined): Job | null {
  if (!jobs || !jobId) return null
  return jobs.find(j => j.uuid === jobId) ?? null
}

export function useJobForm({
  employeeId,
  jobId,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
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
    () => createJobSchema({ mode, optionalFieldsToRequire }),
    [mode, optionalFieldsToRequire],
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
  const isPending = createJobMutation.isPending || updateJobMutation.isPending

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

            let updatedJob: Job

            if (isCreateMode) {
              if (!payload.hireDate) {
                throw new SDKInternalError('hireDate is required to create a job')
              }
              const result = await createJobMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  jobsCreateRequestBody: {
                    title: payload.title,
                    hireDate: payload.hireDate,
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
                    title: payload.title,
                    hireDate: payload.hireDate ?? undefined,
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
        Title: JobTitleField,
        HireDate: HireDateField,
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

export type UseJobFormResult = HookLoadingResult | UseJobFormReady
export type JobFieldsMetadata = UseJobFormReady['form']['fieldsMetadata']
