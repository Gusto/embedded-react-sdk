import { useEffect, useRef, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdate'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdateCompensation'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useLocationsGetMinimumWages } from '@gusto/embedded-api/react-query/locationsGetMinimumWages'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useFederalTaxDetailsGet } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import {
  useQueryErrorHandler,
  type HookFormInternals,
  type HookLoadingResult,
  type HookErrors,
  type HookSubmitResult,
} from '../../helpers'
import type { FieldsMetadata } from '../../FormFieldsContext'
import { generateCompensationSchema, type CompensationFormData } from './schema'
import * as CompensationFields from './CompensationFields'
import type { CompensationFieldComponents } from './CompensationFields'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { FlsaStatus } from '@/shared/constants'
import useNumberFormatter from '@/hooks/useNumberFormatter'

const findCurrentCompensation = (job?: Job | null) => {
  return job?.compensations?.find(comp => comp.uuid === job.currentCompensationUuid)
}

interface UseCompensationFormParams {
  employeeId?: string
  startDate?: string
  shouldFocusError?: boolean
}

export interface CompensationData {
  currentJob: Job | undefined
  currentCompensation: Compensation | undefined
  minimumWages: MinimumWage[]
  showTwoPercentShareholder: boolean
  workAddressState: string | undefined
}

export interface CompensationFormReady {
  isLoading: false
  isPending: boolean
  mode: 'create' | 'update'
  data: CompensationData
  onSubmit: (submittedEmployeeId?: string) => Promise<HookSubmitResult<Compensation> | undefined>
  Fields: CompensationFieldComponents
  hookFormInternals: HookFormInternals<CompensationFormData>
  fieldsMetadata: FieldsMetadata<CompensationFormData>
  errors: HookErrors
}

export type UseCompensationFormResult = HookLoadingResult | CompensationFormReady

