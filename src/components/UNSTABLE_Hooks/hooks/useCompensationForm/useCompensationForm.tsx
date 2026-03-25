import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { Resolver, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Compensation, PaymentUnit } from '@gusto/embedded-api/models/components/compensation'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdate'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdateCompensation'
import { useLocationsGetMinimumWages } from '@gusto/embedded-api/react-query/locationsGetMinimumWages'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useFederalTaxDetailsGet } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import type { HookSubmitResult } from '../../types'
import { useErrorHandling } from '../../useErrorHandling'
import { withOptions } from '../../form/withOptions'
import { deriveFieldsMetadata } from '../../form/deriveFieldsMetadata'
import { createGetFormSubmissionValues } from '../../form/getFormSubmissionValues'
import type { RequiredFieldsInput } from '../../form/resolveRequiredFields'
import {
  createCompensationSchema,
  type CompensationField,
  type CompensationFormData,
  type CompensationFormOutputs,
} from './compensationSchema'
import {
  JobTitleField,
  FlsaStatusField,
  RateField,
  PaymentUnitField,
  AdjustForMinimumWageField,
  MinimumWageIdField,
  TwoPercentShareholderField,
  StateWcCoveredField,
  StateWcClassCodeField,
  StartDateField,
} from './fields'
import { FlsaStatus, PAY_PERIODS, TIP_CREDITS_UNSUPPORTED_STATES } from '@/shared/constants'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { WA_RISK_CLASS_CODES, type WARiskClassCode } from '@/models/WA_RISK_CODES'

export interface CompensationSubmitCallbacks {
  onJobCreated?: (job: Job) => void
  onJobUpdated?: (job: Job) => void
  onCompensationUpdated?: (compensation: Compensation | undefined) => void
}

export interface CompensationSubmitOptions {
  startDate?: string
}

export type CompensationRequiredFields = RequiredFieldsInput<CompensationField>

