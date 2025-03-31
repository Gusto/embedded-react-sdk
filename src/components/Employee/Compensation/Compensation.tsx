import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-aria-components'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import {
  useJobsAndCompensationsGetJobsSuspense,
  invalidateJobsAndCompensationsGetJobs,
} from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsCreateJobMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsCreateJob'
import { useJobsAndCompensationsUpdateMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdate'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDelete'
import { useJobsAndCompensationsUpdateCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsUpdateCompensation'
import { useLocationsGetMinimumWagesSuspense } from '@gusto/embedded-api/react-query/locationsGetMinimumWages'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { type Job } from '@gusto/embedded-api/models/components/job'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import { List } from './List'
import { Head } from './Head'
import { Edit } from './Edit'
import { Actions } from './Actions'
import { RequireAtLeastOne } from '@/types/Helpers'
import {
  componentEvents,
  FLSA_OVERTIME_SALARY_LIMIT,
  FlsaStatus,
  PAY_PERIODS,
} from '@/shared/constants'
import { useI18n } from '@/i18n'
import { yearlyRate } from '@/helpers/payRateCalculator'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import {
  BaseComponent,
  type BaseComponentInterface,
  useBase,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'

export type CompensationDefaultValues = RequireAtLeastOne<{
  rate?: Job['rate']
  title?: Job['title']
  paymentUnit?: (typeof PAY_PERIODS)[keyof typeof PAY_PERIODS]
  flsaStatus?: FlsaStatusType
}>

interface CompensationProps extends CommonComponentInterface {
  employeeId: string
  startDate: string
  defaultValues?: CompensationDefaultValues
}
type MODE =
  | 'LIST'
  | 'ADD_ADDITIONAL_JOB'
  | 'ADD_INITIAL_JOB'
  | 'EDIT_ADDITIONAL_JOB'
  | 'EDIT_INITIAL_JOB'
  | 'PROCEED'

type CompensationContextType = {
  employeeJobs: Job[]
  currentJob?: Job | null
  primaryFlsaStatus?: string
  isPending: boolean
  mode: MODE
  showFlsaChangeWarning: boolean
  minimumWages: MinimumWage[]
  submitWithEffect: (newMode: MODE) => void
  handleAdd: () => void
  handleEdit: (uuid: string) => void
  handleDelete: (uuid: string) => void
  handleFlsaChange: (status: string | number) => void
  handleCancelAddJob: () => void
}
const [useCompensation, CompensationProvider] =
  createCompoundContext<CompensationContextType>('CompensationContext')
export { useCompensation }

const CompensationSchema = v.intersect([
  v.object({
    jobTitle: v.pipe(v.string(), v.nonEmpty()),
  }),
  v.variant('adjustForMinimumWage', [
    v.object({
      adjustForMinimumWage: v.literal(true),
      minimumWageId: v.pipe(v.string(), v.nonEmpty()),
    }),
    v.object({ adjustForMinimumWage: v.literal(false) }),
  ]),
  v.variant('flsaStatus', [
    v.pipe(
      v.object({
        flsaStatus: v.union([
          v.literal(FlsaStatus.EXEMPT),
          v.literal(FlsaStatus.SALARIED_NONEXEMPT),
          v.literal(FlsaStatus.NONEXEMPT),
        ]),
        paymentUnit: v.union([
          v.literal('Hour'),
          v.literal('Week'),
          v.literal('Month'),
          v.literal('Year'),
        ]),
        rate: v.pipe(v.number(), v.minValue(1), v.transform(String)),
      }),
      //Exempt salary threshold validation:
      v.forward(
        v.check(input => {
          return (
            //TODO: this should not be validated for non-primary jobs for NONEXEMPT
            input.flsaStatus !== FlsaStatus.EXEMPT ||
            yearlyRate(Number(input.rate), input.paymentUnit) >= FLSA_OVERTIME_SALARY_LIMIT
          )
        }),
        ['flsaStatus'],
      ),
    ),
    v.object({
      flsaStatus: v.literal(FlsaStatus.OWNER),
      paymentUnit: v.literal('Paycheck'),
      rate: v.pipe(v.number(), v.minValue(1), v.transform(String)),
    }),
    v.object({
      flsaStatus: v.union([
        v.literal(FlsaStatus.COMMISSION_ONLY_EXEMPT),
        v.literal(FlsaStatus.COMISSION_ONLY_NONEXEMPT),
      ]),
      paymentUnit: v.literal('Year'),
      rate: v.pipe(v.literal(0), v.transform(String)),
    }),
  ]),
])
export type CompensationInputs = v.InferInput<typeof CompensationSchema>
export type CompensationOutputs = v.InferOutput<typeof CompensationSchema>

export function Compensation(props: CompensationProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const findCurrentCompensation = (employeeJob?: Job | null) => {
  return employeeJob?.compensations?.find(comp => comp.uuid === employeeJob.currentCompensationUuid)
}

const Root = ({ employeeId, startDate, className, children, ...props }: CompensationProps) => {
  useI18n('Employee.Compensation')
  const { baseSubmitHandler, onEvent } = useBase()
  const queryClient = useQueryClient()

  const { data: jobsData } = useJobsAndCompensationsGetJobsSuspense({ employeeId })
  const employeeJobs = jobsData.jobList!

  const { data: addressesData } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })
  const workAddresses = addressesData.employeeWorkAddressList!

  const currentWorkAddress = workAddresses.find(address => address.active)!

  const {
    data: { minimumWageList },
  } = useLocationsGetMinimumWagesSuspense({
    locationUuid: currentWorkAddress.locationUuid!,
  })
  const minimumWages = minimumWageList!

  const updateCompensationMutation = useJobsAndCompensationsUpdateCompensationMutation({
    onSettled: () => invalidateJobsAndCompensationsGetJobs(queryClient, [employeeId]),
  })
  const createEmployeeJobMutation = useJobsAndCompensationsCreateJobMutation({
    onSettled: () => invalidateJobsAndCompensationsGetJobs(queryClient, [employeeId]),
  })
  const updateEmployeeJobMutation = useJobsAndCompensationsUpdateMutation({
    onSettled: () => invalidateJobsAndCompensationsGetJobs(queryClient, [employeeId]),
  })
  const deleteEmployeeJobMutation = useJobsAndCompensationsDeleteMutation({
    onSettled: () => invalidateJobsAndCompensationsGetJobs(queryClient, [employeeId]),
  })

  //Job being edited/created
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
  //Getting current compensation for a job -> the one with the most recent effective date
  const currentCompensation = findCurrentCompensation(currentJob)
  /** Returns FLSA status of a current compensation of a primary job:
   * Employees can have multiple jobs, with multiple compensations, but only 1 job is primary with 1 current compensation
   */
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
          : (props.defaultValues?.title ?? ''),
      flsaStatus:
        currentCompensation?.flsaStatus ?? primaryFlsaStatus ?? props.defaultValues?.flsaStatus,
      rate: Number(currentCompensation?.rate ?? props.defaultValues?.rate ?? 0),
      adjustForMinimumWage: currentCompensation?.adjustForMinimumWage ?? false,
      minimumWageId: currentCompensation?.minimumWages?.[0]?.uuid ?? '',
      paymentUnit: currentCompensation?.paymentUnit ?? props.defaultValues?.paymentUnit ?? 'Hour',
    } as CompensationInputs
  }, [currentJob, currentCompensation, primaryFlsaStatus, props.defaultValues])

  const formMethods = useForm<CompensationInputs, unknown, CompensationOutputs>({
    resolver: valibotResolver(CompensationSchema),
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
    //If no job has been modified, switch to edit mode
    if (!currentJob && mode === 'LIST') {
      setMode('ADD_ADDITIONAL_JOB')
      return
    }
    //Performing post-submit state setting only on success
    await handleSubmit(async (data: CompensationOutputs) => {
      await onSubmit(data)
      switch (newMode) {
        case 'LIST':
          setMode('LIST')
          setCurrentJob(null)
          reset(defaultValues)
          break
        default:
          onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
      }
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

  /**Update dependent field values upon change in FLSA type */
  const handleFlsaChange = (value: string | number) => {
    //Attempting to change flsa status from nonexempt should prompt user about deletion of other jobs associated with the employee
    if (currentCompensation?.flsaStatus === FlsaStatus.NONEXEMPT && employeeJobs.length > 1) {
      setShowFlsaChangeWarning(true)
    }
    if (value === FlsaStatus.OWNER) {
      setValue('paymentUnit', 'Paycheck')
      resetField('rate', { defaultValue: Number(currentCompensation?.rate) })
    } else if (
      value === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
      value === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('paymentUnit', 'Year')
      setValue('rate', 0)
    } else {
      //reset fields
      resetField('paymentUnit', { defaultValue: currentCompensation?.paymentUnit })
      resetField('rate', { defaultValue: Number(currentCompensation?.rate) })
    }
  }

  const onSubmit: SubmitHandler<CompensationOutputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { jobTitle, ...compensationData } = payload
      let updatedJobData
      //Note: some of the type fixes below are due to the fact that API incorrectly defines current_compensation_uuid as optional
      if (!currentJob) {
        //Adding new job for NONEXEMPT
        const data = await createEmployeeJobMutation.mutateAsync({
          request: {
            employeeId,
            requestBody: { title: jobTitle, hireDate: startDate },
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
            },
          },
        })
        updatedJobData = data.job!
        onEvent(componentEvents.EMPLOYEE_JOB_UPDATED, updatedJobData)
      }

      const { compensation } = await updateCompensationMutation.mutateAsync({
        request: {
          compensationId: currentJob!.currentCompensationUuid!,
          requestBody: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            version: currentJob!.compensations?.find(
              comp => comp.uuid === currentJob!.currentCompensationUuid,
            )?.version!,
            ...compensationData,
            minimumWages: compensationData.adjustForMinimumWage
              ? [{ uuid: compensationData.minimumWageId }]
              : [],
          },
        },
      })
      setShowFlsaChangeWarning(false)
      onEvent(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, compensation)
    })
  }
  return (
    <section className={className}>
      <CompensationProvider
        value={{
          employeeJobs,
          currentJob,
          primaryFlsaStatus,
          showFlsaChangeWarning,
          mode,
          minimumWages,
          handleFlsaChange,
          handleDelete,
          handleEdit,
          handleAdd,
          submitWithEffect,
          handleCancelAddJob,
          isPending:
            updateCompensationMutation.isPending ||
            createEmployeeJobMutation.isPending ||
            updateEmployeeJobMutation.isPending ||
            deleteEmployeeJobMutation.isPending,
        }}
      >
        <FormProvider {...formMethods}>
          <Form>
            {children ? (
              children
            ) : (
              <>
                <Head />
                <List />
                <Edit />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </CompensationProvider>
    </section>
  )
}

Compensation.Head = Head
Compensation.List = List
Compensation.Actions = Actions
Compensation.Edit = Edit

export const CompensationContextual = () => {
  const { employeeId, onEvent, startDate, defaultValues } =
    useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId || !startDate) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Compensation',
        param: !employeeId ? 'employeeId' : 'startDate',
        provider: 'FlowProvider',
      }),
    )
  }
  return (
    <Compensation
      employeeId={employeeId}
      startDate={startDate}
      onEvent={onEvent}
      defaultValues={defaultValues?.compensation}
    />
  )
}
