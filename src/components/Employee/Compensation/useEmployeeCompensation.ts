import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useJobsAndCompensationsGetJobsSuspense } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdate'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDelete'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdateCompensation'
import { useLocationsGetMinimumWagesSuspense } from '@gusto/embedded-api/react-query/locationsGetMinimumWages'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { type Job } from '@gusto/embedded-api/models/components/job'
import { useFederalTaxDetailsGetSuspense } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import {
  type CompensationInputs,
  type CompensationOutputs,
  CompensationSchema,
  type MODE,
} from './useCompensation'
import type { CompensationDefaultValues } from './Compensation'
import { useBase } from '@/components/Base'
import { componentEvents, FlsaStatus } from '@/shared/constants'

interface UseEmployeeCompensationProps {
  employeeId: string
  startDate: string
  defaultValues?: CompensationDefaultValues
}

const findCurrentCompensation = (employeeJob?: Job | null) => {
  return employeeJob?.compensations?.find(comp => comp.uuid === employeeJob.currentCompensationUuid)
}

export function useEmployeeCompensation({
  employeeId,
  startDate,
  defaultValues: propDefaults,
}: UseEmployeeCompensationProps) {
  const { baseSubmitHandler, onEvent } = useBase()

  const { data: jobsData } = useJobsAndCompensationsGetJobsSuspense({ employeeId })
  const employeeJobs = jobsData.jobList!

  const { data: addressesData } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })
  const workAddresses = addressesData.employeeWorkAddressesList!

  const currentWorkAddress = workAddresses.find(address => address.active)!

  const {
    data: { minimumWageList },
  } = useLocationsGetMinimumWagesSuspense({
    locationUuid: currentWorkAddress.locationUuid!,
  })
  const minimumWages = minimumWageList!

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })

  if (!employee) {
    throw new Error('Employee not found')
  }

  const { data } = useFederalTaxDetailsGetSuspense({ companyId: employee.companyUuid! })
  const showTwoPercentStakeholder = data.federalTaxDetails!.taxPayerType === 'S-Corporation'

  const updateCompensationMutation = useJobsAndCompensationsUpdateCompensationMutation()
  const createEmployeeJobMutation = useJobsAndCompensationsCreateJobMutation()
  const updateEmployeeJobMutation = useJobsAndCompensationsUpdateMutation()
  const deleteEmployeeJobMutation = useJobsAndCompensationsDeleteMutation()

  const [currentJob, setCurrentJob] = useState<Job | null>(
    employeeJobs.length === 1 ? (employeeJobs[0] ?? null) : null,
  )

  const [mode, setMode] = useState<MODE>(() => {
    if (!employeeJobs.length) {
      return 'ADD_INITIAL_JOB'
    }

    const currentCompensation = findCurrentCompensation(employeeJobs[0])

    if (employeeJobs.length === 1 && currentCompensation?.flsaStatus !== FlsaStatus.NONEXEMPT) {
      return 'EDIT_INITIAL_JOB'
    }

    return 'LIST'
  })

  const [showFlsaChangeWarning, setShowFlsaChangeWarning] = useState(false)

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

  const defaultValues: CompensationInputs = useMemo(() => {
    return {
      jobTitle:
        currentJob?.title && currentJob.title !== ''
          ? currentJob.title
          : (propDefaults?.title ?? ''),
      flsaStatus: currentCompensation?.flsaStatus ?? primaryFlsaStatus ?? propDefaults?.flsaStatus,
      rate: Number(currentCompensation?.rate ?? propDefaults?.rate ?? 0),
      adjustForMinimumWage: currentCompensation?.adjustForMinimumWage ?? false,
      minimumWageId: currentCompensation?.minimumWages?.[0]?.uuid ?? '',
      paymentUnit: currentCompensation?.paymentUnit ?? propDefaults?.paymentUnit ?? 'Hour',
      stateWcCovered: currentJob?.stateWcCovered ?? false,
      stateWcClassCode: currentJob?.stateWcClassCode ?? '',
      twoPercentShareholder: currentJob?.twoPercentShareholder ?? false,
    } as CompensationInputs
  }, [currentJob, currentCompensation, primaryFlsaStatus, propDefaults])

  const formMethods = useForm<CompensationInputs, unknown, CompensationOutputs>({
    resolver: zodResolver(CompensationSchema),
    defaultValues,
  })
  const { resetField, setValue, handleSubmit, reset } = formMethods

  useEffect(() => {
    reset(defaultValues)
  }, [currentJob, defaultValues, reset])

  const submitWithEffect = async (newMode?: MODE) => {
    if (mode === 'LIST' && newMode === 'PROCEED') {
      onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
      return
    }
    if (!currentJob && mode === 'LIST') {
      setMode('ADD_ADDITIONAL_JOB')
      return
    }
    await handleSubmit(async (data: CompensationOutputs) => {
      await baseSubmitHandler(data, async payload => {
        const { jobTitle, twoPercentShareholder, ...compensationData } = payload
        let updatedJobData
        if (!currentJob) {
          const data = await createEmployeeJobMutation.mutateAsync({
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
          updatedJobData = data.job!
          onEvent(componentEvents.EMPLOYEE_JOB_CREATED, updatedJobData)
        } else {
          const data = await updateEmployeeJobMutation.mutateAsync({
            request: {
              jobId: currentJob.uuid,
              requestBody: {
                title: jobTitle,
                version: currentJob.version as string,
                hireDate: startDate,
                stateWcClassCode: compensationData.stateWcCovered
                  ? compensationData.stateWcClassCode
                  : null,
                stateWcCovered: compensationData.stateWcCovered,
                twoPercentShareholder: twoPercentShareholder ?? false,
              },
            },
          })
          updatedJobData = data.job!
          onEvent(componentEvents.EMPLOYEE_JOB_UPDATED, updatedJobData)
        }

        const { compensation } = await updateCompensationMutation.mutateAsync({
          request: {
            compensationId: updatedJobData.currentCompensationUuid!,
            requestBody: {
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
        setShowFlsaChangeWarning(false)
        onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensation)

        switch (newMode) {
          case 'LIST':
            setMode('LIST')
            setCurrentJob(null)
            reset(defaultValues)
            break
          default:
            onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
        }
      })
    })()
  }

  const handleAdd = () => {
    setMode('ADD_ADDITIONAL_JOB')
    setCurrentJob(null)
    reset(defaultValues)
  }

  const handleCancelAddJob = () => {
    if (employeeJobs.length > 0) {
      setMode('LIST')
    } else {
      setMode('ADD_INITIAL_JOB')
    }

    setCurrentJob(null)
    reset(defaultValues)
  }

  const handleEdit = (uuid: string) => {
    const selectedJob = employeeJobs.find(job => uuid === job.uuid)
    if (selectedJob) {
      setMode('EDIT_ADDITIONAL_JOB')
      setCurrentJob(selectedJob)
    }
  }

  const handleDelete = async (jobId: string) => {
    await deleteEmployeeJobMutation.mutateAsync({ request: { jobId } })
    onEvent(componentEvents.EMPLOYEE_JOB_DELETED)
  }

  const handleFlsaChange = (value: string | number) => {
    if (currentCompensation?.flsaStatus === FlsaStatus.NONEXEMPT && employeeJobs.length > 1) {
      setShowFlsaChangeWarning(true)
    }
    if (value === FlsaStatus.OWNER) {
      setValue('paymentUnit', 'Paycheck')
      resetField('rate', { defaultValue: Number(currentCompensation?.rate) })
    } else if (
      value === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
      value === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('paymentUnit', 'Year')
      setValue('rate', 0)
    } else {
      resetField('paymentUnit', { defaultValue: currentCompensation?.paymentUnit })
      resetField('rate', { defaultValue: Number(currentCompensation?.rate) })
    }
  }

  const isPending =
    updateCompensationMutation.isPending ||
    createEmployeeJobMutation.isPending ||
    updateEmployeeJobMutation.isPending ||
    deleteEmployeeJobMutation.isPending

  return {
    data: {
      employeeJobs,
      currentJob,
      primaryFlsaStatus,
      minimumWages,
      showTwoPercentStakeholder,
      state: currentWorkAddress.state,
    },
    actions: {
      submitWithEffect,
      handleAdd,
      handleEdit,
      handleDelete,
      handleFlsaChange,
      handleCancelAddJob,
    },
    meta: {
      isPending,
      mode,
      showFlsaChangeWarning,
    },
    form: formMethods,
  }
}