export interface UseCompensationFormProps {
  employeeId: string
  withStartDateField?: boolean
  jobId?: string
  requiredFields?: CompensationRequiredFields
  defaultValues?: Partial<CompensationFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

function findCurrentCompensation(job?: Job | null): Compensation | undefined {
  return job?.compensations?.find(comp => comp.uuid === job.currentCompensationUuid)
}

type FlsaStatusValue = CompensationFormData['flsaStatus']

function derivePrimaryFlsaStatus(jobs: Job[]): FlsaStatusValue | undefined {
  return jobs.reduce<FlsaStatusValue | undefined>((prev, curr) => {
    const compensation = curr.compensations?.find(
      comp => comp.uuid === curr.currentCompensationUuid,
    )
    if (!curr.primary || !compensation) return prev
    return compensation.flsaStatus ?? prev
  }, undefined)
}

const flsaStatusEntries: FlsaStatusType[] = (
  Object.keys(FlsaStatus) as Array<keyof typeof FlsaStatus>
).map(key => FlsaStatus[key])

const flsaOptions = flsaStatusEntries.map(status => ({
  value: status,
  label: status,
}))

const paymentUnitEntries: PaymentUnit[] = [
  PAY_PERIODS.HOUR,
  PAY_PERIODS.WEEK,
  PAY_PERIODS.MONTH,
  PAY_PERIODS.YEAR,
  PAY_PERIODS.PAYCHECK,
]

const paymentUnitOptions = paymentUnitEntries.map(unit => ({
  value: unit,
  label: unit,
}))

export function useCompensationForm({
  employeeId,
  withStartDateField = true,
  jobId,
  requiredFields,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseCompensationFormProps) {
  const jobsQuery = useJobsAndCompensationsGetJobs({ employeeId })
  const addressesQuery = useEmployeeAddressesGetWorkAddresses({ employeeId })
  const employeeQuery = useEmployeesGet({ employeeId })

  const employeeJobs = jobsQuery.data?.jobList
  const workAddresses = addressesQuery.data?.employeeWorkAddressesList
  const currentWorkAddress = workAddresses?.find(address => address.active)
  const locationUuid = currentWorkAddress?.locationUuid
  const employee = employeeQuery.data?.employee
  const companyUuid = employee?.companyUuid

  const minWagesQuery = useLocationsGetMinimumWages(
    { locationUuid: locationUuid ?? '' },
    { enabled: !!locationUuid },
  )

  const taxQuery = useFederalTaxDetailsGet(
    { companyId: companyUuid ?? '' },
    { enabled: !!companyUuid },
  )

  const minimumWages = minWagesQuery.data?.minimumWageList ?? []
  const federalTaxDetails = taxQuery.data?.federalTaxDetails
  const showTwoPercentStakeholder = federalTaxDetails?.taxPayerType === 'S-Corporation'

  const currentJob = useMemo<Job | null>(() => {
    if (!employeeJobs) return null
    if (jobId) {
      return employeeJobs.find(j => j.uuid === jobId) ?? null
    }
    return employeeJobs.length === 1 ? (employeeJobs[0] ?? null) : null
  }, [employeeJobs, jobId])

  const currentCompensation = useMemo(() => findCurrentCompensation(currentJob), [currentJob])

  const primaryFlsaStatus = useMemo(() => {
    if (!employeeJobs) return undefined
    return derivePrimaryFlsaStatus(employeeJobs)
  }, [employeeJobs])

  const isCreateMode = !currentJob
  const mode = isCreateMode ? 'create' : 'update'

  const schema = createCompensationSchema({
    mode,
    requiredFields,
    withStartDateField,
  })

  const state = currentWorkAddress?.state

  const hireDate = currentJob?.hireDate
  const resolvedDefaults: CompensationFormData = {
    jobTitle: currentJob?.title || partnerDefaults?.jobTitle || '',
    flsaStatus:
      currentCompensation?.flsaStatus ??
      primaryFlsaStatus ??
      partnerDefaults?.flsaStatus ??
      FlsaStatus.NONEXEMPT,
    rate: Number(currentCompensation?.rate ?? partnerDefaults?.rate ?? 0),
    adjustForMinimumWage: currentCompensation?.adjustForMinimumWage ?? false,
    minimumWageId: currentCompensation?.minimumWages?.[0]?.uuid ?? '',
    paymentUnit:
      currentCompensation?.paymentUnit ?? partnerDefaults?.paymentUnit ?? PAY_PERIODS.HOUR,
    stateWcCovered: currentJob?.stateWcCovered ?? false,
    stateWcClassCode: currentJob?.stateWcClassCode ?? '',
    twoPercentShareholder: currentJob?.twoPercentShareholder ?? false,
    startDate: hireDate ?? partnerDefaults?.startDate ?? null,
  }

  const formMethods = useForm<CompensationFormData, unknown, CompensationFormOutputs>({
    resolver: zodResolver(schema) as unknown as Resolver<CompensationFormData>,
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const watchedFlsaStatus = useWatch({
    control: formMethods.control,
    name: 'flsaStatus',
  })
  const watchedAdjustForMinimumWage = useWatch({
    control: formMethods.control,
    name: 'adjustForMinimumWage',
  })
  const watchedStateWcCovered = useWatch({
    control: formMethods.control,
    name: 'stateWcCovered',
  })

  useEffect(() => {
    if (watchedFlsaStatus === FlsaStatus.OWNER) {
      formMethods.setValue('paymentUnit', PAY_PERIODS.PAYCHECK)
    } else if (
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      formMethods.setValue('paymentUnit', PAY_PERIODS.YEAR)
      formMethods.setValue('rate', 0)
    } else {
      formMethods.setValue('paymentUnit', resolvedDefaults.paymentUnit)
    }
  }, [watchedFlsaStatus, formMethods.setValue, resolvedDefaults.paymentUnit])

  const updateCompensationMutation = useJobsAndCompensationsUpdateCompensationMutation()
  const createJobMutation = useJobsAndCompensationsCreateJobMutation()
  const updateJobMutation = useJobsAndCompensationsUpdateMutation()

  const isPending =
    updateCompensationMutation.isPending ||
    createJobMutation.isPending ||
    updateJobMutation.isPending

  const { baseSubmitHandler, error: submitError, setError } = useBaseSubmit('CompensationForm')

  const queries = [jobsQuery, addressesQuery, employeeQuery, minWagesQuery, taxQuery]
  const errorHandling = useErrorHandling(queries, { error: submitError, setError })

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

  const isWaState = state === 'WA'

  const minimumWageOptions = minimumWages.map(wage => ({
    value: wage.uuid,
    label: `${wage.wage} - ${wage.authority}: ${wage.notes ?? ''}`,
  }))

  const stateWcClassCodeOptions = WA_RISK_CLASS_CODES.map(({ code, description }) => ({
    value: code,
    label: `${code}: ${description}`,
  }))

  const baseMetadata = deriveFieldsMetadata(schema)
  const fieldsMetadata = {
    startDate: baseMetadata.startDate,
    jobTitle: baseMetadata.jobTitle,
    flsaStatus: withOptions<FlsaStatusType>(
      baseMetadata.flsaStatus,
      flsaOptions,
      flsaStatusEntries,
    ),
    rate: { ...baseMetadata.rate, isRequired: true, isDisabled: isCommissionOnly },
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
    twoPercentShareholder: {
      ...baseMetadata.twoPercentShareholder,
      isDisabled: !showTwoPercentStakeholder,
    },
    stateWcCovered: withOptions<string>(
      { ...baseMetadata.stateWcCovered, isDisabled: !isWaState },
      [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      ['yes', 'no'],
    ),
    stateWcClassCode: withOptions<WARiskClassCode>(
      { ...baseMetadata.stateWcClassCode, isDisabled: !isWaState },
      stateWcClassCodeOptions,
      WA_RISK_CLASS_CODES,
    ),
  }

  const onSubmit = async (
    callbacks?: CompensationSubmitCallbacks,
    options?: CompensationSubmitOptions,
  ): Promise<HookSubmitResult<Compensation | undefined> | undefined> => {
    let submitResult: HookSubmitResult<Compensation | undefined> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: CompensationFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const {
              jobTitle,
              twoPercentShareholder,
              startDate: formStartDate,
              ...compensationData
            } = payload

            const resolvedHireDate =
              withStartDateField && formStartDate ? formStartDate : options?.startDate

            let updatedJobData: Job

            if (!currentJob) {
              if (!resolvedHireDate) {
                throw new SDKInternalError('Start date is required')
              }

              const result = await createJobMutation.mutateAsync({
                request: {
                  employeeId,
                  requestBody: {
                    title: jobTitle,
                    hireDate: resolvedHireDate,
                    stateWcCovered: compensationData.stateWcCovered,
                    stateWcClassCode: compensationData.stateWcCovered
                      ? compensationData.stateWcClassCode
                      : null,
                    twoPercentShareholder: twoPercentShareholder ?? false,
                  },
                },
              })
              updatedJobData = result.job!
              callbacks?.onJobCreated?.(updatedJobData)
            } else {
              const result = await updateJobMutation.mutateAsync({
                request: {
                  jobId: currentJob.uuid,
                  requestBody: {
                    title: jobTitle,
                    version: currentJob.version as string,
                    hireDate: resolvedHireDate,
                    stateWcClassCode: compensationData.stateWcCovered
                      ? compensationData.stateWcClassCode
                      : null,
                    stateWcCovered: compensationData.stateWcCovered,
                    twoPercentShareholder: twoPercentShareholder ?? false,
                  },
                },
              })
              updatedJobData = result.job!
              callbacks?.onJobUpdated?.(updatedJobData)
            }

            const { compensation } = await updateCompensationMutation.mutateAsync({
              request: {
                compensationId: updatedJobData.currentCompensationUuid!,
                compensationsUpdateRequestBody: {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                  version: updatedJobData.compensations?.find(
                    comp => comp.uuid === updatedJobData.currentCompensationUuid,
                  )?.version!,
                  ...compensationData,
                  rate: String(compensationData.rate),
                  minimumWages: compensationData.adjustForMinimumWage
                    ? [{ uuid: compensationData.minimumWageId }]
                    : [],
                },
              },
            })

            callbacks?.onCompensationUpdated?.(compensation)

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: compensation,
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

  const isDataLoading =
    jobsQuery.isLoading ||
    addressesQuery.isLoading ||
    employeeQuery.isLoading ||
    minWagesQuery.isLoading ||
    taxQuery.isLoading

  if (
    isDataLoading ||
    !employeeJobs ||
    !workAddresses ||
    !currentWorkAddress ||
    !employee ||
    !companyUuid ||
    !federalTaxDetails
  ) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      compensation: currentCompensation ?? null,
      jobs: employeeJobs,
      currentJob,
      minimumWages,
    },
    status: {
      isPending,
      mode: isCreateMode ? 'create' : 'update',
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        StartDate: withStartDateField ? StartDateField : undefined,
        JobTitle: JobTitleField,
        FlsaStatus: isFlsaSelectionEnabled ? FlsaStatusField : undefined,
        Rate: RateField,
        PaymentUnit: PaymentUnitField,
        AdjustForMinimumWage: isAdjustMinimumWageEnabled ? AdjustForMinimumWageField : undefined,
        MinimumWageId:
          isAdjustMinimumWageEnabled && watchedAdjustForMinimumWage
            ? MinimumWageIdField
            : undefined,
        TwoPercentShareholder: showTwoPercentStakeholder ? TwoPercentShareholderField : undefined,
        StateWcCovered: isWaState ? StateWcCoveredField : undefined,
        StateWcClassCode: isWaState && watchedStateWcCovered ? StateWcClassCodeField : undefined,
      },
      fieldsMetadata,
      hookFormInternals: { formMethods },
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type UseCompensationFormResult = ReturnType<typeof useCompensationForm>
export type UseCompensationFormReady = Extract<UseCompensationFormResult, { data: object }>
export type CompensationFieldsMetadata = UseCompensationFormReady['form']['fieldsMetadata']
export type CompensationFormFields = UseCompensationFormReady['form']['Fields']
