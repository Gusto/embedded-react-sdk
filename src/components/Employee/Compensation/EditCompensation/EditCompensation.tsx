import { useMemo } from 'react'
import type { Job } from '@gusto/embedded-api/models/components/job'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsGetJobsSuspense } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdate'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdateCompensation'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useFederalTaxDetailsGetSuspense } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import { useLocationsGetMinimumWagesSuspense } from '@gusto/embedded-api/react-query/locationsGetMinimumWages'
import type { CompensationDefaultValues } from '../Compensation'
import { type CompensationInputs, type CompensationOutputs } from '../compensationSchema'
import { EditCompensationPresentation } from './EditCompensationPresentation'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface EditCompensationProps extends CommonComponentInterface<'Employee.Compensation'> {
  employeeId: string
  startDate: string
  currentJobId?: string | null
  title: string
  submitCtaLabel: string
  onSaved: (data: CompensationOutputs) => void
  onCancel?: () => void
  partnerDefaultValues?: CompensationDefaultValues
}

export function EditCompensation(props: EditCompensationProps & BaseComponentInterface) {
  useComponentDictionary('Employee.Compensation', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const findCurrentCompensation = (job?: Job | null) => {
  return job?.compensations?.find(comp => comp.uuid === job.currentCompensationUuid)
}

function Root({
  employeeId,
  startDate,
  currentJobId,
  title,
  submitCtaLabel,
  onSaved,
  onCancel,
  partnerDefaultValues,
  className,
}: EditCompensationProps) {
  useI18n('Employee.Compensation')
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: jobsData } = useJobsAndCompensationsGetJobsSuspense({ employeeId })
  const employeeJobs = useMemo(() => jobsData.jobs ?? [], [jobsData.jobs])

  const { data: addressesData } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })
  const workAddresses = addressesData.employeeWorkAddressesList ?? []
  const currentWorkAddress = workAddresses.find(address => address.active) ?? workAddresses[0]

  if (!currentWorkAddress?.locationUuid) {
    throw new Error('No active work address with a location found for this employee')
  }

  const {
    data: { minimumWageList },
  } = useLocationsGetMinimumWagesSuspense({
    locationUuid: currentWorkAddress.locationUuid,
  })
  const minimumWages = minimumWageList ?? []

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })

  if (!employee) {
    throw new Error('Employee not found')
  }

  const { data } = useFederalTaxDetailsGetSuspense({ companyId: employee.companyUuid! })
  const showTwoPercentStakeholder = data.federalTaxDetails?.taxableAsScorp === true

  const currentJob = useMemo(
    () => (currentJobId ? (employeeJobs.find(job => job.uuid === currentJobId) ?? null) : null),
    [employeeJobs, currentJobId],
  )
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

  const defaultValues = useMemo<CompensationInputs>(() => {
    return {
      jobTitle:
        currentJob?.title && currentJob.title !== ''
          ? currentJob.title
          : (partnerDefaultValues?.title ?? ''),
      flsaStatus:
        currentCompensation?.flsaStatus ?? primaryFlsaStatus ?? partnerDefaultValues?.flsaStatus,
      rate: Number(currentCompensation?.rate ?? partnerDefaultValues?.rate ?? 0),
      adjustForMinimumWage: currentCompensation?.adjustForMinimumWage ?? false,
      minimumWageId: currentCompensation?.minimumWages?.[0]?.uuid ?? '',
      paymentUnit: currentCompensation?.paymentUnit ?? partnerDefaultValues?.paymentUnit ?? 'Hour',
      stateWcCovered: currentJob?.stateWcCovered ?? false,
      stateWcClassCode: currentJob?.stateWcClassCode ?? '',
      twoPercentShareholder: currentJob?.twoPercentShareholder ?? false,
    } as CompensationInputs
  }, [currentJob, currentCompensation, primaryFlsaStatus, partnerDefaultValues])

  const updateCompensationMutation = useJobsAndCompensationsUpdateCompensationMutation()
  const createEmployeeJobMutation = useJobsAndCompensationsCreateJobMutation()
  const updateEmployeeJobMutation = useJobsAndCompensationsUpdateMutation()

  const isPending =
    updateCompensationMutation.isPending ||
    createEmployeeJobMutation.isPending ||
    updateEmployeeJobMutation.isPending

  const otherJobsCount = currentJob
    ? employeeJobs.filter(job => job.uuid !== currentJob.uuid).length
    : employeeJobs.length

  const onSave = async (formData: CompensationOutputs) => {
    await baseSubmitHandler(formData, async payload => {
      const { jobTitle, twoPercentShareholder, ...compensationData } = payload
      let updatedJobData: Job

      if (!currentJob) {
        const createResult = await createEmployeeJobMutation.mutateAsync({
          request: {
            employeeId,
            jobsCreateRequestBody: {
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
        updatedJobData = createResult.job!
        onEvent(componentEvents.EMPLOYEE_JOB_CREATED, updatedJobData)
      } else {
        const updateResult = await updateEmployeeJobMutation.mutateAsync({
          request: {
            jobId: currentJob.uuid,
            jobsUpdateRequestBody: {
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
        updatedJobData = updateResult.job!
        onEvent(componentEvents.EMPLOYEE_JOB_UPDATED, updatedJobData)
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

      onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensation)

      onSaved(formData)
    })
  }

  const canChangeFlsaClassification = currentJob?.primary === true || employeeJobs.length === 0

  return (
    <section className={className}>
      <EditCompensationPresentation
        defaultValues={defaultValues}
        title={title}
        submitCtaLabel={submitCtaLabel}
        canChangeFlsaClassification={canChangeFlsaClassification}
        currentCompensationFlsaStatus={currentCompensation?.flsaStatus ?? undefined}
        otherJobsCount={otherJobsCount}
        state={currentWorkAddress.state}
        minimumWages={minimumWages}
        showTwoPercentStakeholder={showTwoPercentStakeholder}
        isPending={isPending}
        onSave={onSave}
        onCancel={onCancel}
      />
    </section>
  )
}
