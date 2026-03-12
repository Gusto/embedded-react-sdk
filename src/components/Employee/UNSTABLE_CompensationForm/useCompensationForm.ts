import { useCallback, useMemo, useRef, useState } from 'react'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdate'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdateCompensation'
import { useLocationsGetMinimumWages } from '@gusto/embedded-api/react-query/locationsGetMinimumWages'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useFederalTaxDetailsGet } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import {
  generateCompensationFormBaseSchema,
  generateCompensationFormSchema,
  compensationFormErrorCodes,
  getFlsaDerivedValues,
  getFlsaFieldOverrides,
  type CompensationFormData,
  type FlsaDerivedValues,
} from './schema'
import { FlsaStatus } from '@/shared/constants'
import { WA_RISK_CLASS_CODES } from '@/models/WA_RISK_CODES'
import { assertResponseData } from '@/helpers/assertResponseData'
import { deriveFieldsFromSchema, type HookLoadingResult } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useQueryErrorHandler } from '@/hooks/useQueryErrorHandler'

interface UseCompensationFormParams {
  employeeId: string
  startDate: string
  jobId?: string
}

const findCurrentCompensation = (job?: Job | null) => {
  return job?.compensations?.find(comp => comp.uuid === job.currentCompensationUuid)
}

const stateWcClassCodeOptions = WA_RISK_CLASS_CODES.map(({ code, description }) => ({
  value: code,
  label: `${code}: ${description}`,
}))