export function useCompensationForm({
  employeeId,
  startDate,
  shouldFocusError = true,
}: UseCompensationFormParams): UseCompensationFormResult {
  const formatCurrency = useNumberFormatter('currency')

  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    error: jobsQueryError,
  } = useJobsAndCompensationsGetJobs({ employeeId: employeeId! }, { enabled: !!employeeId })

  const {
    data: employeeData,
    isLoading: isLoadingEmployee,
    error: employeeQueryError,
  } = useEmployeesGet({ employeeId: employeeId! }, { enabled: !!employeeId })

  const {
    data: workAddressData,
    isLoading: isLoadingWorkAddresses,
    error: workAddressQueryError,
  } = useEmployeeAddressesGetWorkAddresses({ employeeId: employeeId! }, { enabled: !!employeeId })

  const activeWorkAddress = workAddressData?.employeeWorkAddressesList?.find(a => a.active)
  const locationUuid = activeWorkAddress?.locationUuid

  const {
    data: minimumWagesData,
    isLoading: isLoadingMinimumWages,
    error: minimumWagesQueryError,
  } = useLocationsGetMinimumWages({ locationUuid: locationUuid! }, { enabled: !!locationUuid })

  const companyId = employeeData?.employee?.companyUuid

  const {
    data: federalTaxData,
    isLoading: isLoadingFederalTax,
    error: federalTaxQueryError,
  } = useFederalTaxDetailsGet({ companyId: companyId! }, { enabled: !!companyId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  useQueryErrorHandler(
    [
      jobsQueryError,
      employeeQueryError,
      workAddressQueryError,
      minimumWagesQueryError,
      federalTaxQueryError,
    ],
    setError,
  )

  const schema = useMemo(() => generateCompensationSchema(), [])

  const employeeJobs = jobsData?.jobList ?? []
  const primaryJob = employeeJobs.length > 0 ? (employeeJobs[0] ?? undefined) : undefined
  const currentCompensation = findCurrentCompensation(primaryJob)
  const mode = primaryJob ? 'update' : 'create'
  const minimumWages = minimumWagesData?.minimumWageList ?? []
  const showTwoPercentShareholder =
    federalTaxData?.federalTaxDetails?.taxPayerType === 'S-Corporation'
  const workAddressState = activeWorkAddress?.state

  const formMethods = useForm<CompensationFormData>({
    resolver: zodResolver(schema),
    shouldFocusError,
    defaultValues: {
      jobTitle: '',
      flsaStatus: undefined,
      rate: 0,
      paymentUnit: 'Hour',
      adjustForMinimumWage: false,
      minimumWageId: '',
      twoPercentShareholder: false,
      stateWcCovered: false,
      stateWcClassCode: '',
    },
  })

  const hasInitializedForm = useRef(false)
  useEffect(() => {
    if (primaryJob && !hasInitializedForm.current) {
      hasInitializedForm.current = true
      formMethods.reset({
        jobTitle: primaryJob.title ?? '',
        flsaStatus: currentCompensation?.flsaStatus as CompensationFormData['flsaStatus'],
        rate: Number(currentCompensation?.rate ?? 0),
        paymentUnit: (currentCompensation?.paymentUnit ??
          'Hour') as CompensationFormData['paymentUnit'],
        adjustForMinimumWage: currentCompensation?.adjustForMinimumWage ?? false,
        minimumWageId: currentCompensation?.minimumWages?.[0]?.uuid ?? '',
        twoPercentShareholder: primaryJob.twoPercentShareholder ?? false,
        stateWcCovered: primaryJob.stateWcCovered ?? false,
        stateWcClassCode: primaryJob.stateWcClassCode ?? '',
      })
    }
  }, [primaryJob, currentCompensation, formMethods.reset])

  const watchedFlsaStatus = useWatch({ control: formMethods.control, name: 'flsaStatus' })

  const isCommissionOnly =
    watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT ||
    watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT

  const isOwner = watchedFlsaStatus === FlsaStatus.OWNER

  useEffect(() => {
    if (isOwner) {
      formMethods.setValue('paymentUnit', 'Paycheck')
    } else if (isCommissionOnly) {
      formMethods.setValue('paymentUnit', 'Year')
      formMethods.setValue('rate', 0)
    }
  }, [watchedFlsaStatus, formMethods.setValue, isCommissionOnly, isOwner])

  const createJobMutation = useJobsAndCompensationsCreateJobMutation()
  const updateJobMutation = useJobsAndCompensationsUpdateMutation()
  const updateCompensationMutation = useJobsAndCompensationsUpdateCompensationMutation()

  const onSubmit = async (
    submittedEmployeeId?: string,
  ): Promise<HookSubmitResult<Compensation> | undefined> => {
    const resolvedEmployeeId = submittedEmployeeId ?? employeeId
    if (!resolvedEmployeeId) {
      throw new Error('employeeId is required for compensation submission')
    }

    return new Promise<HookSubmitResult<Compensation> | undefined>((resolve, reject) => {
      formMethods
        .handleSubmit(
          async (data: CompensationFormData) => {
            const result = await baseSubmitHandler(data, async payload => {
              const { jobTitle, twoPercentShareholder, ...compensationData } = payload

              let updatedJob: Job

              if (primaryJob) {
                const { job } = await updateJobMutation.mutateAsync({
                  request: {
                    jobId: primaryJob.uuid,
                    requestBody: {
                      title: jobTitle,
                      version: primaryJob.version!,
                      hireDate: startDate,
                      stateWcCovered: compensationData.stateWcCovered,
                      stateWcClassCode: compensationData.stateWcCovered
                        ? compensationData.stateWcClassCode
                        : null,
                      twoPercentShareholder: twoPercentShareholder ?? false,
                    },
                  },
                })
                updatedJob = job!
              } else {
                if (!startDate) {
                  throw new Error('startDate is required when creating a new job')
                }
                const { job } = await createJobMutation.mutateAsync({
                  request: {
                    employeeId: resolvedEmployeeId,
                    requestBody: {
                      title: jobTitle,
                      hireDate: startDate,
                      stateWcCovered: compensationData.stateWcCovered,
                      stateWcClassCode: compensationData.stateWcCovered
                        ? compensationData.stateWcClassCode
                        : null,
                      twoPercentShareholder: twoPercentShareholder ?? false,
                    },
                  },
                })
                updatedJob = job!
              }

              const currentComp = updatedJob.compensations?.find(
                comp => comp.uuid === updatedJob.currentCompensationUuid,
              )

              const { compensation } = await updateCompensationMutation.mutateAsync({
                request: {
                  compensationId: updatedJob.currentCompensationUuid!,
                  requestBody: {
                    version: currentComp?.version ?? '',
                    ...compensationData,
                    rate: String(compensationData.rate),
                    minimumWages: compensationData.adjustForMinimumWage
                      ? [{ uuid: compensationData.minimumWageId }]
                      : [],
                  },
                },
              })

              return compensation
            })
            resolve(result ? { mode, data: result } : undefined)
          },
          () => {
            resolve(undefined)
          },
        )()
        .catch(reject)
    })
  }

  const isLoading =
    isLoadingJobs ||
    isLoadingEmployee ||
    isLoadingWorkAddresses ||
    isLoadingMinimumWages ||
    isLoadingFederalTax

  if (isLoading) {
    return { isLoading: true as const }
  }

  const isPrimaryOrInitial = primaryJob?.primary || !primaryJob
  const isNonexemptWithMinimumWages =
    currentCompensation?.flsaStatus === FlsaStatus.NONEXEMPT && minimumWages.length > 0

  const Fields: CompensationFieldComponents = {
    JobTitle: CompensationFields.JobTitle,
    FlsaStatus: isPrimaryOrInitial ? CompensationFields.FlsaStatus : undefined,
    Rate: CompensationFields.Rate,
    PaymentUnit: CompensationFields.PaymentUnit,
    AdjustForMinimumWage: isNonexemptWithMinimumWages
      ? CompensationFields.AdjustForMinimumWage
      : undefined,
    MinimumWageId: isNonexemptWithMinimumWages ? CompensationFields.MinimumWageId : undefined,
    TwoPercentShareholder: showTwoPercentShareholder
      ? CompensationFields.TwoPercentShareholder
      : undefined,
    StateWcCovered: workAddressState === 'WA' ? CompensationFields.StateWcCovered : undefined,
    StateWcClassCode: workAddressState === 'WA' ? CompensationFields.StateWcClassCode : undefined,
  }

  return {
    isLoading: false as const,
    isPending:
      createJobMutation.isPending ||
      updateJobMutation.isPending ||
      updateCompensationMutation.isPending,
    mode,
    data: {
      currentJob: primaryJob,
      currentCompensation,
      minimumWages,
      showTwoPercentShareholder,
      workAddressState,
    },
    onSubmit,
    Fields,
    hookFormInternals: { formMethods },
    fieldsMetadata: {
      rate: {
        isDisabled: isCommissionOnly,
      },
      paymentUnit: {
        isDisabled: isCommissionOnly || isOwner,
      },
      minimumWageId: {
        entries: minimumWages,
        options: minimumWages.map(wage => ({
          label: `${formatCurrency(Number(wage.wage))} - ${wage.authority}: ${wage.notes ?? ''}`,
          value: wage.uuid,
        })),
      },
    },
    errors: { error, fieldErrors, setError },
  }
}