export function useCompensationForm({ employeeId, startDate, jobId }: UseCompensationFormParams) {
  const [currentFlsaStatus, setCurrentFlsaStatus] = useState<string>()
  const defaultPaymentUnitRef = useRef<CompensationFormData['paymentUnit'] | undefined>(undefined)

  const onFlsaStatusChange = useCallback((newFlsaStatus: string): FlsaDerivedValues => {
    setCurrentFlsaStatus(newFlsaStatus)
    return getFlsaDerivedValues(newFlsaStatus, defaultPaymentUnitRef.current)
  }, [])

  const {
    data: jobsData,
    isLoading: isJobsLoading,
    error: jobsError,
  } = useJobsAndCompensationsGetJobs({ employeeId })

  const {
    data: addressData,
    isLoading: isAddressLoading,
    error: addressError,
  } = useEmployeeAddressesGetWorkAddresses({ employeeId })

  const {
    data: employeeData,
    isLoading: isEmployeeLoading,
    error: employeeError,
  } = useEmployeesGet({ employeeId })

  const employee = employeeData?.employee
  const companyId = employee?.companyUuid

  const employeeJobs = jobsData?.jobList ?? []
  const workAddresses = addressData?.employeeWorkAddressesList ?? []
  const currentWorkAddress = workAddresses.find(address => address.active)

  const {
    data: minimumWageData,
    isLoading: isMinWageLoading,
    error: minWageError,
  } = useLocationsGetMinimumWages(
    { locationUuid: currentWorkAddress?.locationUuid ?? '' },
    { enabled: !!currentWorkAddress?.locationUuid },
  )
  const minimumWages = minimumWageData?.minimumWageList ?? []

  const {
    data: taxData,
    isLoading: isTaxLoading,
    error: taxError,
  } = useFederalTaxDetailsGet({ companyId: companyId ?? '' }, { enabled: !!companyId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const queryErrors = useMemo(
    () => [jobsError, addressError, employeeError, minWageError, taxError],
    [jobsError, addressError, employeeError, minWageError, taxError],
  )
  useQueryErrorHandler(queryErrors, setError)

  const currentJob = useMemo(() => {
    if (jobId) return employeeJobs.find(job => job.uuid === jobId) ?? null
    if (employeeJobs.length === 1) return employeeJobs[0] ?? null
    return null
  }, [jobId, employeeJobs])

  const mode: 'create' | 'update' = currentJob ? 'update' : 'create'

  const currentCompensation = findCurrentCompensation(currentJob)

  const primaryFlsaStatus = useMemo<string | undefined>(() => {
    return employeeJobs.reduce<string | undefined>((prev, curr) => {
      const compensation = curr.compensations?.find(
        comp => comp.uuid === curr.currentCompensationUuid,
      )
      if (!curr.primary || !compensation) return prev
      return compensation.flsaStatus ?? prev
    }, undefined)
  }, [employeeJobs])

  const isLoading =
    isJobsLoading || isAddressLoading || isEmployeeLoading || isMinWageLoading || isTaxLoading

  const createJobMutation = useJobsAndCompensationsCreateJobMutation()
  const updateJobMutation = useJobsAndCompensationsUpdateMutation()
  const updateCompensationMutation = useJobsAndCompensationsUpdateCompensationMutation()

  if (isLoading) {
    return { isLoading: true as const }
  }

  const showTwoPercentStakeholder = taxData?.federalTaxDetails?.taxPayerType === 'S-Corporation'
  const isWashingtonState = currentWorkAddress?.state === 'WA'

  const isFlsaSelectionEnabled =
    mode === 'create' ||
    currentJob?.primary ||
    currentCompensation?.flsaStatus !== FlsaStatus.NONEXEMPT

  const hasMinimumWages = minimumWages.length > 0

  const minimumWageOptions = minimumWages.map(wage => ({
    value: wage.uuid,
    label: `${wage.wage} - ${wage.authority}: ${wage.notes ?? ''}`,
  }))

  const baseSchema = generateCompensationFormBaseSchema()
  const schema = generateCompensationFormSchema()
  const baseFields = deriveFieldsFromSchema(baseSchema)

  const defaultPaymentUnit = currentCompensation?.paymentUnit ?? 'Hour'
  defaultPaymentUnitRef.current = defaultPaymentUnit

  const activeFlsaStatus = currentFlsaStatus ?? currentCompensation?.flsaStatus ?? primaryFlsaStatus

  const flsaOverrides = activeFlsaStatus
    ? getFlsaFieldOverrides(activeFlsaStatus, hasMinimumWages)
    : undefined

  const fields = {
    ...baseFields,
    flsaStatus: {
      ...baseFields.flsaStatus,
      isDisabled: !isFlsaSelectionEnabled,
    },
    rate: { ...baseFields.rate, ...flsaOverrides?.rate },
    paymentUnit: { ...baseFields.paymentUnit, ...flsaOverrides?.paymentUnit },
    adjustForMinimumWage: {
      ...baseFields.adjustForMinimumWage,
      isDisabled: !hasMinimumWages,
      ...flsaOverrides?.adjustForMinimumWage,
    },
    minimumWageId: {
      ...baseFields.minimumWageId,
      options: minimumWageOptions,
      isDisabled: !hasMinimumWages,
      ...flsaOverrides?.minimumWageId,
    },
    twoPercentShareholder: {
      ...baseFields.twoPercentShareholder,
      isDisabled: !showTwoPercentStakeholder,
    },
    stateWcCovered: {
      ...baseFields.stateWcCovered,
      isDisabled: !isWashingtonState,
    },
    stateWcClassCode: {
      ...baseFields.stateWcClassCode,
      options: stateWcClassCodeOptions,
      isDisabled: !isWashingtonState,
    },
  }

  const defaultValues = {
    jobTitle: currentJob?.title ?? '',
    flsaStatus: currentCompensation?.flsaStatus ?? primaryFlsaStatus ?? '',
    rate: Number(currentCompensation?.rate ?? 0),
    adjustForMinimumWage: currentCompensation?.adjustForMinimumWage ?? false,
    minimumWageId: currentCompensation?.minimumWages?.[0]?.uuid ?? '',
    paymentUnit: defaultPaymentUnit,
    stateWcCovered: currentJob?.stateWcCovered ?? false,
    stateWcClassCode: currentJob?.stateWcClassCode ?? '',
    twoPercentShareholder: currentJob?.twoPercentShareholder ?? false,
  }

  const onSubmit = async (data: CompensationFormData): Promise<Compensation | undefined> => {
    return baseSubmitHandler(data, async payload => {
      const { jobTitle, twoPercentShareholder, ...compensationData } = payload

      let updatedJob: Job

      if (mode === 'create') {
        const result = await createJobMutation.mutateAsync({
          request: {
            employeeId,
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
        assertResponseData(result.job, 'job')
        updatedJob = result.job
      } else {
        const result = await updateJobMutation.mutateAsync({
          request: {
            jobId: currentJob!.uuid,
            requestBody: {
              title: jobTitle,
              version: currentJob!.version as string,
              hireDate: startDate,
              stateWcClassCode: compensationData.stateWcCovered
                ? compensationData.stateWcClassCode
                : null,
              stateWcCovered: compensationData.stateWcCovered,
              twoPercentShareholder: twoPercentShareholder ?? false,
            },
          },
        })
        assertResponseData(result.job, 'job')
        updatedJob = result.job
      }

      const { compensation } = await updateCompensationMutation.mutateAsync({
        request: {
          compensationId: updatedJob.currentCompensationUuid!,
          requestBody: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            version: updatedJob.compensations?.find(
              comp => comp.uuid === updatedJob.currentCompensationUuid,
            )?.version!,
            ...compensationData,
            rate: String(compensationData.rate),
            minimumWages: compensationData.adjustForMinimumWage
              ? [{ uuid: compensationData.minimumWageId }]
              : [],
          },
        },
      })

      assertResponseData(compensation, 'compensation')
      return compensation
    })
  }

  return {
    isLoading: false as const,
    schema,
    fields,
    mode,
    data: {
      currentJob,
      currentCompensation,
      employeeJobs,
      primaryFlsaStatus,
    },
    defaultValues,
    onSubmit,
    onFlsaStatusChange,
    isPending:
      createJobMutation.isPending ||
      updateJobMutation.isPending ||
      updateCompensationMutation.isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: compensationFormErrorCodes,
  }
}

export type CompensationFormReady = Exclude<
  ReturnType<typeof useCompensationForm>,
  HookLoadingResult
>
